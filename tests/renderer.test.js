import { test, before } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import h from "../src/element.js";
import { createDOM, render } from "../src/renderer.js";

before(() => {
  const { window } = new JSDOM("");
  global.document = window.document;
});

test("renders a single element with text content", () => {
  const node = createDOM(h("h1", null, "Hello Pulzie"));
  assert.strictEqual(node.tagName, "H1");
  assert.strictEqual(node.textContent, "Hello Pulzie");
});

test("renders an element with attributes applied", () => {
  const node = createDOM(h("div", { class: "card", id: "box" }));
  assert.strictEqual(node.getAttribute("class"), "card");
  assert.strictEqual(node.getAttribute("id"), "box");
});

test("renders nested children correctly", () => {
  const node = createDOM(h("div", null, h("span", null, "inner")));
  assert.strictEqual(node.firstChild.tagName, "SPAN");
  assert.strictEqual(node.firstChild.textContent, "inner");
});

test("renders multiple sibling children", () => {
  const node = createDOM(h("ul", null, h("li", null, "a"), h("li", null, "b")));
  assert.strictEqual(node.children.length, 2);
  assert.strictEqual(node.children[0].textContent, "a");
  assert.strictEqual(node.children[1].textContent, "b");
});

test("renders text and number vnodes directly", () => {
  const text = createDOM("hello");
  const num = createDOM(42);
  assert.strictEqual(text.nodeType, 3);
  assert.strictEqual(text.textContent, "hello");
  assert.strictEqual(num.textContent, "42");
});

test("onclick prop wires up event handler via addEventListener", () => {
  let clicked = 0;
  const node = createDOM(h("button", { onclick: () => clicked++ }, "Click"));
  node.click();
  assert.strictEqual(clicked, 1);
});

test("non-event props still use setAttribute", () => {
  const node = createDOM(h("div", { class: "box", id: "main" }));
  assert.strictEqual(node.getAttribute("class"), "box");
  assert.strictEqual(node.getAttribute("id"), "main");
});

test("simple function component with no props renders correctly", () => {
  function greeting() {
    return h("p", null, "hello");
  }
  const node = createDOM(h(greeting));
  assert.strictEqual(node.tagName, "P");
  assert.strictEqual(node.textContent, "hello");
});

test("function component receives and uses props", () => {
  function Label({ text }) {
    return h("span", null, text);
  }
  const node = createDOM(h(Label, { text: "world" }));
  assert.strictEqual(node.tagName, "SPAN");
  assert.strictEqual(node.textContent, "world");
});

test("function component receives and renders children", () => {
  function Card(_props, children) {
    return h("div", { class: "card" }, ...children);
  }
  const node = createDOM(h(Card, null, h("p", null, "inside")));
  assert.strictEqual(node.tagName, "DIV");
  assert.strictEqual(node.getAttribute("class"), "card");
  assert.strictEqual(node.firstChild.tagName, "P");
  assert.strictEqual(node.firstChild.textContent, "inside");
});

test("nested components resolve correctly", () => {
  function Inner() {
    return h("em", null, "deep");
  }
  function Outer() {
    return h("div", null, h(Inner));
  }
  const node = createDOM(h(Outer));
  assert.strictEqual(node.tagName, "DIV");
  assert.strictEqual(node.firstChild.tagName, "EM");
  assert.strictEqual(node.firstChild.textContent, "deep");
});

test("render() replaces previous content on re-render", () => {
  const container = document.createElement("div");
  render(h("p", null, "first"), container);
  assert.strictEqual(container.childNodes.length, 1);
  render(h("p", null, "second"), container);
  assert.strictEqual(container.childNodes.length, 1);
  assert.strictEqual(container.firstChild.textContent, "second");
});
