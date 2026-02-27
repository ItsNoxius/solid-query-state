import { describe, expect, it } from "vitest";
import { createParser, createMultiParser } from "./parsers";

describe("createParser", () => {
    it("creates parser with parse and serialize", () => {
        const parser = createParser({
            parse: (v) => v.toUpperCase(),
            serialize: (v) => v.toLowerCase(),
        });
        expect(parser.parse("hello")).toBe("HELLO");
        expect(parser.serialize("WORLD")).toBe("world");
    });

    it("parseServerSide returns null for undefined", () => {
        const parser = createParser({
            parse: (v) => v,
            serialize: String,
        });
        expect(parser.parseServerSide(undefined)).toBeNull();
    });

    it("parseServerSide uses first element for array", () => {
        const parser = createParser({
            parse: (v) => v,
            serialize: String,
        });
        expect(parser.parseServerSide(["foo", "bar"])).toBe("foo");
    });

    it("withDefault returns default for undefined", () => {
        const parser = createParser({
            parse: (v) => v,
            serialize: String,
        }).withDefault("default");
        expect(parser.parseServerSide(undefined)).toBe("default");
    });

    it("withOptions merges options", () => {
        const parser = createParser({
            parse: (v) => v,
            serialize: String,
        }).withOptions({ scroll: true });
        expect(parser.scroll).toBe(true);
    });
});

describe("createMultiParser", () => {
    it("creates multi parser for array values", () => {
        const parser = createMultiParser({
            parse: (arr) => arr as unknown as string[],
            serialize: (v) => v as string[],
        });
        expect(parser.parse(["a", "b"])).toEqual(["a", "b"]);
        expect(parser.serialize(["x", "y"])).toEqual(["x", "y"]);
    });

    it("parseServerSide returns null for undefined", () => {
        const parser = createMultiParser({
            parse: (arr) => arr,
            serialize: (v) => v as string[],
        });
        expect(parser.parseServerSide(undefined)).toBeNull();
    });

    it("parseServerSide wraps string in array", () => {
        const parser = createMultiParser({
            parse: (arr) => arr,
            serialize: (v) => v as string[],
        });
        expect(parser.parseServerSide("single")).toEqual(["single"]);
    });

    it("withDefault returns default for undefined", () => {
        const parser = createMultiParser({
            parse: (arr) => arr,
            serialize: (v) => v as string[],
        }).withDefault(["default"]);
        expect(parser.parseServerSide(undefined)).toEqual(["default"]);
    });
});
