import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
const base =
  `/${(process.env.SITE_BASE || "").replace(/^\/+|\/+$/g, "")}/`.replace(
    "//",
    "/",
  );
await writeFile(
  "dist/release.json",
  JSON.stringify({
    commit: execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim(),
    base,
    site: process.env.SITE_URL || process.env.CF_PAGES_URL || null,
  }) + "\n",
);
