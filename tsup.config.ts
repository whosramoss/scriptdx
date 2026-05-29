import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  splitting: false,
  treeshake: true,
  sourcemap: true,
  cjsInterop: true,
  outExtension({ format }) {
    return format === "cjs" ? { js: ".cjs" } : { js: ".js" };
  },
});
