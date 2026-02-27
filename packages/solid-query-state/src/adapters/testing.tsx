import { createEffect, createMemo, createSignal, onCleanup, type JSX } from "solid-js";
import { resetQueues } from "../lib/queues/reset";
import { renderQueryString } from "../lib/url-encoding";
import { createAdapterProvider, setGlobalAdapterValue } from "./lib/context";
import type { AdapterInterface, AdapterOptions } from "./lib/defs";

export type UrlUpdateEvent = {
    searchParams: URLSearchParams;
    queryString: string;
    options: Required<AdapterOptions>;
};

export type OnUrlUpdateFunction = (event: UrlUpdateEvent) => void;

export type TestingAdapterProps = {
    /**
     * An initial value for the search params.
     */
    searchParams?: string | Record<string, string | string[] | undefined> | URLSearchParams;

    /**
     * A function that will be called whenever the URL is updated.
     * Connect that to a spy in your tests to assert the URL updates.
     */
    onUrlUpdate?: OnUrlUpdateFunction;

    /**
     * Internal: enable throttling during tests.
     *
     * @default 0 (no throttling)
     */
    rateLimitFactor?: number;

    /**
     * Internal: Whether to reset the url update queue on mount.
     *
     * Since the update queue is a shared global, each test clears
     * it on mount to avoid interference between tests.
     *
     * @default true
     */
    resetUrlUpdateQueueOnMount?: boolean;

    /**
     * Internal: Whether to reset the queue after each update.
     * @default true
     */
    autoResetQueueOnUpdate?: boolean;

    /**
     * If true, the adapter will store the search params in memory and
     * update that memory on each updateUrl call, to simulate a real adapter.
     *
     * Otherwise, the search params will be frozen to the initial value.
     *
     * @default false
     */
    hasMemory?: boolean;

    defaultOptions?: Partial<
        Pick<import("../defs").Options, "scroll" | "clearOnDefault" | "limitUrlUpdates" | "shallow">
    >;
    processUrlSearchParams?: (search: URLSearchParams) => URLSearchParams;

    children: JSX.Element;
};

function renderInitialSearchParams(searchParams: TestingAdapterProps["searchParams"]): string {
    if (!searchParams) {
        return "";
    }
    if (typeof searchParams === "string") {
        return searchParams.startsWith("?") ? searchParams.slice(1) : searchParams;
    }
    if (searchParams instanceof URLSearchParams) {
        return searchParams.toString();
    }
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
        if (value === undefined) continue;
        if (Array.isArray(value)) {
            for (const v of value) params.append(key, v);
        } else {
            params.set(key, value);
        }
    }
    return params.toString();
}

export function SolidTestingAdapter(props: TestingAdapterProps): JSX.Element {
    const {
        resetUrlUpdateQueueOnMount = true,
        autoResetQueueOnUpdate = true,
        defaultOptions,
        processUrlSearchParams,
        rateLimitFactor = 0,
        hasMemory = false,
        onUrlUpdate,
        children,
        searchParams: initialSearchParams = "",
    } = props;

    const renderedInitialSearchParams = createMemo(() =>
        renderInitialSearchParams(initialSearchParams),
    );

    if (resetUrlUpdateQueueOnMount) {
        resetQueues();
    }

    const [locationSearch, setLocationSearch] = createSignal(renderedInitialSearchParams());

    createEffect(() => {
        if (!hasMemory) return;
        const search = new URLSearchParams(renderedInitialSearchParams());
        setLocationSearch(search.toString());
    });

    const searchParams = createMemo(() => new URLSearchParams(locationSearch()));

    const updateUrl = (search: URLSearchParams, options: Required<AdapterOptions>) => {
        const queryString = renderQueryString(search);
        const searchParamsCopy = new URLSearchParams(search);
        if (hasMemory) {
            setLocationSearch(queryString.replace(/^\?/, ""));
        }
        onUrlUpdate?.({
            searchParams: searchParamsCopy,
            queryString,
            options,
        });
    };

    const getSearchParamsSnapshot = () => new URLSearchParams(locationSearch());

    const useAdapter = (): AdapterInterface => ({
        searchParams,
        updateUrl,
        getSearchParamsSnapshot,
        rateLimitFactor,
        autoResetQueueOnUpdate,
    });

    // Set adapter value immediately so it's available when children run.
    // In Solid, children may be evaluated before the Provider component runs.
    setGlobalAdapterValue({
        useAdapter,
        defaultOptions,
        processUrlSearchParams,
    });
    onCleanup(() => setGlobalAdapterValue(null));

    const Provider = createAdapterProvider(useAdapter);
    return (
        <Provider defaultOptions={defaultOptions} processUrlSearchParams={processUrlSearchParams}>
            {children}
        </Provider>
    );
}

/**
 * A higher order component that wraps the children with the SolidTestingAdapter
 *
 * It allows creating wrappers for testing purposes by providing only the
 * necessary props to the SolidTestingAdapter.
 *
 * Usage:
 * ```tsx
 * render(() => <MyComponent />, {
 *   wrapper: (props) => withSolidTestingAdapter({ searchParams: '?foo=bar' })(props)
 * })
 * ```
 */
export function withSolidTestingAdapter(adapterProps: Omit<TestingAdapterProps, "children"> = {}) {
    return function SolidTestingAdapterWrapper(props: { children: JSX.Element }): JSX.Element {
        return <SolidTestingAdapter {...adapterProps}>{props.children}</SolidTestingAdapter>;
    };
}
