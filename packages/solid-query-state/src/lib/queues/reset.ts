import { debounceController } from "./debounce";
import { globalThrottleQueue } from "./throttle";

export function resetQueues(): void {
    debounceController.abortAll();
    globalThrottleQueue.abort();
}
