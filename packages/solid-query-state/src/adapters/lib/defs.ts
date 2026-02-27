import type { Options } from "../../defs";
import type { Accessor } from "solid-js";

export type AdapterOptions = Pick<Options, "history" | "scroll" | "shallow"> & {
    history: "replace" | "push";
    scroll: boolean;
    shallow: boolean;
};

export type UpdateUrlFunction = (
    search: URLSearchParams,
    options: Required<AdapterOptions>,
) => void;

export type UseAdapterHook = (watchKeys: string[]) => AdapterInterface;

export type AdapterInterface = {
    searchParams: Accessor<URLSearchParams>;
    updateUrl: UpdateUrlFunction;
    getSearchParamsSnapshot?: () => URLSearchParams;
    rateLimitFactor?: number;
    autoResetQueueOnUpdate?: boolean;
};
