import { type IndividualObject } from "@flixlix-cards/shared/states/raw/individual/get-individual-object";
import { type SecondFeedObject } from "@flixlix-cards/shared/states/raw/second-feed";
import {
  type CardMainContext,
  type FlowCardPlusConfig,
  type GridObject,
  type NewDur,
  type TemplatesObj,
} from "@flixlix-cards/shared/types";
import { checkShouldShowDots } from "@flixlix-cards/shared/utils/check-should-show-dots";
import { computeIndividualFlowRate } from "@flixlix-cards/shared/utils/compute-flow-rate";
import { displayValue } from "@flixlix-cards/shared/utils/display-value";
import { showLine } from "@flixlix-cards/shared/utils/show-line";
import { styleLine } from "@flixlix-cards/shared/utils/style-line";
import { html, nothing, svg } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { spacer } from "./spacer";
import { individualSecondarySpan } from "./spans/individual-secondary-span";

/** Default colours for second feed devices, used in order when a device has no colour set. */
const SECOND_FEED_DEVICE_COLORS = ["#5bd08a", "#c25bd0", "#d05b6e", "#5b7bd0"];

const secondFeedStyle = (config: FlowCardPlusConfig, secondFeed: SecondFeedObject) => {
  const field = config.entities.second_feed;
  return styleMap({
    "--second-feed-color": secondFeed.color || undefined,
    "--text-second-feed-color": field?.color_value ? "var(--second-feed-color)" : undefined,
    "--icon-second-feed-color":
      field?.color_icon === false ? "var(--primary-text-color)" : undefined,
  });
};

interface SecondFeedElement {
  secondFeed: SecondFeedObject;
  devices: IndividualObject[];
  grid: GridObject;
  newDur: NewDur;
}

/** The second feed circle, in the bottom-left corner below the grid. Fed from the grid above it. */
export const secondFeedElement = (
  main: CardMainContext,
  config: FlowCardPlusConfig,
  { secondFeed, devices, grid, newDur }: SecondFeedElement
) => {
  if (!secondFeed.has) return spacer;
  const field = config.entities.second_feed;
  const disableEntityClick = config.clickable_entities === false || !secondFeed.entity;
  const hasDevices = devices.length > 0;

  return html`<div
    class="circle-container second-feed ${hasDevices ? "has-devices" : ""}"
    style=${secondFeedStyle(config, secondFeed)}
  >
    ${showLine(config, secondFeed.state) && grid.has
      ? html`<svg width="80" height="30">
          <path d="M40 40 v-40" id="second-feed" class="${styleLine(secondFeed.state, config)}" />
          ${checkShouldShowDots(config) && secondFeed.state > 0
            ? svg`<circle r="1.75" class="second-feed" vector-effect="non-scaling-stroke">
                <animateMotion
                  dur="${newDur.secondFeed ?? 1.66}s"
                  repeatCount="indefinite"
                  calcMode="paced"
                  keyPoints="${secondFeed.invertAnimation ? "0;1" : "1;0"}"
                  keyTimes="0;1"
                >
                  <mpath xlink:href="#second-feed" />
                </animateMotion>
              </circle>`
            : nothing}
        </svg>`
      : html`<svg width="80" height="30"></svg>`}
    <div
      class="circle ${disableEntityClick ? "pointer-events-none" : ""}"
      @click=${(e: MouseEvent) => {
        main.onEntityClick(e, field, secondFeed.entity);
      }}
      @dblclick=${(e: MouseEvent) => {
        main.onEntityDoubleClick(e, field, secondFeed.entity);
      }}
      @pointerdown=${(e: PointerEvent) => {
        main.onEntityPointerDown(e, field, secondFeed.entity);
      }}
      @pointerup=${(e: PointerEvent) => {
        main.onEntityPointerUp(e);
      }}
      @pointercancel=${(e: PointerEvent) => {
        main.onEntityPointerUp(e);
      }}
      @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
        if (e.key === "Enter") {
          main.openDetails(e, field, secondFeed.entity, "tap");
        }
      }}
    >
      <ha-ripple .disabled=${disableEntityClick}></ha-ripple>
      ${secondFeed.icon !== " "
        ? html`<ha-icon id="second-feed-icon" .icon=${secondFeed.icon}></ha-icon>`
        : nothing}
      <span class="second-feed"
        >${displayValue(main.hass, config, secondFeed.state, {
          decimals: field?.decimals,
          unit: field?.unit_of_measurement,
          unitWhiteSpace: field?.unit_white_space,
        })}</span
      >
    </div>
    <span class="label">${secondFeed.name}</span>
    ${hasDevices
      ? html`<svg class="second-feed-connector" width="80" height="10">
          <path d="M40 -10 V10" />
        </svg>`
      : nothing}
  </div>`;
};

const secondFeedDeviceElement = (
  main: CardMainContext,
  config: FlowCardPlusConfig,
  device: IndividualObject,
  column: number,
  duration: number | undefined,
  templatesObj: TemplatesObj
) => {
  const disableEntityClick = config.clickable_entities === false;
  const state = device.state || 0;
  const pathId = `second-feed-device-${column}`;
  const indexInConfig = Math.max(
    config.entities.second_feed?.individual?.findIndex((e) => e.entity === device.entity) ?? 0,
    0
  );

  return html`<div
    class="circle-container second-feed-device"
    style=${styleMap({
      "--second-feed-device-color":
        device.color || SECOND_FEED_DEVICE_COLORS[column] || SECOND_FEED_DEVICE_COLORS[0],
      "--icon-second-feed-device-color":
        device.field?.color_icon === false ? "var(--primary-text-color)" : undefined,
      "--text-second-feed-device-color": device.field?.color_value
        ? "var(--second-feed-device-color)"
        : undefined,
    })}
  >
    ${showLine(config, state)
      ? html`<svg width="80" height="30">
          <path d="M40 0 v30" id="${pathId}" class="${styleLine(state, config)}" />
          ${checkShouldShowDots(config) && state && state >= device.displayZeroTolerance
            ? svg`<circle r="1.75" class="second-feed-device" vector-effect="non-scaling-stroke">
                <animateMotion
                  dur="${computeIndividualFlowRate(device.field?.calculate_flow_rate, duration)}s"
                  repeatCount="indefinite"
                  calcMode="paced"
                  keyPoints="${device.invertAnimation ? "1;0" : "0;1"}"
                  keyTimes="0;1"
                >
                  <mpath xlink:href="#${pathId}" />
                </animateMotion>
              </circle>`
            : nothing}
        </svg>`
      : html`<svg width="80" height="30"></svg>`}
    <div
      class="circle ${disableEntityClick ? "pointer-events-none" : ""}"
      @click=${(e: MouseEvent) => {
        main.onEntityClick(e, device.field, device.entity);
      }}
      @dblclick=${(e: MouseEvent) => {
        main.onEntityDoubleClick(e, device.field, device.entity);
      }}
      @pointerdown=${(e: PointerEvent) => {
        main.onEntityPointerDown(e, device.field, device.entity);
      }}
      @pointerup=${(e: PointerEvent) => {
        main.onEntityPointerUp(e);
      }}
      @pointercancel=${(e: PointerEvent) => {
        main.onEntityPointerUp(e);
      }}
      @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
        if (e.key === "Enter") {
          main.openDetails(e, device.field, device.entity, "tap");
        }
      }}
    >
      <ha-ripple .disabled=${disableEntityClick}></ha-ripple>
      ${individualSecondarySpan(
        main.hass,
        main,
        config,
        { ...templatesObj, individual: [] },
        device,
        indexInConfig,
        "second-feed-device"
      )}
      ${device.icon !== " "
        ? html`<ha-icon class="second-feed-device-icon" .icon=${device.icon}></ha-icon>`
        : nothing}
      ${device.field?.display_zero_state !== false || state > (device.displayZeroTolerance ?? 0)
        ? html`<span class="second-feed-device"
            >${device.showDirection
              ? html`<ha-icon
                  class="small"
                  .icon=${device.invertAnimation ? "mdi:arrow-up" : "mdi:arrow-down"}
                ></ha-icon>`
              : nothing}${displayValue(main.hass, config, device.state, {
              decimals: device.decimals,
              unit: device.unit,
              unitWhiteSpace: device.unit_white_space,
            })}</span
          >`
        : nothing}
    </div>
    <span class="label">${device.name}</span>
  </div>`;
};

interface SecondFeedDevicesElement {
  secondFeed: SecondFeedObject;
  devices: IndividualObject[];
  columns: number;
  newDur: NewDur;
  templatesObj: TemplatesObj;
}

/**
 * The row of devices fed by the second feed, below the rest of the card. A bus line along the
 * top joins them to the second feed above the first column.
 */
export const secondFeedDevicesElement = (
  main: CardMainContext,
  config: FlowCardPlusConfig,
  { secondFeed, devices, columns, newDur, templatesObj }: SecondFeedDevicesElement
) => {
  if (!secondFeed.has || devices.length === 0) return nothing;
  const lastColumn = devices.length - 1;

  return html`<div class="row second-feed-devices" style=${secondFeedStyle(config, secondFeed)}>
    ${lastColumn > 0
      ? html`<svg class="second-feed-bus" preserveAspectRatio="none">
          <line x1="0" y1="1" x2="${(lastColumn / (columns - 1)) * 100}%" y2="1" />
        </svg>`
      : nothing}
    ${Array.from({ length: columns }, (_, column) => {
      const device = devices[column];
      return device
        ? secondFeedDeviceElement(
            main,
            config,
            device,
            column,
            newDur.secondFeedDevices?.[column],
            templatesObj
          )
        : spacer;
    })}
  </div>`;
};
