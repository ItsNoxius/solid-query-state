export type { HistoryOptions, Nullable, Options, SearchParams, UrlKeys } from "./defs";
export { debounce, defaultRateLimit, throttle } from "./lib/queues/rate-limiting";
export * from "./parsers";
export * from "./useQueryState";
export type { UseQueryStatesKeysMap } from "./useQueryStates";
export * from "./useQueryStates";
export { QueryStateAdapter } from "./adapters/solid";
export {
    SolidTestingAdapter,
    withSolidTestingAdapter,
    type OnUrlUpdateFunction,
    type UrlUpdateEvent,
} from "./adapters/testing";
export { isParserBijective, testParseThenSerialize, testSerializeThenParse } from "./testing";
