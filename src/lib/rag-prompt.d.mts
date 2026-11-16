import type { KnowledgePassage } from "./ask-types";
export const RAG_BINARY_PROMPT_VERSION: "per-document-binary-v1";
export function buildRagBinaryPrompt(question: string, passage: Readonly<Pick<KnowledgePassage, "title" | "context" | "text">>): string;
export function parseRagRelevance(raw: string): boolean;
