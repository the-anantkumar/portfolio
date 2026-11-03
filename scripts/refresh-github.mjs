import { readFile, writeFile, mkdir, rename, rm } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert/strict";

// Builds stay offline. Only this command fetches the public contribution calendar.
// Store dates, counts and intensity levels, never repository activity or credentials.
const username = "the-anantkumar";
const source = `https://github.com/users/${username}/contributions`;
const defaultOutput = fileURLToPath(
  new URL("../src/data/github.json", import.meta.url),
);
const attr = (tag, name) =>
  tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1];

export function parseCalendar(html, now = new Date()) {
  const counts = new Map();
  for (const match of html.matchAll(
    /<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g,
  )) {
    const id = attr(match[1], "for");
    const count = match[2]
      .trim()
      .match(/^(No|\d{1,3}(?:,\d{3})+|\d+) contributions? on /);
    if (id && count) {
      assert(!counts.has(id), "Duplicate contribution tooltip");
      counts.set(
        id,
        count[1] === "No" ? 0 : Number(count[1].replaceAll(",", "")),
      );
    }
  }
  const days = [...html.matchAll(/<td\b[^>]*data-date="[^"]+"[^>]*>/g)]
    .map(([tag]) => {
      const date = attr(tag, "data-date");
      const rawLevel = attr(tag, "data-level");
      const count = counts.get(attr(tag, "id"));
      assert(
        date &&
          /^\d{4}-\d{2}-\d{2}$/.test(date) &&
          Number.isFinite(Date.parse(date)) &&
          new Date(date).toISOString().slice(0, 10) === date &&
          Number.isSafeInteger(count) &&
          count >= 0 &&
          rawLevel !== undefined &&
          /^[0-4]$/.test(rawLevel),
        "Unexpected GitHub markup; existing snapshot preserved.",
      );
      return { date, count, level: Number(rawLevel) };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
  assert(
    days.length >= 365 && days.length <= 371,
    "Expected a full-year GitHub calendar",
  );
  assert(
    new Set(days.map((day) => day.date)).size === days.length,
    "Duplicate calendar dates",
  );
  for (let i = 1; i < days.length; i++) {
    assert(
      new Date(days[i].date) - new Date(days[i - 1].date) === 86400000,
      "Calendar must be continuous",
    );
  }
  return {
    username,
    source,
    fetchedAt: now.toISOString().slice(0, 10),
    from: days[0].date,
    to: days.at(-1).date,
    total: days.reduce((sum, day) => sum + day.count, 0),
    days,
  };
}

export async function refreshCalendar({
  input,
  output = defaultOutput,
  fetchImpl = fetch,
  now = new Date(),
} = {}) {
  let previous;
  try {
    previous = JSON.parse(await readFile(output, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  let html;
  if (input) {
    html = await readFile(input, "utf8");
  } else {
    const response = await fetchImpl(source, {
      headers: {
        "User-Agent": "portfolio-public-contributions-snapshot",
        "Accept-Language": "en",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok)
      throw new Error(
        `GitHub returned ${response.status}; existing snapshot preserved.`,
      );
    html = await response.text();
  }
  const snapshot = parseCalendar(html, now);
  assert(
    !previous || snapshot.to >= previous.to,
    "Refusing an older calendar; existing snapshot preserved.",
  );
  // A successful check alone must not manufacture a commit or deployment.
  // fetchedAt remains the capture date of the saved calendar when nothing changes.
  if (
    previous &&
    ["username", "source", "from", "to", "total", "days"].every(
      (key) => JSON.stringify(previous[key]) === JSON.stringify(snapshot[key]),
    )
  )
    return { changed: false, snapshot: previous };

  await mkdir(dirname(output), { recursive: true });
  const temporary = `${output}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, JSON.stringify(snapshot, null, 2) + "\n", {
      flag: "wx",
      flush: true,
    });
    await rename(temporary, output);
  } finally {
    await rm(temporary, { force: true });
  }
  return { changed: true, snapshot };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const { changed, snapshot } = await refreshCalendar({
      input: process.argv[2],
    });
    console.log(
      changed
        ? `Saved ${snapshot.days.length} public calendar days; ${snapshot.total} contributions. No credentials used.`
        : "Calendar unchanged; existing snapshot preserved. No rebuild needed.",
    );
  } catch (error) {
    console.error(`Calendar refresh failed: ${error.message}`);
    process.exitCode = 1;
  }
}
