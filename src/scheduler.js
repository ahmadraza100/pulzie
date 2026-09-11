const pending = new Set();
let scheduled = false;

function flush() {
  scheduled = false;
  while (pending.size > 0) {
    const toRun = [...pending];
    pending.clear();
    for (const fn of toRun) fn();
  }
}

export function schedule(fn) {
  pending.add(fn);
  if (!scheduled) {
    scheduled = true;
    queueMicrotask(flush);
  }
}
