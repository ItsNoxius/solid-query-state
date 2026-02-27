import type { Query } from "../search-params";
import { timeout } from "../timeout";
import { withResolvers, type Resolvers } from "../with-resolvers";
import {
    getSearchParamsSnapshotFromLocation,
    globalThrottleQueue,
    type UpdateQueueAdapterContext,
    type UpdateQueuePushArgs,
} from "./throttle";

class DebouncedPromiseQueue {
    resolvers: Resolvers<URLSearchParams> = withResolvers<URLSearchParams>();
    controller: AbortController = new AbortController();
    queuedValue: UpdateQueuePushArgs | undefined = undefined;
    flushFn: (
        update: UpdateQueuePushArgs,
        adapter: UpdateQueueAdapterContext,
        processUrlSearchParams?: (s: URLSearchParams) => URLSearchParams,
    ) => Promise<URLSearchParams>;

    constructor(
        flushFn: (
            update: UpdateQueuePushArgs,
            adapter: UpdateQueueAdapterContext,
            processUrlSearchParams?: (s: URLSearchParams) => URLSearchParams,
        ) => Promise<URLSearchParams>,
    ) {
        this.flushFn = flushFn;
    }

    abort(): void {
        this.controller.abort();
        this.queuedValue = undefined;
    }

    push(
        value: UpdateQueuePushArgs,
        timeMs: number,
        adapter: UpdateQueueAdapterContext,
        processUrlSearchParams?: (search: URLSearchParams) => URLSearchParams,
    ): Promise<URLSearchParams> {
        this.queuedValue = value;
        this.controller.abort();
        this.controller = new AbortController();
        const outputResolvers = this.resolvers;
        this.resolvers = withResolvers<URLSearchParams>();

        timeout(
            () => {
                this.flushFn(value, adapter, processUrlSearchParams)
                    .then((out) => outputResolvers.resolve(out))
                    .catch((err) => outputResolvers.reject(err));
                this.queuedValue = undefined;
            },
            timeMs,
            this.controller.signal,
        );
        return this.resolvers.promise;
    }
}

export class DebounceController {
    private queues = new Map<string, DebouncedPromiseQueue>();
    private throttleQueue = globalThrottleQueue;

    getQueuedQuery(key: string): Query | null | undefined {
        const queue = this.queues.get(key);
        if (queue?.queuedValue) return queue.queuedValue.query;
        return this.throttleQueue.getQueuedQuery(key);
    }

    push(
        update: UpdateQueuePushArgs,
        timeMs: number,
        adapter: UpdateQueueAdapterContext,
        processUrlSearchParams?: (search: URLSearchParams) => URLSearchParams,
    ): Promise<URLSearchParams> {
        const getSnapshot = adapter.getSearchParamsSnapshot ?? getSearchParamsSnapshotFromLocation;
        if (!Number.isFinite(timeMs)) {
            return Promise.resolve(getSnapshot());
        }
        const key = update.key;
        if (!this.queues.has(key)) {
            this.queues.set(
                key,
                new DebouncedPromiseQueue((u, a, p) => {
                    this.throttleQueue.push(u);
                    return this.throttleQueue.flush(a, p);
                }),
            );
        }
        return this.queues.get(key)!.push(update, timeMs, adapter, processUrlSearchParams);
    }

    abort(key: string): (p: Promise<URLSearchParams>) => Promise<URLSearchParams> {
        const queue = this.queues.get(key);
        if (!queue) return (p) => p;
        this.queues.delete(key);
        queue.abort();
        return (promise) => promise;
    }

    abortAll(): void {
        for (const queue of this.queues.values()) {
            queue.abort();
        }
        this.queues.clear();
    }
}

export const debounceController = new DebounceController();
