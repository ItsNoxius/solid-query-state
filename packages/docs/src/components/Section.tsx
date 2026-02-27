import type { JSX } from "solid-js";

interface SectionProps {
    title: string;
    children: JSX.Element;
}

export function Section(props: SectionProps) {
    return (
        <section class="px-6 py-12 lg:px-12">
            <div class="mx-auto max-w-3xl">
                <h2 class="mb-8 text-3xl font-bold text-white">{props.title}</h2>
                <div class="prose prose-invert max-w-none space-y-6 text-zinc-300">
                    {props.children}
                </div>
            </div>
        </section>
    );
}
