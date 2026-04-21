"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Command, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import { DevHubLogo, DevHubWordmark } from "@/components/ui/DevHubLogo";
import UserMenu from "@/components/layout/UserMenu";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Resources", href: "/resources" },
  { label: "AI Chat", href: "/chat" },
  { label: "Pathfinder", href: "/pathfinder" },
  { label: "My Learning", href: "/my-learning" },
  { label: "Events", href: "/events" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Shell() {
  const pathname = usePathname() ?? "/";
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-[color:var(--border)] backdrop-blur-md bg-[color:var(--paper)]/85">
      <div className="h-full max-w-[1260px] mx-auto px-5 lg:px-10 flex items-center gap-8">
        {/* Left — wordmark */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <DevHubLogo size={28} />
          <DevHubWordmark size={16} />
        </Link>

        {/* Center — nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-3 py-2 text-[13.5px] rounded-md transition-colors",
                  active
                    ? "text-[color:var(--ink)] font-medium"
                    : "text-[color:var(--fg-muted)] hover:text-[color:var(--ink)]",
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute left-3 right-3 -bottom-[17px] h-[2px] bg-[color:var(--accent)] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right — search + theme + bell + user */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[color:var(--bg-elev)] border border-[color:var(--border)] min-w-[220px]">
            <Search className="w-4 h-4 text-[color:var(--fg-subtle)]" />
            <input
              type="text"
              placeholder="Search…"
              className="flex-1 bg-transparent text-[13px] text-[color:var(--fg)] placeholder:text-[color:var(--fg-subtle)] outline-none"
            />
            <div className="flex items-center gap-1 text-[color:var(--fg-subtle)]">
              <kbd className="px-1.5 py-[1px] text-[10px] font-mono bg-[color:var(--bg-hover)] rounded border border-[color:var(--border)]">
                <Command className="w-3 h-3 inline" />
              </kbd>
              <kbd className="px-1.5 py-[1px] text-[10px] font-mono bg-[color:var(--bg-hover)] rounded border border-[color:var(--border)]">
                K
              </kbd>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[color:var(--fg-muted)] hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--ink)] transition"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {user ? (
            <button
              aria-label="Notifications"
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-[color:var(--fg-muted)] hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--ink)] transition"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[color:var(--accent)] rounded-full" />
            </button>
          ) : null}

          <UserMenu />
        </div>
      </div>
    </header>
  );
}
