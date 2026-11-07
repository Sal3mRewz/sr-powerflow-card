import { css, unsafeCSS } from "lit";

/**
 * Optional shapes for an entity's circle, set with `shape:` on the entity. Leaving it out (or
 * `circle`) keeps the normal circle.
 *
 * Each shape is drawn in the 80×80 box the circle uses, inset 2px so a 4px stroke stays inside
 * it. Every outline touches the middle of all four sides (40,2 / 78,40 / 40,78 / 2,40), where the
 * flow lines meet the circle.
 */
export const SHAPE_NAMES = ["circle", "house", "car"] as const;
export type ShapeName = (typeof SHAPE_NAMES)[number];

export type ShapeDefinition = {
  /** One closed path. On the home it also carries the coloured split of where power comes from. */
  outline: string;
  /** Extra detail drawn with the outline but not part of the split, such as wheels. */
  decoration?: string;
};

export const SHAPES: Record<Exclude<ShapeName, "circle">, ShapeDefinition> = {
  // A house with a chimney on the right side of the roof.
  house: {
    outline: "M40 2 L60 16.7 V7 H67 V21.9 L78 30 V78 H2 V30 Z",
  },
  // A car seen from the side, facing right: wheel arches cut into the bottom edge, with wheels
  // and windows as decoration. Its content is nudged down (see shapeStyles) to sit below the
  // windows and clear the wheels.
  car: {
    outline:
      "M2 78 V44 Q2 38 8 37 L14 36 L22 7 Q23.5 2 28 2 H52 Q56 2 58 6 L66 34 L75 37 Q78 38.5 78 42 V78 H66 A8.5 8.5 0 1 0 54 78 H26 A8.5 8.5 0 1 0 14 78 Z",
    decoration:
      "M54 72 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M14 72 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M21 25 L25.5 8 H38 V25 Z M42 8 H54.5 L59 25 H42 Z",
  },
};

/** The shape set on an entity, or undefined for a circle (the default) or an unknown name. */
export const getShape = (field?: { shape?: unknown }): ShapeDefinition | undefined =>
  typeof field?.shape === "string" && field.shape in SHAPES
    ? SHAPES[field.shape as keyof typeof SHAPES]
    : undefined;

/** Classes to add to an entity's `.circle` element to draw its shape. Empty for a circle. */
export const shapeClass = (field?: { shape?: unknown }): string =>
  getShape(field) ? `shape shape-${field!.shape as string}` : "";

const maskImage = ({ outline, decoration }: ShapeDefinition) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80' fill='none' stroke='black' stroke-width='2' stroke-linejoin='round'><path d='${outline} ${decoration ?? ""}'/></svg>`
  )}")`;

/**
 * Styles for shaped circles. The circle's border is hidden and a full-size `::before` takes its
 * colour (`border-color: inherit`) and is masked to the shape's outline. So every existing
 * border colour rule, including dynamic colours, applies to shapes unchanged.
 */
export const shapeStyles = css`
  .circle.shape {
    border-style: none;
    border-radius: 0;
  }
  .circle.shape::before {
    content: "";
    position: absolute;
    inset: 0;
    box-sizing: border-box;
    border: 40px solid;
    border-color: inherit;
    pointer-events: none;
    -webkit-mask: var(--shape-mask) center / 100% 100% no-repeat;
    mask: var(--shape-mask) center / 100% 100% no-repeat;
  }
  /* The home draws its outline as the coloured split of its sources instead. */
  .home .circle.shape::before {
    display: none;
  }
  .home-circle-sections path {
    stroke-width: 4px;
    animation: var(--home-circle-animation);
    transition:
      stroke-dashoffset 0.4s,
      stroke-dasharray 0.4s;
  }
  .home-circle-sections path.low-carbon {
    stroke: var(--non-fossil-color);
  }
  .circle.shape-car {
    padding-top: 8px;
  }
  .home-circle-sections path.shape-decoration {
    stroke: var(--primary-color);
    stroke-width: 2px;
    animation: none;
  }
  ${unsafeCSS(
    Object.entries(SHAPES)
      .map(
        ([name, shape]) => `
  .circle.shape-${name} {
    --shape-mask: ${maskImage(shape)};
  }
  .circle.shape-${name} > ha-ripple {
    border-radius: 0;
    clip-path: path("${shape.outline}");
  }`
      )
      .join("\n")
  )}
`;
