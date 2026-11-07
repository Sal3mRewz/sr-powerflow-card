# sr-powerflow-card

A Home Assistant Lovelace power flow card. It is a fork of
[Power Flow Card Plus](https://github.com/flixlix/power-flow-card-plus) by
[@flixlix](https://github.com/flixlix), based on upstream **v0.3.7**.

Current version: **0.3.7-fd.2**

## How it differs from upstream

- Supports a **second home** fed from the grid.
- Supports **combined grid entities**.
- Installs **alongside** the original card (see below).

The card and its editor elements are registered under `-fd` names, so it can be
installed **alongside** the original Power Flow Card Plus without conflicts:

| Upstream element | This card |
| --- | --- |
| `power-flow-card-plus` | `power-flow-card-plus-fd` |
| `power-flow-card-plus-editor` | `power-flow-card-plus-fd-editor` |
| `individual-devices-editor` | `individual-devices-editor-fd` |
| `individual-row-editor` | `individual-row-editor-fd` |
| `link-subpage` | `link-subpage-fd` |
| `subpage-header` | `subpage-header-fd` |

It shows up in the card picker as **Power Flow Card Plus FD**.

## Installation

### HACS (custom repository)

1. In HACS, open the menu (⋮) → **Custom repositories**.
2. Add `https://github.com/Sal3mRewz/sr-powerflow-card` with the type **Dashboard** (called **Lovelace** in older HACS versions).
3. Install **SR Power Flow Card**, then reload your browser.

### Manual

1. Copy `sr-powerflow-card.js` into `<config>/www/`.
2. Add a dashboard resource (Settings → Dashboards → ⋮ → Resources):
   ```yaml
   url: /local/sr-powerflow-card.js
   type: module
   ```
3. Reload your browser.

## Usage

```yaml
type: custom:power-flow-card-plus-fd
entities:
  grid:
    entity: sensor.grid_power
  solar:
    entity: sensor.solar_power
  battery:
    entity: sensor.battery_power
    state_of_charge: sensor.battery_soc
```

All configuration options are the same as upstream. See the
[Power Flow Card Plus documentation](https://github.com/flixlix/power-flow-card-plus#readme)
for the full reference.

## Credits

All credit for the original card goes to [@flixlix](https://github.com/flixlix) and the
contributors of [flixlix/flixlix-cards](https://github.com/flixlix/flixlix-cards).
Upstream changelog: [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE). Original work © flixlix and contributors; this fork keeps the original copyright notice.
