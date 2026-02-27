import { Section } from "../components/Section";
import { CodeBlock } from "../components/CodeBlock";

export function Usage() {
    return (
        <Section title="Usage">
            <h3 class="text-lg font-semibold text-white">Single query state</h3>
            <p class="text-zinc-400">
                Use <code class="rounded bg-zinc-800 px-1.5 py-0.5">createQueryState</code> for a
                single key. It returns a getter and setter, similar to createSignal.
            </p>
            <CodeBlock
                code={`import { createQueryState, parseAsInteger } from "solid-query-state";

function Counter() {
  const [count, setCount] = createQueryState(
    "count",
    parseAsInteger.withDefault(0)
  );

  return (
    <div>
      <p>Count: {"{count()}"}</p>
      <button onClick={() => setCount((c) => (c ?? 0) + 1)}>+</button>
      <button onClick={() => setCount((c) => (c ?? 0) - 1)}>-</button>
    </div>
  );
}`}
            />

            <h3 class="text-lg font-semibold text-white">Multiple query states</h3>
            <p class="text-zinc-400">
                Use <code class="rounded bg-zinc-800 px-1.5 py-0.5">createQueryStates</code> to
                manage multiple keys at once.
            </p>
            <CodeBlock
                code={`import { createQueryStates, parseAsString, parseAsInteger } from "solid-query-state";

function Filters() {
  const [filters, setFilters] = createQueryStates(
    {
      search: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(0),
    },
    { history: "replace" }
  );

  return (
    <div>
      <input
        value={filters().search}
        onInput={(e) => setFilters({ search: e.currentTarget.value })}
      />
      <button onClick={() => setFilters({ page: filters().page + 1 })}>
        Next
      </button>
    </div>
  );
}`}
            />

            <h3 class="text-lg font-semibold text-white">Built-in parsers</h3>
            <p class="text-zinc-400">solid-query-state includes parsers for common types:</p>
            <div class="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-zinc-700 text-left">
                            <th class="pb-2 font-medium text-zinc-300">Parser</th>
                            <th class="pb-2 font-medium text-zinc-300">Type</th>
                        </tr>
                    </thead>
                    <tbody class="text-zinc-400">
                        <tr class="border-b border-zinc-800">
                            <td>parseAsString</td>
                            <td>string</td>
                        </tr>
                        <tr class="border-b border-zinc-800">
                            <td>parseAsInteger</td>
                            <td>number</td>
                        </tr>
                        <tr class="border-b border-zinc-800">
                            <td>parseAsFloat</td>
                            <td>number</td>
                        </tr>
                        <tr class="border-b border-zinc-800">
                            <td>parseAsBoolean</td>
                            <td>boolean</td>
                        </tr>
                        <tr class="border-b border-zinc-800">
                            <td>parseAsHex</td>
                            <td>number (hex)</td>
                        </tr>
                        <tr class="border-b border-zinc-800">
                            <td>parseAsIsoDateTime</td>
                            <td>Date</td>
                        </tr>
                        <tr>
                            <td>parseAsStringLiteral</td>
                            <td>union of strings</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p class="text-zinc-400">
                All parsers support{" "}
                <code class="rounded bg-zinc-800 px-1.5 py-0.5">.withDefault(value)</code> for
                default values.
            </p>
        </Section>
    );
}
