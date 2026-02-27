import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
import solid from "vite-plugin-solid";

export default defineConfig({
    plugins: [solid()],
    resolve: {
        alias: {
            // Test against built output to catch consumer-level errors (e.g. JSX import resolution)
            "solid-query-state": resolve(__dirname, "dist/index.js"),
        },
    },
    test: {
        globals: true,
        environment: "jsdom",
        coverage: {
            provider: "v8",
            reporter: ["text", "lcov"],
            include: ["src/**/*.ts", "src/**/*.tsx"],
            exclude: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/testing.ts"],
        },
    },
});
