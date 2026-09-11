import { defineConfig } from "vite";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
  root: command === "serve" ? "demo" : ".",
  plugins: [tailwindcss()],
  esbuild: {
    jsx: "transform",
    jsxFactory: "h",
    jsxFragment: "Fragment",
  },
  build: {
    lib: {
      entry: resolve("src/index.js"),
      name: "pUlzie",
      fileName: "pulzie",
      formats: ["es", "umd"],
    },
    outDir: resolve("dist"),
  },
}));
