"use client";

import { Search, Bell, User, Command, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

export default function Header() {
  const [searchFocused, setSearchFocused] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
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

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-themed-secondary hover:text-themed hover:bg-themed-tertiary transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-tiger-orange rounded-full"></span>
        </button>

        {/* User menu */}
        <button className="flex items-center gap-2 lg:gap-3 p-1.5 lg:pr-3 rounded-xl hover:bg-themed-tertiary transition-all">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tiger-orange to-tiger-orange-dark flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="hidden lg:block text-sm font-medium text-themed-secondary">Developer</span>
        </button>
      </div>
    </header>
  );
}
