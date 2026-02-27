import { describe, expect, it } from "vitest";
import { safeParse, safeParseArray } from "./safe-parse";

describe("safeParse", () => {
    it("returns parsed value when parse succeeds", () => {
        const parse = (v: string) => parseInt(v, 10);
        expect(safeParse(parse, "42")).toBe(42);
    });

    it("returns null when parse throws", () => {
        const parse = () => {
            throw new Error("parse error");
        };
        expect(safeParse(parse, "bad")).toBeNull();
    });

    it("returns null when parse returns null", () => {
        const parse = () => null;
        expect(safeParse(parse, "x")).toBeNull();
    });
});

describe("safeParseArray", () => {
    it("returns parsed value when parse succeeds", () => {
        const parse = (v: readonly string[]) => v.join(",");
        expect(safeParseArray(parse, ["a", "b"])).toBe("a,b");
    });

    it("returns null when parse throws", () => {
        const parse = () => {
            throw new Error("parse error");
        };
        expect(safeParseArray(parse, ["a"])).toBeNull();
    });

    it("returns null when parse returns null", () => {
        const parse = () => null;
        expect(safeParseArray(parse, ["x"])).toBeNull();
    });
});
