import { createRag } from "./rag";
import { searchPassages } from "../lib/retrieval.mjs";
import { verifyVectors } from "../lib/embedding-config.mjs";
import { TOPICS, groupMatches, followupsFor, selectPassages, sourceTemplateId } from "../lib/navigator.mjs";
import type { NavigationAction } from "../lib/navigator.mjs";
import type {
  EmbeddingMessage,
  KnowledgeCorpus,
  KnowledgePassage,
  SearchVectors,
} from "../lib/ask-types";

const root = document.querySelector<HTMLElement>("#ask-app");

if (root) {
  const rag = createRag(root);
  const form = root.querySelector<HTMLFormElement>("#ask-form")!;
  const question = root.querySelector<HTMLTextAreaElement>("#ask-question")!;
  const status = root.querySelector<HTMLElement>("#ask-status")!;
  const results = root.querySelector<HTMLElement>("#ask-results")!;
  const list = root.querySelector<HTMLOListElement>("#ask-result-list")!;
  const summary = root.querySelector<HTMLElement>("#ask-result-summary")!;
  const exploreMeaning = root.querySelector<HTMLButtonElement>("#ask-explore-meaning")!;
  const enhancement = root.querySelector<HTMLDetailsElement>("#ask-enhancement")!;
  const followups = root.querySelector<HTMLElement>("#ask-followups")!;
  const followupList = root.querySelector<HTMLElement>("#ask-followup-list")!;
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

  function setTopic(id = "") {
    root!.querySelectorAll<HTMLButtonElement>("[data-ask-topic]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.askTopic === id));
    });
  }

  function showResults(matches: { passage: KnowledgePassage; score: number }[], semantic: boolean, reason?: string, guided = false) {
    const fragment = document.createDocumentFragment();
    const groups = groupMatches(matches);
    for (const group of groups) {
      const item = document.createElement("li");
      const template = document.getElementById(sourceTemplateId(group.key)) as HTMLTemplateElement | null;
      if (!template) throw new Error("Public source card missing");
      const card = template.content.cloneNode(true) as DocumentFragment;
      const evidence = card.querySelector<HTMLElement>(".ask-card-evidence")!;
      card.querySelector(".ask-evidence-count")!.textContent = String(group.matches.length);
      card.querySelector(".ask-matched-sections")!.textContent = `Matched: ${group.matches.map(({ passage }) => passage.title.split(": ").slice(1).join(": ") || passage.title).join(" · ")}`;
      for (const { passage } of group.matches) {
        const section = document.createElement("section");
        section.className = "ask-evidence-passage";
        section.dataset.passageId = passage.id;
        const title = document.createElement("h4");
        title.textContent = passage.title;
        const text = document.createElement("p");
        text.className = "ask-result-text";
        text.textContent = passage.text;
        const link = document.createElement("a");
        link.className = "ask-source-link";
        link.href = passage.url;
        link.textContent = `Read source: ${passage.title}`;
        section.append(title, text, link);
        evidence.append(section);
      }
      item.append(card);
      fragment.append(item);
    }
    list.replaceChildren(fragment);
    rag.evidence(question.value.trim(), matches.map(({ passage }) => passage));
    followupList.replaceChildren();
    followups.hidden = groups.length === 0;
    if (groups.length) {
      const current = new Set(matches.map(({ passage }) => passage.id));
      const actions = followupsFor(groups[0].key).filter((action) => !action.passages.every((id) => current.has(id))).slice(0, 3);
      followups.hidden = actions.length === 0;
      for (const action of actions) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "ask-secondary";
        button.dataset.askFollowup = action.id;
        button.textContent = action.question;
        button.addEventListener("click", () => { void navigate(action); });
        followupList.append(button);
      }
    }
    results.hidden = false;
    const explanations: Record<string, string> = {
      private: "This search covers public professional information. Private details and confidential records are not indexed.",
      "unpublished-technology": "The public portfolio does not document the requested technology experience. Try an employer, project, or published skill.",
      "unsupported-claim": "These sources do not establish that claim. Try asking what was evaluated and what remains unverified.",
      "unsupported-request": "Ask about Anant’s public work, experience, or projects.",
      "dated-evidence-only": "Search uses published snapshots. Check the source pages for measurement dates and the contribution calendar’s capture date.",
    };
    const noMatch = explanations[reason ?? ""] ?? (semantic
      ? "No relevant passage was found. Try a project, employer, skill, or a more specific question."
      : "Word matching did not find enough overlap. Try different words, or explore optional meaning-based search.");
    exploreMeaning.hidden = matches.length > 0 || semanticState !== "off" || reason !== "insufficient-evidence";
    summary.textContent = matches.length
      ? `${groups.length} ${groups.length === 1 ? "source" : "sources"} · ${matches.length} ${matches.length === 1 ? "passage" : "passages"} · ${guided ? "Guided exploration" : semantic ? "Meaning + word matching" : "Word matching"}`
      : `No supported match. ${noMatch}`;
    status.textContent = matches.length
      ? `${groups.length} ${groups.length === 1 ? "source is" : "sources are"} ready below${guided ? " from the selected topic" : `, using ${semantic ? "meaning and word matching" : "word matching"}`}. Expand matched evidence to read the original passages.`
      : `No supported match. ${noMatch}`;
    // Results follow optional model controls. Bring them into view immediately
    // after a deliberate search, including for keyboard and phone visitors.
    root!.querySelector<HTMLElement>("#ask-result-heading")!.focus({ preventScroll: true });
    results.scrollIntoView({ block: "start", behavior: "instant" });
  }

  async function navigate(selection: NavigationAction, topicId = "") {
    rag.reset();
    const current = ++searchSequence;
    rejectPending();
    setTopic(topicId);
    question.value = selection.question;
    results.hidden = true;
    followups.hidden = true;
    results.setAttribute("aria-busy", "true");
    status.textContent = "Opening public portfolio evidence…";
    try {
      const corpus = await getCorpus();
      if (current !== searchSequence) return;
      showResults(selectPassages(selection, corpus.passages), false, undefined, true);
    } catch {
      if (current === searchSequence) status.textContent = "Search data could not be loaded. Try again, or explore the portfolio links below.";
    } finally {
      if (current === searchSequence) results.setAttribute("aria-busy", "false");
    }
  }

  async function search() {
    rag.reset();
    const current = ++searchSequence;
    rejectPending();
    setTopic();
    followups.hidden = true;
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
      showResults(response.kind === "results" ? response.results.slice(0, 3) : [], semantic, response.reason);
    } catch {
      if (current !== searchSequence) return;
      status.textContent = "Search data could not be loaded. Try again, or explore the portfolio links below.";
    } finally {
      if (current === searchSequence) results.setAttribute("aria-busy", "false");
    }
  }

  async function enableMeaningSearch() {
    if (semanticState !== "off") return;
    enhancement.open = true;
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
    rag.reset();
    searchSequence += 1;
    rejectPending();
    results.setAttribute("aria-busy", "false");
    results.hidden = true;
    list.replaceChildren();
    followups.hidden = true;
    setTopic();
    status.textContent = "";
  });
  root.querySelectorAll<HTMLButtonElement>("[data-ask-topic]").forEach((button) => {
    button.addEventListener("click", () => {
      const topic = TOPICS.find((entry) => entry.id === button.dataset.askTopic);
      if (topic) void navigate(topic, topic.id);
    });
  });
  root.querySelectorAll<HTMLButtonElement>("[data-ask-example]").forEach((button) => {
    button.addEventListener("click", () => {
      question.value = button.dataset.askExample!;
      question.focus();
      void search();
    });
  });
  enable.addEventListener("click", () => { void enableMeaningSearch(); });
  exploreMeaning.addEventListener("click", () => {
    // Show the download disclosure before the separate opt-in action.
    enhancement.open = true;
    enable.focus();
    enhancement.scrollIntoView({ block: "center", behavior: "instant" });
  });
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
    rag.reset();
    searchSequence += 1;
    useWordMatching("Word matching is ready.");
  });
  form.hidden = false;
  enhancement.hidden = false;
}
