import effect from "./effect.js";

function applyProps(el, props) {
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value == null || value === false) {
      // skip — false means "omit this attribute"
    } else {
      el.setAttribute(key, value === true ? "" : value);
      if (key === "value") el.value = value;
      if (key === "checked") el.checked = !!value;
    }
  }
}

function createDOM(vnode) {
  if (typeof vnode === "string" || typeof vnode === "number") {
    return document.createTextNode(String(vnode));
  }
  if (typeof vnode.type === "function") {
    return createDOM(vnode.type(vnode.props, vnode.children));
  }
  const el = document.createElement(vnode.type);
  applyProps(el, vnode.props);
  for (const child of vnode.children) {
    el.appendChild(createDOM(child));
  }
  return el;
}

function resolve(vnode) {
  if (typeof vnode === "string" || typeof vnode === "number") return vnode;
  if (typeof vnode.type === "function") {
    return resolve(vnode.type(vnode.props, vnode.children));
  }
  return { ...vnode, children: vnode.children.map(resolve) };
}

function patchProps(el, oldProps, newProps) {
  const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);
  for (const key of allKeys) {
    const oldVal = oldProps[key];
    const newVal = newProps[key];
    if (oldVal === newVal) continue;
    const isEvent = key.startsWith("on") &&
      (typeof oldVal === "function" || typeof newVal === "function");
    if (isEvent) {
      const eventName = key.slice(2).toLowerCase();
      if (oldVal) el.removeEventListener(eventName, oldVal);
      if (newVal) el.addEventListener(eventName, newVal);
    } else if (newVal == null || newVal === false) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, newVal === true ? "" : newVal);
      if (key === "value") el.value = newVal;
      if (key === "checked") el.checked = !!newVal;
    }
  }
}

function patch(parent, oldVnode, newVnode, index) {
  const domNode = parent.childNodes[index];

  if (newVnode == null) {
    parent.removeChild(domNode);
    return;
  }

  if (oldVnode == null) {
    parent.appendChild(createDOM(newVnode));
    return;
  }

  if (typeof oldVnode !== "object" && typeof newVnode !== "object") {
    if (String(oldVnode) !== String(newVnode)) {
      domNode.nodeValue = String(newVnode);
    }
    return;
  }

  if (typeof oldVnode !== typeof newVnode || oldVnode.type !== newVnode.type) {
    parent.replaceChild(createDOM(newVnode), domNode);
    return;
  }

  patchProps(domNode, oldVnode.props, newVnode.props);

  const oldChildren = oldVnode.children;
  const newChildren = newVnode.children;
  const minLen = Math.min(oldChildren.length, newChildren.length);

  for (let i = 0; i < minLen; i++) {
    patch(domNode, oldChildren[i], newChildren[i], i);
  }
  for (let i = minLen; i < newChildren.length; i++) {
    domNode.appendChild(createDOM(newChildren[i]));
  }
  for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
    domNode.removeChild(domNode.childNodes[i]);
  }
}

function render(vnode, container) {
  container.replaceChildren(createDOM(vnode));
}

function mount(vnode, container) {
  let prevResolved = null;
  effect(() => {
    const newResolved = resolve(vnode);
    if (prevResolved === null) {
      container.appendChild(createDOM(newResolved));
    } else {
      patch(container, prevResolved, newResolved, 0);
    }
    prevResolved = newResolved;
  });
}

export { createDOM, render, mount };
