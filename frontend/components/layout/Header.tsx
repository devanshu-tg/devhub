"use client";

import { Search, Bell, User, Command } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-16 bg-dark-800/50 backdrop-blur-md border-b border-dark-600 flex items-center justify-between px-4 lg:px-6">
      {/* Spacer for mobile menu button */}
      <div className="w-10 lg:hidden" />
      
      {/* Search Bar */}
      <div className="flex-1 max-w-xl mx-4 lg:mx-0">
        <div 
          className={`
            relative flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl
            bg-dark-700/50 border transition-all duration-200
            ${searchFocused 
              ? 'border-tiger-orange shadow-lg shadow-tiger-orange/10' 
              : 'border-dark-600 hover:border-dark-500'}
          `}
        >
          <Search className="w-4 h-4 text-dark-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 bg-transparent text-sm text-white placeholder-dark-400 outline-none min-w-0"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <div className="hidden sm:flex items-center gap-1 text-dark-500">
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-dark-600 rounded border border-dark-500">
              <Command className="w-3 h-3 inline" />
            </kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-dark-600 rounded border border-dark-500">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700 transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-tiger-orange rounded-full"></span>
        </button>

        {/* User menu */}
        <button className="flex items-center gap-2 lg:gap-3 p-1.5 lg:pr-3 rounded-xl hover:bg-dark-700 transition-all">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tiger-orange to-tiger-orange-dark flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="hidden lg:block text-sm font-medium text-dark-200">Developer</span>
        </button>
      </div>
    </header>
  );
}
