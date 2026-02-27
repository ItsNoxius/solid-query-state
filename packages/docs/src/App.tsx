import {
    createQueryState,
    createQueryStates,
    parseAsInteger,
    parseAsString,
    type UseQueryStatesKeysMap,
} from "solid-query-state";
import "./App.css";

function App() {
    const [name, setName] = createQueryState("name", parseAsString);
    const [count, setCount] = createQueryState(
        "count",
        parseAsInteger.withDefault(0),
    );

    const [filters, setFilters] = createQueryStates(
        {
            search: parseAsString.withDefault(""),
            page: parseAsInteger.withDefault(0),
        } as UseQueryStatesKeysMap,
        { history: "replace" },
    );

    return (
        <>
            <div>
                <h1>solid-query-state for Solid.js</h1>
            </div>
            <section class="card">
                <h2>Single query state (name)</h2>
                <input
                    type="text"
                    value={name() ?? ""}
                    onInput={(e) => setName(e.currentTarget.value || null)}
                    placeholder="Your name"
                />
                <button onClick={() => setName(null)}>Clear</button>
                <p>Hello, {name() ?? "anonymous visitor"}!</p>
            </section>
            <section class="card">
                <h2>Single query state (count)</h2>
                <p>Count: {count()}</p>
                <button onClick={() => setCount((c) => (c ?? 0) + 1)}>+</button>
                <button onClick={() => setCount((c) => (c ?? 0) - 1)}>-</button>
                <button onClick={() => setCount(0)}>Reset</button>
                <button onClick={() => setCount(null)}>Clear from URL</button>
            </section>
            <section class="card">
                <h2>Multiple query states</h2>
                <input
                    type="text"
                    value={(filters().search as string) ?? ""}
                    onInput={(e) =>
                        setFilters({ search: e.currentTarget.value })
                    }
                    placeholder="Search..."
                />
                <p>Page: {filters().page as number}</p>
                <button
                    onClick={() =>
                        setFilters({
                            page: ((filters().page as number) ?? 0) + 1,
                        })
                    }
                >
                    Next page
                </button>
                <button
                    onClick={() =>
                        setFilters({
                            page: Math.max(
                                0,
                                ((filters().page as number) ?? 0) - 1,
                            ),
                        })
                    }
                >
                    Prev
                </button>
            </section>
        </>
    );
}

export default App;
