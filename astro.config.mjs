import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
// Production supplies its public origin and path; local development stays at /.
const site = process.env.SITE_URL || process.env.CF_PAGES_URL;
export default defineConfig({
  output: "static",
  base: process.env.SITE_BASE || "/",
  ...(site ? { site } : {}),
  build: { inlineStylesheets: "never" },
  vite: {
    resolve: {
      // This feature deliberately uses CPU/WASM only. Avoid bundling WebGPU
      // kernels and a second, unused WASM binary from the library default.
      alias: [{
        find: /^onnxruntime-web\/webgpu$/,
        replacement: fileURLToPath(new URL("./node_modules/onnxruntime-web/dist/ort.wasm.min.mjs", import.meta.url)),
      }],
    },
    worker: { format: "es" },
  },
});
