const fullLog = [];
const undoStack = [];
let cursor = -1;
let recording = true;

export function track(sig, name = "signal") {
  let prev = sig();
  sig.subscribe((next) => {
    fullLog.push({ sig, name, previous: prev, next, timestamp: Date.now() });
    if (recording) {
      if (cursor < undoStack.length - 1) undoStack.splice(cursor + 1);
      undoStack.push({ sig, previous: prev, next });
      cursor = undoStack.length - 1;
    }
    prev = next;
  });
}

export function getHistory() {
  return fullLog.map(({ name, previous, next, timestamp }) => ({ name, previous, next, timestamp }));
}

export function clearHistory() {
  fullLog.length = 0;
  undoStack.length = 0;
  cursor = -1;
}

export function undo() {
  if (cursor < 0) return false;
  const { sig, previous } = undoStack[cursor];
  cursor--;
  recording = false;
  sig(previous);
  recording = true;
  return true;
}

export function redo() {
  if (cursor >= undoStack.length - 1) return false;
  cursor++;
  const { sig, next } = undoStack[cursor];
  recording = false;
  sig(next);
  recording = true;
  return true;
}

export function replay({ delay = 0, onStep } = {}) {
  // snapshot before iterating — sig(next) triggers track callbacks that push to fullLog
  const steps = [...fullLog];
  if (delay === 0) {
    recording = false;
    for (const { sig, next } of steps) {
      sig(next);
      onStep?.({ sig, next });
    }
    recording = true;
    return;
  }
  steps.forEach(({ sig, next }, i) => {
    setTimeout(() => {
      recording = false;
      sig(next);
      recording = true;
      onStep?.({ sig, next });
    }, delay * (i + 1));
  });
}
