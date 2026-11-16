// Public immutable model; generation requires its own explicit opt-in.
export const RAG_MODEL = Object.freeze({
  model: "onnx-community/Qwen2.5-0.5B-Instruct",
  revision: "22942cb7d7ba4cc81bb4673549ca4d4614469b5e",
  dtype: "q8",
  weightBytes: 512096557,
  weightSha256: "41834041ab1b29eff9fc592f1a29a1844133aea35832ea9fa91682be13016100",
  maxPromptTokens: 2048, maxNewTokens: 48,
  cacheKey: "portfolio-rag-qwen-v1",
});
