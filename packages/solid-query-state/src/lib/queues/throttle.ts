import type { AdapterOptions } from "../../adapters/lib/defs";
import { write, type Query } from "../search-params";
import { timeout } from "../timeout";
import { withResolvers, type Resolvers } from "../with-resolvers";
import { defaultRateLimit } from "./rate-limiting";

type UpdateMap = Map<string, Query | null>;
export type UpdateQueueAdapterContext = {
    updateUrl: (search: URLSearchParams, options: AdapterOptions) => void;
    getSearchParamsSnapshot?: () => URLSearchParams;
    rateLimitFactor?: number;
    autoResetQueueOnUpdate?: boolean;
};

export type UpdateQueuePushArgs = {
    key: string;
    query: Query | null;
    options: AdapterOptions;
};

export function getSearchParamsSnapshotFromLocation(): URLSearchParams {
    return new URLSearchParams(
        typeof location !== "undefined" ? location.search : "",
    );
}

export class ThrottledQueue {
    updateMap: UpdateMap = new Map();
    options: Required<AdapterOptions> = {
        history: "replace",
        scroll: false,
        shallow: true,
    };
    timeMs: number = defaultRateLimit.timeMs;
    resolvers: Resolvers<URLSearchParams> | null = null;
    controller: AbortController | null = null;
    lastFlushedAt = 0;
    resetQueueOnNextPush = false;

    push(
        { key, query, options }: UpdateQueuePushArgs,
        timeMs: number = defaultRateLimit.timeMs,
    ): void {
        if (this.resetQueueOnNextPush) {
            this.reset();
            this.resetQueueOnNextPush = false;
        }
        this.updateMap.set(key, query);
        if (options.history === "push") this.options.history = "push";
        if (options.scroll) this.options.scroll = true;
        if (options.shallow === false) this.options.shallow = false;
        if (!Number.isFinite(this.timeMs) || timeMs > this.timeMs) {
            this.timeMs = timeMs;
        }
    }

    getQueuedQuery(key: string): Query | null | undefined {
        return this.updateMap.get(key);
    }

    getPendingPromise({
        getSearchParamsSnapshot = getSearchParamsSnapshotFromLocation,
    }: UpdateQueueAdapterContext): Promise<URLSearchParams> {
        return (
            this.resolvers?.promise ??
            Promise.resolve(getSearchParamsSnapshot())
        );
    }

    flush(
        {
            getSearchParamsSnapshot = getSearchParamsSnapshotFromLocation,
            rateLimitFactor = 1,
            ...adapter
        }: UpdateQueueAdapterContext & {
            updateUrl: (s: URLSearchParams, o: AdapterOptions) => void;
        },
        processUrlSearchParams?: (search: URLSearchParams) => URLSearchParams,
    ): Promise<URLSearchParams> {
        this.controller ??= new AbortController();
        if (!Number.isFinite(this.timeMs)) {
            return Promise.resolve(getSearchParamsSnapshot());
        }
        if (this.resolvers) return this.resolvers.promise;

        this.resolvers = withResolvers<URLSearchParams>();
        const flushNow = () => {
            this.lastFlushedAt = performance.now();
            const [search, err] = this.applyPendingUpdates(
                {
                    ...adapter,
                    autoResetQueueOnUpdate:
                        adapter.autoResetQueueOnUpdate ?? true,
                    getSearchParamsSnapshot,
                },
                processUrlSearchParams,
            );
            if (err === null) {
                this.resolvers!.resolve(search);
                this.resetQueueOnNextPush = true;
            } else {
                this.resolvers!.reject(search);
            }
            this.resolvers = null;
        };

        const runOnNextTick = () => {
            const now = performance.now();
            const timeSinceLastFlush = now - this.lastFlushedAt;
            const timeMs = this.timeMs;
            const flushInMs =
                rateLimitFactor * Math.max(0, timeMs - timeSinceLastFlush);
            if (flushInMs === 0) {
                flushNow();
            } else {
                timeout(flushNow, flushInMs, this.controller!.signal);
            }
        };
        timeout(runOnNextTick, 0, this.controller.signal);
        return this.resolvers.promise;
    }

    abort(): string[] {
        this.controller?.abort();
        this.controller = new AbortController();
        this.resolvers?.resolve(new URLSearchParams());
        this.resolvers = null;
        return this.reset();
    }

    reset(): string[] {
        const queuedKeys = Array.from(this.updateMap.keys());
        this.updateMap.clear();
        this.options = { history: "replace", scroll: false, shallow: true };
        this.timeMs = defaultRateLimit.timeMs;
        return queuedKeys;
    }

    applyPendingUpdates(
        adapter: UpdateQueueAdapterContext & {
            updateUrl: (s: URLSearchParams, o: AdapterOptions) => void;
            autoResetQueueOnUpdate: boolean;
            getSearchParamsSnapshot: () => URLSearchParams;
        },
        processUrlSearchParams?: (search: URLSearchParams) => URLSearchParams,
    ): [URLSearchParams, null | unknown] {
        const { updateUrl, getSearchParamsSnapshot } = adapter;
        let search = getSearchParamsSnapshot();

        if (this.updateMap.size === 0) return [search, null];

        const items = Array.from(this.updateMap.entries());
        const options = { ...this.options };
        if (adapter.autoResetQueueOnUpdate) this.reset();

        for (const [key, value] of items) {
            if (value === null) {
                search.delete(key);
            } else {
                search = write(value, key, new URLSearchParams(search));
            }
        }
        if (processUrlSearchParams) {
            search = processUrlSearchParams(search);
        }
        try {
            updateUrl(search, options);
            return [search, null];
        } catch (err) {
            return [search, err];
        }
    }
}

export const globalThrottleQueue = new ThrottledQueue();
