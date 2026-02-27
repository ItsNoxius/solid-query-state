import { describe, expect, it } from "vitest";
import * as pkg from "./index";

describe("API exports", () => {
    it("exports createQueryState", () => {
        expect(typeof pkg.createQueryState).toBe("function");
    });

    it("exports createQueryStates", () => {
        expect(typeof pkg.createQueryStates).toBe("function");
    });

    it("exports QueryStateAdapter", () => {
        expect(typeof pkg.QueryStateAdapter).toBe("function");
    });

    it("exports parsers", () => {
        expect(pkg.parseAsString).toBeDefined();
        expect(pkg.parseAsInteger).toBeDefined();
        expect(pkg.parseAsFloat).toBeDefined();
        expect(pkg.parseAsBoolean).toBeDefined();
        expect(pkg.parseAsHex).toBeDefined();
        expect(pkg.parseAsIndex).toBeDefined();
        expect(pkg.parseAsTimestamp).toBeDefined();
        expect(pkg.parseAsIsoDateTime).toBeDefined();
        expect(pkg.parseAsIsoDate).toBeDefined();
        expect(pkg.parseAsStringLiteral).toBeDefined();
        expect(pkg.parseAsStringEnum).toBeDefined();
        expect(pkg.parseAsNumberLiteral).toBeDefined();
        expect(pkg.parseAsArrayOf).toBeDefined();
        expect(pkg.createParser).toBeDefined();
        expect(pkg.createMultiParser).toBeDefined();
    });

    it("exports rate limit helpers", () => {
        expect(pkg.debounce(100)).toEqual({ method: "debounce", timeMs: 100 });
        expect(pkg.throttle(50)).toEqual({ method: "throttle", timeMs: 50 });
        expect(pkg.defaultRateLimit).toBeDefined();
    });
});
