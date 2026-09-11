import { getCurrent } from "./context.js";

function signal(initial) {
  let _value = initial;
  const subscribers = new Set();

  function sig(next) {
    if (arguments.length === 0) {
      const current = getCurrent();
      if (current) {
        subscribers.add(current);
        current.deps.add(subscribers);
      }
      return _value;
    }
    if (Object.is(_value, next)) return;
    _value = next;
    for (const fn of [...subscribers]) fn(next);
  }

  sig.subscribe = function(fn) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  };
  Object.defineProperty(sig, "subscriberCount", { get: () => subscribers.size });
  return sig;
}

export default signal;
 