import signal from "./signal.js";
import h from "./element.js";
import { mount } from "./renderer.js";
import { inspect } from "./inspector.js";

function fmt(val) {
  if (val === null || val === undefined) return String(val);
  if (Array.isArray(val)) return `[${val.length}]`;
  if (typeof val === "object") {
    const keys = Object.keys(val);
    return keys.length <= 3
      ? `{${keys.join(", ")}}`
      : `{${keys.slice(0, 3).join(", ")}…}`;
  }
  if (typeof val === "string") return val.length > 24 ? val.slice(0, 24) + "…" : `"${val}"`;
  return String(val);
}

const S = {
  panel: [
    "position:fixed", "bottom:16px", "right:16px",
    "background:#0f0f0f", "color:#e5e5e5",
    "font:11px/1.5 ui-monospace,monospace",
    "width:240px", "max-height:320px", "overflow:hidden",
    "border-radius:10px", "z-index:9999",
    "box-shadow:0 4px 24px rgba(0,0,0,.45)",
    "border:1px solid #2a2a2a",
  ].join(";"),
  header: "padding:8px 12px;border-bottom:1px solid #1e1e1e;display:flex;align-items:center;gap:6px",
  dot: "width:6px;height:6px;border-radius:50%;background:#a78bfa;flex-shrink:0",
  title: "font-weight:600;letter-spacing:.04em;color:#a78bfa;font-size:10px;text-transform:uppercase",
  body: "padding:8px 0;overflow-y:auto;max-height:270px",
  row: "display:flex;align-items:baseline;gap:0;padding:2px 12px;",
  name: "color:#7dd3fc;min-width:64px;flex-shrink:0",
  val: "color:#e5e5e5;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap",
  subs: "color:#444;margin-left:8px;flex-shrink:0",
  divider: "border:none;border-top:1px solid #1e1e1e;margin:6px 0",
  histItem: "padding:2px 12px;color:#555;white-space:nowrap;overflow:hidden;text-overflow:ellipsis",
  histArrow: "color:#333",
  histNext: "color:#86efac",
};

export function mountDevTools(container) {
  const tick = signal(0);

  function DevPanel() {
    tick();
    const { signals, recentHistory } = inspect();

    const signalRows = Object.entries(signals).map(([name, { value, subscribers }]) =>
      h("div", { style: S.row },
        h("span", { style: S.name }, name),
        h("span", { style: S.val }, fmt(value)),
        h("span", { style: S.subs }, `×${subscribers}`)
      )
    );

    const histRows = recentHistory.slice(-5).reverse().map(({ name, previous, next }) =>
      h("div", { style: S.histItem },
        h("span", { style: "color:#555" }, `${name} `),
        h("span", { style: S.histArrow }, fmt(previous)),
        h("span", { style: "color:#333" }, " → "),
        h("span", { style: S.histNext }, fmt(next))
      )
    );

    return h("div", { style: S.panel },
      h("div", { style: S.header },
        h("div", { style: S.dot }),
        h("span", { style: S.title }, "PulseUI")
      ),
      h("div", { style: S.body },
        ...signalRows,
        histRows.length > 0
          ? h("hr", { style: S.divider })
          : null,
        ...histRows
      )
    );
  }

  const refresh = () => tick(tick() + 1);
  mount(h(DevPanel), container);
  return { refresh };
}
