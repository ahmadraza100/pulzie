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

test("changed non-event prop is updated via setAttribute", async () => {
  const cls = signal("a");
  function App() { return h("div", { class: cls() }); }
  const container = document.createElement("div");
  mount(h(App), container);
  assert.strictEqual(container.firstChild.getAttribute("class"), "a");
  cls("b");
  await tick();
  assert.strictEqual(container.firstChild.getAttribute("class"), "b");
});

test("removed prop is cleaned up via removeAttribute", async () => {
  const showId = signal(true);
  function App() {
    return showId()
      ? h("div", { class: "box", id: "main" })
      : h("div", { class: "box" });
  }
  const container = document.createElement("div");
  mount(h(App), container);
  assert.strictEqual(container.firstChild.getAttribute("id"), "main");
  showId(false);
  await tick();
  assert.strictEqual(container.firstChild.getAttribute("id"), null);
  assert.strictEqual(container.firstChild.getAttribute("class"), "box");
});

test("event handler is swapped — stale closure does not fire after patch", async () => {
  const label = signal("A");
  let result = null;
  function Button() {
    const text = label();
    return h("button", { onclick: () => { result = text; } }, text);
  }
  const container = document.createElement("div");
  mount(h(Button), container);

  container.firstChild.click();
  assert.strictEqual(result, "A");

  label("B");
  await tick();
  container.firstChild.click();
  assert.strictEqual(result, "B");
});

test("text node is updated in place, element not recreated", async () => {
  const label = signal("before");
  function App() { return h("p", null, label()); }
  const container = document.createElement("div");
  mount(h(App), container);

  const p = container.firstChild;
  assert.strictEqual(p.textContent, "before");

  label("after");
  await tick();

  assert.strictEqual(container.firstChild, p);
  assert.strictEqual(p.textContent, "after");
});

test("element is replaced when type changes", async () => {
  const isButton = signal(true);
  function App() {
    return isButton() ? h("button", null, "btn") : h("span", null, "spn");
  }
  const container = document.createElement("div");
  mount(h(App), container);

  assert.strictEqual(container.firstChild.tagName, "BUTTON");
  const original = container.firstChild;

  isButton(false);
  await tick();

  assert.strictEqual(container.firstChild.tagName, "SPAN");
  assert.notStrictEqual(container.firstChild, original);
});

test("child is appended when list grows", async () => {
  const count = signal(1);
  function App() {
    return h("ul", null, ...Array.from({ length: count() }, (_, i) =>
      h("li", null, String(i))
    ));
  }
  const container = document.createElement("div");
  mount(h(App), container);

  assert.strictEqual(container.firstChild.children.length, 1);

  count(3);
  await tick();
  assert.strictEqual(container.firstChild.children.length, 3);
  assert.strictEqual(container.firstChild.children[2].textContent, "2");
});

test("child is removed when list shrinks", async () => {
  const count = signal(3);
  function App() {
    return h("ul", null, ...Array.from({ length: count() }, (_, i) =>
      h("li", null, String(i))
    ));
  }
  const container = document.createElement("div");
  mount(h(App), container);

  assert.strictEqual(container.firstChild.children.length, 3);

  count(1);
  await tick();
  assert.strictEqual(container.firstChild.children.length, 1);
  assert.strictEqual(container.firstChild.children[0].textContent, "0");
});
