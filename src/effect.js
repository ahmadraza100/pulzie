import { setCurrent } from "./context.js";
import { schedule } from "./scheduler.js";

function effect(fn) {
  function run() {
    for (const dep of runner.deps) dep.delete(runner);
    runner.deps.clear();
    setCurrent(runner);
    fn();
    setCurrent(null);
  }

  function runner() {
    schedule(run);
  }
  runner.deps = new Set();

  run();
}

export default effect;
