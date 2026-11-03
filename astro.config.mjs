import { defineConfig } from "astro/config";
// Production supplies its public origin and path; local development stays at /.
const site = process.env.SITE_URL || process.env.CF_PAGES_URL;
export default defineConfig({
  output: "static",
  base: process.env.SITE_BASE || "/",
  ...(site ? { site } : {}),
  build: { inlineStylesheets: "never" },
});
