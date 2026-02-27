/**
 * Basic smoke tests - see api.test.ts, parsers.test.ts, useQueryState.test.ts,
 * and useQueryStates.test.ts for comprehensive nuqs-compatible test coverage.
 */
import { describe, it, expect } from "vitest";
import {
    createQueryState,
    createQueryStates,
    parseAsString,
    parseAsInteger,
    QueryStateAdapter,
    debounce,
    throttle,
} from "./index";

describe("solid-query-state", () => {
    it("exports createQueryState", () => {
        expect(typeof createQueryState).toBe("function");
    });

    it("exports createQueryStates", () => {
        expect(typeof createQueryStates).toBe("function");
    });

    it("exports parsers", () => {
        expect(parseAsString).toBeDefined();
        expect(parseAsInteger).toBeDefined();
    });

    it("exports QueryStateAdapter", () => {
        expect(typeof QueryStateAdapter).toBe("function");
    });

    it("exports rate limit helpers", () => {
        expect(debounce(100)).toEqual({ method: "debounce", timeMs: 100 });
        expect(throttle(50)).toEqual({ method: "throttle", timeMs: 50 });
    });
});
