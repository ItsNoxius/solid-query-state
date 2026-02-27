import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { QueryStateAdapter } from "./adapters/solid";
import { createQueryState } from "./useQueryState";
import { parseAsInteger, parseAsString } from "./parsers";

describe("createQueryState", () => {
    it("reads initial value from search params", () => {
        window.history.replaceState(null, "", "?test=foo");
        const Consumer = () => {
            const [val] = createQueryState("test", parseAsString);
            return <span data-testid="value">{val() ?? "null"}</span>;
        };
        const { getByTestId } = render(() => (
            <QueryStateAdapter>
                <Consumer />
            </QueryStateAdapter>
        ));
        expect(getByTestId("value").textContent).toBe("foo");
    });

    it("returns null when key is absent", () => {
        const Consumer = () => {
            const [val] = createQueryState("missing", parseAsString);
            return <span data-testid="value">{val() ?? "null"}</span>;
        };
        const { getByTestId } = render(() => (
            <QueryStateAdapter>
                <Consumer />
            </QueryStateAdapter>
        ));
        expect(getByTestId("value").textContent).toBe("null");
    });

    it("updates URL when setState is called", async () => {
        window.history.replaceState(null, "", "?test=init");
        const Consumer = () => {
            const [val, setVal] = createQueryState("test", parseAsString);
            return (
                <button data-testid="btn" onClick={() => setVal("updated")}>
                    {val() ?? "null"}
                </button>
            );
        };
        const { getByTestId } = render(() => (
            <QueryStateAdapter>
                <Consumer />
            </QueryStateAdapter>
        ));
        expect(getByTestId("btn").textContent).toBe("init");
        getByTestId("btn").click();
        await new Promise((r) => setTimeout(r, 60)); // Wait for throttle
        expect(window.location.search).toContain("test=updated");
    });

    it("supports parseAsInteger with default", () => {
        const Consumer = () => {
            const [val] = createQueryState("count", parseAsInteger.withDefault(42));
            return <span data-testid="value">{val()}</span>;
        };
        const { getByTestId } = render(() => (
            <QueryStateAdapter>
                <Consumer />
            </QueryStateAdapter>
        ));
        expect(getByTestId("value").textContent).toBe("42");
    });

    it("honors clearOnDefault: true by default", async () => {
        window.history.replaceState(null, "", "?test=init");
        const Consumer = () => {
            const [val, setVal] = createQueryState("test", parseAsString.withDefault("default"));
            return (
                <button data-testid="btn" onClick={() => setVal("default")}>
                    {val()}
                </button>
            );
        };
        const { getByTestId } = render(() => (
            <QueryStateAdapter>
                <Consumer />
            </QueryStateAdapter>
        ));
        getByTestId("btn").click();
        await new Promise((r) => setTimeout(r, 60)); // Wait for throttle
        expect(window.location.search).not.toContain("test=");
    });

    it("combines updates for single key in same tick", async () => {
        const Consumer = () => {
            const [, setVal] = createQueryState("test", parseAsString);
            return (
                <button
                    data-testid="btn"
                    onClick={() => {
                        setVal("a");
                        setVal("b");
                    }}
                >
                    Update
                </button>
            );
        };
        const { getByTestId } = render(() => (
            <QueryStateAdapter>
                <Consumer />
            </QueryStateAdapter>
        ));
        getByTestId("btn").click();
        await new Promise((r) => setTimeout(r, 60)); // Wait for throttle
        expect(window.location.search).toContain("test=b");
    });

    it("supports functional updater", async () => {
        window.history.replaceState(null, "", "?count=10");
        const Consumer = () => {
            const [val, setVal] = createQueryState("count", parseAsInteger.withDefault(0));
            return (
                <button data-testid="btn" onClick={() => setVal((c) => (c ?? 0) + 1)}>
                    {val()}
                </button>
            );
        };
        const { getByTestId } = render(() => (
            <QueryStateAdapter>
                <Consumer />
            </QueryStateAdapter>
        ));
        expect(getByTestId("btn").textContent).toBe("10");
        getByTestId("btn").click();
        await new Promise((r) => setTimeout(r, 60)); // Wait for throttle
        expect(window.location.search).toContain("count=11");
    });

    it("clears value when set to null", async () => {
        window.history.replaceState(null, "", "?test=foo");
        const Consumer = () => {
            const [val, setVal] = createQueryState("test", parseAsString.withDefault("default"));
            return (
                <button data-testid="btn" onClick={() => setVal(null)}>
                    {val() ?? "null"}
                </button>
            );
        };
        const { getByTestId } = render(() => (
            <QueryStateAdapter>
                <Consumer />
            </QueryStateAdapter>
        ));
        expect(getByTestId("btn").textContent).toBe("foo");
        getByTestId("btn").click();
        await new Promise((r) => setTimeout(r, 60)); // Wait for throttle
        expect(window.location.search).not.toContain("test=");
    });

    it("honors clearOnDefault: false", async () => {
        window.history.replaceState(null, "", "?test=init");
        const Consumer = () => {
            const [val, setVal] = createQueryState(
                "test",
                parseAsString.withDefault("default").withOptions({
                    clearOnDefault: false,
                }),
            );
            return (
                <button data-testid="btn" onClick={() => setVal("default")}>
                    {val()}
                </button>
            );
        };
        const { getByTestId } = render(() => (
            <QueryStateAdapter>
                <Consumer />
            </QueryStateAdapter>
        ));
        getByTestId("btn").click();
        await new Promise((r) => setTimeout(r, 60));
        expect(window.location.search).toContain("test=default");
    });

    it("supports parseAsArrayOf", async () => {
        const { parseAsArrayOf } = await import("./parsers");
        const arrayParser = parseAsArrayOf(parseAsInteger);
        window.history.replaceState(null, "", "?tags=1,2,3");
        const Consumer = () => {
            const [val, setVal] = createQueryState("tags", arrayParser);
            return (
                <button data-testid="btn" onClick={() => setVal([4, 5, 6])}>
                    {val()?.join(",") ?? "null"}
                </button>
            );
        };
        const { getByTestId } = render(() => (
            <QueryStateAdapter>
                <Consumer />
            </QueryStateAdapter>
        ));
        expect(getByTestId("btn").textContent).toBe("1,2,3");
        getByTestId("btn").click();
        await new Promise((r) => setTimeout(r, 60));
        expect(window.location.search).toMatch(/tags=4/);
        expect(decodeURIComponent(window.location.search)).toContain("tags=4,5,6");
    });
});
