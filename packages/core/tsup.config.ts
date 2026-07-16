import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "types/index": "src/types/index.ts",
    "viewer/index": "src/viewer/index.ts",
    "annotations/index": "src/annotations/index.ts",
    "utils/index": "src/utils/index.ts"
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["openseadragon", "@wtsml/doodle"],
  treeshake: true
});
