import { A } from "@solidjs/router";

export function Hero() {
  return (
    <section class="px-6 py-24 lg:px-12">
      <div class="mx-auto max-w-4xl text-center">
        <h1 class="mb-6 text-5xl font-bold tracking-tight text-white md:text-6xl">
          solid-query-state
        </h1>
        <p class="mb-12 text-xl text-zinc-400">
          Type-safe search params state management for Solid.js
        </p>

        <div class="mb-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              id: "type-safe",
              title: "Type-safe",
              desc: "End-to-end type safety with parsers and serializers.",
            },
            {
              id: "simple",
              title: "Simple",
              desc: "A familiar createSignal-like API that syncs with the URL.",
            },
            {
              id: "batteries",
              title: "Batteries included",
              desc: "Built-in parsers for strings, numbers, booleans, dates, and more.",
            },
            {
              id: "history",
              title: "History controls",
              desc: "Replace or append to navigation history. Use Back/Forward to navigate state.",
            },
            {
              id: "related",
              title: "Related queries",
              desc: "createQueryStates to manage multiple keys at once.",
            },
            {
              id: "tested",
              title: "Tested & testable",
              desc: "Use the provided test adapter to test your components in isolation.",
            },
          ].map((item) => (
            <div
              class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-left transition hover:border-zinc-700"
            >
              <h3 class="mb-2 font-semibold text-white">{item.title}</h3>
              <p class="text-sm text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>

        <div class="flex flex-wrap justify-center gap-4">
          <A
            href="/installation"
            class="rounded-lg bg-amber-500 px-6 py-3 font-medium text-zinc-950 transition hover:bg-amber-400"
          >
            Get started
          </A>
          <A
            href="/playground"
            class="rounded-lg border border-zinc-700 px-6 py-3 font-medium transition hover:border-zinc-600 hover:bg-zinc-900"
          >
            Playground
          </A>
          <A
            href="/tests"
            class="rounded-lg border border-zinc-700 px-6 py-3 font-medium transition hover:border-zinc-600 hover:bg-zinc-900"
          >
            Test suite
          </A>
        </div>
      </div>
    </section>
  );
}
