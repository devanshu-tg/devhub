"use client";

import { Search, Bell, User, Command, Sun, Moon, LogOut, Bookmark, BarChart3, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import AuthModal from "@/components/ui/AuthModal";
import toast from "react-hot-toast";

export default function Header() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, profile, loading, signOut } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debug telemetry removed - was causing console errors

  // Close user menu when clicking outside - use click (not mousedown) so button onClick fires first
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isInsideMenu = userMenuRef.current && userMenuRef.current.contains(target);
      
      if (!isInsideMenu) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent mousedown handler from closing menu first
    
    setUserMenuOpen(false);
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const handleNavigate = (e: React.MouseEvent, path: string) => {
    e.stopPropagation(); // Prevent mousedown handler from closing menu first
    setUserMenuOpen(false);
    router.push(path);
  };
  
  const handleMenuItemClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation(); // Prevent mousedown handler from closing menu first
    action();
  };

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      <header className="h-16 bg-themed-secondary/50 backdrop-blur-md border-b border-themed flex items-center justify-between px-4 lg:px-6">
        {/* Spacer for mobile menu button */}
        <div className="w-10 lg:hidden" />
        
        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-4 lg:mx-0">
          <div 
            className={`
              relative flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl
              bg-themed-tertiary/50 border transition-all duration-200
              ${searchFocused 
                ? 'border-tiger-orange shadow-lg shadow-tiger-orange/10' 
                : 'border-themed hover:border-themed'}
            `}
          >
            <Search className="w-4 h-4 text-themed-muted flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 bg-transparent text-sm text-themed placeholder:text-themed-muted outline-none min-w-0"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <div className="hidden sm:flex items-center gap-1 text-themed-muted">
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-themed-tertiary rounded border border-themed">
                <Command className="w-3 h-3 inline" />
              </kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-themed-tertiary rounded border border-themed">
                K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="relative p-2 rounded-lg text-themed-secondary hover:text-themed hover:bg-themed-tertiary transition-all"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>

          {/* Notifications - only show when logged in */}
          {user && (
            <button className="relative p-2 rounded-lg text-themed-secondary hover:text-themed hover:bg-themed-tertiary transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-tiger-orange rounded-full"></span>
            </button>
          )}

          {/* User section */}
          {loading ? (
            // Loading state
            <div className="w-8 h-8 rounded-lg bg-themed-tertiary animate-pulse" />
          ) : user ? (
            // Logged in - show user menu
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                }}
                className="flex items-center gap-2 lg:gap-3 p-1.5 lg:pr-3 rounded-xl hover:bg-themed-tertiary transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tiger-orange to-tiger-orange-dark flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <span className="hidden lg:block text-sm font-medium text-themed-secondary">{displayName}</span>
                <ChevronDown className={`hidden lg:block w-4 h-4 text-themed-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown menu */}
              {userMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-themed-secondary border border-themed shadow-xl py-2 z-50 animate-fade-in"
                  onClick={(e) => { e.stopPropagation(); }}
                  onMouseDown={(e) => { e.stopPropagation(); }}
                >
                  {/* User info */}
                  <div className="px-4 py-2 border-b border-themed">
                    <p className="text-sm font-medium text-themed">{displayName}</p>
                    <p className="text-xs text-themed-muted truncate">{user.email}</p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <button 
                      onMouseDown={(e) => { e.stopPropagation(); }}
                      onClick={(e) => { handleNavigate(e, "/bookmarks"); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-themed-secondary hover:bg-themed-tertiary hover:text-themed transition-all cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4" />
                      My Bookmarks
                    </button>
                    <button 
                      onMouseDown={(e) => { e.stopPropagation(); }}
                      onClick={(e) => { handleMenuItemClick(e, () => toast("Coming soon!", { icon: "🚧" })); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-themed-secondary hover:bg-themed-tertiary hover:text-themed transition-all cursor-pointer"
                    >
                      <BarChart3 className="w-4 h-4" />
                      My Progress
                    </button>
                  </div>

                  {/* Sign out */}
                  <div className="border-t border-themed pt-1 mt-1">
                    <button 
                      onMouseDown={(e) => { e.stopPropagation(); }}
                      onClick={(e) => { handleSignOut(e); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Not logged in - show login button
            <button 
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-tiger-orange text-white font-medium hover:bg-tiger-orange-dark transition-all"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </>
  );
}
