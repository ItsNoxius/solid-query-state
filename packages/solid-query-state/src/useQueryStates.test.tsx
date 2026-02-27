import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { QueryStateAdapter } from "./adapters/solid";
import { createQueryStates } from "./useQueryStates";
import {
    parseAsFloat,
    parseAsInteger,
    parseAsString,
} from "./parsers";

describe("createQueryStates", () => {
    it("reads initial values from search params", () => {
        window.history.replaceState(null, "", "?a=foo&b=42");
        const parsers = {
            a: parseAsString,
            b: parseAsInteger,
        };
        const Consumer = () => {
            const [state] = createQueryStates(parsers);
            return (
                <span data-testid="value">
                    {state().a}-{state().b}
                </span>
            );
        };
        const { getByTestId } = render(
            () => (
                <QueryStateAdapter>
                    <Consumer />
                </QueryStateAdapter>
            ),
        );
        expect(getByTestId("value").textContent).toBe("foo-42");
    });

    it("returns null for absent keys", () => {
        window.history.replaceState(null, "", window.location.pathname || "/");
        const parsers = {
            a: parseAsString,
            b: parseAsInteger,
        };
        const Consumer = () => {
            const [state] = createQueryStates(parsers);
            return (
                <span data-testid="value">
                    {state().a ?? "n"}-{state().b ?? "n"}
                </span>
            );
        };
        const { getByTestId } = render(
            () => (
                <QueryStateAdapter>
                    <Consumer />
                </QueryStateAdapter>
            ),
        );
        expect(getByTestId("value").textContent).toBe("n-n");
    });

    it("supports default values", () => {
        const parsers = {
            lat: parseAsFloat.withDefault(45.18),
            lng: parseAsFloat.withDefault(5.72),
        };
        const Consumer = () => {
            const [state] = createQueryStates(parsers);
            return (
                <span data-testid="value">
                    {state().lat}-{state().lng}
                </span>
            );
        };
        const { getByTestId } = render(
            () => (
                <QueryStateAdapter>
                    <Consumer />
                </QueryStateAdapter>
            ),
        );
        expect(getByTestId("value").textContent).toBe("45.18-5.72");
    });

    it("updates multiple keys at once", async () => {
        window.history.replaceState(null, "", "?a=init&b=1");
        const parsers = {
            a: parseAsString,
            b: parseAsInteger,
        };
        const Consumer = () => {
            const [state, setState] = createQueryStates(parsers);
            return (
                <button
                    data-testid="btn"
                    onClick={() => setState({ a: "updated", b: 99 })}
                >
                    {state().a}-{state().b}
                </button>
            );
        };
        const { getByTestId } = render(
            () => (
                <QueryStateAdapter>
                    <Consumer />
                </QueryStateAdapter>
            ),
        );
        expect(getByTestId("btn").textContent).toBe("init-1");
        getByTestId("btn").click();
        await new Promise((r) => setTimeout(r, 60)); // Wait for throttle
        expect(window.location.search).toContain("a=updated");
        expect(window.location.search).toContain("b=99");
    });

    it("combines updates for multiple keys in same tick", async () => {
        const parsers = {
            a: parseAsString,
            b: parseAsString,
        };
        const Consumer = () => {
            const [, setState] = createQueryStates(parsers);
            return (
                <button
                    data-testid="btn"
                    onClick={() => {
                        setState({ a: "first" });
                        setState({ b: "second" });
                    }}
                >
                    Update
                </button>
            );
        };
        const { getByTestId } = render(
            () => (
                <QueryStateAdapter>
                    <Consumer />
                </QueryStateAdapter>
            ),
        );
        getByTestId("btn").click();
        await new Promise((r) => setTimeout(r, 60)); // Wait for throttle
        expect(window.location.search).toContain("a=first");
        expect(window.location.search).toContain("b=second");
    });

    it("supports functional updater", async () => {
        window.history.replaceState(null, "", "?count=10");
        const parsers = {
            count: parseAsInteger.withDefault(0),
        };
        const Consumer = () => {
            const [state, setState] = createQueryStates(parsers);
            return (
                <button
                    data-testid="btn"
                    onClick={() =>
                        setState((s) => ({
                            count: (s.count ?? 0) + 1,
                        }))
                    }
                >
                    {state().count}
                </button>
            );
        };
        const { getByTestId } = render(
            () => (
                <QueryStateAdapter>
                    <Consumer />
                </QueryStateAdapter>
            ),
        );
        expect(getByTestId("btn").textContent).toBe("10");
        getByTestId("btn").click();
        await new Promise((r) => setTimeout(r, 60)); // Wait for throttle
        expect(window.location.search).toContain("count=11");
    });

    it("supports partial updates", async () => {
        window.history.replaceState(null, "", "?a=1&b=2&c=3");
        const parsers = {
            a: parseAsString,
            b: parseAsString,
            c: parseAsString,
        };
        const Consumer = () => {
            const [state, setState] = createQueryStates(parsers);
            return (
                <button
                    data-testid="btn"
                    onClick={() => setState({ b: "updated" })}
                >
                    {state().a}-{state().b}-{state().c}
                </button>
            );
        };
        const { getByTestId } = render(
            () => (
                <QueryStateAdapter>
                    <Consumer />
                </QueryStateAdapter>
            ),
        );
        getByTestId("btn").click();
        await new Promise((r) => setTimeout(r, 60)); // Wait for throttle
        expect(window.location.search).toContain("a=1");
        expect(window.location.search).toContain("b=updated");
        expect(window.location.search).toContain("c=3");
    });

    it("supports urlKeys option", () => {
        window.history.replaceState(null, "", "?short=value");
        const parsers = {
            longKey: parseAsString,
        };
        const Consumer = () => {
            const [state] = createQueryStates(parsers, {
                urlKeys: { longKey: "short" },
            });
            return <span data-testid="value">{state().longKey}</span>;
        };
        const { getByTestId } = render(
            () => (
                <QueryStateAdapter>
                    <Consumer />
                </QueryStateAdapter>
            ),
        );
        expect(getByTestId("value").textContent).toBe("value");
    });

    it("clears value when set to null", async () => {
        window.history.replaceState(null, "", "?a=foo&b=42");
        const parsers = {
            a: parseAsString.withDefault("default"),
            b: parseAsInteger,
        };
        const Consumer = () => {
            const [state, setState] = createQueryStates(parsers);
            return (
                <button
                    data-testid="btn"
                    onClick={() => setState({ a: null })}
                >
                    {state().a}-{state().b}
                </button>
            );
        };
        const { getByTestId } = render(
            () => (
                <QueryStateAdapter>
                    <Consumer />
                </QueryStateAdapter>
            ),
        );
        getByTestId("btn").click();
        await new Promise((r) => setTimeout(r, 60)); // Wait for throttle
        expect(window.location.search).not.toContain("a=");
    });

    it("supports limitUrlUpdates debounce option", async () => {
        const { debounce } = await import("./index");
        window.history.replaceState(null, "", "?x=1");
        const parsers = {
            x: parseAsInteger.withDefault(0),
        };
        const Consumer = () => {
            const [state, setState] = createQueryStates(parsers, {
                limitUrlUpdates: debounce(10),
            });
            return (
                <button
                    data-testid="btn"
                    onClick={() => {
                        setState({ x: 2 });
                        setState({ x: 3 });
                    }}
                >
                    {state().x}
                </button>
            );
        };
        const { getByTestId } = render(
            () => (
                <QueryStateAdapter>
                    <Consumer />
                </QueryStateAdapter>
            ),
        );
        getByTestId("btn").click();
        await new Promise((r) => setTimeout(r, 50));
        expect(window.location.search).toContain("x=3");
    });

    it("supports parseAsArrayOf in createQueryStates", async () => {
        const { parseAsArrayOf } = await import("./parsers");
        window.history.replaceState(null, "", "?tags=a,b,c");
        const parsers = {
            tags: parseAsArrayOf(parseAsString),
        };
        const Consumer = () => {
            const [state, setState] = createQueryStates(parsers);
            return (
                <button
                    data-testid="btn"
                    onClick={() => setState({ tags: ["x", "y"] })}
                >
                    {state().tags?.join("-") ?? "null"}
                </button>
            );
        };
        const { getByTestId } = render(
            () => (
                <QueryStateAdapter>
                    <Consumer />
                </QueryStateAdapter>
            ),
        );
        expect(getByTestId("btn").textContent).toBe("a-b-c");
        getByTestId("btn").click();
        await new Promise((r) => setTimeout(r, 60));
        expect(window.location.search).toMatch(/tags=/);
        expect(decodeURIComponent(window.location.search)).toContain("tags=x,y");
    });
});
