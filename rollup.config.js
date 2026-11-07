// Build for sr-powerflow-card. Adapted from @flixlix-cards/bundler (MIT).
// `npm run build` writes the bundled card to ./sr-powerflow-card.js, which HACS installs.
// `npm run dev` rebuilds on change and serves it at http://<host>:5001/sr-powerflow-card.js.
import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { existsSync } from "node:fs";
import path from "node:path";
import minifyHTMLModule from "rollup-plugin-minify-html-literals";
import serve from "rollup-plugin-serve";

const minifyHTML = minifyHTMLModule.default ?? minifyHTMLModule;
const watch = !!process.env.ROLLUP_WATCH;
const sharedDir = path.resolve("src/shared");

// Resolve `@flixlix-cards/shared/<path>` to src/shared/<path>.ts or src/shared/<path>/index.ts.
// The shared code keeps upstream's import paths, so it stays easy to compare with upstream.
const sharedAlias = {
  name: "shared-alias",
  resolveId(source) {
    if (!source.startsWith("@flixlix-cards/shared/")) return null;
    const base = path.join(sharedDir, source.slice("@flixlix-cards/shared/".length));
    for (const candidate of [`${base}.ts`, path.join(base, "index.ts"), base]) {
      if (existsSync(candidate)) return candidate;
    }
    return null;
  },
};

export default {
  input: "src/sr-powerflow-card.ts",
  output: {
    file: "sr-powerflow-card.js",
    format: "es",
    inlineDynamicImports: true,
    sourcemap: watch,
  },
  plugins: [
    sharedAlias,
    minifyHTML(),
    typescript({ declaration: false, declarationMap: false, noEmit: false, compilerOptions: { target: "es2020" } }),
    nodeResolve(),
    json({ compact: true }),
    commonjs(),
    babel({
      babelHelpers: "bundled",
      exclude: [/node_modules\/@mdi/],
      presets: [
        [
          "@babel/preset-env",
          {
            targets: "iOS >= 15, Safari >= 15, Chrome >= 80, Firefox >= 80",
            bugfixes: true,
            modules: false,
          },
        ],
      ],
    }),
    ...(watch
      ? [
          serve({
            contentBase: ["."],
            host: "0.0.0.0",
            port: 5001,
            allowCrossOrigin: true,
            headers: { "Access-Control-Allow-Origin": "*" },
          }),
        ]
      : [terser({ output: { comments: false } })]),
  ],
  // These @formatjs files use top-level `this` as `window` (as upstream's bundler sets it).
  moduleContext: (id) =>
    [
      "node_modules/@formatjs/intl-utils/lib/src/diff.js",
      "node_modules/@formatjs/intl-utils/lib/src/resolve-locale.js",
    ].some((file) => id.trimEnd().endsWith(file))
      ? "window"
      : undefined,
};
