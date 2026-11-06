import { searchPassages } from "../lib/retrieval.mjs";
import { verifyVectors } from "../lib/embedding-config.mjs";
import type {
  EmbeddingMessage,
  KnowledgeCorpus,
  KnowledgePassage,
  SearchVectors,
} from "../lib/ask-types";

const root = document.querySelector<HTMLElement>("#ask-app");

if (root) {
  const form = root.querySelector<HTMLFormElement>("#ask-form")!;
  const question = root.querySelector<HTMLTextAreaElement>("#ask-question")!;
  const status = root.querySelector<HTMLElement>("#ask-status")!;
  const results = root.querySelector<HTMLElement>("#ask-results")!;
  const list = root.querySelector<HTMLOListElement>("#ask-result-list")!;
  const summary = root.querySelector<HTMLElement>("#ask-result-summary")!;
  const enhancement = root.querySelector<HTMLElement>("#ask-enhancement")!;
  const enable = root.querySelector<HTMLButtonElement>("#semantic-enable")!;
  const cancel = root.querySelector<HTMLButtonElement>("#semantic-cancel")!;
  const semanticStatus = root.querySelector<HTMLElement>("#semantic-status")!;
  const mode = root.querySelector<HTMLElement>("#ask-mode")!;

  let corpusPromise: Promise<KnowledgeCorpus> | undefined;
  let worker: Worker | undefined;
  let vectors: SearchVectors | undefined;
  let semanticState: "off" | "loading" | "ready" = "off";
  let lifecycle = 0;
  let searchSequence = 0;
  let embeddingSequence = 0;
  let loadingTimer: ReturnType<typeof setTimeout> | undefined;
  let rejectLoading: ((error: Error) => void) | undefined;
  const pending = new Map<number, {
    resolve: (vector: number[]) => void;
    reject: (error: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  }>();

  async function readJSON(url: string): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch(url, {
        credentials: "omit",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Search data unavailable");
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  function isPassage(value: unknown): value is KnowledgePassage {
    if (!isRecord(value)) return false;
    if (!["id", "title", "text", "context", "url"].every(
      (key) => typeof value[key] === "string" && value[key].length > 0,
    )) return false;
    try {
      const url = new URL(value.url as string, window.location.href);
      return url.origin === window.location.origin && ["http:", "https:"].includes(url.protocol);
    } catch {
      return false;
    }
  }

  async function getCorpus(): Promise<KnowledgeCorpus> {
    if (!corpusPromise) {
      corpusPromise = readJSON(root!.dataset.knowledgeUrl!).then((value) => {
        if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.passages)
          || value.passages.length === 0 || !value.passages.every(isPassage)) {
          throw new Error("Invalid search data");
        }
        const passages: KnowledgePassage[] = value.passages;
        if (new Set(passages.map((passage) => passage.id)).size !== passages.length) {
          throw new Error("Duplicate search passages");
        }
        return { version: 1 as const, passages };
      }).catch((error: unknown) => {
        corpusPromise = undefined;
        throw error;
      });
    }
    return corpusPromise;
  }

  async function checkedVectors(value: unknown, corpus: KnowledgeCorpus): Promise<SearchVectors> {
    if (!isRecord(value) || value.version !== 1 || !isRecord(value.vectors)
      || !["model", "revision", "dtype", "corpusHash"].every(
        (key) => typeof value[key] === "string" && value[key].length > 0,
      )) throw new Error("Invalid meaning search data");
    await verifyVectors(value, corpus.passages);
    return value as unknown as SearchVectors;
  }

  function rejectPending() {
    for (const request of pending.values()) {
      clearTimeout(request.timer);
      request.reject(new Error("Meaning search stopped"));
    }
    pending.clear();
  }

  function useWordMatching(message: string) {
    lifecycle += 1;
    clearTimeout(loadingTimer);
    rejectLoading?.(new Error("Model loading stopped"));
    rejectLoading = undefined;
    worker?.terminate();
    worker = undefined;
    vectors = undefined;
    semanticState = "off";
    rejectPending();
    enable.hidden = false;
    enable.disabled = false;
    cancel.hidden = true;
    mode.textContent = "WORD MATCHING";
    semanticStatus.textContent = message;
    if (document.activeElement === cancel) enable.focus();
  }

  function embed(text: string): Promise<number[]> {
    if (!worker || semanticState !== "ready") return Promise.reject(new Error("Model unavailable"));
    const id = ++embeddingSequence;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error("Meaning search timed out"));
      }, 30_000);
      pending.set(id, { resolve, reject, timer });
      worker!.postMessage({ type: "embed", id, text });
    });
  }

  function showResults(matches: { passage: KnowledgePassage; score: number }[], semantic: boolean) {
    const fragment = document.createDocumentFragment();
    for (const { passage } of matches) {
      const item = document.createElement("li");
      const article = document.createElement("article");
      article.className = "ask-result";
      const context = document.createElement("p");
      context.className = "ask-result-context";
      context.textContent = passage.context;
      const title = document.createElement("h3");
      title.textContent = passage.title;
      const text = document.createElement("p");
      text.className = "ask-result-text";
      text.textContent = passage.text;
      const link = document.createElement("a");
      link.className = "ask-source-link";
      link.href = passage.url;
      link.textContent = `Read source: ${passage.title}`;
      article.append(context, title, text, link);
      item.append(article);
      fragment.append(item);
    }
    list.replaceChildren(fragment);
    results.hidden = false;
    summary.textContent = matches.length
      ? `${matches.length} relevant ${matches.length === 1 ? "passage" : "passages"}, found with ${semantic ? "meaning and word matching" : "word matching"}.`
      : "No supported match. Try a project, employer, skill, or a more specific question.";
    status.textContent = matches.length
      ? `${matches.length} ${matches.length === 1 ? "passage is" : "passages are"} ready below, using ${semantic ? "meaning and word matching" : "word matching"}. Open a source for the full context.`
      : "No supported match in the public portfolio. I cannot verify an answer from these sources.";
    // Results follow optional model controls. Bring them into view immediately
    // after a deliberate search, including for keyboard and phone visitors.
    root!.querySelector<HTMLElement>("#ask-result-heading")!.focus({ preventScroll: true });
    results.scrollIntoView({ block: "start", behavior: "instant" });
  }

  async function search() {
    const current = ++searchSequence;
    rejectPending();
    const text = question.value.trim();
    if (!text || text.length > 500) {
      status.textContent = text.length > 500
        ? "Keep your question to 500 characters or fewer."
        : "Enter a question about my work to begin.";
      question.focus();
      return;
    }
    results.setAttribute("aria-busy", "true");
    results.hidden = true;
    status.textContent = "Finding relevant portfolio passages…";
    try {
      const corpus = await getCorpus();
      if (current !== searchSequence) return;
      let queryVector: number[] | undefined;
      if (semanticState === "ready") {
        try {
          queryVector = await embed(text);
        } catch {
          if (current !== searchSequence) return;
          useWordMatching("Meaning-based search is unavailable. Word matching is still ready. You can try enabling it again.");
        }
      }
      if (current !== searchSequence) return;
      const semantic = Boolean(queryVector && vectors);
      const response = searchPassages(text, corpus.passages, semantic
        ? { queryVector, vectors: vectors!.vectors }
        : undefined);
      showResults(response.kind === "results" ? response.results.slice(0, 3) : [], semantic);
    } catch {
      if (current !== searchSequence) return;
      status.textContent = "Search data could not be loaded. Try again, or explore the portfolio links below.";
    } finally {
      if (current === searchSequence) results.setAttribute("aria-busy", "false");
    }
  }

  async function enableMeaningSearch() {
    if (semanticState !== "off") return;
    const generation = ++lifecycle;
    semanticState = "loading";
    enable.hidden = true;
    cancel.hidden = false;
    cancel.textContent = "Cancel download";
    mode.textContent = "LOADING MEANING SEARCH";
    semanticStatus.textContent = "Preparing the model. You can keep searching with word matching while it loads.";
    cancel.focus();
    try {
      const instance = new Worker(new URL("./embedding-worker.ts", import.meta.url), { type: "module" });
      worker = instance;
      const modelReady = new Promise<void>((resolve, reject) => {
        rejectLoading = reject;
        loadingTimer = setTimeout(() => reject(new Error("Model loading timed out")), 120_000);
        instance.addEventListener("error", (event) => {
          event.preventDefault();
          if (generation !== lifecycle) return;
          reject(new Error("Model loading failed"));
          useWordMatching("The model could not run on this device. Word matching is still ready. You can try again.");
        });
        instance.addEventListener("message", (event: MessageEvent<EmbeddingMessage>) => {
          if (generation !== lifecycle) return;
          const message = event.data;
          if (message.type === "progress" && semanticState === "loading") {
            semanticStatus.textContent = message.message;
          } else if (message.type === "ready") {
            clearTimeout(loadingTimer);
            rejectLoading = undefined;
            resolve();
          } else if (message.type === "embedding") {
            const request = pending.get(message.id);
            if (!request) return;
            pending.delete(message.id);
            clearTimeout(request.timer);
            if (Array.isArray(message.vector) && message.vector.length > 0
              && message.vector.length === Object.values(vectors?.vectors ?? {})[0]?.length
              && message.vector.every((value) => Number.isFinite(value))) {
              request.resolve(message.vector);
            } else {
              request.reject(new Error("Invalid model result"));
            }
          } else if (message.type === "error") {
            if (message.id !== undefined) {
              const request = pending.get(message.id);
              if (request) {
                pending.delete(message.id);
                clearTimeout(request.timer);
                request.reject(new Error("Meaning search failed"));
              }
            } else {
              reject(new Error("Model unavailable"));
              useWordMatching("The model could not be loaded. Word matching is still ready. You can try again.");
            }
          }
        });
      });
      instance.postMessage({ type: "load" });
      const dataReady = Promise.all([getCorpus(), readJSON(root!.dataset.vectorsUrl!)])
        .then(([corpus, data]) => checkedVectors(data, corpus));
      const [, data] = await Promise.all([modelReady, dataReady]);
      if (generation !== lifecycle) return;
      vectors = data;
      semanticState = "ready";
      mode.textContent = "MEANING + WORD MATCHING";
      cancel.textContent = "Use word matching";
      semanticStatus.textContent = "Meaning-based search is ready. Your next question will use the model on this device.";
    } catch {
      if (generation !== lifecycle) return;
      useWordMatching("The model could not be loaded. Word matching is still ready. You can try again.");
      enable.focus();
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void search();
  });
  question.addEventListener("input", () => {
    searchSequence += 1;
    rejectPending();
    results.setAttribute("aria-busy", "false");
    status.textContent = "";
  });
  root.querySelectorAll<HTMLButtonElement>("[data-ask-example]").forEach((button) => {
    button.addEventListener("click", () => {
      question.value = button.dataset.askExample!;
      question.focus();
      void search();
    });
  });
  enable.addEventListener("click", () => { void enableMeaningSearch(); });
  root.querySelector("#ask-another")!.addEventListener("click", () => {
    question.focus();
    question.select();
  });
  cancel.addEventListener("click", () => {
    const loading = semanticState === "loading";
    useWordMatching(loading
      ? "Model loading canceled. Word matching is ready."
      : "Meaning-based search is off. Word matching is ready.");
    enable.focus();
  });
  window.addEventListener("pagehide", () => {
    searchSequence += 1;
    useWordMatching("Word matching is ready.");
  });
  form.hidden = false;
  enhancement.hidden = false;
}
