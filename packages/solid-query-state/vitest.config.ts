import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";

export default defineConfig({
    plugins: [solid()],
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
