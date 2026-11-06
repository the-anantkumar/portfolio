/// <reference lib="webworker" />
import { env, AutoModel, AutoTokenizer, FeatureExtractionPipeline } from "@huggingface/transformers";
import wasmURL from "onnxruntime-web/ort-wasm-simd-threaded.wasm?url";
import factoryURL from "onnxruntime-web/ort-wasm-simd-threaded.mjs?url";
import { EMBEDDING } from "../lib/embedding-config.mjs";

const scope = self as unknown as DedicatedWorkerGlobalScope;
env.allowLocalModels = false;
// Some library metadata probes omit the revision option. Pin the URL template
// too, so those requests cannot silently resolve the upstream main branch.
env.remotePathTemplate = `{model}/resolve/${EMBEDDING.revision}/`;
env.useBrowserCache = true;
env.cacheKey = "portfolio-public-embeddings-v1";
env.useWasmCache = false; // Use same-origin modules, without blob imports.
env.backends.onnx.wasm!.wasmPaths = {
  wasm: new URL(wasmURL, scope.location.href).href,
  mjs: new URL(factoryURL, scope.location.href).href,
};
// Pages does not supply cross-origin isolation headers. One WASM thread works
// without SharedArrayBuffer; the dedicated Worker keeps the interface usable.
env.backends.onnx.wasm!.numThreads = 1;
env.backends.onnx.wasm!.proxy = false;
const modelPrefix = `https://huggingface.co/${EMBEDDING.model}/resolve/${EMBEDDING.revision}/`;
env.fetch = (input, init) => {
  const url = String(input);
  if (!url.startsWith(modelPrefix)) throw new Error(`Unexpected model asset URL: ${url}`);
  return fetch(url, { ...init, credentials: "omit", referrerPolicy: "no-referrer" });
};

let extractor: Promise<FeatureExtractionPipeline> | undefined;
let lastProgressAt = 0;
function loadModel() {
  const options = {
    revision: EMBEDDING.revision,
    dtype: EMBEDDING.dtype,
    device: "wasm" as const,
    progress_callback: (progress: { status: string; progress?: number }) => {
      if (Date.now() - lastProgressAt < 500) return;
      lastProgressAt = Date.now();
      const percent = typeof progress.progress === "number"
        ? ` Current file: ${Math.min(100, Math.round(progress.progress))}%.` : "";
      scope.postMessage({ type: "progress", message: `Preparing the search model.${percent} Word matching is still available.` });
    },
  };
  // Construct explicitly: pipeline() in 4.3.2 probes unversioned model
  // metadata before applying revision. Every network asset here must be pinned.
  extractor ??= Promise.all([
    AutoModel.from_pretrained(EMBEDDING.model, options),
    AutoTokenizer.from_pretrained(EMBEDDING.model, options),
  ]).then(([model, tokenizer]) => new FeatureExtractionPipeline({ task: "feature-extraction", model, tokenizer }));
  return extractor;
}

// Serialize inference to avoid concurrent session calls on slower devices.
let queue = Promise.resolve();
scope.addEventListener("message", (event: MessageEvent) => {
  const message = event.data;
  if (message?.type === "load") {
    void loadModel().then(() => scope.postMessage({ type: "ready" })).catch((error: unknown) => {
      extractor = undefined;
      scope.postMessage({ type: "error", message: error instanceof Error ? error.message : "The public model could not be loaded." });
    });
  } else if (message?.type === "embed" && Number.isSafeInteger(message.id)
    && typeof message.text === "string" && message.text.length <= 500) {
    queue = queue.then(async () => {
      try {
        const model = await loadModel();
        const tensor = await model(message.text, { pooling: EMBEDDING.pooling, normalize: true });
        scope.postMessage({ type: "embedding", id: message.id, vector: Array.from(tensor.data) });
      } catch {
        scope.postMessage({ type: "error", id: message.id, message: "Meaning search could not complete." });
      }
    });
  }
});
