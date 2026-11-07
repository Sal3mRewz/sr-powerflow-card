import { type HomeAssistant } from "custom-card-helpers";
import { isNumberValue } from "@flixlix-cards/shared/utils/utils";
import { getEntityState } from "./get-entity-state";
import { getEntityNames } from "./mutli-entity";

const prefixes = ["K", "M", "G", "T", "P", "E", "Z", "Y"];

// Sums every available entity of a combined entity ("sensor.a|sensor.b"), converting each one
// by its own unit, so W and kW sensors can be combined.
export const getEntityStateWatts = (hass: HomeAssistant, entity: string | undefined): number => {
  if (!entity || getEntityState(hass, entity) === null) return 0;

  return getEntityNames(entity).reduce((total, id) => {
    const entityState = hass.states[id];
    if (!entityState || !isNumberValue(entityState.state)) return total;
    const unit = entityState.attributes.unit_of_measurement ?? "";
    return total + convertUnitToWatts(Number(entityState.state), unit);
  }, 0);
};

const convertUnitToWatts = (value: number, unit: string): number => {
  const prefix = unit.toUpperCase().slice(0, 1);
  const prefixIndex = prefixes.indexOf(prefix);

  if (prefixIndex > -1) return value * Math.pow(1000, prefixIndex + 1);
  return value;
};
