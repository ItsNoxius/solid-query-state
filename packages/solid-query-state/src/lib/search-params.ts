export type Query = string | Array<string>;

export function isAbsentFromUrl(query: Query | null): query is null | [] {
    return query === null || (Array.isArray(query) && query.length === 0);
}

export function write(
    serialized: Query,
    key: string,
    searchParams: URLSearchParams,
): URLSearchParams {
    if (typeof serialized === "string") {
        searchParams.set(key, serialized);
    } else {
        searchParams.delete(key);
        for (const v of serialized) {
            searchParams.append(key, v);
        }
        if (!searchParams.has(key)) {
            searchParams.set(key, "");
        }
    }
    return searchParams;
}

export function compareQuery(
    a: string | string[] | null | undefined,
    b: string | string[] | null | undefined,
): boolean {
    if (a === b) return true;
    if (a == null || b == null) return a === b;
    const arrA = Array.isArray(a) ? a : [a];
    const arrB = Array.isArray(b) ? b : [b];
    if (arrA.length !== arrB.length) return false;
    return arrA.every((v, i) => v === arrB[i]);
}
