export type SearchParams = Record<string, string | string[] | undefined>;

export type HistoryOptions = "replace" | "push";

export type LimitUrlUpdates =
    | { method: "debounce"; timeMs: number }
    | { method: "throttle"; timeMs: number };

export type Options = {
    /**
     * How the query update affects page history.
     * `push` creates a new history entry (Back button works).
     * `replace` (default) keeps current history point.
     */
    history?: HistoryOptions;

    /**
     * Scroll to top after a query state update.
     * Defaults to false.
     */
    scroll?: boolean;

    /**
     * Shallow mode (true by default) keeps updates client-side only.
     * No effect in Solid SPA.
     */
    shallow?: boolean;

    /**
     * Maximum time (ms) between URL updates.
     * Defaults to 50ms to avoid browser History API rate limits.
     */
    throttleMs?: number;

    /**
     * Limit the rate of URL updates.
     * Takes precedence over throttleMs if both are set.
     */
    limitUrlUpdates?: LimitUrlUpdates;

    /**
     * Clear the key from URL when set to default value.
     * Defaults to true.
     */
    clearOnDefault?: boolean;
};

export type Nullable<T> = {
    [K in keyof T]: T[K] | null;
} & {};

export type UrlKeys<T extends Record<string, string>> = Partial<Record<keyof T, string>>;
