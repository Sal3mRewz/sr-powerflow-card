import { shapeSchema } from "./_schema-base";

// Visual editor fields for `entities.second_feed`. Its devices (`individual`) are edited with
// the individual devices editor below this form.
export const secondFeedSchema = [
  {
    name: "entities",
    label: "Extra Entities (counted in the total, not drawn)",
    selector: { entity: { multiple: true, filter: { domain: "sensor" } } },
  },
  {
    name: "entity",
    label: "Total Entity (optional, overrides the sum)",
    selector: { entity: { filter: { domain: "sensor" } } },
  },
  {
    type: "grid",
    column_min_width: "200px",
    schema: [
      { name: "name", label: "Name", selector: { text: {} } },
      { name: "icon", label: "Icon", selector: { icon: {} } },
      shapeSchema,
      { name: "color", label: "Color", selector: { color_rgb: {} } },
      {
        name: "decimals",
        label: "Decimals",
        selector: { number: { mode: "box", min: 0, step: 1 } },
      },
      { name: "color_value", label: "Color Value", selector: { boolean: {} } },
      { name: "color_icon", label: "Color Icon", default: true, selector: { boolean: {} } },
      {
        name: "display_zero",
        label: "Display When Zero",
        default: true,
        selector: { boolean: {} },
      },
      {
        name: "display_zero_tolerance",
        label: "Display Zero Tolerance",
        selector: { number: { mode: "box", min: 0, step: 1 } },
      },
      { name: "inverted_animation", label: "Invert Animation", selector: { boolean: {} } },
    ],
  },
];
