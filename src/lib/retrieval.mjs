// Ranking is evidence retrieval, never an answer generator. Scores are ranking
// signals, not probabilities or factual-confidence percentages.
const STOP_WORDS = new Set(
  "a an the and or of to in on at for from with by as is are was were be been being do does did have has had can could would should will may might i me my you your he him his it its they them their this that these those there what which who when where why how tell show give explain describe list find summarize summarise outline compare please about during before after through into over under within without between across around throughout along while than then also".split(" "),
);

function stem(word) {
  // Small English morphology rules keep inflections together without adding
  // question-specific synonyms: validate, validates, validated and validation
  // all reduce to validat; connect, connected and connection reduce to connect.
  if (word.length > 4 && /(?:ies|ied)$/.test(word)) return word.slice(0, -3) + "y";
  if (word.length > 3 && word.endsWith("s") && !/(?:ss|us|is)$/.test(word)) word = word.slice(0, -1);
  if (word.length > 6 && word.endsWith("ion")) word = word.slice(0, -3);
  if (word.length > 5 && word.endsWith("ing")) word = word.slice(0, -3);
  else if (word.length > 4 && word.endsWith("ed")) word = word.slice(0, -2);
  if (word.length > 4 && /([b-df-hj-np-tv-z])\1$/.test(word) && !/(?:ss|ll)$/.test(word)) word = word.slice(0, -1);
  if (word.length > 4 && word.endsWith("e")) word = word.slice(0, -1);
  return word;
}

function terms(value) {
  const words = value.toLowerCase().normalize("NFKC").match(/[\p{L}\p{N}]+/gu) ?? [];
  return [...new Set(words
    .filter((word) => !STOP_WORDS.has(word) && (word.length > 1 || /^\d$/.test(word)))
    .map(stem))];
}

function scopedPassages(question, passages) {
  // Public collection IDs give employers and projects stable names. Matching
  // Nielsen joins its case study and experience entry; it never admits a
  // different project's deployment paragraph just because both say validate.
  const mentioned = new Set();
  const words = new Set(question.toLowerCase().match(/[a-z0-9]+/g) ?? []);
  for (const passage of passages) {
    const [, subject] = /^(?:project|experience)\/([^/]+)/.exec(passage.id) ?? [];
    if (!subject) continue;
    const name = subject.split("-")[0];
    if (name === "portfolio") continue;
    if (words.has(name)) mentioned.add(name);
  }
  return mentioned.size
    ? passages.filter((passage) => {
      const [, subject] = /^(?:project|experience)\/([^/]+)/.exec(passage.id) ?? [];
      return subject && mentioned.has(subject.split("-")[0]);
    })
    : passages;
}

function asksAboutUnknownNamedTechnology(question, passages, personTerms) {
  if (!/\b(?:experience|worked|working|use|uses|using|used|built|build|shipped|developed|operating|operate|applications?|apps?|clusters?)\b/i.test(question)) return false;
  const known = new Set(terms(passages.map((passage) => `${passage.title} ${passage.context} ${passage.text}`).join(" ")));
  const named = [...question.matchAll(/\b[A-Z][A-Za-z0-9+#.]*/g)]
    // Sentence-initial capitalization alone does not identify a technology.
    .filter((match) => match.index !== 0)
    .map((match) => match[0]);
  // Explicit tool/topic constructions also work when visitors type lowercase.
  for (const match of question.matchAll(/\b(?:use|uses|using|used|operating|operate|experience\s+(?:with|in)|work(?:ed|ing)?\s+(?:with|on))\s+(?:(?:the|an?)\s+)?([a-z][a-z0-9+#.]*)/gi)) {
    named.push(match[1]);
  }
  return named.some((word) => {
    const [term] = terms(word);
    return term && !personTerms.has(term) && !known.has(term);
  });
}

function broadEntityOverview(query, scoped, allPassages) {
  if (scoped === allPassages) return [];
  const entityTerms = new Set(terms(scoped.map((passage) =>
    passage.id.split("/")[1].replaceAll("-", " "),
  ).join(" ")));
  const broadTerms = new Set(terms("work build built building experience role background contribution contributions contribute created create developed develop development engineering software projects project technical make made"));
  const remainder = query.filter((term) => !entityTerms.has(term));
  if (!remainder.every((term) => broadTerms.has(term))) return [];
  // Broad questions about a named employer/product deserve its actual overview
  // or experience entry. Any specific unmatched topic prevents this fallback.
  return scoped.filter((passage) => passage.id.startsWith("experience/") || passage.id.endsWith("/overview"));
}

function unsupported(reason) {
  return { kind: "unsupported", results: [], reason };
}

function boundary(question) {
  if (question.length > 500) return "question-too-long";
  if (/\b(?:phone|telephone|mobile\s+number|home\s+address|street\s+address|date\s+of\s+birth|birthday|salary|compensation|password|credential|api\s*key|secret|passport|aadhar|aadhaar)\b/i.test(question)) return "private";
  if (/\b(?:pay|paid|paying)\s+(?:him|anant)\b|\b(?:his|anant'?s)\s+(?:income|earnings)\b/i.test(question)) return "private";
  if (/\b(?:private|confidential|internal)\s+(?:data|profiles?|conversations?|prompts?|identifiers?|infrastructure|datasets?|configurations?|documents?|repositories|repository|repos?|sources?)\b/i.test(question)) return "private";
  if (/\b(?:ignore|override|forget)\b.*\b(?:instruction|rule|prompt|previous)\b|\bsystem\s+prompt\b/i.test(question)) return "unsupported-request";
  // Do not endorse a misleading premise simply because it shares vocabulary
  // with the evidence. Visitors can ask neutral questions about these subjects.
  if (/\b(?:prove|proven|guarantee|guaranteed|always|every|all)\b.*\b(?:error.free|accurate|accuracy|safe|superior|better|production|prediction|connection|workload)\b|\b(?:clinical|clinically)\b|\bpatients?\b.*\b(?:outcomes?|improved?|diagnos\w*|treat\w*|cure\w*)\b/i.test(question)) return "unsupported-claim";
  if (/\b(?:trlr)\b.*\b(?:revenue|paying\s+customer|traction|user\s+count|prediction\s+gain|outperform|beat|surpass|superior)\b|\b(?:how\s+much|percentage)\b.*\b(?:better|improvement|gain)\b/i.test(question)) return "unsupported-claim";
  if (/\b(?:current|latest|today|now|live)\b.*\b(?:github|contribution|commit|rating|user\s+count|install)\b/i.test(question)) return "dated-evidence-only";
  return undefined;
}

function cosine(left, right) {
  if (!Array.isArray(right) || right.length !== left.length || left.length === 0) return undefined;
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let index = 0; index < left.length; index++) {
    if (!Number.isFinite(left[index]) || !Number.isFinite(right[index])) return undefined;
    dot += left[index] * right[index];
    leftNorm += left[index] ** 2;
    rightNorm += right[index] ** 2;
  }
  return leftNorm && rightNorm ? dot / Math.sqrt(leftNorm * rightNorm) : undefined;
}

export function searchPassages(question, passages, options = {}) {
  if (typeof question !== "string") return unsupported("empty-question");
  const blocked = boundary(question);
  if (blocked) return unsupported(blocked);
  const personTerms = new Set(terms(passages.find((passage) => passage.id === "page/home/intro")?.text.split("\n")[0] ?? ""));
  if (asksAboutUnknownNamedTechnology(question, passages, personTerms)) return unsupported("unpublished-technology");
  const questionTerms = terms(question);
  const substantiveTerms = questionTerms.filter((term) => !personTerms.has(term));
  const query = substantiveTerms.length ? substantiveTerms : questionTerms;
  if (!query.length) return unsupported("empty-question");
  const limit = Math.max(1, Math.min(3, options.limit ?? 3));
  const scoped = scopedPassages(question, passages);
  const overview = broadEntityOverview(query, scoped, passages);
  if (overview.length) {
    return { kind: "results", results: overview.slice(0, limit).map((passage) => ({ passage, score: 1 })) };
  }
  const allowedIds = new Set(scoped.map((passage) => passage.id));
  const documents = passages.map((passage) => ({
    passage,
    title: terms(passage.title),
    text: terms(passage.text),
    context: terms(passage.context),
  }));
  const frequency = new Map(query.map((term) => [term, documents.filter((doc) =>
    doc.text.includes(term) || doc.title.includes(term) || doc.context.includes(term),
  ).length]));
  const weight = (term) => Math.log(1 + (documents.length + 1) / ((frequency.get(term) ?? 0) + 1));
  const queryWeight = query.reduce((sum, term) => sum + weight(term), 0);
  const ranked = documents.map((doc) => {
    let matchingWeight = 0;
    let lexical = 0;
    let matched = 0;
    for (const term of query) {
      const inText = doc.text.includes(term);
      const inTitle = doc.title.includes(term);
      const inContext = doc.context.includes(term);
      if (!inText && !inTitle && !inContext) continue;
      matched++;
      matchingWeight += weight(term);
      lexical += weight(term) * (inText ? 1 : 0) + weight(term) * (inTitle ? 0.6 : 0) + weight(term) * (inContext ? 0.2 : 0);
    }
    const coverage = matchingWeight / queryWeight;
    const similarity = Array.isArray(options.queryVector)
      ? cosine(options.queryVector, options.vectors?.[doc.passage.id])
      : undefined;
    return { passage: doc.passage, lexical: lexical / queryWeight, coverage, matched, similarity };
  });
  const lexicalOrder = [...ranked].sort((a, b) => b.lexical - a.lexical || a.passage.id.localeCompare(b.passage.id));
  const semanticOrder = ranked.filter((result) => result.similarity !== undefined)
    .sort((a, b) => b.similarity - a.similarity || a.passage.id.localeCompare(b.passage.id));
  const useSemantic = semanticOrder.length > 0;
  // This threshold is calibrated on the committed development questions for the
  // pinned q8 model. New questions still need review; similarity is not truth.
  const minimumSimilarity = options.minSimilarity ?? 0.4;
  const scopedSemantic = semanticOrder.filter((result) => allowedIds.has(result.passage.id));
  const leading = scopedSemantic[0];
  // A modest semantic score can still be useful when one source clearly leads
  // and shares several substantive terms. This admits one source, not a broad
  // set of lower-scoring related topics. Explicit thresholds disable fallback.
  const clearLead = options.minSimilarity === undefined && leading
    && leading.similarity >= 0.3
    && leading.similarity - (scopedSemantic[1]?.similarity ?? 0) >= 0.06
    && leading.matched >= 2;
  const eligible = ranked.filter((result) => {
    if (!allowedIds.has(result.passage.id)) return false;
    const lexicalEvidence = result.coverage >= 0.46 && result.lexical >= 0.48 && result.matched >= Math.min(2, query.length);
    // An embedding must not discard independently useful exact evidence, such
    // as a technology name or a measurement. It adds paraphrase matches.
    return lexicalEvidence
      || (useSemantic && result.similarity !== undefined && result.similarity >= minimumSimilarity)
      || (clearLead && result === leading);
  });
  const results = eligible.map((result) => ({
    passage: result.passage,
    score: useSemantic
      // Preserve precise lexical matches before fusing remaining candidates.
      // A broad semantic association must not bury an exact named-employer
      // validation match. These remain ranking signals, never confidence.
      ? result.coverage >= 0.75 && result.lexical >= 0.8 && result.matched >= 2
        ? 1 + result.lexical
        : (result.similarity === undefined ? 0 : 1 / (20 + semanticOrder.indexOf(result))) + 0.35 / (20 + lexicalOrder.indexOf(result))
      : result.lexical,
  })).sort((a, b) => b.score - a.score || a.passage.id.localeCompare(b.passage.id)).slice(0, limit);
  return results.length ? { kind: "results", results } : unsupported("insufficient-evidence");
}
