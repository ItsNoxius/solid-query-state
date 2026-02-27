import { createQueryStates, parseAsInteger, parseAsString } from "solid-query-state";
import type { UseQueryStatesKeysMap } from "solid-query-state";

export function Pagination() {
    const [filters, setFilters] = createQueryStates(
        {
            search: parseAsString.withDefault(""),
            page: parseAsInteger.withDefault(0),
        } as UseQueryStatesKeysMap,
        { history: "replace" },
    );

    return (
        <div class="flex flex-col gap-4">
            <input
                type="text"
                value={(filters().search as string) ?? ""}
                onInput={(e) => setFilters({ search: e.currentTarget.value })}
                placeholder="Search..."
                class="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <div class="flex items-center justify-between">
                <p class="text-zinc-400">
                    Page: <span class="font-medium text-white">{filters().page as number}</span>
                </p>
                <div class="flex gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            setFilters({
                                page: Math.max(0, ((filters().page as number) ?? 0) - 1),
                            })
                        }
                        class="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium transition hover:bg-zinc-800 disabled:opacity-50"
                        disabled={(filters().page as number) <= 0}
                    >
                        Prev
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            setFilters({
                                page: ((filters().page as number) ?? 0) + 1,
                            })
                        }
                        class="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-amber-400"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
