import { defineConfig } from "astro/config";
// Cloudflare supplies CF_PAGES_URL; SITE_URL can override it for a canonical domain.
const site = process.env.SITE_URL || process.env.CF_PAGES_URL;
export default defineConfig({
  output: "static",
  ...(site ? { site } : {}),
  build: { inlineStylesheets: "never" },
});
