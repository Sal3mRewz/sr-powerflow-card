import { type IndividualObject } from "@flixlix-cards/shared/states/raw/individual/get-individual-object";
import {
  type CardMainContext,
  type ConfigEntities,
  type FlowCardPlusConfig,
  type NewDur,
  type TemplatesObj,
} from "@flixlix-cards/shared/types";
import { html, nothing, svg } from "lit";
import { generalSecondarySpan } from "./spans/general-secondary-span";
import { getShape, shapeClass } from "@flixlix-cards/shared/const/shapes";

interface Home {
  home: any;
  entities: ConfigEntities;
  templatesObj: TemplatesObj;
  grid: any;
  newDur: NewDur;
  homeUsageToDisplay: string;
  homeSolarCircumference: number;
  CIRCLE_CIRCUMFERENCE: number;
  homeBatteryCircumference: number;
  homeNonFossilCircumference: number;
  homeGridCircumference: number;
  individual: IndividualObject[];
}

export const homeElement = (
  main: CardMainContext,
  config: FlowCardPlusConfig,
  {
    home,
    entities,
    templatesObj,
    homeUsageToDisplay,
    homeSolarCircumference,
    CIRCLE_CIRCUMFERENCE,
    homeBatteryCircumference,
    homeNonFossilCircumference,
    homeGridCircumference,
    individual,
  }: Home
) => {
  const showHomeLabel = individual.filter((i) => i.has).length <= 1;
  const isHomeEntityDefined = entities.home?.entity !== undefined;
  const noActionSet = ["none", undefined];
  const staticAction =
    !noActionSet.includes(entities.home?.tap_action?.action) ||
    !noActionSet.includes(entities.home?.hold_action?.action) ||
    !noActionSet.includes(entities.home?.double_tap_action?.action);
  const isClickable = isHomeEntityDefined || staticAction;
  const disableEntityClick = config.clickable_entities === false || !isClickable;

  // The coloured split of where the home's power comes from is drawn around the circle, or
  // along the outline of the home's shape. pathLength makes a shape's outline measure the same
  // as the circle, so the same segment lengths work for both.
  const shape = getShape(entities.home);
  const ringSegment = (className: string, dashArray: string, dashOffset: string) =>
    shape
      ? svg`<path
          class=${className}
          d=${shape.outline}
          pathLength=${CIRCLE_CIRCUMFERENCE}
          stroke-dasharray=${dashArray}
          stroke-dashoffset=${dashOffset}
          shape-rendering="geometricPrecision"
        />`
      : svg`<circle
          class=${className}
          cx="40"
          cy="40"
          r="38"
          stroke-dasharray=${dashArray}
          stroke-dashoffset=${dashOffset}
          shape-rendering="geometricPrecision"
        />`;

  return html`
    <div class="circle-container home">
      <div
        class="circle ${disableEntityClick ? "pointer-events-none" : ""} ${shapeClass(config.entities.home)}"
        id="home-circle"
        @click=${(e: MouseEvent) => {
          main.onEntityClick(e, entities.home, entities.home?.entity);
        }}
        @dblclick=${(e: MouseEvent) => {
          main.onEntityDoubleClick(e, entities.home, entities.home?.entity);
        }}
        @pointerdown=${(e: PointerEvent) => {
          main.onEntityPointerDown(e, entities.home, entities.home?.entity);
        }}
        @pointerup=${(e: PointerEvent) => {
          main.onEntityPointerUp(e);
        }}
        @pointercancel=${(e: PointerEvent) => {
          main.onEntityPointerUp(e);
        }}
        @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
          if (e.key === "Enter") {
            main.openDetails(e, entities.home, entities.home?.entity, "tap");
          }
        }}
      >
        <ha-ripple .disabled=${disableEntityClick}></ha-ripple>
        ${generalSecondarySpan(main.hass, main, config, templatesObj, home, "home")}
        ${home.icon !== " " ? html`<ha-icon id="home-icon" .icon=${home.icon}></ha-icon>` : nothing}
        ${homeUsageToDisplay}
        <svg class="home-circle-sections">
          ${homeSolarCircumference !== undefined
            ? ringSegment(
                "solar",
                `${homeSolarCircumference} ${CIRCLE_CIRCUMFERENCE - homeSolarCircumference}`,
                `-${CIRCLE_CIRCUMFERENCE - homeSolarCircumference}`
              )
            : nothing}
          ${homeBatteryCircumference
            ? ringSegment(
                "battery",
                `${homeBatteryCircumference} ${CIRCLE_CIRCUMFERENCE - homeBatteryCircumference}`,
                `-${CIRCLE_CIRCUMFERENCE - homeBatteryCircumference - (homeSolarCircumference || 0)}`
              )
            : nothing}
          ${homeNonFossilCircumference !== undefined
            ? ringSegment(
                "low-carbon",
                `${homeNonFossilCircumference} ${CIRCLE_CIRCUMFERENCE - homeNonFossilCircumference}`,
                `-${CIRCLE_CIRCUMFERENCE -
                homeNonFossilCircumference -
                (homeBatteryCircumference || 0) -
                (homeSolarCircumference || 0)}`
              )
            : nothing}
          ${ringSegment(
            "grid",
            `${homeGridCircumference ??
            CIRCLE_CIRCUMFERENCE -
              homeSolarCircumference! -
              (homeBatteryCircumference || 0)} ${homeGridCircumference !== undefined
              ? CIRCLE_CIRCUMFERENCE - homeGridCircumference
              : homeSolarCircumference! + (homeBatteryCircumference || 0)}`,
            "0"
          )}
          ${shape?.decoration
            ? svg`<path class="shape-decoration" d=${shape.decoration} />`
            : nothing}
        </svg>
      </div>
      ${!showHomeLabel
        ? html`<span class="label"></span>`
        : html`<span class="label">${home.name}</span>`}
    </div>
  `;
};
