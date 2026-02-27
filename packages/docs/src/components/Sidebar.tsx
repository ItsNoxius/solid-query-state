import { A, useLocation } from "@solidjs/router";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/installation", label: "Installation" },
  { href: "/usage", label: "Usage" },
  { href: "/playground", label: "Playground" },
  { href: "/tests", label: "Test suite" },
] as const;

const playgroundDemos = [
  { href: "/playground/basic-counter", label: "Basic counter" },
  { href: "/playground/pagination", label: "Pagination" },
  { href: "/playground/hex-colors", label: "Hex colors" },
  { href: "/playground/tic-tac-toe", label: "Tic Tac Toe" },
] as const;

export function Sidebar() {
  const location = useLocation();

  const isActive = (href: string) => {
    const pathname = location.pathname;
    if (href === "/") return pathname === "/";
    if (href === "/playground") return pathname === "/playground" || pathname.startsWith("/playground/");
    return pathname.startsWith(href);
  };

  return (
    <aside class="fixed left-0 top-0 z-40 h-screen w-64 border-r border-zinc-800 bg-zinc-950">
      <div class="flex h-full flex-col">
        <A
          href="/"
          class="border-b border-zinc-800 px-6 py-5 font-semibold text-white hover:text-amber-400"
        >
          solid-query-state
        </A>
        <nav class="flex-1 overflow-y-auto px-4 py-4">
          <ul class="space-y-1">
            {navItems.map((item) => (
              <li>
                <A
                  href={item.href}
                  end={item.href === "/"}
                  class={`block rounded-lg px-3 py-2 text-sm transition ${
                    isActive(item.href)
                      ? "bg-zinc-800 text-amber-400"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                >
                  {item.label}
                </A>
              </li>
            ))}
          </ul>
          <div class="mt-6">
            <p class="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Demos
            </p>
            <ul class="space-y-1">
              {playgroundDemos.map((item) => (
                <li>
                  <A
                    href={item.href}
                    class="block rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-200"
                  >
                    {item.label}
                  </A>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
}
