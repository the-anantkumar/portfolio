import type { APIRoute } from "astro";
import { getKnowledge } from "../lib/knowledge";

export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await getKnowledge()), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
