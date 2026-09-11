import { test } from "node:test";
import assert from "node:assert/strict";
import h from "../src/element.js";

test("creates element with type, props, and single text child", () => {
  const el = h("div", { class: "card" }, "Hello");
  assert.deepStrictEqual(el, {
    type: "div",
    props: { class: "card" },
    children: ["Hello"],
  });
});

test("handles null props", () => {
  const el = h("span", null, "text");
  assert.deepStrictEqual(el, {
    type: "span",
    props: {},
    children: ["text"],
  });
});

test("handles multiple children of mixed types", () => {
  const el = h("p", null, "count: ", 42);
  assert.deepStrictEqual(el, {
    type: "p",
    props: {},
    children: ["count: ", 42],
  });
});

test("flattens nested arrays of children from .map()", () => {
  const items = ["a", "b", "c"];
  const el = h("ul", null, items.map((i) => h("li", null, i)));
  assert.strictEqual(el.children.length, 3);
  assert.strictEqual(el.children[0].type, "li");
  assert.deepStrictEqual(el.children[0].children, ["a"]);
});

test("filters out null and undefined children", () => {
  const el = h("div", null, "hello", null, undefined, "world");
  assert.deepStrictEqual(el.children, ["hello", "world"]);
});

test("supports nesting h() as a child", () => {
  const el = h("div", null, h("span", { id: "x" }, "inner"));
  assert.strictEqual(el.type, "div");
  assert.strictEqual(el.children.length, 1);
  assert.deepStrictEqual(el.children[0], {
    type: "span",
    props: { id: "x" },
    children: ["inner"],
  });
});
