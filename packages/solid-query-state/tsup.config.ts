import { defineConfig } from "tsup";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    esbuildOptions(options) {
        options.jsx = "automatic";
        options.jsxImportSource = "solid-js";
    },
    async onSuccess() {
        // solid-js/jsx-runtime resolves to main bundle (no jsx export) in Solid 1.x;
        // the actual runtime is at solid-js/h/jsx-runtime
        const distPath = join(import.meta.dirname, "dist", "index.js");
        let code = readFileSync(distPath, "utf8");
        code = code.replace(
            /from "solid-js\/jsx-runtime"/g,
            'from "solid-js/h/jsx-runtime"',
        );
        writeFileSync(distPath, code);
    },
});
