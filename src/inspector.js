import { getHistory } from "./history.js";

const registry = new Map();

export function register(sig, name) {
  registry.set(name, sig);
}

export function inspect() {
  const signals = {};
  for (const [name, sig] of registry) {
    signals[name] = { value: sig(), subscribers: sig.subscriberCount };
  }
  return { signals, recentHistory: getHistory().slice(-10) };
}

export function clearRegistry() {
  registry.clear();
}
