import {
  createQueryState,
  createQueryStates,
  parseAsInteger,
  parseAsString,
  type UseQueryStatesKeysMap,
} from "solid-query-state";

export default function App() {
  const [name, setName] = createQueryState("name", parseAsString);
  const [count, setCount] = createQueryState(
    "count",
    parseAsInteger.withDefault(0)
  );

  const [filters, setFilters] = createQueryStates(
    {
      search: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(0),
    } as UseQueryStatesKeysMap,
    { history: "replace" }
  );

  return (
    <main data-testid="app">
      <h1 data-testid="title">solid-query-state E2E</h1>

      <section data-testid="name-section">
        <h2>Name</h2>
        <input
          data-testid="name-input"
          type="text"
          value={name() ?? ""}
          onInput={(e) => setName(e.currentTarget.value || null)}
          placeholder="Your name"
        />
        <button data-testid="name-clear" onClick={() => setName(null)}>
          Clear
        </button>
        <p data-testid="name-display">
          Hello, {name() ?? "anonymous visitor"}!
        </p>
      </section>

      <section data-testid="count-section">
        <h2>Count</h2>
        <p data-testid="count-display">Count: {count()}</p>
        <button data-testid="count-increment" onClick={() => setCount((c) => (c ?? 0) + 1)}>
          +
        </button>
        <button data-testid="count-decrement" onClick={() => setCount((c) => (c ?? 0) - 1)}>
          -
        </button>
        <button data-testid="count-reset" onClick={() => setCount(0)}>
          Reset
        </button>
        <button data-testid="count-clear" onClick={() => setCount(null)}>
          Clear from URL
        </button>
      </section>

      <section data-testid="filters-section">
        <h2>Filters</h2>
        <input
          data-testid="search-input"
          type="text"
          value={(filters().search as string) ?? ""}
          onInput={(e) => setFilters({ search: e.currentTarget.value })}
          placeholder="Search..."
        />
        <p data-testid="page-display">Page: {filters().page as number}</p>
        <button
          data-testid="page-next"
          onClick={() =>
            setFilters({
              page: ((filters().page as number) ?? 0) + 1,
            })
          }
        >
          Next
        </button>
        <button
          data-testid="page-prev"
          onClick={() =>
            setFilters({
              page: Math.max(0, ((filters().page as number) ?? 0) - 1),
            })
          }
        >
          Prev
        </button>
      </section>
    </main>
  );
}
