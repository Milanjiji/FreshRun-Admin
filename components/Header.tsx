"use client";

import React, { useEffect, useState } from "react";
import { Search, Bell, HelpCircle, ChevronDown, Sun, Moon } from "lucide-react";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-surface/80 px-8 backdrop-blur-md">
      {/* Search Bar */}
      <div className="flex w-96 items-center gap-2 rounded-xl bg-primary/5 px-4 py-2 border border-border focus-within:border-primary transition-all">
        <Search className="h-4 w-4 text-muted" />
        <input 
          type="text" 
          placeholder="Search for orders, users or products..." 
          className="w-full bg-transparent text-sm outline-none text-foreground placeholder:text-muted/50"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <button className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground transition-colors">
          <HelpCircle className="h-4 w-4" />
          Help
        </button>

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="rounded-full p-2 text-muted hover:bg-background hover:text-foreground transition-colors"
          aria-label="Toggle Theme"
        >
          {mounted ? (
            theme === "dark" ? <Sun className="h-5 w-5 text-primary" /> : <Moon className="h-5 w-5" />
          ) : (
            <div className="h-5 w-5" /> // Skeleton space during SSR/hydration
          )}
        </button>
        
        <button className="relative rounded-full p-2 hover:bg-background transition-colors">
          <Bell className="h-5 w-5 text-muted" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 border-2 border-surface" />
        </button>

        <div className="flex items-center gap-3 border-l border-border pl-6">
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">Milan Admin</p>
            <p className="text-[10px] text-muted">milan@freshrun.com</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
            <span className="text-sm font-bold text-primary">M</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted" />
        </div>
      </div>
    </header>
  );
}
