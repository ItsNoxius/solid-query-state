import { describe, expect, it } from "vitest";
import {
    defaultRateLimit,
    debounce,
    throttle,
} from "./rate-limiting";

describe("rate-limiting", () => {
    it("defaultRateLimit has throttle method and 50ms", () => {
        expect(defaultRateLimit.method).toBe("throttle");
        expect(defaultRateLimit.timeMs).toBe(50);
    });

    it("throttle returns correct config", () => {
        expect(throttle(100)).toEqual({ method: "throttle", timeMs: 100 });
    });

    it("debounce returns correct config", () => {
        expect(debounce(200)).toEqual({ method: "debounce", timeMs: 200 });
    });
});
