import { describe, expect, it } from "vitest";
import { applyChange, filterSearchParams } from "./key-isolation";

describe("filterSearchParams", () => {
    it("returns all params when keys is empty", () => {
        const params = new URLSearchParams("a=1&b=2&c=3");
        const result = filterSearchParams(params, [], false);
        expect(result.toString()).toBe("a=1&b=2&c=3");
    });

    it("filters to only specified keys", () => {
        const params = new URLSearchParams("a=1&b=2&c=3");
        const result = filterSearchParams(params, ["a", "c"], false);
        expect(result.get("a")).toBe("1");
        expect(result.get("c")).toBe("3");
        expect(result.has("b")).toBe(false);
    });

    it("creates copy when copy is true", () => {
        const params = new URLSearchParams("a=1&b=2");
        const result = filterSearchParams(params, ["a"], true);
        expect(result).not.toBe(params);
        expect(result.get("a")).toBe("1");
    });
});

describe("applyChange", () => {
    it("returns old value when nothing changed for watched keys", () => {
        const oldParams = new URLSearchParams("a=1&b=2");
        const newParams = new URLSearchParams("a=1&b=2");
        const fn = applyChange(newParams, ["a", "b"], false);
        const result = fn(oldParams);
        expect(result).toBe(oldParams);
    });

    it("returns filtered new value when watched key changed", () => {
        const oldParams = new URLSearchParams("a=1&b=2");
        const newParams = new URLSearchParams("a=2&b=2");
        const fn = applyChange(newParams, ["a", "b"], true);
        const result = fn(oldParams);
        expect(result.get("a")).toBe("2");
        expect(result.get("b")).toBe("2");
    });

    it("detects change when keys length is 0 (always changed)", () => {
        const oldParams = new URLSearchParams("a=1");
        const newParams = new URLSearchParams("a=2");
        const fn = applyChange(newParams, [], true);
        const result = fn(oldParams);
        expect(result.get("a")).toBe("2");
    });
});
