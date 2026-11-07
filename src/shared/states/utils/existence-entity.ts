import { isNumberValue } from "@flixlix-cards/shared/utils/utils";
import { type HomeAssistant } from "custom-card-helpers";
import { getEntityNames } from "./mutli-entity";

// A combined entity ("sensor.a|sensor.b") is available when at least one of its entities is,
// so one sensor going offline doesn't blank the whole total.
export const isEntityAvailable = (hass: HomeAssistant, entityId: string): boolean =>
  getEntityNames(entityId).some((id) => isNumberValue(hass.states[id]?.state));

export const doesEntityExist = (hass: HomeAssistant, entityId: string): boolean => {
  const ids = getEntityNames(entityId);
  for (const id of ids) {
    if (!(id in hass.states)) {
      return false;
    }
  }

  return true;
};
