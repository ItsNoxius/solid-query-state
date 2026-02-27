export function safeParse<T>(parse: (value: string) => T | null, value: string): T | null {
    try {
        return parse(value);
    } catch {
        return null;
    }
}

export function safeParseArray<T>(
    parse: (value: ReadonlyArray<string>) => T | null,
    value: ReadonlyArray<string>,
): T | null {
    try {
        return parse(value);
    } catch {
        return null;
    }
}
