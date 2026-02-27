import type { JSX } from "solid-js";
import { QueryStateAdapter } from "solid-query-state";
import { Sidebar } from "./components/Sidebar";

interface AppProps {
    children?: JSX.Element;
}

export default function App(props: AppProps) {
    return (
        <QueryStateAdapter>
            <div class="min-h-screen bg-zinc-950 text-zinc-100">
                <Sidebar />
                <main class="lg:pl-64">{props.children}</main>
            </div>
        </QueryStateAdapter>
    );
}
