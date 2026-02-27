import { createMemo, Show, Switch, Match } from "solid-js";
import { A, useParams } from "@solidjs/router";
import { Section } from "../components/Section";
import { CodeBlock } from "../components/CodeBlock";
import { BasicCounter } from "../demos/BasicCounter";
import { Pagination } from "../demos/Pagination";
import { HexColors } from "../demos/HexColors";
import { TicTacToe } from "../demos/TicTacToe";

const demoList = [
    {
        id: "basic-counter",
        label: "Basic counter",
        desc: "State is stored in the URL query string",
    },
    {
        id: "pagination",
        label: "Pagination",
        desc: "Integer page index with server-side rendering",
    },
    { id: "hex-colors", label: "Hex colors", desc: "Parsing RGB values from a hex color" },
    {
        id: "tic-tac-toe",
        label: "Tic Tac Toe",
        desc: "Use the Back/Forward buttons to undo/redo moves",
    },
];

const demoCode: Record<string, string> = {
    "basic-counter": `import { createQueryState, parseAsInteger } from "solid-query-state";

function BasicCounter() {
  const [count, setCount] = createQueryState(
    "count",
    parseAsInteger.withDefault(0)
  );

  return (
    <div>
      <p>Count: ${"{"}count()${"}"}</p>
      <button onClick={() => setCount((c) => (c ?? 0) + 1)}>+</button>
      <button onClick={() => setCount((c) => (c ?? 0) - 1)}>-</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}`,
    pagination: `import { createQueryStates, parseAsString, parseAsInteger } from "solid-query-state";

function Pagination() {
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
        placeholder="Search..."
      />
      <p>Page: ${"{"}filters().page${"}"}</p>
      <button onClick={() => setFilters({ page: filters().page - 1 })}>Prev</button>
      <button onClick={() => setFilters({ page: filters().page + 1 })}>Next</button>
    </div>
  );
}`,
    "hex-colors": `import { createParser, createQueryState } from "solid-query-state";

const parseAsHexColor = createParser({
  parse: (v) => {
    const hex = v.replace(/^#/, "");
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
    return hex;
  },
  serialize: (v) => v,
}).withDefault("3b82f6");

function HexColors() {
  const [color, setColor] = createQueryState("color", parseAsHexColor);

  return (
    <div>
      <div style=${"{"}${"{"} background: "#" + color() ${"}"}${"}"} />
      ${"{"}["3b82f6", "ef4444", "22c55e"].map((hex) => (
        <button onClick={() => setColor(hex)} style=${"{"}${"{"} background: "#" + hex ${"}"}${"}"} />
      ))${"}"}
    </div>
  );
}`,
    "tic-tac-toe": `import { createParser, createQueryState } from "solid-query-state";

const parseAsBoard = createParser({
  parse: (v) => parseBoard(v) ? serializeBoard(parseBoard(v)) : null,
  serialize: (v) => v,
}).withDefault("---------");

function TicTacToe() {
  const [boardStr, setBoardStr] = createQueryState("board", parseAsBoard);
  const board = () => parseBoard(boardStr()) ?? emptyBoard;

  const play = (i: number) => {
    const next = [...board()];
    next[i] = turn();
    setBoardStr(serializeBoard(next));
  };

  return (
    <div>
      ${"{"}board().map((cell, i) => (
        <button onClick={() => play(i)} disabled=${"{"}!!cell${"}"}>${"{"}cell ?? ""${"}"}</button>
      ))${"}"}
    </div>
  );
}`,
};

export function Playground() {
    const params = useParams();
    const demoId = createMemo(() => params.demo ?? null);

    return (
        <Section title="Playground">
            <Show
                when={!demoId()}
                fallback={
                    <>
                        <div class="mb-6">
                            <A
                                href="/playground"
                                class="text-sm text-amber-400 hover:text-amber-300"
                            >
                                ← Back to playground
                            </A>
                        </div>
                        <div class="space-y-8">
                            <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                                <Switch
                                    fallback={
                                        <p class="text-zinc-400">
                                            Demo not found. Select one from the sidebar.
                                        </p>
                                    }
                                >
                                    <Match when={demoId() === "basic-counter"}>
                                        <BasicCounter />
                                    </Match>
                                    <Match when={demoId() === "pagination"}>
                                        <Pagination />
                                    </Match>
                                    <Match when={demoId() === "hex-colors"}>
                                        <HexColors />
                                    </Match>
                                    <Match when={demoId() === "tic-tac-toe"}>
                                        <TicTacToe />
                                    </Match>
                                </Switch>
                            </div>
                            {demoId() && demoCode[demoId()!] && (
                                <div>
                                    <h3 class="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
                                        Code
                                    </h3>
                                    <CodeBlock code={demoCode[demoId()!]!} language="typescript" />
                                </div>
                            )}
                        </div>
                    </>
                }
            >
                <p class="mb-8 text-zinc-400">Examples and demos of solid-query-state in action.</p>
                <div class="space-y-4">
                    {demoList.map((item) => (
                        <A
                            href={`/playground/${item.id}`}
                            class="block rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-zinc-700"
                        >
                            <h4 class="font-semibold text-white">{item.label}</h4>
                            <p class="mt-1 text-sm text-zinc-400">{item.desc}</p>
                        </A>
                    ))}
                </div>
            </Show>
        </Section>
    );
}
