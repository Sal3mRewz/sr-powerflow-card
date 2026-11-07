import { type IndividualObject } from "@flixlix-cards/shared/states/raw/individual/get-individual-object";
import { type FlowCardPlusConfig, type NewDur } from "@flixlix-cards/shared/types";
import { html } from "lit";
import { flowBatteryToGrid } from "./battery-to-grid";
import { flowBatteryToHome } from "./battery-to-home";
import { flowGridToHome } from "./grid-to-home";
import { flowSolarToGrid } from "./solar-to-grid";
import { flowSolarToHome } from "./solar-to-home";
import { flowSolarToBattery } from "./solart-to-battery";

export interface Flows {
  battery: any;
  grid: any;
  individual: IndividualObject[];
  hasSecondFeed?: boolean;
  solar: any;
  newDur: NewDur;
}

export const flowElement = (
  config: FlowCardPlusConfig,
  { battery, grid, individual, hasSecondFeed, solar, newDur }: Flows
) => {
  return html`
  ${flowSolarToHome(config, { battery, grid, individual, hasSecondFeed, solar, newDur })}
  ${flowSolarToGrid(config, { battery, grid, individual, hasSecondFeed, solar, newDur })}
  ${flowSolarToBattery(config, { battery, individual, hasSecondFeed, solar, newDur })}
  ${flowGridToHome(config, { battery, grid, individual, hasSecondFeed, solar, newDur })}
  ${flowBatteryToHome(config, { battery, grid, individual, hasSecondFeed, newDur })}
  ${flowBatteryToGrid(config, { battery, grid, individual, hasSecondFeed, newDur })}
</div>`;
};
