import { createSignal, createEffect, createMemo } from "solid-js";
import {
    useAdapterContext,
    useAdapterDefaultOptions,
    useAdapterProcessUrlSearchParams,
} from "./adapters/lib/context";
import type { Nullable, Options, UrlKeys } from "./defs";
import { debounceController } from "./lib/queues/debounce";
import { defaultRateLimit } from "./lib/queues/rate-limiting";
import {
    globalThrottleQueue,
    type UpdateQueuePushArgs,
} from "./lib/queues/throttle";
import { safeParse } from "./lib/safe-parse";
import { safeParseArray } from "./lib/safe-parse";
import { isAbsentFromUrl } from "./lib/search-params";
import { syncEmitter } from "./lib/sync";

export type KeyMapValue = {
    parse: (value: string) => unknown;
    serialize?: (value: unknown) => string;
    eq?: (a: unknown, b: unknown) => boolean;
    type?: "single" | "multi";
    defaultValue?: unknown;
} & Options;

export type UseQueryStatesKeysMap = Record<string, KeyMapValue>;

export type UseQueryStatesOptions = Options & {
    urlKeys?: UrlKeys<Record<string, string>>;
};

type Values<T extends UseQueryStatesKeysMap> = {
    [K in keyof T]: T[K]["defaultValue"] extends NonNullable<unknown>
        ? NonNullable<ReturnType<T[K]["parse"]>>
        : ReturnType<T[K]["parse"]> | null;
};

type NullableValues<T extends UseQueryStatesKeysMap> = Nullable<Values<T>>;

type UpdaterFn<T extends UseQueryStatesKeysMap> = (
    old: Values<T>,
) => Partial<NullableValues<T>> | null;

export type SetValues<T extends UseQueryStatesKeysMap> = (
    values: Partial<NullableValues<T>> | UpdaterFn<T> | null,
    options?: Options,
) => void;

export type UseQueryStatesReturn<T extends UseQueryStatesKeysMap> = [
    () => Values<T>,
    SetValues<T>,
];

function parseMap<T extends UseQueryStatesKeysMap>(
    keyMap: T,
    urlKeys: Record<string, string>,
    searchParams: URLSearchParams,
    getQueuedQuery: (key: string) => string | string[] | null | undefined,
): NullableValues<T> {
    const state = {} as NullableValues<T>;
    for (const stateKey of Object.keys(keyMap)) {
        const parser = keyMap[stateKey]!;
        const urlKey = urlKeys[stateKey] ?? stateKey;
        const fallbackValue = parser.type === "multi" ? [] : null;
        const queuedQuery = getQueuedQuery(urlKey);
        const query =
            queuedQuery === undefined
                ? parser.type === "multi"
                    ? searchParams?.getAll(urlKey)
                    : (searchParams?.get(urlKey) ?? fallbackValue)
                : queuedQuery;

        const normalizedQuery =
            parser.type === "multi"
                ? Array.isArray(query)
                    ? query
                    : query != null
                      ? [query]
                      : []
                : query;
        const value = isAbsentFromUrl(
            Array.isArray(normalizedQuery)
                ? normalizedQuery
                : (normalizedQuery ?? null),
        )
            ? null
            : parser.type === "multi"
              ? safeParseArray(
                    parser.parse as unknown as (
                        v: ReadonlyArray<string>,
                    ) => unknown,
                    normalizedQuery as string[],
                )
              : safeParse(
                    parser.parse as (v: string) => unknown,
                    (normalizedQuery as string) ?? "",
                );

        state[stateKey as keyof T] = (value ??
            null) as NullableValues<T>[keyof T];
    }
    return state;
}

function applyDefaultValues<T extends UseQueryStatesKeysMap>(
    state: NullableValues<T>,
    defaults: Partial<Values<T>>,
): Values<T> {
    return Object.fromEntries(
        Object.keys(state).map((key) => [
            key,
            state[key] ?? defaults[key] ?? null,
        ]),
    ) as Values<T>;
}

export function createQueryStates<T extends UseQueryStatesKeysMap>(
    keyMap: T,
    options: UseQueryStatesOptions = {},
): UseQueryStatesReturn<T> {
    const defaultOptions = useAdapterDefaultOptions();
    const processUrlSearchParams = useAdapterProcessUrlSearchParams();

    const {
        history = "replace",
        scroll = defaultOptions?.scroll ?? false,
        shallow = (defaultOptions as { shallow?: boolean })?.shallow ?? true,
        throttleMs = defaultRateLimit.timeMs,
        limitUrlUpdates = defaultOptions?.limitUrlUpdates,
        clearOnDefault = defaultOptions?.clearOnDefault ?? true,
        urlKeys = {},
    } = options;

    const resolvedUrlKeys = Object.fromEntries(
        Object.keys(keyMap).map((key) => [key, urlKeys[key] ?? key]),
    ) as Record<string, string>;

    const watchKeys = Object.values(resolvedUrlKeys);
    const adapter = useAdapterContext(watchKeys);

    const defaultValues = Object.fromEntries(
        Object.keys(keyMap).map((key) => {
            const parser = keyMap[key];
            return [key, parser?.defaultValue ?? null] as const;
        }),
    ) as Partial<Values<T>>;

    function getQueuedQuery(key: string) {
        return (
            debounceController.getQueuedQuery(key) ??
            globalThrottleQueue.getQueuedQuery(key)
        );
    }

    const [internalState, setInternalState] = createSignal<NullableValues<T>>(
        (() => {
            const source =
                typeof location !== "undefined"
                    ? new URLSearchParams(location.search)
                    : new URLSearchParams();
            return parseMap(keyMap, resolvedUrlKeys, source, getQueuedQuery);
        })(),
    );

    createEffect(() => {
        const searchParams = adapter.searchParams();
        const state = parseMap(
            keyMap,
            resolvedUrlKeys,
            searchParams,
            getQueuedQuery,
        );
        setInternalState(() => state);
    });

    createEffect(() => {
        const handlers: Record<
            string,
            (payload: {
                state: unknown;
                query: string | string[] | null;
            }) => void
        > = {};
        for (const stateKey of Object.keys(keyMap)) {
            const parser = keyMap[stateKey] as KeyMapValue;
            handlers[stateKey] = ({ state }) => {
                const defaultValue = parser.defaultValue ?? null;
                const nextValue = state ?? defaultValue ?? null;
                setInternalState((current) => {
                    const currentValue =
                        current[stateKey] ?? defaultValue ?? null;
                    if (Object.is(currentValue, nextValue)) return current;
                    return { ...current, [stateKey]: nextValue };
                });
            };
        }
        for (const stateKey of Object.keys(keyMap)) {
            const urlKey = resolvedUrlKeys[stateKey];
            const handler = handlers[stateKey];
            if (urlKey && handler) syncEmitter.on(urlKey, handler);
        }
        return () => {
            for (const stateKey of Object.keys(keyMap)) {
                const urlKey = resolvedUrlKeys[stateKey];
                const handler = handlers[stateKey];
                if (urlKey && handler) syncEmitter.off(urlKey, handler);
            }
        };
    });

    const setState: SetValues<T> = (stateUpdater, callOptions = {}) => {
        const nullMap = Object.fromEntries(
            Object.keys(keyMap).map((key) => [key, null]),
        ) as NullableValues<T>;

        const newState: Partial<NullableValues<T>> =
            typeof stateUpdater === "function"
                ? (stateUpdater(
                      applyDefaultValues(internalState(), defaultValues),
                  ) ?? nullMap)
                : (stateUpdater ?? nullMap);

        for (const [stateKey, value] of Object.entries(newState)) {
            const parser = keyMap[stateKey];
            const urlKey = resolvedUrlKeys[stateKey]!;
            if (!parser || value === undefined) continue;

            const shouldClear =
                (callOptions.clearOnDefault ??
                    (parser as KeyMapValue & Options).clearOnDefault ??
                    clearOnDefault) &&
                value !== null &&
                parser.defaultValue !== undefined &&
                (parser.eq ?? ((a: unknown, b: unknown) => a === b))(
                    value,
                    parser.defaultValue,
                );

            const query =
                shouldClear || value === null
                    ? null
                    : (parser.serialize ?? String)(value);

            syncEmitter.emit(urlKey, {
                state: shouldClear ? null : value,
                query,
            });

            const update: UpdateQueuePushArgs = {
                key: urlKey,
                query: shouldClear ? null : query,
                options: {
                    history:
                        callOptions.history ??
                        (parser as Options).history ??
                        history,
                    shallow:
                        callOptions.shallow ??
                        (parser as Options).shallow ??
                        shallow,
                    scroll:
                        callOptions.scroll ??
                        (parser as Options).scroll ??
                        scroll,
                },
            };

            const timeMs =
                callOptions?.limitUrlUpdates?.timeMs ??
                (parser as Options).limitUrlUpdates?.timeMs ??
                limitUrlUpdates?.timeMs ??
                (parser as Options).throttleMs ??
                throttleMs;

            if (
                callOptions?.limitUrlUpdates?.method === "debounce" ||
                limitUrlUpdates?.method === "debounce" ||
                (parser as Options).limitUrlUpdates?.method === "debounce"
            ) {
                debounceController.push(
                    update,
                    timeMs,
                    adapter,
                    processUrlSearchParams ?? undefined,
                );
            } else {
                debounceController.abort(urlKey);
                globalThrottleQueue.push(update, timeMs);
                globalThrottleQueue.flush(
                    adapter,
                    processUrlSearchParams ?? undefined,
                );
            }
        }
    };

    const outputState = createMemo(() =>
        applyDefaultValues(internalState(), defaultValues),
    );

    return [outputState, setState];
}
