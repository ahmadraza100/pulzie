import { test } from "node:test";
import assert from "node:assert/strict";
import signal from "../src/signal.js";

test("stores initial value", () => {
  const count = signal(42);
  assert.strictEqual(count(), 42);
});

test("value is readable via count()", () => {
  const count = signal("hello");
  assert.strictEqual(count(), "hello");
});

test("value is writable via count(next)", () => {
  const count = signal(1);
  count(2);
  assert.strictEqual(count(), 2);
});

test("same value does not notify", () => {
  const count = signal(5);
  let calls = 0;
  count.subscribe(() => calls++);
  count(5);
  assert.strictEqual(calls, 0);
});

test("multiple subscribers all notified", () => {
  const count = signal(0);
  const received = [];
  count.subscribe((v) => received.push("A:" + v));
  count.subscribe((v) => received.push("B:" + v));
  count(1);
  count(2);
  assert.deepStrictEqual(received, ["A:1", "B:1", "A:2", "B:2"]);
});

test("subscriber can unsubscribe", () => {
  const count = signal(0);
  let calls = 0;
  const stop = count.subscribe(() => calls++);
  count(1);
  stop();
  count(2);
  assert.strictEqual(calls, 1);
});
