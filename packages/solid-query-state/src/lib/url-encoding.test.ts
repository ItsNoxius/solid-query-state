import { describe, expect, it } from "vitest";
import { renderQueryString } from "./url-encoding";

describe("renderQueryString", () => {
    it("returns empty string for empty URLSearchParams", () => {
        const params = new URLSearchParams();
        expect(renderQueryString(params)).toBe("");
    });

    it("prepends ? for non-empty params", () => {
        const params = new URLSearchParams("foo=bar");
        expect(renderQueryString(params)).toBe("?foo=bar");
    });

    it("handles multiple params", () => {
        const params = new URLSearchParams("a=1&b=2");
        expect(renderQueryString(params)).toBe("?a=1&b=2");
    });

    it("encodes special characters", () => {
        const params = new URLSearchParams();
        params.set("key", "value with spaces");
        expect(renderQueryString(params)).toContain("value+with+spaces");
    });
});
