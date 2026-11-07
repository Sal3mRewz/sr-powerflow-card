# sr-powerflow-card

A Home Assistant Lovelace power flow card. It is a fork of
[Power Flow Card Plus](https://github.com/flixlix/power-flow-card-plus) by
[@flixlix](https://github.com/flixlix), based on upstream **v0.3.7**.


This is a card edited mostly with various AI tools, I love the flixlix power flow card but wanted to separate some feeds - so I can have devices on Henley blocks or second consumer units show my total grid use but not confuse what my home appliances are using. If you get any use out of it great. If you want the original, far better, far more supported version stick with flixlix.



Current version: **0.6.0**

## How it differs from upstream

- Supports a **second feed** from the grid.
- Supports **combined grid entities**.
- Installs **alongside** the original card (see below).

The card and its editor elements are registered under their own names, so it can be
installed **alongside** the original Power Flow Card Plus without conflicts:

| Upstream element | This card |
| --- | --- |
| `power-flow-card-plus` | `sr-powerflow-card` |
| `power-flow-card-plus-editor` | `sr-powerflow-card-editor` |
| `individual-devices-editor` | `sr-individual-devices-editor` |
| `individual-row-editor` | `sr-individual-row-editor` |
| `link-subpage` | `sr-link-subpage` |
| `subpage-header` | `sr-subpage-header` |

It shows up in the card picker as **SR Power Flow Card**.

> **Upgrading to 0.5.0:** the card type is `custom:sr-powerflow-card` (since
> 0.4.0), and the second feed is configured under `second_feed` (since 0.5.0).
> Update both in each dashboard card that uses this card.

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
type: custom:sr-powerflow-card
entities:
  grid:
    entity: sensor.grid_power
  solar:
    entity: sensor.solar_power
  battery:
    entity: sensor.battery_power
    state_of_charge: sensor.battery_soc
```

### Second feed

A second supply from the grid, shown below the home circle. Set either a single
`entity`, or a list of `entities` whose power is summed. Add `individual` devices
to show what the second feed is powering.

```yaml
entities:
  second_feed:
    entity: sensor.second_feed_power
    name: Second Feed            # optional, default "Second Feed"
    icon: mdi:meter-electric-outline  # optional
    color: "#488fc2"             # optional
    display_zero: true           # optional
    display_zero_tolerance: 0    # optional
    inverted_animation: false    # optional
    individual:                  # optional devices fed by the second feed
      - entity: sensor.workshop_power
        name: Workshop
```

### Shapes

Any entity can be drawn as a shape instead of a circle. Add `shape` to the entities you want
to change. Anything without it stays a circle. In the visual editor it's the **Shape** dropdown on
each entity's page.

| `shape` | Looks like |
| --- | --- |
| `circle` | A circle (the default) |
| `house` | A house with a chimney |
| `car` | A car seen from the side, with windows and wheels |

```yaml
entities:
  home:
    shape: house       # the coloured split of where power comes from follows the house outline
  grid:
    entity: sensor.grid_power
  individual:
    - entity: sensor.ev_charger_power
      name: EV
      shape: car
  second_feed:
    entity: sensor.second_feed_power
    shape: house
    individual:
      - entity: sensor.workshop_power
        shape: car     # second feed devices can have shapes too
```

Shapes use the same colours as circles, and the flow lines still meet them in the middle of
each side.

All other configuration options are the same as upstream. See the
[Power Flow Card Plus documentation](https://github.com/flixlix/power-flow-card-plus#readme)
for the full reference.

## Development

The card is written in TypeScript with [Lit](https://lit.dev/). Building needs Node.js 22 or later.

```sh
npm install
npm run build      # writes sr-powerflow-card.js, the file HACS installs (commit it)
npm run dev        # rebuilds on change and serves http://<host>:5001/sr-powerflow-card.js
npm test
npm run typecheck
```

Layout:

- `src/sr-powerflow-card.ts`: the card.
- `src/ui-editor/`: the visual editor.
- `src/shared/`: upstream's shared card code, kept in upstream's layout and import paths
  (`@flixlix-cards/shared/...`) so it is easy to compare with
  [flixlix-cards](https://github.com/flixlix/flixlix-cards) and take in upstream fixes.

What this fork changes from upstream v0.3.7:

- Second feed: `src/shared/states/raw/second-feed.ts` (its power) and
  `src/shared/components/second-feed.ts` (the circle and its device row), plus styles in
  `src/shared/style/index.ts` and the editor page in `src/ui-editor/ui-editor.ts`.
- Combined entities (`sensor.a|sensor.b`) are summed with each entity's own unit, and count
  as available while any of them is: `src/shared/states/utils/`.
- Element names use `sr-` so the card installs alongside the original.
- Optional shapes (`shape:`): `src/shared/const/shapes.ts`, used by every entity's element in
  `src/shared/components/`.

## Credits

All credit for the original card goes to [@flixlix](https://github.com/flixlix) and the
contributors of [flixlix/flixlix-cards](https://github.com/flixlix/flixlix-cards).
Upstream changelog: [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE). Original work © flixlix and contributors; this fork keeps the original copyright notice.
