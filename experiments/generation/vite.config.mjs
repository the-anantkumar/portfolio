import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
export default defineConfig({
  root: "experiments/generation/web",
  publicDir: false,
  resolve: { alias: [{ find: /^onnxruntime-web\/webgpu$/, replacement: fileURLToPath(new URL("../../node_modules/onnxruntime-web/dist/ort.wasm.min.mjs", import.meta.url)) }] },
  worker: { format: "es" },
  build: { outDir: resolve("artifacts/generation/browser"), emptyOutDir: true, target: "es2022" },
});
