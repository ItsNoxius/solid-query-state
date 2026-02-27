import type { LimitUrlUpdates } from "../../defs";

export const defaultRateLimit = {
    method: "throttle" as const,
    timeMs: 50,
};

export function throttle(timeMs: number): LimitUrlUpdates {
    return { method: "throttle", timeMs };
}

export function debounce(timeMs: number): LimitUrlUpdates {
    return { method: "debounce", timeMs };
}
