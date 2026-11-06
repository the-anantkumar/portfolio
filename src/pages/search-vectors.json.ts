import type { APIRoute } from "astro";
import { readFile } from "node:fs/promises";
import { getKnowledge } from "../lib/knowledge";
import { verifyVectors } from "../lib/embedding-config.mjs";

export const GET: APIRoute = async () => {
  // Explicit maintainer regeneration builds the corpus before vectors exist.
  // verify-build rejects this placeholder, so it cannot become a release.
  if (process.env.SEARCH_INDEX_REBUILD === "1") {
    return Response.json({ version: 0, rebuilding: true });
  }
  const index = JSON.parse(await readFile("src/data/search-vectors.json", "utf8"));
  await verifyVectors(index, (await getKnowledge()).passages);
  return Response.json(index);
};
