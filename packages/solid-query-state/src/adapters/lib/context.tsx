import {
    createContext,
    useContext,
    onCleanup,
    type Component,
    type JSX,
} from "solid-js";
import type { Options } from "../../defs";
import type { AdapterInterface, UseAdapterHook } from "./defs";

export type AdapterProps = {
    defaultOptions?: Partial<
        Pick<
            Options,
            "scroll" | "clearOnDefault" | "limitUrlUpdates" | "shallow"
        >
    >;
    processUrlSearchParams?: (search: URLSearchParams) => URLSearchParams;
};

export type AdapterContextValue = AdapterProps & {
    useAdapter: UseAdapterHook;
};

const NUQS_ADAPTER_MARKER = Symbol("nuqs-adapter");

type AdapterContextValueWithMarker = AdapterContextValue & {
    [NUQS_ADAPTER_MARKER]?: true;
};

const defaultContext: AdapterContextValue = {
    useAdapter() {
        throw new Error(
            "[solid-query-state] QueryStateAdapter not found. Wrap your app with <QueryStateAdapter>",
        );
    },
};

export const NuqsAdapterContext =
    createContext<AdapterContextValue>(defaultContext);

/** Module-level fallback for HMR when context is lost during reload */
let globalAdapterValue: AdapterContextValue | null = null;

/** Called by QueryStateAdapter to set the adapter value before children run */
export function setGlobalAdapterValue(
    value: AdapterContextValue | null,
): void {
    if (value === null) {
        globalAdapterValue = null;
        return;
    }
    const marked = value as AdapterContextValueWithMarker;
    marked[NUQS_ADAPTER_MARKER] = true;
    globalAdapterValue = marked;
}

function getAdapterValue(
    value: AdapterContextValue | undefined,
): AdapterContextValue | null {
    if (
        value &&
        (value as AdapterContextValueWithMarker)[NUQS_ADAPTER_MARKER]
    ) {
        return value;
    }
    return globalAdapterValue;
}

export function createAdapterProvider(
    useAdapter: UseAdapterHook,
): Component<AdapterProps & { children: JSX.Element }> {
    return (props) => {
        const { children, defaultOptions, processUrlSearchParams } = props;
        const value: AdapterContextValueWithMarker = {
            useAdapter,
            defaultOptions,
            processUrlSearchParams,
            [NUQS_ADAPTER_MARKER]: true,
        };
        globalAdapterValue = value;
        onCleanup(() => {
            globalAdapterValue = null;
        });
        return (
            <NuqsAdapterContext.Provider value={value as AdapterContextValue}>
                {children}
            </NuqsAdapterContext.Provider>
        );
    };
}

export function useAdapterContext(watchKeys: string[]): AdapterInterface {
    const value = useContext(NuqsAdapterContext);
    const adapterValue = getAdapterValue(value);
    if (!adapterValue?.useAdapter) {
        throw new Error(
            "[solid-query-state] QueryStateAdapter not found. Wrap your app with <QueryStateAdapter>",
        );
    }
    return adapterValue.useAdapter(watchKeys);
}

export function useAdapterDefaultOptions() {
    const value = useContext(NuqsAdapterContext);
    return getAdapterValue(value)?.defaultOptions;
}

export function useAdapterProcessUrlSearchParams() {
    const value = useContext(NuqsAdapterContext);
    return getAdapterValue(value)?.processUrlSearchParams;
}
