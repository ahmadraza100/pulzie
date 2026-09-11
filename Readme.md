# Pulzie

A reactive UI framework I built from scratch in vanilla JavaScript. No libraries, no compiler plugins, no magic — just the core ideas behind how frameworks like Solid and Vue actually work, implemented from first principles.

Signals drive reactivity. When a signal changes, only the effects that read it re-run. The DOM updates surgically, not from a full re-render.

**[Live demo →](pulzie.vercel.app)**
<img width="1795" height="1003" alt="Screenshot 2026-09-11 at 5 14 28 AM" src="https://github.com/user-attachments/assets/9a1050f0-4040-4224-b6cf-05bfb89d4fe6" />


---

## Why I built this

I wanted to understand what's actually happening inside modern reactive frameworks — not just use them. So I built one.

The result is ~300 lines of source code that handles: reactive signals with automatic dependency tracking, batched async updates, virtual DOM diffing/patching, JSX, undo/redo history, and a devtools overlay.

---

## What's inside

| Module | Responsibility |
|---|---|
| `signal.js` | Reactive values — callable functions that track who reads them |
| `effect.js` | Runs when created, re-runs when any signal it read changes |
| `scheduler.js` | Batches pending effects into one microtask flush |
| `element.js` | `h()` — pure function that returns virtual DOM nodes |
| `renderer.js` | Creates real DOM, diffs/patches on re-render |
| `history.js` | Undo, redo, and replay with a linear change stack |
| `devtools.js` | Live overlay panel showing signal state and recent transitions |

---

## Getting started

```bash
git clone https://github.com/ahmadraza100/pulzie.git
cd pulzie
npm install
npm start        # demo at http://localhost:5173
npm test         # 56 tests, all passing
npm run build    # bundles to dist/
```

---

## How it works

### Signals

A signal is a function. Call it with no arguments to read, pass a value to write.

```js
import { signal } from "pulzie";

const count = signal(0);

count();     // 0
count(5);
count();     // 5
```

Subscribing manually returns an unsubscribe function:

```js
const stop = count.subscribe((val) => console.log(val));
count(10);   // logs 10
stop();
count(20);   // nothing
```

### Effects

Effects re-run automatically whenever a signal they read changes. Dependencies are tracked per-run, so if a branch stops reading a signal, it stops reacting to it.

```js
import { signal, effect } from "pulzie";

const user = signal("Ahmad");

effect(() => {
  document.title = user();   // runs now, and again every time user changes
});

user("Raza");   // effect re-runs
```

### Components + JSX

Components are plain functions. The renderer re-runs them whenever their signals change and surgically patches only what's different in the DOM.

```jsx
import { signal, mount, h } from "pulzie";

const count = signal(0);

function Counter() {
  return (
    <div>
      <p>{String(count())}</p>
      <button onclick={() => count(count() + 1)}>+1</button>
    </div>
  );
}

mount(<Counter />, document.getElementById("app"));
```

### Undo / redo

Wrap any signal with `track()` to opt it into the change history. `undo()` and `redo()` step through it. Branching after an undo truncates the forward stack — same as any text editor.

```js
import { signal, track, undo, redo } from "pulzie";

const count = signal(0);
track(count, "count");

count(1);
count(2);
undo();    // → 1
undo();    // → 0
count(5);  // branch — redo is gone
```

---

## Interesting implementation details

**Stale dependency cleanup** — before each effect re-run, it removes itself from every subscriber set it was in, then re-subscribes fresh. This means `if/else` branches that stop reading a signal automatically unsubscribe from it.

**Snapshot pattern in two places** — signal writes iterate `[...subscribers]` (not the live Set) so a subscriber that unsubscribes mid-loop doesn't cause skips. The same pattern prevents `replay()` from infinitely appending to the log it's iterating.

**`resolve()` before diffing** — the reconciler flattens all function components into plain vnodes before comparing old and new trees. This means `patch()` never needs to handle function types — it only sees strings and element objects.

**`recording` flag for undo/redo** — when undo or redo writes back to a signal, the history module suppresses re-recording via a boolean flag, so stepping through history doesn't pollute the undo stack.

---

## Project structure

```
src/          framework source
demo/         interactive demo app
tests/        56 unit tests (node:test, no extra dependencies)
examples/     benchmark script
dist/         built output — ESM + UMD
```
