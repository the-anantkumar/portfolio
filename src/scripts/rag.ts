import { prepareRag, validateRagSelection } from "../lib/rag.mjs";
import { RAG_MODEL } from "../lib/rag-config.mjs";
import type { KnowledgePassage } from "../lib/ask-types";

export function createRag(root: HTMLElement) {
  const el = <T extends HTMLElement>(id: string) => root.querySelector<T>(`#${id}`)!;
  const disclosure = el<HTMLDetailsElement>("rag-enhancement");
  const enable = el<HTMLButtonElement>("rag-enable"), stop = el<HTMLButtonElement>("rag-stop");
  const clear = el<HTMLButtonElement>("rag-clear"), generate = el<HTMLButtonElement>("rag-generate");
  const status = el("rag-status"), answerStatus = el("rag-answer-status");
  const panel = el("rag-answer-panel"), content = el("rag-answer-content");
  let worker: Worker | undefined;
  let state: "off" | "loading" | "ready" | "generating" = "off";
  let sequence = 0, timer: ReturnType<typeof setTimeout> | undefined;
  let context: { question: string; passages: KnowledgePassage[] } | undefined;
  function controls() {
    enable.hidden = state !== "off"; stop.hidden = state === "off";
    stop.textContent = state === "loading" ? "Cancel answer download" : state === "generating" ? "Stop answer" : "Disable AI answers";
    generate.disabled = state !== "ready" || !context;
    generate.hidden = state === "off" || state === "loading";
    clear.disabled = state !== "off";
  }
  function shutdown(message: string) {
    sequence++; clearTimeout(timer); worker?.terminate(); worker = undefined; state = "off";
    status.textContent = message; controls();
  }
  function reset() {
    sequence++; context = undefined; content.replaceChildren(); panel.hidden = true; answerStatus.textContent = "";
    if (state === "generating") shutdown("Answer stopped because the question changed. Enable again to compose another answer.");
    controls();
  }
  function evidence(question: string, passages: KnowledgePassage[]) {
    reset();
    const result = prepareRag(question, passages);
    if (result.kind !== "ready") return;
    context = { question: result.question, passages: result.passages.map(p => ({...p})) };
    panel.hidden = false;
    answerStatus.textContent = state === "ready" ? "Ready to compose from the sources below." : "Optional local answers can be enabled below the question box.";
    controls();
  }
  enable.addEventListener("click", () => {
    if (state !== "off") return;
    disclosure.open = true; state = "loading"; controls(); stop.focus();
    status.textContent = "Preparing the answer model. Evidence search remains available.";
    const instance = new Worker(new URL("./rag-worker.ts", import.meta.url), { type: "module" }); worker = instance;
    timer = setTimeout(() => { if (worker === instance) shutdown("Loading timed out. You can retry; evidence search is ready."); }, 180_000);
    instance.addEventListener("error", () => { if (worker === instance) shutdown("The answer model is unavailable. You can retry; evidence search is ready."); });
    instance.addEventListener("message", ({ data }) => {
      if (worker !== instance) return;
      if (data.type === "progress" && state === "loading") status.textContent = `Preparing the answer model.${typeof data.percent === "number" ? ` Current file: ${data.percent}%.` : ""} You can keep exploring.`;
      if (data.type === "ready") { clearTimeout(timer); state = "ready"; status.textContent = "Local answers ready. Choose Compose on a search result."; controls(); }
      if (data.type === "error") {
        if (data.id !== undefined && data.id !== sequence) return;
        answerStatus.textContent = "An answer could not be composed. Read the original evidence below.";
        shutdown("The answer model stopped. Enable it to retry.");
      }
      if (data.type === "answer" && data.id === sequence && state === "generating" && context) {
        clearTimeout(timer); state = "ready"; controls(); content.replaceChildren();
        try {
          const result = validateRagSelection(data.raw, context.passages);
          if (result.kind === "abstain") { answerStatus.textContent = "The model could not select a supported answer. Explore the original evidence below."; return; }
          for (const [index, passage] of result.passages.entries()) {
            const article = document.createElement("article"); article.className = "rag-quote"; article.dataset.passageId = passage.id;
            const role = document.createElement("p"); role.className = "rag-attribution"; role.textContent = passage.context;
            const quote = document.createElement("blockquote"); quote.textContent = passage.text;
            const link = document.createElement("a"); link.href = passage.url; link.textContent = `[${index + 1}] ${passage.title}`;
            article.append(role, quote, link); content.append(article);
          }
          answerStatus.textContent = result.repaired ? "Original wording, selected by a local language model. The companion outcome is included to preserve its qualification." : "Original wording, selected by a local language model. Check the linked sources for context.";
        } catch { answerStatus.textContent = "The model output did not pass source checks. Original evidence is available below."; }
      }
    });
    instance.postMessage({ type: "load" });
  });
  generate.addEventListener("click", () => {
    if (state !== "ready" || !worker || !context) return;
    const id = ++sequence; state = "generating"; controls(); content.replaceChildren();
    answerStatus.textContent = "Composing from the retrieved sources on this device…";
    timer = setTimeout(() => { if (id === sequence) { answerStatus.textContent = "Answer timed out. Original evidence is available below."; shutdown("Answer stopped. Enable again to retry."); } }, 60_000);
    worker.postMessage({ type: "generate", id, question: context.question, passages: context.passages });
  });
  stop.addEventListener("click", () => { shutdown("AI answers are off. Evidence search is ready."); content.replaceChildren(); answerStatus.textContent = "Answer stopped. Original evidence is available below."; enable.focus(); });
  clear.addEventListener("click", async () => {
    shutdown("Removing the answer model cache…"); clear.disabled = true;
    try { await caches.delete(RAG_MODEL.cacheKey); status.textContent = "Answer model cache removed from this browser. A future opt-in will download it again."; }
    catch { status.textContent = "Cache removal is unavailable here. You can clear this site's data in browser settings."; }
    controls();
  });
  window.addEventListener("pagehide", () => { reset(); shutdown("AI answers are off."); });
  disclosure.hidden = false; controls();
  return { reset, evidence };
}
