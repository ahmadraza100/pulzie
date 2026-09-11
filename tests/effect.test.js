import { test } from "node:test";
import assert from "node:assert/strict";
import signal from "../src/signal.js";
import effect from "../src/effect.js";

const tick = () => new Promise(queueMicrotask);

test("effect runs immediately on creation", () => {
  let ran = false;
  effect(() => { ran = true; });
  assert.strictEqual(ran, true);
});

test("effect re-runs when a signal it read changes", async () => {
  const count = signal(0);
  let last;
  effect(() => { last = count(); });
  assert.strictEqual(last, 0);
  count(1);
  await tick();
  assert.strictEqual(last, 1);
  count(2);
  await tick();
  assert.strictEqual(last, 2);
});

test("effect does not re-run when a signal it never read changes", async () => {
  const a = signal(0);
  const b = signal(0);
  let runs = 0;
  effect(() => { a(); runs++; });
  assert.strictEqual(runs, 1);
  b(99);
  await tick();
  assert.strictEqual(runs, 1);
});

test("effect drops stale dependency after branch switches", async () => {
  const enabled = signal(true);
  const a = signal(10);
  const b = signal(20);
  let runs = 0;

  effect(() => {
    runs++;
    if (enabled()) { a(); } else { b(); }
  });

  assert.strictEqual(runs, 1);

  enabled(false);
  await tick();
  assert.strictEqual(runs, 2);

  a(999);
  await tick();
  assert.strictEqual(runs, 2);  // a dropped — should NOT re-run

  b(999);
  await tick();
  assert.strictEqual(runs, 3);
});

test("effect with multiple signal reads re-runs when any one changes", async () => {
  const a = signal(0);
  const b = signal(0);
  const log = [];
  effect(() => { log.push(a() + b()); });
  a(1);
  await tick();
  b(1);
  await tick();
  assert.deepStrictEqual(log, [0, 1, 2]);
});
