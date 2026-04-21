"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BarChart3, ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/components/AuthProvider";
import AuthModal from "@/components/ui/AuthModal";
import { Avatar } from "@/components/ui/Avatar";

export default function UserMenu() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    try {
      await signOut();
      toast.success("Signed out");
      router.push("/");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-[color:var(--bg-hover)] animate-pulse" />;
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)] text-[13px] font-medium hover:opacity-90 transition"
        >
          <UserIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Sign in</span>
        </button>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </>
    );
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-[color:var(--bg-hover)] transition"
      >
        <Avatar name={displayName} size={32} />
        <ChevronDown
          className={`hidden lg:block w-4 h-4 text-[color:var(--fg-muted)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-60 rounded-lg bg-[color:var(--bg-elev)] border border-[color:var(--border)] shadow-soft py-2 z-50 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-2 border-b border-[color:var(--border)]">
            <p className="text-[13px] font-medium text-[color:var(--ink)]">{displayName}</p>
            <p className="text-[11.5px] font-mono text-[color:var(--fg-subtle)] truncate">{user.email}</p>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                setOpen(false);
                router.push("/bookmarks");
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[color:var(--fg-muted)] hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--ink)] transition text-left"
            >
              <Bookmark className="w-4 h-4" />
              My Bookmarks
            </button>
            <button
              onClick={() => {
                setOpen(false);
                router.push("/my-learning");
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[color:var(--fg-muted)] hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--ink)] transition text-left"
            >
              <BarChart3 className="w-4 h-4" />
              My Learning
            </button>
          </div>

          <div className="border-t border-[color:var(--border)] pt-1 mt-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-red-500 hover:bg-red-500/10 transition text-left"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
