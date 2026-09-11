import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import signal from "../src/signal.js";
import { track, clearHistory } from "../src/history.js";
import { register, inspect, clearRegistry } from "../src/inspector.js";

beforeEach(() => {
  clearHistory();
  clearRegistry();
});

test("inspect returns current value and subscriber count for registered signals", () => {
  const count = signal(42);
  register(count, "count");
  const { signals } = inspect();
  assert.strictEqual(signals.count.value, 42);
  assert.strictEqual(typeof signals.count.subscribers, "number");
});

test("inspect reflects updated signal values", () => {
  const x = signal(0);
  register(x, "x");
  x(99);
  const { signals } = inspect();
  assert.strictEqual(signals.x.value, 99);
});

test("inspect includes recent history from tracked signals", () => {
  const a = signal(0);
  register(a, "a");
  track(a, "a");
  a(1);
  a(2);
  const { recentHistory } = inspect();
  assert.ok(recentHistory.length >= 2);
  assert.strictEqual(recentHistory.at(-1).next, 2);
});

test("subscriberCount increases when effects subscribe", () => {
  const s = signal(0);
  register(s, "s");
  assert.strictEqual(inspect().signals.s.subscribers, 0);
  s.subscribe(() => {});
  assert.strictEqual(inspect().signals.s.subscribers, 1);
});
