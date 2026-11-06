// A reviewed, immutable public model revision. Never resolve "main" at runtime.
export const EMBEDDING = Object.freeze({
  model: "Xenova/all-MiniLM-L6-v2",
  revision: "751bff37182d3f1213fa05d7196b954e230abad9",
  dtype: "q8",
  dimensions: 384,
  pooling: "mean",
  normalize: true,
});

export const embeddingText = (passage) =>
  `${passage.title}\n${passage.context}\n${passage.text}`;

// URLs change with SITE_BASE; the model sees only these public text fields.
export async function corpusHash(passages) {
  const input = JSON.stringify(passages.map(({ id, title, context, text }) =>
    ({ id, title, context, text }),
  ));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyVectors(index, passages) {
  if (index.version !== 1 || index.corpusHash !== await corpusHash(passages)) {
    throw new Error("Search content changed. Run npm run index:search to regenerate the public embeddings.");
  }
  for (const [key, value] of Object.entries(EMBEDDING)) {
    if (index[key] !== value) throw new Error(`Incompatible embedding ${key}`);
  }
  if (Object.keys(index.vectors ?? {}).length !== passages.length) throw new Error("Incomplete embedding index");
  for (const passage of passages) {
    const vector = index.vectors[passage.id];
    if (!Array.isArray(vector) || vector.length !== EMBEDDING.dimensions || !vector.every(Number.isFinite)) {
      throw new Error(`Invalid embedding: ${passage.id}`);
    }
    const norm = Math.sqrt(vector.reduce((sum, value) => sum + value ** 2, 0));
    if (Math.abs(norm - 1) > 0.005) throw new Error(`Unnormalized embedding: ${passage.id}`);
  }
}
