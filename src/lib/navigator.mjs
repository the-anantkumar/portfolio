// Authored navigation into public sources. These actions never invoke a model.
const p = (project, section) => `project/${project}/${section}`;
export const TOPICS = [
  { id: "experience", label: "Experience", icon: "01", question: "Explore Anant’s professional experience", passages: ["experience/nielsen-media", "experience/sap-labs", "experience/iiit-delhi"] },
  { id: "projects", label: "Projects", icon: "02", question: "Explore Anant’s selected projects", passages: [p("trlr", "overview"), p("codeforces-potd", "overview"), p("nielsen-data-systems", "overview")] },
  { id: "founder", label: "Founder", icon: "03", question: "Explore Anant’s founder work at trlr", passages: [p("trlr", "my-contribution"), p("trlr", "engineering-decisions"), p("trlr", "current-outcome")] },
  { id: "skills", label: "Skills", icon: "04", question: "Explore Anant’s backend and product engineering skills", passages: [p("nielsen-data-systems", "engineering-foundations"), p("trlr", "overview"), "experience/sap-labs"] },
  { id: "about", label: "About", icon: "05", question: "Explore Anant’s education and interests", passages: ["page/about"] },
  { id: "contact", label: "Contact", icon: "06", question: "Explore public contact details and desired roles", passages: ["page/home/contact"] },
];

const action = (id, question, passages) => ({ id, question, passages });
const general = [
  action("work", "What has Anant worked on professionally?", TOPICS[0].passages),
  action("projects", "Which products has Anant built?", TOPICS[1].passages),
  action("founder", "What does Anant own as founder of trlr?", [p("trlr", "my-contribution")]),
];
export const FOLLOWUPS = {
  "project/trlr": [
    action("ownership", "What does Anant personally own at trlr?", [p("trlr", "my-contribution")]),
    action("reliability", "How does trlr handle interruptions and retries?", [p("trlr", "engineering-decisions")]),
    action("evaluation", "What is trlr’s hypothesis and what remains unproven?", [p("trlr", "the-problem"), p("trlr", "current-outcome")]),
  ],
  "project/nielsen-data-systems": [
    action("validation", "What did Anant validate in the Nielsen parallel run?", [p("nielsen-data-systems", "parallel-validation-at-scale")]),
    action("migration", "How was the reference-data migration checked?", [p("nielsen-data-systems", "reference-data-migration")]),
    action("design", "Which Nielsen design work is still pending?", [p("nielsen-data-systems", "design-work-implementation-pending")]),
  ],
  "project/codeforces-potd": [
    action("recommendation", "How are daily Codeforces problems chosen?", [p("codeforces-potd", "my-contribution")]),
    action("engineering", "How does the extension use the Codeforces API?", [p("codeforces-potd", "engineering-decisions")]),
    action("evidence", "What adoption evidence and measurement limits are published?", [p("codeforces-potd", "evidence"), p("codeforces-potd", "what-i-learned")]),
  ],
  "project/portfolio": [
    action("architecture", "How is this portfolio built?", [p("portfolio", "architecture")]),
    action("search", "How does optional search fit this portfolio?", [p("portfolio", "future-search")]),
    action("delivery", "How is the portfolio hosted?", [p("portfolio", "delivery")]),
  ],
};

export function sourceKey(id) {
  if (id === "experience/nielsen-media") return "project/nielsen-data-systems";
  if (id === "page/home/intro") return "page/about";
  return id.startsWith("project/") ? id.split("/").slice(0, 2).join("/") : id;
}

export const sourceTemplateId = (key) => `ask-source-${key.replaceAll("/", "-")}`;
export const followupsFor = (key) => FOLLOWUPS[key] ?? general;

export function selectPassages(selection, passages) {
  return selection.passages.map((id) => {
    const passage = passages.find((entry) => entry.id === id);
    if (!passage) throw new Error(`Missing public navigation source: ${id}`);
    return { passage, score: 1 };
  });
}

export function groupMatches(matches) {
  const groups = new Map();
  for (const match of matches) {
    const key = sourceKey(match.passage.id);
    if (!groups.has(key)) groups.set(key, { key, matches: [] });
    const group = groups.get(key);
    if (!group.matches.some(({ passage }) => passage.id === match.passage.id)) group.matches.push(match);
  }
  return [...groups.values()];
}

export function validateNavigator(passages, sources) {
  const keys = new Set(sources.map((source) => source.key));
  if (keys.size !== sources.length) throw new Error("Duplicate navigation source key");
  if (new Set(sources.map((source) => sourceTemplateId(source.key))).size !== sources.length) throw new Error("Duplicate source template ID");
  for (const passage of passages) {
    if (!keys.has(sourceKey(passage.id))) throw new Error(`No card for public source: ${passage.id}`);
  }
  for (const selection of [...TOPICS, ...general, ...Object.values(FOLLOWUPS).flat()]) selectPassages(selection, passages);
  for (const key of Object.keys(FOLLOWUPS)) {
    if (!keys.has(key)) throw new Error(`No card for follow-up group: ${key}`);
  }
}
