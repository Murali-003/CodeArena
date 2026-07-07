import { useState, useEffect } from "react";
import { Search, Bell, Zap, Shield, UserCheck, Sun, Moon } from "lucide-react";
import { User } from "../types";

interface HeaderProps {
  activeUser: User | null;
  onUserSwitch: (user: User) => void;
  onSearchQueryChange?: (query: string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export default function Header({
  activeUser,
  onUserSwitch,
  onSearchQueryChange,
  theme,
  onToggleTheme
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [systemLatency, setSystemLatency] = useState(24);

  // Simulate slight fluctuations in system latency
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemLatency(prev => {
        const diff = Math.floor(Math.random() * 5) - 2;
        const next = prev + diff;
        return Math.max(12, Math.min(next, 48));
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 px-6 flex items-center justify-between shrink-0 relative transition-colors duration-200">
      {/* Search Bar */}
      <div className="flex items-center space-x-3 w-96 relative">
        <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Quick search problems, categories or keys..."
          onChange={(e) => onSearchQueryChange && onSearchQueryChange(e.target.value)}
          className="w-full bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-800 focus:border-zinc-450 dark:focus:border-zinc-700 focus:outline-none rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 font-sans tracking-wide transition-all"
        />
      </div>

      {/* Stats & Actions */}
      <div className="flex items-center space-x-4">
        {/* API Gateway Status */}
        <div className="hidden lg:flex items-center space-x-3.5 font-mono text-[10px] text-zinc-500 dark:text-zinc-400 border-r border-zinc-250 dark:border-zinc-900 pr-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-zinc-600 dark:text-zinc-300">API: ONLINE</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>{systemLatency}ms</span>
          </div>
        </div>

        {/* Active User Badge */}
        <div className="flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-200 font-mono">
          <UserCheck className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
          <span className="font-semibold text-zinc-500 dark:text-zinc-300">Logged in as:</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold truncate max-w-[120px]">{activeUser?.username}</span>
          {activeUser?.role === "ADMIN" && (
            <span className="text-[9px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded font-bold tracking-wider">ADMIN</span>
          )}
        </div>

        {/* Dark/Light mode toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 bg-zinc-100 dark:bg-zinc-900/30 hover:bg-zinc-200 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all cursor-pointer flex items-center justify-center shrink-0"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-500 animate-pulse" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* Notifications Mock */}
        <button className="p-2 bg-zinc-100 dark:bg-zinc-900/30 hover:bg-zinc-200 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
        </button>
      </div>
    </header>
  );
}
