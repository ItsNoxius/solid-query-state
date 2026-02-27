import { compareQuery } from "./lib/search-params";
import type {
    GenericParserBuilder,
    MultiParserBuilder,
    SingleParserBuilder,
} from "./parsers";

export function isParserBijective<T>(
    parser: SingleParserBuilder<T>,
    serialized: string,
    input: T,
): boolean;
export function isParserBijective<T>(
    parser: MultiParserBuilder<T>,
    serialized: Array<string>,
    input: T,
): boolean;

/**
 * Test that a parser is bijective (serialize then parse gives back the same value).
 *
 * It will throw if the parser does not serialize the input to the expected serialized value,
 * or if the parser does not parse the serialized value to the expected input value.
 * The parser's `eq` function (if provided, otherwise `===`) is used to compare the values.
 *
 * @param parser The parser to test
 * @param serialized The serialized representation of the input to test against
 * @param input An input value to test against
 * @returns `true` if the test passes, otherwise it will throw.
 */
export function isParserBijective<T>(
    parser: GenericParserBuilder<T>,
    serialized: string | Array<string>,
    input: T,
): boolean {
    if (parser.type === "multi" && Array.isArray(serialized)) {
        testSerializeThenParse(parser as MultiParserBuilder<T>, input);
        testParseThenSerialize(parser as MultiParserBuilder<T>, serialized);
    } else if (parser.type !== "multi" && typeof serialized === "string") {
        testSerializeThenParse(parser as SingleParserBuilder<T>, input);
        testParseThenSerialize(parser as SingleParserBuilder<T>, serialized);
    } else {
        throw new Error(
            "[solid-query-state] isParserBijective: mismatched parser type and serialized value type",
        );
    }
    // Test value equality
    const serializedOutput =
        parser.type === "multi"
            ? (parser as MultiParserBuilder<T>).serialize(input)
            : (parser as SingleParserBuilder<T>).serialize(input);
    if (!compareQuery(serializedOutput, serialized)) {
        throw new Error(
            `[solid-query-state] parser.serialize does not match expected serialized value
Expected: '${serialized}'
Received: '${serializedOutput}'`,
        );
    }
    const parsed =
        parser.type === "multi"
            ? (parser as MultiParserBuilder<T>).parse(
                  serialized as Array<string>,
              )
            : (parser as SingleParserBuilder<T>).parse(
                  serialized as string,
              );
    if (parsed === null || !parser.eq!(parsed, input)) {
        throw new Error(
            `[solid-query-state] parser.parse does not match expected input value
Expected: ${input}
Received: ${parsed}`,
        );
    }
    return true;
}

export function testSerializeThenParse<T>(
    parser: SingleParserBuilder<T>,
    input: T,
): boolean;
export function testSerializeThenParse<T>(
    parser: MultiParserBuilder<T>,
    input: T,
): boolean;

/**
 * Test that a parser is bijective (serialize then parse gives back the same value).
 *
 * It will throw if the parser is not bijective (if the parsed value is not equal to the input value).
 * The parser's `eq` function is used to compare the values.
 *
 * @param parser The parser to test
 * @param input An input value to test against
 * @returns `true` if the test passes, otherwise it will throw.
 */
export function testSerializeThenParse<T>(
    parser: GenericParserBuilder<T>,
    input: T,
): boolean {
    const serialized =
        parser.type === "multi"
            ? (parser as MultiParserBuilder<T>).serialize(input)
            : (parser as SingleParserBuilder<T>).serialize(input);
    const parsed =
        parser.type === "multi" && Array.isArray(serialized)
            ? (parser as MultiParserBuilder<T>).parse(serialized)
            : parser.type !== "multi" && typeof serialized === "string"
              ? (parser as SingleParserBuilder<T>).parse(serialized)
              : null;
    if (parsed === null) {
        throw new Error(
            `[solid-query-state] testSerializeThenParse: parsed value is null (when parsing ${serialized} serialized from ${input})`,
        );
    }
    if (!parser.eq!(input, parsed)) {
        throw new Error(
            `[solid-query-state] parser is not bijective (in testSerializeThenParse)
Expected value: ${typeof input === "object" ? JSON.stringify(input) : input}
Received parsed value: ${typeof parsed === "object" ? JSON.stringify(parsed) : parsed}
Serialized as: '${serialized}'`,
        );
    }
    return true;
}

export function testParseThenSerialize<T>(
    parser: SingleParserBuilder<T>,
    input: string,
): boolean;
export function testParseThenSerialize<T>(
    parser: MultiParserBuilder<T>,
    input: Array<string>,
): boolean;

/**
 * Tests that a parser is bijective (parse then serialize gives back the same query string).
 *
 * It will throw if the parser is not bijective (if the serialized value is not equal to the input query).
 *
 * @param parser The parser to test
 * @param input A query string to test against
 * @returns `true` if the test passes, otherwise it will throw.
 */
export function testParseThenSerialize<T>(
    parser: GenericParserBuilder<T>,
    input: string | Array<string>,
): boolean {
    const parsed =
        parser.type === "multi" && Array.isArray(input)
            ? (parser as MultiParserBuilder<T>).parse(input)
            : parser.type !== "multi" && typeof input === "string"
              ? (parser as SingleParserBuilder<T>).parse(input)
              : null;
    if (parsed === null) {
        throw new Error(
            `[solid-query-state] testParseThenSerialize: parsed value is null (when parsing ${input})`,
        );
    }
    const serialized =
        parser.type === "multi"
            ? (parser as MultiParserBuilder<T>).serialize(parsed)
            : (parser as SingleParserBuilder<T>).serialize(parsed);
    if (!compareQuery(serialized, input)) {
        throw new Error(
            `[solid-query-state] parser is not bijective (in testParseThenSerialize)
Expected query: '${input}'
Received query: '${serialized}'
Parsed value: ${parsed}`,
        );
    }
    return true;
}
