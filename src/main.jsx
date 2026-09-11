import signal from "./signal.js";
import { mount } from "./renderer.js";
import { track, undo, redo, getHistory } from "./history.js";
import { register } from "./inspector.js";
import { mountDevTools } from "./devtools.js";

const count = signal(0);
const text = signal("hello");
track(count, "count");
track(text, "text");
register(count, "count");
register(text, "text");

function Counter() {
  return (
    <div>
      <h2>Counter Ahmad: {String(count())}</h2>
      <button onclick={() => count(count() + 1)}>+1</button>
      <button onclick={() => count(count() - 1)}>-1</button>
      <button onclick={() => count(count() * 2)}>×2</button>
      <button onclick={() => { undo(); }}>Undo</button>
      <button onclick={() => { redo(); }}>Redo</button>
    </div>
  );
}

function TextDemo() {
  return (
    <div>
      <h2>Text: {text()}</h2>
      <button onclick={() => text("hello")}>hello</button>
      <button onclick={() => text("world")}>world</button>
      <button onclick={() => text("Pulzie!")}>Pulzie!</button>
    </div>
  );
}

function HistoryLog() {
  const log = getHistory();
  return (
    <div>
      <h2>History ({String(log.length)} entries)</h2>
      <ul>
        {log.slice(-5).map((entry) => (
          <li>{entry.name}: {String(entry.previous)} → {String(entry.next)}</li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  return (
    <div>
      <h1>Pulzie Demo</h1>
      <Counter />
      <TextDemo />
      <HistoryLog />
    </div>
  );
}

mount(<App />, document.getElementById("app"));

const devContainer = document.createElement("div");
document.body.appendChild(devContainer);
const { refresh } = mountDevTools(devContainer);
count.subscribe(refresh);
text.subscribe(refresh);
