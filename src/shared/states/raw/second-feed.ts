import {
  getIndividualObject,
  type IndividualObject,
} from "@flixlix-cards/shared/states/raw/individual/get-individual-object";
import { getEntityStateWatts } from "@flixlix-cards/shared/states/utils/get-entity-state-watts";
import { type FlowCardPlusConfig } from "@flixlix-cards/shared/types";
import {
  computeFieldIcon,
  computeFieldName,
} from "@flixlix-cards/shared/utils/compute-field-attributes";
import { convertColorListToHex } from "@flixlix-cards/shared/utils/convert-color";
import { type HomeAssistant } from "custom-card-helpers";

export type SecondFeedObject = {
  has: boolean;
  /** Entity opened on click: the total entity, or the first counted entity. */
  entity: string | undefined;
  /** Power in watts, always positive. */
  state: number;
  name: string;
  icon: string;
  color: string | undefined;
  invertAnimation: boolean;
  /** Devices fed by the second feed, in config order. */
  devices: IndividualObject[];
};

/**
 * Works out the second feed from `entities.second_feed`.
 *
 * Its power is `entity` when set. Otherwise it is the sum of its devices (`individual`) and any
 * extra `entities`, each counted once.
 */
export const getSecondFeedObject = (
  hass: HomeAssistant,
  config: FlowCardPlusConfig
): SecondFeedObject => {
  const field = config.entities.second_feed;
  const extraEntities = (field?.entities ?? []).filter(
    (entity): entity is string => typeof entity === "string" && entity !== ""
  );
  const devices = (field?.individual ?? [])
    .filter((device) => !!device?.entity)
    .map((device) => getIndividualObject({ hass, config, field: device }));
  const countedEntities = [...new Set([...devices.map((device) => device.entity), ...extraEntities])];
  const isConfigured = !!field && (!!field.entity || countedEntities.length > 0);
  const state = !isConfigured
    ? 0
    : field?.entity
      ? Math.abs(getEntityStateWatts(hass, field.entity))
      : countedEntities.reduce(
          (total, entity) => total + Math.abs(getEntityStateWatts(hass, entity)),
          0
        );

  return {
    has:
      isConfigured &&
      (field?.display_zero !== false || state > (field?.display_zero_tolerance ?? 0)),
    entity: field?.entity || countedEntities[0],
    state,
    name: computeFieldName(hass, field, "Second Feed"),
    icon: computeFieldIcon(hass, field, "mdi:meter-electric-outline"),
    color: Array.isArray(field?.color) ? convertColorListToHex(field.color) : field?.color,
    invertAnimation: field?.inverted_animation ?? false,
    devices,
  };
};
