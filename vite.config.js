import { defineConfig } from "vite";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command, mode }) => {
  const isDemo = command === "serve" || mode === "demo";
  return {
    root: isDemo ? "demo" : ".",
    plugins: [tailwindcss()],
    esbuild: {
      jsx: "transform",
      jsxFactory: "h",
      jsxFragment: "Fragment",
    },
    build: isDemo
      ? { outDir: resolve("demo/dist") }
      : {
          lib: {
            entry: resolve("src/index.js"),
            name: "PulseUI",
            fileName: "pulse-ui",
            formats: ["es", "umd"],
          },
          outDir: resolve("dist"),
        },
  };
});
