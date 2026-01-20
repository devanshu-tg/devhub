"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  Home, 
  Library, 
  MessageSquare, 
  Compass, 
  Sparkles,
  ExternalLink,
  Github,
  BookOpen,
  Menu,
  X,
  Bookmark,
  GraduationCap
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/components/AuthProvider";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Resource Wall", href: "/resources", icon: Library },
  { name: "AI Chat", href: "/chat", icon: MessageSquare },
  { name: "Pathfinder", href: "/pathfinder", icon: Compass },
];

const externalLinks = [
  { name: "TigerGraph Docs", href: "https://docs.tigergraph.com", icon: BookOpen },
  { name: "GitHub", href: "https://github.com/tigergraph", icon: Github },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-themed">
        <Link href="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tiger-orange to-tiger-orange-light flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg text-themed group-hover:text-tiger-orange transition-colors">
            DevHub
          </span>
        </Link>
        {/* Mobile close button */}
        <button 
          className="lg:hidden p-2 text-themed-muted hover:text-themed"
          onClick={() => setMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="mb-4">
          <p className="px-3 text-xs font-semibold text-themed-muted uppercase tracking-wider">
            Main
          </p>
        </div>
        
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-tiger-orange/10 text-tiger-orange"
                  : "text-themed-secondary hover:bg-themed-tertiary hover:text-themed"
              )}
            >
              <item.icon className={clsx(
                "w-5 h-5",
                isActive ? "text-tiger-orange" : "text-themed-muted"
              )} />
              {item.name}
              {item.name === "AI Chat" && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-tiger-orange/20 text-tiger-orange font-semibold">
                  AI
                </span>
              )}
            </Link>
          );
        })}

        {/* User Links Section - only shown when logged in */}
        {user && (
          <div className="pt-6 mt-6 border-t border-themed">
            <p className="px-3 mb-4 text-xs font-semibold text-themed-muted uppercase tracking-wider">
              My Stuff
            </p>
            <Link
              href="/my-learning"
              onClick={() => setMobileOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                pathname === "/my-learning"
                  ? "bg-tiger-orange/10 text-tiger-orange"
                  : "text-themed-secondary hover:bg-themed-tertiary hover:text-themed"
              )}
            >
              <GraduationCap className={clsx(
                "w-5 h-5",
                pathname === "/my-learning" ? "text-tiger-orange" : "text-themed-muted"
              )} />
              My Learning
            </Link>
            <Link
              href="/bookmarks"
              onClick={() => setMobileOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                pathname === "/bookmarks"
                  ? "bg-tiger-orange/10 text-tiger-orange"
                  : "text-themed-secondary hover:bg-themed-tertiary hover:text-themed"
              )}
            >
              <Bookmark className={clsx(
                "w-5 h-5",
                pathname === "/bookmarks" ? "text-tiger-orange" : "text-themed-muted"
              )} />
              My Bookmarks
            </Link>
          </div>
        )}

        {/* External Links Section */}
        <div className="pt-6 mt-6 border-t border-themed">
          <p className="px-3 mb-4 text-xs font-semibold text-themed-muted uppercase tracking-wider">
            Resources
          </p>
          {externalLinks.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-themed-secondary hover:bg-themed-tertiary hover:text-themed transition-all duration-200"
            >
              <item.icon className="w-5 h-5 text-themed-muted" />
              {item.name}
              <ExternalLink className="w-3 h-3 ml-auto text-themed-muted" />
            </a>
          ))}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-themed">
        <div className="p-4 rounded-xl bg-gradient-to-br from-tiger-orange/10 to-transparent border border-tiger-orange/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-tiger-orange" />
            <span className="text-sm font-semibold text-themed">GSQL AI Pro</span>
          </div>
          <p className="text-xs text-themed-secondary mb-3">
            Generate production-ready GSQL with AI
          </p>
          <span className="text-xs px-2 py-1 rounded-full bg-themed-tertiary text-themed-secondary">
            Coming Soon
          </span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-themed-secondary border border-themed text-themed"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={clsx(
        "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-themed-secondary border-r border-themed flex flex-col transform transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-themed-secondary border-r border-themed flex-col">
        {sidebarContent}
      </aside>
    </>
  );
}
