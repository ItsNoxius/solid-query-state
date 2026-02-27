import { describe, expect, it } from "vitest";
import {
    compareQuery,
    isAbsentFromUrl,
    write,
} from "./search-params";

describe("isAbsentFromUrl", () => {
    it("returns true for null", () => {
        expect(isAbsentFromUrl(null)).toBe(true);
    });

    it("returns true for empty array", () => {
        expect(isAbsentFromUrl([])).toBe(true);
    });

    it("returns false for non-empty string", () => {
        expect(isAbsentFromUrl("foo")).toBe(false);
    });

    it("returns false for non-empty array", () => {
        expect(isAbsentFromUrl(["foo"])).toBe(false);
    });
});

describe("write", () => {
    it("sets string value for single key", () => {
        const params = new URLSearchParams();
        write("value", "key", params);
        expect(params.get("key")).toBe("value");
    });

    it("replaces existing value", () => {
        const params = new URLSearchParams("key=old");
        write("new", "key", params);
        expect(params.get("key")).toBe("new");
    });

    it("handles array values with multiple entries", () => {
        const params = new URLSearchParams();
        write(["a", "b", "c"], "key", params);
        expect(params.getAll("key")).toEqual(["a", "b", "c"]);
    });

    it("deletes key and appends for array (replacing previous)", () => {
        const params = new URLSearchParams("key=old");
        write(["a", "b"], "key", params);
        expect(params.getAll("key")).toEqual(["a", "b"]);
    });

    it("sets empty string when array is empty", () => {
        const params = new URLSearchParams();
        write([], "key", params);
        expect(params.get("key")).toBe("");
    });
});

describe("compareQuery", () => {
    it("returns true for identical strings", () => {
        expect(compareQuery("a", "a")).toBe(true);
    });

    it("returns true for identical arrays", () => {
        expect(compareQuery(["a", "b"], ["a", "b"])).toBe(true);
    });

    it("returns true when both are null/undefined", () => {
        expect(compareQuery(null, null)).toBe(true);
        expect(compareQuery(undefined, undefined)).toBe(true);
    });

    it("returns false for different strings", () => {
        expect(compareQuery("a", "b")).toBe(false);
    });

    it("returns false for different array lengths", () => {
        expect(compareQuery(["a"], ["a", "b"])).toBe(false);
    });

    it("returns false for different array values", () => {
        expect(compareQuery(["a", "b"], ["a", "c"])).toBe(false);
    });

    it("compares string to single-element array", () => {
        expect(compareQuery("a", ["a"])).toBe(true);
        expect(compareQuery(["a"], "a")).toBe(true);
    });
});
