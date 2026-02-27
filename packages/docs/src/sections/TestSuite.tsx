import { createSignal } from "solid-js";
import { Section } from "../components/Section";
import { CodeBlock } from "../components/CodeBlock";

export function TestSuite() {
  const [testOutput, setTestOutput] = createSignal<string | null>(null);
  const [running, setRunning] = createSignal(false);

  const runTests = async () => {
    setRunning(true);
    setTestOutput(null);
    try {
      // We can't run vitest from the browser - show instructions instead
      // In a real scenario you'd have a backend that runs tests
      setTestOutput(
        "Run 'pnpm test:run' in the project root to execute the test suite.\n\n" +
          "The solid-query-state package includes comprehensive tests for:\n" +
          "• createQueryState (single key)\n" +
          "• createQueryStates (multiple keys)\n" +
          "• Parsers and serialization\n" +
          "• URL sync and history"
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <Section title="Test suite">
      <p class="text-zinc-400">
        solid-query-state is fully tested. Use the provided{" "}
        <code class="rounded bg-zinc-800 px-1.5 py-0.5">SolidTestingAdapter</code>{" "}
        to test your components in isolation.
      </p>

      <h3 class="text-lg font-semibold text-white">Running tests</h3>
      <p class="text-zinc-400">
        From the project root, run the test suite:
      </p>
      <CodeBlock code="pnpm test:run" language="bash" />

      <h3 class="text-lg font-semibold text-white">Test adapter</h3>
      <p class="text-zinc-400">
        Use <code class="rounded bg-zinc-800 px-1.5 py-0.5">withSolidTestingAdapter</code> to
        wrap your tests and control the URL in isolation:
      </p>
      <CodeBlock
        code={`import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { QueryStateAdapter, createQueryState, parseAsString } from "solid-query-state";

describe("createQueryState", () => {
  it("reads initial value from search params", () => {
    window.history.replaceState(null, "", "?test=foo");

    const Consumer = () => {
      const [val] = createQueryState("test", parseAsString);
      return <span data-testid="value">{val() ?? "null"}</span>;
    };

    const { getByTestId } = render(() => (
      <QueryStateAdapter>
        <Consumer />
      </QueryStateAdapter>
    ));

    expect(getByTestId("value").textContent).toBe("foo");
  });
});`}
      />

      <h3 class="text-lg font-semibold text-white">Test coverage</h3>
      <div class="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-700 text-left">
              <th class="p-3 font-medium text-zinc-300">Test file</th>
              <th class="p-3 font-medium text-zinc-300">Coverage</th>
            </tr>
          </thead>
          <tbody class="text-zinc-400">
            <tr class="border-b border-zinc-800">
              <td class="p-3">useQueryState.test.tsx</td>
              <td class="p-3">createQueryState, parsers, URL sync</td>
            </tr>
            <tr class="border-b border-zinc-800">
              <td class="p-3">useQueryStates.test.tsx</td>
              <td class="p-3">createQueryStates, partial updates, urlKeys</td>
            </tr>
            <tr class="border-b border-zinc-800">
              <td class="p-3">parsers.test.ts</td>
              <td class="p-3">Built-in parsers, withDefault</td>
            </tr>
            <tr>
              <td class="p-3">api.test.ts</td>
              <td class="p-3">Package exports</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6">
        <button
          type="button"
          onClick={runTests}
          disabled={running()}
          class="rounded-lg bg-amber-500 px-4 py-2 font-medium text-zinc-950 transition hover:bg-amber-400 disabled:opacity-50"
        >
          {running() ? "Running..." : "View test info"}
        </button>
        {testOutput() && (
          <pre class="mt-4 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-300">
            {testOutput()}
          </pre>
        )}
      </div>
    </Section>
  );
}
