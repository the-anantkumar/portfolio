import { readFile, writeFile, mkdir } from "node:fs/promises";
import assert from "node:assert/strict";

// Optional maintainer command; normal builds never require the network.
// Only public dates, counts and intensity levels are stored, never repository activity.
const username = "the-anantkumar";
const source = `https://github.com/users/${username}/contributions`;
const input = process.argv[2];
const html = input
  ? await readFile(input, "utf8")
  : await fetch(source, {
      headers: { "User-Agent": "portfolio-public-contributions-snapshot" },
      signal: AbortSignal.timeout(15000),
    }).then((response) => {
      if (!response.ok)
        throw new Error(
          `GitHub returned ${response.status}; existing snapshot preserved.`,
        );
      return response.text();
    });
const attr = (tag, name) =>
  tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1];
const counts = new Map();
for (const match of html.matchAll(
  /<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g,
)) {
  const id = attr(match[1], "for");
  const count = match[2].trim().match(/^(No|[\d,]+) contributions? on /);
  if (id && count)
    counts.set(
      id,
      count[1] === "No" ? 0 : Number(count[1].replaceAll(",", "")),
    );
}
const days = [...html.matchAll(/<td\b[^>]*data-date="[^\"]+"[^>]*>/g)]
  .map(([tag]) => {
    const date = attr(tag, "data-date");
    const level = Number(attr(tag, "data-level"));
    const count = counts.get(attr(tag, "id"));
    assert(
      date &&
        /^\d{4}-\d{2}-\d{2}$/.test(date) &&
        Number.isInteger(count) &&
        count >= 0 &&
        Number.isInteger(level) &&
        level >= 0 &&
        level <= 4,
      "Unexpected GitHub markup; existing snapshot preserved.",
    );
    return { date, count, level };
  })
  .sort((a, b) => a.date.localeCompare(b.date));
assert(
  days.length >= 350 && days.length <= 371,
  "Expected a full-year GitHub calendar; existing snapshot preserved.",
);
assert(
  new Set(days.map((d) => d.date)).size === days.length,
  "Duplicate calendar dates",
);
for (let i = 1; i < days.length; i++)
  assert(
    new Date(days[i].date) - new Date(days[i - 1].date) === 86400000,
    "Calendar must be continuous",
  );
const snapshot = {
  username,
  source,
  fetchedAt: new Date().toISOString().slice(0, 10),
  from: days[0].date,
  to: days.at(-1).date,
  total: days.reduce((sum, day) => sum + day.count, 0),
  days,
};
await mkdir("src/data", { recursive: true });
await writeFile(
  "src/data/github.json",
  JSON.stringify(snapshot, null, 2) + "\n",
);
console.log(
  `Saved ${days.length} public calendar days; ${snapshot.total} contributions. No credentials used.`,
);
