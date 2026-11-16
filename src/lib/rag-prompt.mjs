// Frozen binary relevance prompt from the native FLAN screening. Full sources
// remain intact; the model selects evidence, and never supplies displayed prose.
export const RAG_BINARY_PROMPT_VERSION = "per-document-binary-v1";

export function buildRagBinaryPrompt(question, passage) {
  if (typeof question !== "string" || !question.trim() || question.length > 500) {
    throw new Error("Question must contain 1 to 500 characters");
  }
  for (const field of ["title", "context", "text"]) {
    if (!passage || typeof passage[field] !== "string" || !passage[field].trim()) {
      throw new Error(`Missing source ${field}`);
    }
  }
  return `Document title: ${passage.title}\nDocument context: ${passage.context}\nDocument: ${passage.text}\n\nQuestion: ${question}\nDoes this document answer the question? Answer yes or no.`;
}

export function parseRagRelevance(raw) {
  if (typeof raw !== "string" || raw.length > 16) throw new Error("Invalid binary relevance result");
  const label = raw.trim().toLowerCase().replace(/[.!]$/, "");
  if (label !== "yes" && label !== "no") throw new Error("Expected only yes or no");
  return label === "yes";
}
