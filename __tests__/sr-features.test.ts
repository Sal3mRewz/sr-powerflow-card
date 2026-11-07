// Tests for what this fork adds on top of upstream Power Flow Card Plus: the second feed and
// combined entities ("sensor.a|sensor.b") summed with per-entity unit conversion.
import { describe, expect, test, vi } from "vitest";

import { getSecondFeedObject } from "@flixlix-cards/shared/states/raw/second-feed";
import { isAboveTolerance } from "@flixlix-cards/shared/states/tolerance/base";
import { isEntityAvailable } from "@flixlix-cards/shared/states/utils/existence-entity";
import { getEntityStateWatts } from "@flixlix-cards/shared/states/utils/get-entity-state-watts";
import { type PowerFlowCardPlusConfig } from "@flixlix-cards/shared/types";
import { type HomeAssistant } from "custom-card-helpers";
import { PowerFlowCardPlus } from "../src/sr-powerflow-card";

type States = Record<string, { state: string; unit?: string }>;

const makeHass = (states: States) =>
  ({
    states: Object.fromEntries(
      Object.entries(states).map(([entityId, { state, unit }]) => [
        entityId,
        {
          entity_id: entityId,
          state,
          attributes: unit ? { unit_of_measurement: unit } : {},
        },
      ])
    ),
    localize: (key: string) => key,
    locale: { language: "en", number_format: "language", time_format: "language" },
    language: "en",
  }) as unknown as HomeAssistant;

const makeConfig = (entities: PowerFlowCardPlusConfig["entities"]) =>
  ({
    type: "custom:sr-powerflow-card",
    min_flow_rate: 0.75,
    max_flow_rate: 6,
    max_expected_power: 2000,
    min_expected_power: 0.01,
    entities,
  }) as unknown as PowerFlowCardPlusConfig;

describe("combined entities", () => {
  test("sums each entity, converting each by its own unit", () => {
    const hass = makeHass({
      "sensor.a": { state: "500", unit: "W" },
      "sensor.b": { state: "1.5", unit: "kW" },
    });
    expect(getEntityStateWatts(hass, "sensor.a|sensor.b")).toBe(2000);
  });

  test("still counts the entities that are available when one is not", () => {
    const hass = makeHass({
      "sensor.a": { state: "500", unit: "W" },
      "sensor.b": { state: "unavailable" },
    });
    expect(isEntityAvailable(hass, "sensor.a|sensor.b")).toBe(true);
    expect(getEntityStateWatts(hass, "sensor.a|sensor.b")).toBe(500);
  });

  test("is unavailable only when every entity is", () => {
    const hass = makeHass({ "sensor.a": { state: "unavailable" } });
    expect(isEntityAvailable(hass, "sensor.a|sensor.missing")).toBe(false);
    expect(getEntityStateWatts(hass, "sensor.a|sensor.missing")).toBe(0);
  });
});

describe("tolerance", () => {
  test("compares the size of negative values", () => {
    expect(isAboveTolerance(-50, 10)).toBe(true);
    expect(isAboveTolerance(-5, 10)).toBe(false);
    expect(isAboveTolerance(0, 0)).toBe(false);
    expect(isAboveTolerance(null, 0)).toBe(false);
  });
});

describe("second feed state", () => {
  const hass = makeHass({
    "sensor.workshop": { state: "300", unit: "W" },
    "sensor.garage": { state: "-0.2", unit: "kW" },
    "sensor.lights": { state: "50", unit: "W" },
    "sensor.feed_total": { state: "1000", unit: "W" },
  });

  test("is not shown when not configured", () => {
    const feed = getSecondFeedObject(hass, makeConfig({}));
    expect(feed.has).toBe(false);
    expect(feed.state).toBe(0);
  });

  test("sums its devices and extra entities, counting each entity once", () => {
    const feed = getSecondFeedObject(
      hass,
      makeConfig({
        second_feed: {
          entities: ["sensor.lights", "sensor.workshop", ""],
          individual: [{ entity: "sensor.workshop" }, { entity: "sensor.garage" }],
        },
      } as PowerFlowCardPlusConfig["entities"])
    );
    expect(feed.has).toBe(true);
    // 300 + |-200| + 50; sensor.workshop is listed twice but counted once.
    expect(feed.state).toBe(550);
    expect(feed.devices.map((d) => d.entity)).toEqual(["sensor.workshop", "sensor.garage"]);
    expect(feed.entity).toBe("sensor.workshop");
    expect(feed.name).toBe("Second Feed");
    expect(feed.icon).toBe("mdi:meter-electric-outline");
  });

  test("uses the total entity instead of the sum when set", () => {
    const feed = getSecondFeedObject(
      hass,
      makeConfig({
        second_feed: { entity: "sensor.feed_total", individual: [{ entity: "sensor.workshop" }] },
      } as PowerFlowCardPlusConfig["entities"])
    );
    expect(feed.state).toBe(1000);
    expect(feed.entity).toBe("sensor.feed_total");
  });

  test("hides at zero when display_zero is false", () => {
    const zeroHass = makeHass({ "sensor.feed_total": { state: "0", unit: "W" } });
    const feed = getSecondFeedObject(
      zeroHass,
      makeConfig({
        second_feed: { entity: "sensor.feed_total", display_zero: false },
      } as PowerFlowCardPlusConfig["entities"])
    );
    expect(feed.has).toBe(false);
  });

  test("converts an RGB colour list to hex", () => {
    const feed = getSecondFeedObject(
      hass,
      makeConfig({
        second_feed: { entity: "sensor.feed_total", color: [255, 0, 16] },
      } as PowerFlowCardPlusConfig["entities"])
    );
    expect(feed.color).toBe("#ff0010");
  });
});

describe("card", () => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    }
  );

  const mount = async (entities: PowerFlowCardPlusConfig["entities"], states: States) => {
    const card = document.createElement("sr-powerflow-card") as PowerFlowCardPlus;
    card.setConfig(makeConfig(entities));
    card.hass = makeHass(states);
    document.body.appendChild(card);
    await card.updateComplete;
    return card.shadowRoot!;
  };

  test("is registered as sr-powerflow-card with an sr- editor", async () => {
    expect(customElements.get("sr-powerflow-card")).toBe(PowerFlowCardPlus);
    const editor = await PowerFlowCardPlus.getConfigElement();
    expect(editor.tagName.toLowerCase()).toBe("sr-powerflow-card-editor");
    expect(customElements.get("sr-subpage-header")).toBeDefined();
    expect(customElements.get("sr-link-subpage")).toBeDefined();
    expect(customElements.get("sr-individual-devices-editor")).toBeDefined();
    expect(customElements.get("sr-individual-row-editor")).toBeDefined();
  });

  test("draws the second feed and its devices", async () => {
    const root = await mount(
      {
        grid: { entity: "sensor.grid" },
        second_feed: {
          name: "Workshop Feed",
          individual: [
            { entity: "sensor.workshop", name: "Workshop" },
            { entity: "sensor.garage", name: "Garage" },
          ],
        },
      } as PowerFlowCardPlusConfig["entities"],
      {
        "sensor.grid": { state: "800", unit: "W" },
        "sensor.workshop": { state: "300", unit: "W" },
        "sensor.garage": { state: "200", unit: "W" },
      }
    );

    const feed = root.querySelector(".circle-container.second-feed");
    expect(feed).not.toBeNull();
    expect(feed!.classList.contains("has-devices")).toBe(true);
    expect(feed!.querySelector(".label")!.textContent).toBe("Workshop Feed");
    expect(feed!.querySelector("span.second-feed")!.textContent).toContain("500");

    const devices = root.querySelectorAll(".row.second-feed-devices .second-feed-device .label");
    expect([...devices].map((d) => d.textContent)).toEqual(["Workshop", "Garage"]);
    expect(root.querySelector(".card-content.has-second-feed-devices")).not.toBeNull();
  });

  test("draws no second feed when it is not configured", async () => {
    const root = await mount({ grid: { entity: "sensor.grid" } } as PowerFlowCardPlusConfig["entities"], {
      "sensor.grid": { state: "800", unit: "W" },
    });
    expect(root.querySelector(".second-feed")).toBeNull();
    expect(root.querySelector(".second-feed-devices")).toBeNull();
  });
});
