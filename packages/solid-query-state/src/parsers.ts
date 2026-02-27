import type { Options } from "./defs";
import { safeParse, safeParseArray } from "./lib/safe-parse";

type Require<T, K extends keyof T> = Pick<T, K> & Omit<T, K>;

export type SingleParser<T> = {
    type?: "single";
    parse: (value: string) => T | null;
    serialize?: (value: T) => string;
    eq?: (a: T, b: T) => boolean;
};

export type MultiParser<T> = {
    type: "multi";
    parse: (value: ReadonlyArray<string>) => T | null;
    serialize?: (value: T) => Array<string>;
    eq?: (a: T, b: T) => boolean;
};

export type GenericParser<T> = SingleParser<T> | MultiParser<T>;

export type SingleParserBuilder<T> = Required<SingleParser<T>> &
    Options & {
        withOptions(this: SingleParserBuilder<T>, options: Options): SingleParserBuilder<T>;
        withDefault(
            this: SingleParserBuilder<T>,
            defaultValue: NonNullable<T>,
        ): Omit<SingleParserBuilder<T>, "parseServerSide"> & {
            readonly defaultValue: NonNullable<T>;
        };
        parseServerSide(value: string | string[] | undefined): T | null;
    };

export type MultiParserBuilder<T> = Required<MultiParser<T>> &
    Options & {
        withOptions(this: MultiParserBuilder<T>, options: Options): MultiParserBuilder<T>;
        withDefault(
            this: MultiParserBuilder<T>,
            defaultValue: NonNullable<T>,
        ): Omit<MultiParserBuilder<T>, "parseServerSide"> & {
            readonly defaultValue: NonNullable<T>;
        };
        parseServerSide(value: string | string[] | undefined): T | null;
    };

export type GenericParserBuilder<T> = SingleParserBuilder<T> | MultiParserBuilder<T>;

export function createParser<T>(
    parser: Require<SingleParser<T>, "parse" | "serialize">,
): SingleParserBuilder<T> {
    function parseServerSideNullable(value: string | string[] | undefined) {
        if (typeof value === "undefined") return null;
        let str = "";
        if (Array.isArray(value)) {
            if (value[0] === undefined) return null;
            str = value[0];
        }
        if (typeof value === "string") str = value;
        return safeParse(parser.parse, str);
    }

    return {
        type: "single",
        eq: (a, b) => a === b,
        ...parser,
        serialize: parser.serialize ?? (String as (v: T) => string),
        parseServerSide: parseServerSideNullable,
        withDefault(defaultValue) {
            return {
                ...this,
                defaultValue,
                parseServerSide(value) {
                    return parseServerSideNullable(value) ?? defaultValue;
                },
            } as SingleParserBuilder<T> & {
                readonly defaultValue: NonNullable<T>;
            };
        },
        withOptions(options: Options) {
            return { ...this, ...options } as SingleParserBuilder<T>;
        },
    };
}

export function createMultiParser<T>(
    parser: Omit<MultiParser<T>, "parse" | "serialize"> & {
        parse: (value: ReadonlyArray<string>) => T | null;
        serialize?: (value: T) => Array<string>;
    },
): MultiParserBuilder<T> {
    function parseServerSideNullable(value: string | string[] | undefined) {
        if (typeof value === "undefined") return null;
        return safeParseArray(parser.parse, Array.isArray(value) ? value : [value]);
    }

    return {
        ...parser,
        type: "multi",
        eq: (a, b) => a === b,
        serialize: parser.serialize ?? ((v: T) => [String(v)]),
        parseServerSide: parseServerSideNullable,
        withDefault(defaultValue) {
            return {
                ...this,
                defaultValue,
                parseServerSide(value) {
                    return parseServerSideNullable(value) ?? defaultValue;
                },
            } as MultiParserBuilder<T> & {
                readonly defaultValue: NonNullable<T>;
            };
        },
        withOptions(options: Options) {
            return { ...this, ...options } as MultiParserBuilder<T>;
        },
    };
}

// Built-in parsers
export const parseAsString: SingleParserBuilder<string> = createParser({
    parse: (v) => v,
    serialize: String,
});

export const parseAsInteger: SingleParserBuilder<number> = createParser({
    parse: (v) => {
        const int = parseInt(v);
        return int == int ? int : null;
    },
    serialize: (v) => "" + Math.round(v),
});

export const parseAsIndex: SingleParserBuilder<number> = createParser({
    parse: (v) => {
        const int = parseInt(v);
        return int == int ? int - 1 : null;
    },
    serialize: (v) => "" + Math.round(v + 1),
});

export const parseAsHex: SingleParserBuilder<number> = createParser({
    parse: (v) => {
        const int = parseInt(v, 16);
        return int == int ? int : null;
    },
    serialize: (v) => {
        const hex = Math.round(v).toString(16);
        return (hex.length & 1 ? "0" : "") + hex;
    },
});

export const parseAsFloat: SingleParserBuilder<number> = createParser({
    parse: (v) => {
        const float = parseFloat(v);
        return float == float ? float : null;
    },
    serialize: String,
});

export const parseAsBoolean: SingleParserBuilder<boolean> = createParser({
    parse: (v) => v.toLowerCase() === "true",
    serialize: String,
});

function compareDates(a: Date, b: Date) {
    return a.valueOf() === b.valueOf();
}

export const parseAsTimestamp: SingleParserBuilder<Date> = createParser({
    parse: (v) => {
        const ms = parseInt(v);
        return ms == ms ? new Date(ms) : null;
    },
    serialize: (v: Date) => "" + v.valueOf(),
    eq: compareDates,
});

export const parseAsIsoDateTime: SingleParserBuilder<Date> = createParser({
    parse: (v) => {
        const date = new Date(v);
        return date.valueOf() == date.valueOf() ? date : null;
    },
    serialize: (v: Date) => v.toISOString(),
    eq: compareDates,
});

export const parseAsIsoDate: SingleParserBuilder<Date> = createParser({
    parse: (v) => {
        const date = new Date(v.slice(0, 10));
        return date.valueOf() == date.valueOf() ? date : null;
    },
    serialize: (v: Date) => v.toISOString().slice(0, 10),
    eq: compareDates,
});

export function parseAsStringLiteral<Literal extends string>(
    validValues: readonly Literal[],
): SingleParserBuilder<Literal> {
    return createParser({
        parse: (query: string) => {
            const asConst = query as unknown as Literal;
            return validValues.includes(asConst) ? asConst : null;
        },
        serialize: String,
    });
}

export function parseAsStringEnum<Enum extends string>(
    validValues: Enum[],
): SingleParserBuilder<Enum> {
    return parseAsStringLiteral(validValues as readonly Enum[]);
}

export function parseAsNumberLiteral<Literal extends number>(
    validValues: readonly Literal[],
): SingleParserBuilder<Literal> {
    return createParser({
        parse: (query: string) => {
            const asConst = parseFloat(query) as unknown as Literal;
            if (validValues.includes(asConst)) return asConst;
            return null;
        },
        serialize: String,
    });
}

export function parseAsArrayOf<ItemType>(
    itemParser: SingleParser<ItemType>,
    separator = ",",
): SingleParserBuilder<ItemType[]> {
    const itemEq = itemParser.eq ?? ((a: ItemType, b: ItemType) => a === b);
    const encodedSeparator = encodeURIComponent(separator);

    return createParser({
        parse: (query) => {
            if (query === "") return [] as ItemType[];
            return query
                .split(separator)
                .map((item) =>
                    safeParse(itemParser.parse, item.replaceAll(encodedSeparator, separator)),
                )
                .filter((value): value is ItemType => value !== null && value !== undefined);
        },
        serialize: (values) =>
            values
                .map((value) => {
                    const str = itemParser.serialize ? itemParser.serialize(value) : String(value);
                    return str.replaceAll(separator, encodedSeparator);
                })
                .join(separator),
        eq(a, b) {
            if (a === b) return true;
            if (a.length !== b.length) return false;
            return a.every((value, index) => itemEq(value, b[index]!));
        },
    });
}

export type inferParserType<Input> =
    Input extends GenericParserBuilder<infer Value>
        ? Input extends { defaultValue: NonNullable<Value> }
            ? NonNullable<Value>
            : Value | null
        : Input extends Record<string, GenericParserBuilder<unknown>>
          ? {
                [K in keyof Input]: Input[K] extends GenericParserBuilder<infer V>
                    ? Input[K] extends { defaultValue: NonNullable<V> }
                        ? NonNullable<V>
                        : V | null
                    : never;
            }
          : never;
