import { createQueryState, parseAsInteger } from "solid-query-state";

export function BasicCounter() {
  const [count, setCount] = createQueryState(
    "count",
    parseAsInteger.withDefault(0)
  );

  return (
    <div class="flex flex-col items-center gap-4">
      <p class="text-xl font-medium text-white">Count: {count()}</p>
      <div class="flex gap-2">
        <button
          type="button"
          onClick={() => setCount((c) => (c ?? 0) + 1)}
          class="rounded-lg bg-amber-500 px-4 py-2 font-medium text-zinc-950 transition hover:bg-amber-400"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setCount((c) => (c ?? 0) - 1)}
          class="rounded-lg border border-zinc-600 px-4 py-2 font-medium transition hover:bg-zinc-800"
        >
          -
        </button>
        <button
          type="button"
          onClick={() => setCount(0)}
          class="rounded-lg border border-zinc-600 px-4 py-2 font-medium transition hover:bg-zinc-800"
        >
          Reset
        </button>
      </div>
      <p class="text-sm text-zinc-500">
        Try the browser Back/Forward buttons to navigate state
      </p>
    </div>
  );
}
