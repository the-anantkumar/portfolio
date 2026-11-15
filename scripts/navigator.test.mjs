import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { TOPICS, followupsFor, groupMatches, selectPassages } from "../src/lib/navigator.mjs";

const { passages } = JSON.parse(await readFile("dist/knowledge.json", "utf8"));
const match = (id, score = 1) => ({ passage: passages.find((passage) => passage.id === id), score });

test("Nielsen experience and case evidence share a card without merging founder work", () => {
  const inputs = [match("experience/nielsen-media", 0.9), match("project/trlr/my-contribution", 0.8), match("project/nielsen-data-systems/parallel-validation-at-scale", 0.7)];
  const groups = groupMatches(inputs);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].key, "project/nielsen-data-systems");
  assert.deepEqual(groups[0].matches, [inputs[0], inputs[2]]);
  assert.equal(groups[1].key, "project/trlr");
  assert.strictEqual(groups[0].matches[1].passage, inputs[2].passage, "Grouping retains the complete source object");
  assert.match(groups[0].matches[1].passage.text, /this particular run/);
});

test("guided product evaluation keeps the hypothesis and unvalidated outcome together", () => {
  const action = followupsFor("project/trlr").find((entry) => entry.id === "evaluation");
  const result = selectPassages(action, passages);
  assert.deepEqual(result.map(({ passage }) => passage.id), ["project/trlr/the-problem", "project/trlr/current-outcome"]);
  assert.match(result[1].passage.text, /still require further measurement/);
  assert.notEqual(result[0].passage.url, result[1].passage.url);
});

test("topics resolve approved sources and missing sources fail instead of fabricating evidence", () => {
  for (const topic of TOPICS) {
    const matches = selectPassages(topic, passages);
    assert(matches.length > 0 && matches.length <= 3);
    for (const { passage } of matches) assert.strictEqual(passage, passages.find((source) => source.id === passage.id));
  }
  assert.throws(() => selectPassages({ passages: ["unpublished/private-source"] }, passages), /Missing public navigation source/);
});

test("repeated evidence is deduplicated while its original rank and scope are retained", () => {
  const first = match("project/codeforces-potd/evidence", 0.9);
  const second = match("project/codeforces-potd/what-i-learned", 0.8);
  const [group] = groupMatches([first, second, { ...first, score: 0.2 }]);
  assert.deepEqual(group.matches, [first, second]);
  assert.match(group.matches[0].passage.text, /3 November 2026/);
  assert.match(group.matches[1].passage.text, /separate measurement/);
});
