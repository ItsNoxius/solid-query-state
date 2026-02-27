import { createSignal, createEffect, onCleanup } from "solid-js";
import type { JSX } from "solid-js";
import { createEmitter } from "../lib/emitter";
import { renderQueryString } from "../lib/url-encoding";
import { applyChange, filterSearchParams } from "./lib/key-isolation";
import { createAdapterProvider, setGlobalAdapterValue } from "./lib/context";
import type { AdapterInterface, AdapterOptions } from "./lib/defs";

const HISTORY_UPDATE_MARKER = "__solid-query-state";

const emitter = createEmitter<{ update: URLSearchParams }>();

function createUpdateUrlFn() {
    return function updateUrl(search: URLSearchParams, options: Required<AdapterOptions>) {
        if (typeof location === "undefined") return;
        const url = new URL(location.href);
        url.search = renderQueryString(search);
        const method = options.history === "push" ? history.pushState : history.replaceState;
        method.call(history, history.state, HISTORY_UPDATE_MARKER, url.toString());
        emitter.emit("update", search);
        if (options.scroll) {
            window.scrollTo({ top: 0 });
        }
    };
}

function useSolidAdapter(watchKeys: string[]): AdapterInterface {
    const [searchParams, setSearchParams] = createSignal<URLSearchParams>(
        (() => {
            if (typeof location === "undefined") return new URLSearchParams();
            return filterSearchParams(new URLSearchParams(location.search), watchKeys, false);
        })(),
    );

    createEffect(() => {
        if (typeof window === "undefined") return;
        const onPopState = () => {
            setSearchParams((prev) =>
                applyChange(new URLSearchParams(location.search), watchKeys, false)(prev),
            );
        };
        const onEmitterUpdate = (search: URLSearchParams) => {
            setSearchParams((prev) => applyChange(search, watchKeys, true)(prev));
        };
        emitter.on("update", onEmitterUpdate);
        window.addEventListener("popstate", onPopState);
        onCleanup(() => {
            emitter.off("update", onEmitterUpdate);
            window.removeEventListener("popstate", onPopState);
        });
    });

    const updateUrl = createUpdateUrlFn();

    return {
        searchParams,
        updateUrl,
        getSearchParamsSnapshot: () =>
            new URLSearchParams(typeof location !== "undefined" ? location.search : ""),
    };
}

const SolidAdapterProvider = createAdapterProvider(useSolidAdapter);

export function QueryStateAdapter(
    props: { children: JSX.Element } & {
        defaultOptions?: Parameters<typeof SolidAdapterProvider>[0]["defaultOptions"];
        processUrlSearchParams?: (search: URLSearchParams) => URLSearchParams;
    },
) {
    // Set adapter value immediately so it's available when children run.
    // In Solid, children may be evaluated before the Provider component runs.
    setGlobalAdapterValue({
        useAdapter: useSolidAdapter,
        defaultOptions: props.defaultOptions,
        processUrlSearchParams: props.processUrlSearchParams,
    });
    return (
        <SolidAdapterProvider
            defaultOptions={props.defaultOptions}
            processUrlSearchParams={props.processUrlSearchParams}
        >
            {props.children}
        </SolidAdapterProvider>
    );
}
