import type { APIRoute } from "astro";
import { withBase } from "../lib/paths";
export const GET: APIRoute = ({ site }) =>
  new Response(
    `User-agent: *\nAllow: /\n${site ? `Sitemap: ${new URL(withBase("sitemap.xml"), site).href}\n` : ""}`,
    { headers: { "Content-Type": "text/plain" } },
  );
