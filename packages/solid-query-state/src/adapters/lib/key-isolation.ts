import { compareQuery } from "../../lib/search-params";

export function applyChange(
    newValue: URLSearchParams,
    keys: string[],
    copy: boolean,
): (oldValue: URLSearchParams) => URLSearchParams {
    return (oldValue: URLSearchParams) => {
        const hasChanged =
            keys.length === 0
                ? true
                : keys.some((key) => !compareQuery(oldValue.getAll(key), newValue.getAll(key)));
        if (!hasChanged) return oldValue;
        return filterSearchParams(newValue, keys, copy);
    };
}

export function filterSearchParams(
    search: URLSearchParams,
    keys: string[],
    copy: boolean,
): URLSearchParams {
    if (keys.length === 0) return search;
    const filtered = copy ? new URLSearchParams(search) : search;
    const keysToDelete = [...search.keys()].filter((k) => !keys.includes(k));
    for (const key of keysToDelete) {
        filtered.delete(key);
    }
    return filtered;
}
