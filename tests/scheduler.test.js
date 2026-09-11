import { test } from "node:test";
import assert from "node:assert/strict";
import { schedule } from "../src/scheduler.js";

const tick = () => new Promise(queueMicrotask);

test("multiple schedule(fn) calls with same fn only run it once", async () => {
  let runs = 0;
  const fn = () => runs++;
  schedule(fn);
  schedule(fn);
  schedule(fn);
  assert.strictEqual(runs, 0);  // not yet — still in microtask queue
  await tick();
  assert.strictEqual(runs, 1);  // ran exactly once despite three schedule() calls
});

test("scheduled fn runs after current synchronous code", async () => {
  const log = [];
  schedule(() => log.push("scheduled"));
  log.push("sync");
  assert.deepStrictEqual(log, ["sync"]);  // scheduled hasn't run yet
  await tick();
  assert.deepStrictEqual(log, ["sync", "scheduled"]);
});
