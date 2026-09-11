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

const BASE = "position:fixed;z-index:9999;font:11px/1.5 ui-monospace,monospace;background:#0f0f0f;color:#e5e5e5;border:1px solid #2a2a2a;box-shadow:0 4px 24px rgba(0,0,0,.45)";

function panelStyle(mobile, open) {
  if (!open) return `${BASE};bottom:16px;right:16px;border-radius:999px;overflow:hidden`;
  if (mobile) return `${BASE};bottom:0;left:0;right:0;border-radius:16px 16px 0 0;max-height:65vh;overflow:hidden`;
  return `${BASE};bottom:16px;right:16px;width:256px;max-height:340px;border-radius:10px;overflow:hidden`;
}

const S = {
  header: (open) =>
    `padding:${open ? "9px" : "7px"} 12px;display:flex;align-items:center;gap:7px;cursor:pointer;user-select:none;${open ? "border-bottom:1px solid #1e1e1e;" : ""}`,
  dot: "width:6px;height:6px;border-radius:50%;background:#a78bfa;flex-shrink:0",
  title: "font-weight:600;letter-spacing:.04em;color:#a78bfa;font-size:10px;text-transform:uppercase;flex:1",
  chevron: (open) => `color:#555;font-size:8px;line-height:1;transition:transform .18s;display:inline-block;transform:rotate(${open ? "0" : "180"}deg)`,
  body: "padding:8px 0;overflow-y:auto;max-height:calc(65vh - 34px)",
  row: "display:flex;align-items:baseline;padding:2px 12px;",
  name: "color:#7dd3fc;min-width:68px;flex-shrink:0",
  val: "color:#e5e5e5;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap",
  subs: "color:#444;margin-left:8px;flex-shrink:0",
  divider: "border:none;border-top:1px solid #1e1e1e;margin:6px 0",
  histItem: "padding:2px 12px;color:#555;white-space:nowrap;overflow:hidden;text-overflow:ellipsis",
  histNext: "color:#86efac",
  handle: "width:36px;height:3px;background:#333;border-radius:2px;margin:8px auto 0;",
};

export function mountDevTools(container) {
  const tick = signal(0);
  const open = signal(window.innerWidth >= 640);

  window.addEventListener("resize", () => tick(tick() + 1), { passive: true });

  function DevPanel() {
    tick();
    const mobile = window.innerWidth < 640;
    const isOpen = open();
    const { signals, recentHistory } = inspect();

    const header = h("div", { style: S.header(isOpen), onclick: () => open(!isOpen) },
      h("div", { style: S.dot }),
      h("span", { style: S.title }, "DevTools"),
      h("span", { style: S.chevron(isOpen) }, "▲")
    );

    if (!isOpen) return h("div", { style: panelStyle(mobile, false) }, header);

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
        h("span", { style: "color:#333" }, fmt(previous)),
        h("span", { style: "color:#333" }, " → "),
        h("span", { style: S.histNext }, fmt(next))
      )
    );

    return h("div", { style: panelStyle(mobile, true) },
      mobile && h("div", { style: S.handle }),
      header,
      h("div", { style: S.body },
        ...signalRows,
        histRows.length > 0 ? h("hr", { style: S.divider }) : null,
        ...histRows
      )
    );
  }

  const refresh = () => tick(tick() + 1);
  mount(h(DevPanel), container);
  return { refresh };
}
