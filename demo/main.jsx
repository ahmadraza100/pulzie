import "./styles.css";
import h from "../src/element.js";
import signal from "../src/signal.js";
import { mount } from "../src/renderer.js";
import { track, undo, redo } from "../src/history.js";
import { register } from "../src/inspector.js";
import { mountDevTools } from "../src/devtools.js";

// ─── Signals ──────────────────────────────────────────────────────────────────

const pulse = signal(0);
setInterval(() => pulse(pulse() + 1), 1200);

const r = signal(124);
const g = signal(58);
const b = signal(237);

const fetchStatus = signal("idle");
const fetchQuote = signal({ text: "", author: "" });
const draft = signal("");
const todos = signal([
  { id: 1, text: "Build a reactive framework", done: true },
  { id: 2, text: "Add JSX support", done: true },
  { id: 3, text: "Wire up undo / redo", done: false },
]);
const newTodo = signal("");

track(todos, "todos");
register(r, "red");
register(g, "green");
register(b, "blue");
register(todos, "todos");
register(draft, "draft");
register(fetchStatus, "fetch");

const quotes = [
  { text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "Perfection is achieved when there is nothing left to take away.", author: "Antoine de Saint-Exupéry" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Programs must be written for people to read.", author: "Abelson & Sussman" },
];

let lastIdx = -1;

async function loadQuote() {
  if (fetchStatus() === "loading") return;
  fetchStatus("loading");
  await new Promise((res) => setTimeout(res, 750));
  let idx;
  do { idx = Math.floor(Math.random() * quotes.length); } while (idx === lastIdx);
  lastIdx = idx;
  fetchQuote(quotes[idx]);
  fetchStatus("done");
}

function addTodo() {
  const text = newTodo().trim();
  if (!text) return;
  todos([...todos(), { id: Date.now(), text, done: false }]);
  newTodo("");
}
function toggleTodo(id) {
  todos(todos().map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
}
function removeTodo(id) {
  todos(todos().filter((t) => t.id !== id));
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Card({ class: cls = "" }, children) {
  return (
    <div class={`bg-zinc-950 rounded-2xl border border-zinc-800 shadow-sm p-6 ${cls}`}>
      {children}
    </div>
  );
}

function SectionLabel({ text }) {
  return <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">{text}</p>;
}

function DarkBtn({ onclick, disabled = false, class: cls = "" }, children) {
  return (
    <button
      onclick={onclick}
      disabled={disabled}
      class={`text-sm px-4 py-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer ${cls}`}
    >
      {children}
    </button>
  );
}

function GhostBtn({ onclick, class: cls = "" }, children) {
  return (
    <button
      onclick={onclick}
      class={`text-sm px-3 py-1.5 rounded-lg border text-white border-zinc-600 bg-zinc-800 hover:bg-zinc-600 transition-colors cursor-pointer ${cls}`}
    >
      {children}
    </button>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/8 backdrop-blur-xl bg-zinc-950/75">
      <span class="font-bold tracking-tight text-white text-xl">
        Pul<span class="text-violet-400">zie</span>
      </span>
      <div class="flex items-center gap-6">
        <a href="#how-it-works" class="text-sm text-zinc-500 hover:text-white transition-colors hidden sm:block">How it works</a>
        <a href="#demo" class="text-sm text-zinc-500 hover:text-white transition-colors hidden sm:block">Demo</a>
        <a
          href="https://github.com/ahmadraza100/pulzie"
          class="text-sm text-zinc-300 border border-zinc-700 hover:border-zinc-500 hover:text-white px-3 py-1.5 rounded-lg transition-all"
        >
          GitHub →
        </a>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const count = pulse();

  return (
    <section class="bg-zinc-950 min-h-screen flex items-center pt-16 relative overflow-hidden">
      {/* dot grid — kept inline: background-image radial-gradient can't be expressed as a Tailwind class */}
      <div class="absolute inset-0 opacity-60 pointer-events-none" style="background-image:radial-gradient(circle,#2a2a2e 1px,transparent 1px);background-size:28px 28px" />
      {/* radial vignette */}
      <div class="absolute inset-0 pointer-events-none" style="background:radial-gradient(ellipse 80% 60% at 50% 50%,transparent 40%,#09090b 100%)" />

      <div class="max-w-[1100px] mx-auto px-6 py-20 w-full relative">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-[72px] items-center">

          <div>
            <div class="inline-flex items-center gap-2 text-[11px] font-mono text-violet-400 border border-violet-400/20 rounded-full px-3.5 py-1.5 mb-8 bg-violet-400/[0.06]">
              <span class="pulse w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0 inline-block" />
              built from scratch — no runtime deps
            </div>

            <h1 class="text-[clamp(3rem,7.5vw,4.5rem)] font-black text-white leading-[1.04] tracking-[-0.05em] mb-6">
              A  framework<br />
              <span class="text-violet-400">you can read</span><br />
              in an afternoon.
            </h1>

            <p class="text-zinc-500 text-[clamp(1rem,1.4vw,1.125rem)] leading-[1.75] mb-11 max-w-[420px] tracking-[-0.01em]">
              Signals, virtual DOM diffing, undo/redo, and devtools — ~300 lines of vanilla JS. Read it, fork it, make it yours.
            </p>

            <div class="flex gap-2 flex-wrap">
              <a
                href="https://github.com/ahmadraza100/pulzie"
                class="inline-flex items-center gap-2 px-[22px] py-[11px] bg-white text-zinc-950 text-xs font-semibold rounded-[10px] no-underline tracking-[-0.01em] hover:bg-zinc-100 transition-colors"
              >
                View on GitHub
              </a>
              <a
                href="#demo"
                class="inline-flex items-center px-[22px] py-[11px] border border-zinc-800 text-zinc-400 text-xs rounded-[10px] no-underline transition-all hover:border-zinc-600 hover:text-zinc-200"
              >
                Try the demo ↓
              </a>
            </div>
          </div>

          <div class="relative">
            <div class="absolute -inset-6 pointer-events-none rounded-[32px]" style="background:radial-gradient(ellipse at 50% 50%,rgba(167,139,250,.15) 0%,transparent 70%)" />
            <div class="relative bg-[#111113] border border-zinc-800 rounded-[20px] p-7">
              <div class="flex items-center justify-between mb-5">
                <div class="text-[10px] font-mono text-zinc-600 tracking-[0.08em]">LIVE · ticking every 1.2s</div>
                <div class="flex gap-1.5">
                  <div class="w-2 h-2 rounded-full bg-zinc-700" />
                  <div class="w-2 h-2 rounded-full bg-zinc-700" />
                  <div class="w-2 h-2 rounded-full bg-zinc-700" />
                </div>
              </div>
              <div class="text-[clamp(56px,6vw,80px)] font-mono font-bold leading-none mb-7 tracking-[-0.04em] bg-gradient-to-br from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                {String(count).padStart(4, "0")}
              </div>
              <div class="bg-[#0c0c0e] border border-zinc-900 rounded-xl p-[18px] font-mono text-[12px] leading-loose">
                <span class="text-zinc-600">// 2 lines. that's it.</span><br />
                <span class="text-sky-300">const </span>
                <span class="text-zinc-200">pulse = </span>
                <span class="text-purple-400">signal</span>
                <span class="text-zinc-200">(0)</span><br />
                <span class="text-sky-300">setInterval</span>
                <span class="text-zinc-200">(() ={">"} pulse(pulse() + 1), 1200)</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function Stats() {
  const items = [
    { value: "~300", label: "lines of source" },
    { value: "0", label: "runtime deps", note: "vite · jsdom are devDeps" },
    { value: "56", label: "passing tests" },
    { value: "JSX", label: "via Vite esbuild" },
  ];

  return (
    <div class="bg-zinc-950 border-y border-zinc-900">
      <div class="max-w-[1100px] mx-auto px-6 grid grid-cols-2 sm:grid-cols-4">
        {items.map((item, i) => (
          <div class={`py-7 px-6 text-center${i < items.length - 1 ? " border-r border-zinc-900" : ""}`}>
            <div class="text-[1.75rem] font-extrabold text-white tracking-[-0.03em] font-mono">
              {item.value}
            </div>
            <div class="text-xs text-zinc-600 mt-1">{item.label}</div>
            {item.note && (
              <div class="text-[0.65rem] text-zinc-700 mt-0.5 font-mono">{item.note}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────

function CodeLine(_props, children) {
  return <div class="font-mono text-[12px] leading-loose">{children}</div>;
}

function Features() {
  return (
    <section id="how-it-works" class="bg-zinc-950 py-[100px] px-6">
      <div class="max-w-[1100px] mx-auto">

        <div class="text-center mb-[72px]">
          <div class="text-[11px] font-bold tracking-[0.1em] uppercase text-violet-400 mb-3.5">
            How it works
          </div>
          <h2 class="text-[clamp(2rem,4.5vw,3.25rem)] font-black text-white tracking-[-0.05em] leading-[1.06]">
            Three primitives.<br />Everything else follows.
          </h2>
          <p class="text-[clamp(0.95rem,1.3vw,1.075rem)] text-zinc-500 mt-3.5 max-w-[480px] mx-auto leading-[1.75]">
            Signal → Effect → Renderer. That's the whole model.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div class="bg-zinc-950 border border-zinc-800 rounded-[20px] p-8 flex flex-col gap-5">
            <div>
              <div class="text-[1.3rem] font-bold text-white mb-2">Signals</div>
              <div class="text-[0.85rem] text-zinc-500 leading-[1.65]">
                A signal is a callable value. Read it, write it, subscribe to it. Only effects that read a signal re-run when it changes — nothing else.
              </div>
            </div>
            <div class="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-4 mt-auto">
              <CodeLine>
                <span class="text-sky-300">const </span>
                <span class="text-zinc-200">count = </span>
                <span class="text-purple-400">signal</span>
                <span class="text-zinc-200">(0)</span>
              </CodeLine>
              <CodeLine>
                <span class="text-zinc-200">count() </span>
                <span class="text-zinc-600">// read → 0</span>
              </CodeLine>
              <CodeLine>
                <span class="text-zinc-200">count(5) </span>
                <span class="text-zinc-600">// write</span>
              </CodeLine>
            </div>
          </div>

          <div class="bg-zinc-950 border border-zinc-800 rounded-[20px] p-8 flex flex-col gap-5">
            <div>
              <div class="text-[1.3rem] font-bold text-white mb-2">Effects + vDOM</div>
              <div class="text-[0.85rem] text-zinc-500 leading-[1.65]">
                Components are plain functions. The renderer wraps them in an effect, diffs the vnode tree on re-run, and patches only what changed in the real DOM.
              </div>
            </div>
            <div class="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-4 mt-auto">
              <CodeLine>
                <span class="text-sky-600">function </span>
                <span class="text-green-600">Counter</span>
                <span class="text-gray-100">() {"{"}</span>
              </CodeLine>
              <CodeLine>
                <span class="text-gray-100">{"  return <p>"}</span>
                <span class="text-purple-500">{"{"}count(){"}"}</span>
                <span class="text-gray-100">{"</p>"}</span>
              </CodeLine>
              <CodeLine><span class="text-gray-100">{"}"}</span></CodeLine>
            </div>
          </div>

          <div class="bg-zinc-950 border border-zinc-800 rounded-[20px] p-8 flex flex-col gap-5">
            <div>
              <div class="text-[1.3rem] font-bold text-white mb-2">History</div>
              <div class="text-[0.85rem] text-zinc-500 leading-[1.65]">
                Wrap any signal with <span class="font-mono text-gray-100">track()</span> and get undo, redo, and replay for free. New changes after an undo truncate the forward stack.
              </div>
            </div>
            <div class="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-4 mt-auto">
              <CodeLine>
                <span class="text-purple-500">track</span>
                <span class="text-gray-100">(count, </span>
                <span class="text-green-600">"count"</span>
                <span class="text-gray-100">)</span>
              </CodeLine>
              <CodeLine>
                <span class="text-purple-500">undo</span>
                <span class="text-gray-100">() </span>
                <span class="text-gray-400">// step back</span>
              </CodeLine>
              <CodeLine>
                <span class="text-purple-500">redo</span>
                <span class="text-gray-100">() </span>
                <span class="text-gray-400">// step forward</span>
              </CodeLine>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Demo ─────────────────────────────────────────────────────────────────────

function Slider({ sig, val, label, accent }) {
  return (
    <div class="flex items-center gap-3">
      <span class={`text-[11px] font-bold font-mono w-3 ${accent}`}>{label}</span>
      <input
        type="range" min="0" max="255"
        value={String(val)}
        oninput={(e) => sig(Number(e.target.value))}
        class="flex-1 h-1.5 cursor-pointer"
      />
      <span class="text-xs font-mono text-gray-400 w-7 text-right">{String(val)}</span>
    </div>
  );
}

function ColorLab() {
  const rv = r(), gv = g(), bv = b();
  const hex = `#${[rv, gv, bv].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  return (
    <Card>
      <SectionLabel text="Color Lab" />
      {/* dynamic rgb value must stay inline */}
      <div class="w-full h-20 rounded-xl mb-4" style={`background:rgb(${rv},${gv},${bv});transition:background 60ms`} />
      <p class="text-center font-mono text-sm text-gray-400 mb-5">{hex}</p>
      <div class="space-y-4">
        <Slider sig={r} val={rv} label="R" accent="text-red-500" />
        <Slider sig={g} val={gv} label="G" accent="text-green-600" />
        <Slider sig={b} val={bv} label="B" accent="text-blue-500" />
      </div>
    </Card>
  );
}

function AsyncQuote() {
  const status = fetchStatus();
  const quote = fetchQuote();
  return (
    <Card>
      <SectionLabel text="Async Signal" />
      <div class="min-h-[96px] flex flex-col justify-between">
        <div class="flex-1 flex items-center justify-center mb-5">
          {status === "idle" && (
            <p class="text-sm text-gray-400 text-center leading-relaxed">
              Loading state is just a signal.<br />
              <span class="text-xs text-gray-300">Press to see it in action.</span>
            </p>
          )}
          {status === "loading" && (
            <div class="flex flex-col items-center gap-2.5">
              <div class="w-5 h-5 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin" />
              <span class="text-xs text-gray-400">fetching...</span>
            </div>
          )}
          {status === "done" && (
            <div>
              <p class="text-sm text-gray-700 text-center leading-relaxed italic">"{quote.text}"</p>
              <p class="text-xs text-gray-400 text-center mt-2">— {quote.author}</p>
            </div>
          )}
        </div>
        <DarkBtn onclick={loadQuote} disabled={status === "loading"} class="w-full justify-center">
          {status === "loading" ? "loading..." : status === "done" ? "load another" : "load quote"}
        </DarkBtn>
      </div>
    </Card>
  );
}

function LiveWriter() {
  const text = draft();
  const chars = text.length;
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const lines = text === "" ? 0 : text.split("\n").length;
  const pct = Math.min(100, Math.round((chars / 280) * 100));
  const over = chars > 280;
  return (
    <Card>
      <SectionLabel text="Live Writer" />
      <textarea
        value={text}
        oninput={(e) => draft(e.target.value)}
        placeholder="Start typing..."
        class="w-full h-24 text-sm text-white bg-zinc-800 border border-zinc-600 rounded-lg p-3 resize-none outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
      />
      <div class="flex items-center justify-between mt-3">
        <div class="flex gap-5">
          <StatBadge label="chars" value={String(chars)} warn={over} />
          <StatBadge label="words" value={String(words)} />
          <StatBadge label="lines" value={String(lines)} />
        </div>
        <div class="flex items-center gap-2">
          <div class="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            {/* dynamic width% must stay inline */}
            <div
              class={`h-full rounded-full transition-all ${over ? "bg-red-400" : "bg-gray-400"}`}
              style={`width:${pct}%`}
            />
          </div>
          <span class={`text-xs font-mono ${over ? "text-red-500" : "text-gray-400"}`}>
            {String(280 - chars)}
          </span>
        </div>
      </div>
    </Card>
  );
}

function StatBadge({ label, value, warn = false }) {
  return (
    <div class="flex flex-col items-center">
      <span class={`text-lg font-mono font-bold ${warn ? "text-red-500" : "text-gray-100"}`}>{value}</span>
      <span class="text-[10px] text-gray-400">{label}</span>
    </div>
  );
}

function TodoBoard() {
  const list = todos();
  const doneCount = list.filter((t) => t.done).length;
  return (
    <Card>
      <SectionLabel text="Undo Board" />
      <div class="flex gap-2 mb-4">
        <input
          type="text"
          value={newTodo()}
          oninput={(e) => newTodo(e.target.value)}
          onkeydown={(e) => e.key === "Enter" && addTodo()}
          placeholder="Add a task..."
          class="flex-1 text-sm bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
        />
        <DarkBtn onclick={addTodo}>+</DarkBtn>
      </div>
      <ul class="space-y-1.5 mb-4 min-h-[80px]">
        {list.length === 0 && (
          <li class="text-sm text-gray-300 py-6 text-center">no tasks</li>
        )}
        {list.map((todo) => (
          <li class="flex items-center gap-2.5 group py-0.5">
            <button
              onclick={() => toggleTodo(todo.id)}
              class={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${todo.done ? "bg-gray-900 border-gray-900" : "border-gray-300 hover:border-gray-500"}`}
            >
              {todo.done && <span class="text-white text-[9px] leading-none">✓</span>}
            </button>
            <span class={`flex-1 text-sm ${todo.done ? "line-through text-gray-300" : "text-gray-700"}`}>
              {todo.text}
            </span>
            <button
              onclick={() => removeTodo(todo.id)}
              class="text-gray-200 hover:text-red-400 text-base opacity-0 group-hover:opacity-100 transition-all cursor-pointer px-1"
            >×</button>
          </li>
        ))}
      </ul>
      <div class="flex items-center justify-between pt-3 border-t border-gray-100">
        <span class="text-xs text-gray-400">{String(doneCount)} / {String(list.length)} done</span>
        <div class="flex gap-1">
          <GhostBtn onclick={() => undo()}>↩</GhostBtn>
          <GhostBtn onclick={() => redo()}>↪</GhostBtn>
        </div>
      </div>
    </Card>
  );
}

function DemoSection() {
  return (
    <section id="demo" class="bg-zinc-950 border-t border-zinc-800 py-[100px] px-6">
      <div class="max-w-[760px] mx-auto">
        <div class="text-center mb-14">
          <div class="text-[11px] font-bold tracking-[0.1em] uppercase text-violet-400 mb-3.5">
            Try it
          </div>
          <h2 class="text-[clamp(2rem,4.5vw,3.25rem)] font-black text-white tracking-[-0.05em]">
            Live demos
          </h2>
          <p class="text-[clamp(0.95rem,1.3vw,1.075rem)] text-zinc-500 mt-3.5 leading-[1.75] max-w-[420px] mx-auto">
            Every interaction is powered by Pulzie — no React, no Vue, just signals.
          </p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ColorLab />
          <AsyncQuote />
          <LiveWriter />
          <TodoBoard />
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer class="bg-zinc-950 border-t border-zinc-900 py-10 px-6">
      <div class="max-w-[1100px] mx-auto flex items-center justify-between flex-wrap gap-3">
        <span class="text-sm font-bold text-white">
          Pul<span class="text-violet-400">zie</span>
          <span class="font-normal text-zinc-600 text-xs ml-2.5">v1.0.0</span>
        </span>
        <span class="text-xs text-zinc-600">
          Built by Ahmad Raza · MIT License
        </span>
        <a
          href="https://github.com/ahmadraza100/pulzie"
          class="text-[0.8rem] text-zinc-600 no-underline transition-colors hover:text-zinc-400"
        >
          github →
        </a>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  return (
    <div>
      <Nav />
      <Hero />
      <Stats />
      <Features />
      <DemoSection />
      <Footer />
    </div>
  );
}

mount(<App />, document.getElementById("app"));

const devPanel = document.createElement("div");
document.body.appendChild(devPanel);
const { refresh } = mountDevTools(devPanel);
[r, g, b, todos, draft, fetchStatus, pulse].forEach((s) => s.subscribe(refresh));
