import { createParser, createQueryState } from "solid-query-state";

const parseAsHexColor = createParser({
    parse: (v) => {
        const hex = v.replace(/^#/, "");
        if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
        return hex;
    },
    serialize: (v) => v,
}).withDefault("3b82f6");

export function HexColors() {
    const [color, setColor] = createQueryState("color", parseAsHexColor);

    const bgStyle = () => `#${color()}`;

    return (
        <div class="flex flex-col items-center gap-4">
            <div
                class="h-24 w-full max-w-xs rounded-xl border border-zinc-700 transition"
                style={{ "background-color": bgStyle() }}
            />
            <div class="flex flex-wrap justify-center gap-2">
                {["3b82f6", "ef4444", "22c55e", "eab308", "a855f7", "ec4899"].map((hex) => (
                    <button
                        type="button"
                        onClick={() => setColor(hex)}
                        class="h-10 w-10 rounded-lg border-2 transition hover:scale-110"
                        style={{
                            "background-color": `#${hex}`,
                            "border-color": color() === hex ? "#f59e0b" : "transparent",
                        }}
                        title={`#${hex}`}
                    />
                ))}
            </div>
            <p class="text-sm text-zinc-500">Color: #{color()}</p>
        </div>
    );
}
