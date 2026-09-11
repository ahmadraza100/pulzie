import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import signal from "../src/signal.js";
import { track, getHistory, clearHistory, undo, redo, replay } from "../src/history.js";

beforeEach(() => clearHistory());

test("track records name, previous, next, and timestamp", () => {
  const count = signal(0);
  track(count, "count");
  count(5);
  const log = getHistory();
  assert.strictEqual(log.length, 1);
  assert.strictEqual(log[0].name, "count");
  assert.strictEqual(log[0].previous, 0);
  assert.strictEqual(log[0].next, 5);
  assert.ok(typeof log[0].timestamp === "number");
});

test("getHistory returns a copy — mutations do not affect the log", () => {
  const a = signal(0);
  track(a, "a");
  a(1);
  const h1 = getHistory();
  h1.push({ fake: true });
  assert.strictEqual(getHistory().length, 1);
});

test("multiple signals tracked independently", () => {
  const a = signal(0);
  const b = signal("hello");
  track(a, "a");
  track(b, "b");
  a(1);
  b("world");
  a(2);
  const log = getHistory();
  assert.strictEqual(log.length, 3);
  assert.strictEqual(log[0].name, "a");
  assert.strictEqual(log[1].name, "b");
  assert.strictEqual(log[2].name, "a");
});

test("clearHistory empties the log", () => {
  const a = signal(0);
  track(a, "a");
  a(1);
  clearHistory();
  assert.strictEqual(getHistory().length, 0);
});

test("undo applies previous value", async () => {
  const count = signal(0);
  track(count, "count");
  count(5);
  undo();
  assert.strictEqual(count(), 0);
});

test("redo applies next value after undo", async () => {
  const count = signal(0);
  track(count, "count");
  count(5);
  undo();
  redo();
  assert.strictEqual(count(), 5);
});

test("undo returns false when nothing to undo", () => {
  assert.strictEqual(undo(), false);
});

test("redo returns false when at latest state", () => {
  const count = signal(0);
  track(count, "count");
  count(1);
  assert.strictEqual(redo(), false);
});

test("new change after undo truncates redo history", () => {
  const count = signal(0);
  track(count, "count");
  count(1);
  count(2);
  undo();
  undo();
  count(99);
  assert.strictEqual(redo(), false);
  assert.strictEqual(count(), 99);
});

test("undo does not re-record itself in the undo stack", () => {
  const count = signal(0);
  track(count, "count");
  count(1);
  count(2);
  undo();
  undo();
  redo();
  assert.strictEqual(count(), 1);
  undo();
  assert.strictEqual(count(), 0);
});

test("replay re-applies transitions in order", () => {
  const count = signal(0);
  track(count, "count");
  count(1);
  count(2);
  count(3);
  count(0);
  replay();
  assert.strictEqual(count(), 0);
});

test("replay calls onStep for each transition", () => {
  const count = signal(0);
  track(count, "count");
  count(10);
  count(20);
  const steps = [];
  replay({ onStep: ({ next }) => steps.push(next) });
  assert.deepStrictEqual(steps, [10, 20]);
});
