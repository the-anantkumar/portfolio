import { GENERATION } from "../config.mjs";
const run = document.querySelector("#run");
const cancel = document.querySelector("#cancel");
const status = document.querySelector("#status");
const output = document.querySelector("#results");
let worker;
let generation = 0;
run.addEventListener("click", async () => {
  const current = ++generation;
  run.disabled = true;
  cancel.hidden = false;
  status.textContent = "Loading the fixed public cases and model…";
  const started = performance.now();
  window.generationReport = undefined;
  try {
    const response = await fetch("./lab-data.json", { credentials: "omit" });
    if (!response.ok) throw new Error("Missing local test cases");
    const { cases } = await response.json();
    if (current !== generation) return;
    worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
    const rows = [];
    let loadMilliseconds;
    worker.addEventListener("error", (event) => {
      if (current !== generation) return;
      window.generationReport = { candidate: GENERATION, error: event.message, cases: rows, promoted: false };
      status.textContent = "The local experiment failed. No visitor feature has been enabled.";
      worker.terminate();
      run.disabled = false;
      cancel.hidden = true;
    });
    worker.addEventListener("message", ({ data }) => {
      if (current !== generation) return;
      if (data.type === "loaded") loadMilliseconds = Math.round(performance.now() - started);
      else if (data.type === "case") {
        rows.push(data.row);
        output.textContent = rows.map((row) => `${row.id}: ${row.flags.length ? row.flags.join(", ") : "automated checks passed; human review required"}`).join("\n");
        status.textContent = `Reviewed ${rows.length} of ${cases.length} fixed cases.`;
      } else if (data.type === "done" || data.type === "error") {
        window.generationReport = { candidate: GENERATION, backend: "browser CPU WASM, one thread", loadMilliseconds, cases: rows, error: data.type === "error" ? data.message : undefined, automatedPasses: rows.filter((row) => !row.flags.length).length, humanReview: "pending", promoted: false };
        status.textContent = data.type === "done" ? "Screening complete. Human source review is still required." : "The experiment failed. No visitor feature has been enabled.";
        run.disabled = false;
        cancel.hidden = true;
        worker.terminate();
      }
    });
    worker.postMessage({ type: "run", cases });
  } catch (error) {
    if (current !== generation) return;
    status.textContent = "The local experiment could not start.";
    window.generationReport = { candidate: GENERATION, error: String(error), cases: [], promoted: false };
    run.disabled = false;
    cancel.hidden = true;
  }
});
cancel.addEventListener("click", () => {
  generation++;
  worker?.terminate();
  window.generationReport = { candidate: GENERATION, error: "Stopped by user", cases: [], promoted: false };
  status.textContent = "Experiment stopped. The public portfolio is unaffected.";
  run.disabled = false;
  cancel.hidden = true;
});
