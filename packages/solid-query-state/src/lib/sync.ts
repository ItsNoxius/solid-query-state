import { createEmitter } from "./emitter";
import type { Query } from "./search-params";

export type CrossHookSyncPayload = {
    state: unknown;
    query: Query | null;
};

export const syncEmitter =
    createEmitter<Record<string, CrossHookSyncPayload>>();
