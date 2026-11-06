import type { Passage } from "./knowledge";

export interface SearchOptions {
  limit?: number;
  queryVector?: number[];
  vectors?: Record<string, number[]>;
  minSimilarity?: number;
}

export type SearchResult =
  | { kind: "results"; results: { passage: Passage; score: number }[]; reason?: never }
  | { kind: "unsupported"; results: []; reason: string };

export function searchPassages(question: string, passages: Passage[], options?: SearchOptions): SearchResult;
