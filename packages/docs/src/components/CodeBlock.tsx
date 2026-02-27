import { createMemo } from "solid-js";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-bash";
import "prismjs/themes/prism-tomorrow.css";

interface CodeBlockProps {
    code: string;
    language?: string;
}

export function CodeBlock(props: CodeBlockProps) {
    const lang = () => props.language ?? "typescript";
    const grammar = () => {
        const l = lang();
        if (l === "tsx" || l === "typescript" || l === "ts") return Prism.languages.typescript;
        if (l === "bash" || l === "shell" || l === "sh") return Prism.languages.bash;
        return Prism.languages.typescript;
    };

    const highlighted = createMemo((): string => {
        const code = props.code;
        const g = grammar();
        const l = lang();
        if (!g) {
            return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
        try {
            return Prism.highlight(code, g, l) as string;
        } catch {
            return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
    });

    return (
        <pre class="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm">
            <code class={`language-${lang()}`} innerHTML={highlighted()} />
        </pre>
    );
}
