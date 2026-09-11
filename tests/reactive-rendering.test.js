import { test, before } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import signal from "../src/signal.js";
import h from "../src/element.js";
import { mount } from "../src/renderer.js";

const tick = () => new Promise(queueMicrotask);

before(() => {
  const { window } = new JSDOM("");
  global.document = window.document;
});

test("changing a signal causes the DOM to update", async () => {
  const count = signal(0);
  function Counter() {
    return h("p", null, String(count()));
  }
  const container = document.createElement("div");
  mount(h(Counter), container);
  assert.strictEqual(container.firstChild.textContent, "0");
  count(1);
  await tick();
  assert.strictEqual(container.firstChild.textContent, "1");
  count(5);
  await tick();
  assert.strictEqual(container.firstChild.textContent, "5");
});

test("click handler that mutates a signal causes a re-render", async () => {
  const count = signal(0);
  function Counter() {
    return h("button", { onclick: () => count(count() + 1) }, String(count()));
  }
  const container = document.createElement("div");
  mount(h(Counter), container);
  assert.strictEqual(container.firstChild.textContent, "0");
  container.firstChild.click();
  await tick();
  assert.strictEqual(container.firstChild.textContent, "1");
  container.firstChild.click();
  await tick();
  assert.strictEqual(container.firstChild.textContent, "2");
});
