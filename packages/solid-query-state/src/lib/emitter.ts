type Listener<T> = (payload: T) => void;

export function createEmitter<Events extends Record<string, unknown>>() {
    const listeners = new Map<
        keyof Events,
        Set<Listener<Events[keyof Events]>>
    >();

    return {
        on<K extends keyof Events>(event: K, listener: Listener<Events[K]>) {
            if (!listeners.has(event)) {
                listeners.set(event, new Set());
            }
            listeners
                .get(event)!
                .add(listener as Listener<Events[keyof Events]>);
        },

        off<K extends keyof Events>(event: K, listener: Listener<Events[K]>) {
            listeners
                .get(event)
                ?.delete(listener as Listener<Events[keyof Events]>);
        },

        emit<K extends keyof Events>(event: K, payload: Events[K]) {
            listeners.get(event)?.forEach((fn) => fn(payload));
        },
    };
}
