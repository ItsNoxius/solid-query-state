import type { Options } from "./defs";
import type { GenericParser } from "./parsers";
import { createQueryStates, type UseQueryStatesKeysMap } from "./useQueryStates";

export type CreateQueryStateOptions<T> = GenericParser<T> & Options;

export type CreateQueryStateReturn<T, Default> = [
    () => Default extends undefined ? T | null : T,
    (
        value: null | T | ((old: Default extends T ? T : T | null) => T | null),
        options?: Options,
    ) => void,
];

export function createQueryState<T>(
    key: string,
    options: CreateQueryStateOptions<T> & { defaultValue: NonNullable<T> },
): CreateQueryStateReturn<T, NonNullable<T>>;

export function createQueryState<T>(
    key: string,
    options?: CreateQueryStateOptions<T>,
): CreateQueryStateReturn<T, undefined>;

export function createQueryState<T>(
    key: string,
    options?: CreateQueryStateOptions<T> & { defaultValue?: T },
) {
    const opts = options ?? ({} as CreateQueryStateOptions<T> & { defaultValue?: T });
    const { parse, type, serialize, eq, defaultValue, ...hookOptions } = opts;

    const keyMap = {
        [key]: {
            parse: parse ?? ((x: string) => x as unknown as T),
            type,
            serialize,
            eq,
            defaultValue,
        },
    } as UseQueryStatesKeysMap;

    const [states, setState] = createQueryStates(keyMap, hookOptions);

    const value = () => states()[key] as T | null;
    const update = (
        stateUpdater: null | T | ((old: T | null) => T | null),
        callOptions: Options = {},
    ) => {
        setState(
            (old) => ({
                [key]:
                    typeof stateUpdater === "function"
                        ? (stateUpdater as (old: T | null) => T | null)(old[key] as T | null)
                        : stateUpdater,
            }),
            callOptions,
        );
    };

    return [value, update] as CreateQueryStateReturn<T, T | undefined>;
}
