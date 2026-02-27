import { createSignal } from "solid-js";
import { Section } from "../components/Section";
import { CodeBlock } from "../components/CodeBlock";

const installCommands: Record<string, string> = {
  npm: "npm install solid-query-state",
  pnpm: "pnpm add solid-query-state",
  yarn: "yarn add solid-query-state",
  bun: "bun add solid-query-state",
};

export function Installation() {
  const [pm, setPm] = createSignal<string>("npm");

  return (
    <Section title="Installation">
      <p class="text-zinc-400">
        Install the <code class="rounded bg-zinc-800 px-1.5 py-0.5">solid-query-state</code> package with your favourite package manager:
      </p>
      <div class="flex gap-2">
        {(["npm", "pnpm", "yarn", "bun"] as const).map((p) => (
          <button
            type="button"
            onClick={() => setPm(p)}
            class={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
              pm() === p
                ? "border-amber-500 bg-amber-500/10 text-amber-400"
                : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <CodeBlock code={installCommands[pm()] ?? installCommands.npm} language="bash" />
      <h3 class="text-lg font-semibold text-white">Requirements</h3>
      <ul class="list-inside list-disc space-y-2 text-zinc-400">
        <li><code class="rounded bg-zinc-800 px-1.5 py-0.5">solid-js</code> ^1</li>
        <li><code class="rounded bg-zinc-800 px-1.5 py-0.5">typescript</code> ^5</li>
      </ul>
      <h3 class="text-lg font-semibold text-white">Setup</h3>
      <p class="text-zinc-400">
        Wrap your app with <code class="rounded bg-zinc-800 px-1.5 py-0.5">QueryStateAdapter</code>:
      </p>
      <CodeBlock
        code={`import { render } from "solid-js/web";
import { QueryStateAdapter } from "solid-query-state";
import App from "./App";

const root = document.getElementById("root");
render(
  () => (
    <QueryStateAdapter>
      <App />
    </QueryStateAdapter>
  ),
  root!
);`}
      />
    </Section>
  );
}
