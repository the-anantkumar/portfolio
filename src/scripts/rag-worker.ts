/// <reference lib="webworker" />
import { env, AutoModelForSeq2SeqLM, AutoTokenizer, type Tensor } from "@huggingface/transformers";
import wasmURL from "onnxruntime-web/ort-wasm-simd-threaded.wasm?url";
import factoryURL from "onnxruntime-web/ort-wasm-simd-threaded.mjs?url";
import { RAG_MODEL } from "../lib/rag-config.mjs";
import { prepareRag, validateRagSelection } from "../lib/rag.mjs";
import { buildRagBinaryPrompt, parseRagRelevance } from "../lib/rag-prompt.mjs";

const scope = self as unknown as DedicatedWorkerGlobalScope;
env.allowLocalModels = false;
env.remotePathTemplate = `{model}/resolve/${RAG_MODEL.revision}/`;
env.useBrowserCache = true;
env.cacheKey = RAG_MODEL.cacheKey;
env.useWasmCache = false;
env.backends.onnx.wasm!.numThreads = 1;
env.backends.onnx.wasm!.proxy = false;
env.backends.onnx.wasm!.wasmPaths = {
  wasm: new URL(wasmURL, scope.location.href).href,
  mjs: new URL(factoryURL, scope.location.href).href,
};
const prefix = `https://huggingface.co/${RAG_MODEL.model}/resolve/${RAG_MODEL.revision}/`;
env.fetch = (input, init = {}) => {
  if (!String(input).startsWith(prefix)) throw new Error("Unpinned model asset");
  const headers = new Headers(init.headers);
  headers.delete("Authorization");
  return fetch(input, { ...init, headers, credentials: "omit", referrerPolicy: "no-referrer" });
};

let model: Awaited<ReturnType<typeof AutoModelForSeq2SeqLM.from_pretrained>> | undefined;
let tokenizer: Awaited<ReturnType<typeof AutoTokenizer.from_pretrained>> | undefined;
let busy = false;
let progressAt = 0;
scope.addEventListener("message", async ({ data }) => {
  if (busy) return;
  busy = true;
  try {
    if (data?.type === "load") {
      if (!model || !tokenizer) {
        const options = {
          revision: RAG_MODEL.revision,
          dtype: "q8" as const,
          device: "wasm" as const,
          progress_callback: (progress: { status: string; progress?: number }) => {
            if (Date.now() - progressAt < 500) return;
            progressAt = Date.now();
            scope.postMessage({
              type: "progress",
              percent: Number.isFinite(progress.progress) ? Math.round(progress.progress!) : undefined,
            });
          },
        };
        [model, tokenizer] = await Promise.all([
          AutoModelForSeq2SeqLM.from_pretrained(RAG_MODEL.model, options),
          AutoTokenizer.from_pretrained(RAG_MODEL.model, options),
        ]);
      }
      scope.postMessage({ type: "ready" });
    } else if (data?.type === "generate" && Number.isSafeInteger(data.id)) {
      if (!model || !tokenizer) throw new Error("Model unavailable");
      const prepared = prepareRag(data.question, data.passages);
      if (prepared.kind !== "ready") {
        scope.postMessage({ type: "answer", id: data.id, raw: '{"sources":[]}' });
        return;
      }
      const sources: number[] = [];
      let maxPromptTokensUsed = 0;
      for (const [index, passage] of prepared.passages.entries()) {
        const prompt = buildRagBinaryPrompt(prepared.question, passage);
        const inputs = tokenizer(prompt, { add_special_tokens: true, truncation: false });
        const promptTokens = inputs.input_ids.data.length;
        maxPromptTokensUsed = Math.max(maxPromptTokensUsed, promptTokens);
        if (promptTokens > RAG_MODEL.maxPromptTokens) throw new Error("Evidence exceeds context budget");
        const output = await model.generate({
          ...inputs,
          max_new_tokens: RAG_MODEL.maxNewTokens,
          do_sample: false,
          return_dict_in_generate: false,
        });
        const raw = tokenizer.batch_decode(output as Tensor, { skip_special_tokens: true })[0];
        if (parseRagRelevance(raw)) sources.push(index + 1);
      }
      const raw = JSON.stringify({ sources });
      const checked = validateRagSelection(raw, prepared.passages, prepared.question);
      scope.postMessage({
        type: "answer", id: data.id,
        raw: checked.kind === "abstain" ? '{"sources":[]}' : raw,
        maxPromptTokensUsed,
      });
    }
  } catch {
    scope.postMessage({ type: "error", id: data?.id, message: "The local answer could not be completed. Original evidence is available." });
  } finally {
    busy = false;
  }
});
