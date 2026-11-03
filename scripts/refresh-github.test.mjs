import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  readFile,
  writeFile,
  readdir,
  stat,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseCalendar, refreshCalendar } from "./refresh-github.mjs";

const now = new Date("2026-11-03T12:00:00Z");
// Synthetic GitHub-shaped HTML, with zero, singular and comma-formatted counts.
function fixture({ offset = 0, firstCount = 1234 } = {}) {
  return Array.from({ length: 365 }, (_, index) => {
    const date = new Date(Date.UTC(2025, 10, 4 + index + offset))
      .toISOString()
      .slice(0, 10);
    const count = index === 0 ? firstCount : index === 1 ? 1 : 0;
    return `<td id="contribution-day-${index}" data-date="${date}" data-level="${count ? 1 : 0}"></td>
<tool-tip for="contribution-day-${index}">${count ? count.toLocaleString("en-US") : "No"} contribution${count === 1 ? "" : "s"} on ${date}.</tool-tip>`;
  })
    .reverse()
    .join("\n");
}
const html = fixture();
const response =
  (body = html) =>
  async () => ({ ok: true, text: async () => body });

async function savedCalendar(t) {
  const directory = await mkdtemp(join(tmpdir(), "portfolio-calendar-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const output = join(directory, "github.json");
  const previous = JSON.stringify(parseCalendar(html, now), null, 2) + "\n";
  await writeFile(output, previous);
  return { output, directory, previous };
}

test("parses and sorts a full calendar with exact counts", () => {
  const snapshot = parseCalendar(html, now);
  assert.equal(snapshot.days.length, 365);
  assert.equal(snapshot.total, 1235);
  assert.equal(snapshot.from, "2025-11-04");
  assert.equal(snapshot.to, "2026-11-03");
  assert.equal(snapshot.fetchedAt, "2026-11-03");
  assert.deepEqual(snapshot.days[0], {
    date: "2025-11-04",
    count: 1234,
    level: 1,
  });
  assert.equal(snapshot.days[1].count, 1);
  assert.equal(snapshot.days[2].count, 0);
});

for (const [name, broken] of [
  ["non-calendar HTML", "<html>Service unavailable</html>"],
  ["missing count", html.replace("1,234 contributions on", "Contributions on")],
  ["missing intensity", html.replace('data-level="1"', "")],
  ["invalid intensity", html.replace('data-level="1"', 'data-level="5"')],
  [
    "impossible date",
    html.replace('data-date="2026-02-28"', 'data-date="2026-02-30"'),
  ],
  [
    "duplicate date",
    html.replace('data-date="2026-11-03"', 'data-date="2026-11-02"'),
  ],
  [
    "date gap",
    html.replace('data-date="2026-11-03"', 'data-date="2026-11-04"'),
  ],
  [
    "partial year",
    html.replace(/<td[^>]+data-date="2026-11-03"[^>]*><\/td>/, ""),
  ],
]) {
  test(`rejects ${name} and preserves the saved snapshot`, async (t) => {
    const { output, previous } = await savedCalendar(t);
    await assert.rejects(
      refreshCalendar({ output, fetchImpl: response(broken), now }),
    );
    assert.equal(await readFile(output, "utf8"), previous);
  });
}

test("unchanged data does not rewrite the file or its capture date", async (t) => {
  const { output, previous } = await savedCalendar(t);
  const before = await stat(output);
  const result = await refreshCalendar({
    output,
    fetchImpl: response(),
    now: new Date("2026-11-04"),
  });
  assert.equal(result.changed, false);
  assert.equal(result.snapshot.fetchedAt, "2026-11-03");
  assert.equal(await readFile(output, "utf8"), previous);
  assert.equal((await stat(output)).mtimeMs, before.mtimeMs);
});

test("updated counts replace the snapshot and leave no temporary files", async (t) => {
  const { output, directory } = await savedCalendar(t);
  const result = await refreshCalendar({
    output,
    fetchImpl: response(fixture({ firstCount: 1235 })),
    now,
  });
  assert.equal(result.changed, true);
  assert.equal(JSON.parse(await readFile(output, "utf8")).total, 1236);
  assert.deepEqual(await readdir(directory), ["github.json"]);
});

test("a rolling calendar advances even when the total stays the same", async (t) => {
  const { output } = await savedCalendar(t);
  const result = await refreshCalendar({
    output,
    fetchImpl: response(fixture({ offset: 1 })),
    now,
  });
  assert.equal(result.changed, true);
  assert.equal(result.snapshot.to, "2026-11-04");
  assert.equal(result.snapshot.total, 1235);
});

test("an older calendar cannot overwrite the latest snapshot", async (t) => {
  const { output, previous } = await savedCalendar(t);
  await assert.rejects(
    refreshCalendar({
      output,
      fetchImpl: response(fixture({ offset: -1 })),
      now,
    }),
    /older calendar/,
  );
  assert.equal(await readFile(output, "utf8"), previous);
});

for (const [name, fetchImpl] of [
  [
    "network/timeout failure",
    async () => {
      throw new Error("Fetch failed");
    },
  ],
  ["HTTP failure", async () => ({ ok: false, status: 503 })],
  [
    "body read failure",
    async () => ({
      ok: true,
      text: async () => {
        throw new Error("Connection closed");
      },
    }),
  ],
]) {
  test(`${name} leaves the saved snapshot unchanged`, async (t) => {
    const { output, previous } = await savedCalendar(t);
    await assert.rejects(refreshCalendar({ output, fetchImpl, now }));
    assert.equal(await readFile(output, "utf8"), previous);
  });
}

test("local HTML input works without a network request", async (t) => {
  const { output, directory } = await savedCalendar(t);
  const input = join(directory, "calendar.html");
  await writeFile(input, fixture({ firstCount: 2 }));
  const result = await refreshCalendar({
    input,
    output,
    now,
    fetchImpl: async () => {
      throw new Error("Network must not be used");
    },
  });
  assert.equal(result.changed, true);
  assert.equal(result.snapshot.total, 3);
});

test("fetches only the public calendar with a timeout and no authentication", async (t) => {
  const { output } = await savedCalendar(t);
  await refreshCalendar({
    output,
    now,
    fetchImpl: async (url, options) => {
      assert.equal(
        url,
        "https://github.com/users/the-anantkumar/contributions",
      );
      assert.equal(options.headers.Authorization, undefined);
      assert.equal(options.headers["Accept-Language"], "en");
      assert(options.signal instanceof AbortSignal);
      return { ok: true, text: async () => html };
    },
  });
});
