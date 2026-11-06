export interface KnowledgePassage {
  id: string;
  title: string;
  text: string;
  context: string;
  url: string;
}

export interface KnowledgeCorpus {
  version: 1;
  passages: KnowledgePassage[];
}

export interface SearchVectors {
  version: 1;
  model: string;
  revision: string;
  dtype: string;
  corpusHash: string;
  vectors: Record<string, number[]>;
}

export type EmbeddingMessage =
  | { type: "progress"; message: string }
  | { type: "ready" }
  | { type: "embedding"; id: number; vector: number[] }
  | { type: "error"; message: string; id?: number };
