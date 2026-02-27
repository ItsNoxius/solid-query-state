# solid-query-state

Type-safe URL query state management for [Solid.js](https://www.solidjs.com/). Sync component state with the URL search params—filters, pagination, modals, and more—with full TypeScript support and shareable links.

## Installation

```bash
npm install solid-query-state
# or
pnpm add solid-query-state
# or
yarn add solid-query-state
# or
bun add solid-query-state
```

**Requirements:** Solid.js ^1, TypeScript ^5

## Quick Start

1. Wrap your app with `QueryStateAdapter`:

```tsx
import { render } from "solid-js/web";
import { QueryStateAdapter } from "solid-query-state";
import App from "./App";

render(
    () => (
        <QueryStateAdapter>
            <App />
        </QueryStateAdapter>
    ),
    document.getElementById("root")!,
);
```

2. Use `createQueryState` or `createQueryStates` in your components:

```tsx
import { createQueryState, parseAsInteger } from "solid-query-state";

function Counter() {
    const [count, setCount] = createQueryState("count", parseAsInteger.withDefault(0));

    return (
        <div>
            <p>Count: {count()}</p>
            <button onClick={() => setCount((c) => (c ?? 0) + 1)}>+</button>
            <button onClick={() => setCount((c) => (c ?? 0) - 1)}>-</button>
        </div>
    );
}
```

Visiting `?count=5` will show 5; changing the count updates the URL. Back/forward navigation works as expected.

## API

### createQueryState

Manages a single query parameter. Returns a getter and setter (similar to `createSignal`).

```tsx
const [value, setValue] = createQueryState("key", parser);
```

- **key** – URL parameter name (e.g. `"page"` → `?page=1`)
- **parser** – Parses/serializes the value (see [Built-in parsers](#built-in-parsers))
- **options** – Optional: `history`, `scroll`, `throttleMs`, `clearOnDefault`, etc.

### createQueryStates

Manages multiple query parameters at once.

```tsx
const [state, setState] = createQueryStates({
    search: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(0),
    sort: parseAsStringLiteral(["asc", "desc"]),
});
```

Update one or more keys:

```tsx
setState({ page: 1 });
setState((prev) => ({ page: (prev.page ?? 0) + 1 }));
setState(null); // clear all
```

### Built-in parsers

| Parser                            | Type             | Example                   |
| --------------------------------- | ---------------- | ------------------------- |
| `parseAsString`                   | string           | `?q=hello`                |
| `parseAsInteger`                  | number           | `?page=1`                 |
| `parseAsFloat`                    | number           | `?lat=45.5`               |
| `parseAsBoolean`                  | boolean          | `?active=true`            |
| `parseAsHex`                      | number (hex)     | `?color=ff0000`           |
| `parseAsIndex`                    | number (1-based) | `?tab=2` → index 1        |
| `parseAsTimestamp`                | Date (ms)        | `?t=1700000000000`        |
| `parseAsIsoDateTime`              | Date (ISO)       | `?d=2024-01-01T00:00:00Z` |
| `parseAsIsoDate`                  | Date (date only) | `?d=2024-01-01`           |
| `parseAsStringLiteral(["a","b"])` | union            | `?mode=a`                 |
| `parseAsStringEnum(values)`       | enum             | same as above             |
| `parseAsNumberLiteral([1,2,3])`   | union of numbers | `?level=2`                |
| `parseAsArrayOf(parser, ",")`     | array            | `?tags=a,b,c`             |

All parsers support `.withDefault(value)` for default values. Keys are removed from the URL when set to their default (when `clearOnDefault` is true, which is the default).

### Custom parsers

```tsx
import { createParser } from "solid-query-state";

const parseAsJson = createParser({
    parse: (v) => {
        try {
            return JSON.parse(v);
        } catch {
            return null;
        }
    },
    serialize: (v) => JSON.stringify(v),
});
```

### Options

Options can be passed to `createQueryState` / `createQueryStates` or per-parser via `.withOptions()`:

| Option            | Default     | Description                                                                   |
| ----------------- | ----------- | ----------------------------------------------------------------------------- |
| `history`         | `"replace"` | `"push"` or `"replace"` for history updates                                   |
| `scroll`          | `false`     | Scroll to top on URL change                                                   |
| `throttleMs`      | `50`        | Min ms between URL updates                                                    |
| `limitUrlUpdates` | -           | `{ method: "debounce", timeMs: 300 }` or `{ method: "throttle", timeMs: 50 }` |
| `clearOnDefault`  | `true`      | Remove key from URL when value equals default                                 |

### Testing

Use `SolidTestingAdapter` or `withSolidTestingAdapter` to test components without a real browser URL:

```tsx
import { render } from "@solidjs/testing-library";
import { createQueryState, parseAsString, withSolidTestingAdapter } from "solid-query-state";

const { getByTestId } = render(() => <MyComponent />, {
    wrapper: withSolidTestingAdapter({ searchParams: "?q=test" }),
});
```

## License

MIT
