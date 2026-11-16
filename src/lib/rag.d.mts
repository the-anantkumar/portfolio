import type { KnowledgePassage } from "./ask-types";

export const RAG_PROMPT_VERSION: number;
export const RAG_SYSTEM_PROMPT: string;
export interface RagMessage { role: "system" | "user"; content: string }
export interface RagAbstention { kind: "abstain"; passages: []; reason: string }
export interface RagPrepared {
  kind: "ready";
  question: string;
  passages: readonly Readonly<KnowledgePassage>[];
  messages: RagMessage[];
}
export interface RagAnswer {
  kind: "answer";
  passages: readonly Readonly<KnowledgePassage>[];
  repaired: boolean;
}
export function buildRagMessages(question: string, passages: readonly KnowledgePassage[]): RagMessage[];
export function prepareRag(question: string, passages: readonly KnowledgePassage[]): RagPrepared | RagAbstention;
export function validateRagSelection(raw: string, passages: readonly KnowledgePassage[]): RagAnswer | RagAbstention;
