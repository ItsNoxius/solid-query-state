import { describe, expect, it } from "vitest";
import { createEmitter } from "./emitter";

describe("createEmitter", () => {
    it("calls listener when event is emitted", () => {
        const emitter = createEmitter<{ test: string }>();
        const listener = (payload: string) => {
            expect(payload).toBe("hello");
        };
        emitter.on("test", listener);
        emitter.emit("test", "hello");
    });

    it("calls multiple listeners for same event", () => {
        const emitter = createEmitter<{ test: number }>();
        const results: number[] = [];
        emitter.on("test", (n) => results.push(n));
        emitter.on("test", (n) => results.push(n * 2));
        emitter.emit("test", 5);
        expect(results).toEqual([5, 10]);
    });

    it("does not call listener after off", () => {
        const emitter = createEmitter<{ test: string }>();
        let called = false;
        const listener = () => {
            called = true;
        };
        emitter.on("test", listener);
        emitter.off("test", listener);
        emitter.emit("test", "x");
        expect(called).toBe(false);
    });

    it("supports multiple event types", () => {
        const emitter = createEmitter<{ a: string; b: number }>();
        const aResults: string[] = [];
        const bResults: number[] = [];
        emitter.on("a", (v) => aResults.push(v));
        emitter.on("b", (v) => bResults.push(v));
        emitter.emit("a", "foo");
        emitter.emit("b", 42);
        expect(aResults).toEqual(["foo"]);
        expect(bResults).toEqual([42]);
    });
});
