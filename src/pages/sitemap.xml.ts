import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { withBase } from "../lib/paths";
export const GET: APIRoute = async ({ site }) => {
  // Omit fictitious canonical URLs from local builds.
  const routes = site
    ? [
        "/",
        ...(await getCollection("projects")).map((p) => `/projects/${p.id}/`),
      ]
    : [];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((route) => `<url><loc>${new URL(withBase(route), site).href}</loc></url>`).join("")}</urlset>`,
    { headers: { "Content-Type": "application/xml" } },
  );
};
