import { LayoutDashboard, Code, History, Trophy, Calendar, User as UserIcon, LogOut, Terminal } from "lucide-react";
import { User } from "../types";
import { motion } from "motion/react";

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  activeUser: User | null;
  onLogout: () => void;
}

export default function Sidebar({ currentTab, onTabChange, activeUser, onLogout }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-500", activeBg: "bg-blue-50/80 dark:bg-blue-500/10", activeBorder: "border-blue-200 dark:border-blue-500/30", activeText: "text-blue-700 dark:text-blue-400" },
    { id: "problems", label: "Problems", icon: Code, color: "text-indigo-500", activeBg: "bg-indigo-50/80 dark:bg-indigo-500/10", activeBorder: "border-indigo-200 dark:border-indigo-500/30", activeText: "text-indigo-700 dark:text-indigo-400" },
    { id: "submissions", label: "Submissions", icon: History, color: "text-amber-500", activeBg: "bg-amber-50/80 dark:bg-amber-500/10", activeBorder: "border-amber-200 dark:border-amber-500/30", activeText: "text-amber-700 dark:text-amber-400" },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy, color: "text-yellow-500", activeBg: "bg-yellow-50/80 dark:bg-yellow-500/10", activeBorder: "border-yellow-200 dark:border-yellow-500/30", activeText: "text-yellow-700 dark:text-yellow-500" },
    { id: "streak", label: "Streak & Activity", icon: Calendar, color: "text-orange-500", activeBg: "bg-orange-50/80 dark:bg-orange-500/10", activeBorder: "border-orange-200 dark:border-orange-500/30", activeText: "text-orange-700 dark:text-orange-400" },
    { id: "profile", label: "Profile", icon: UserIcon, color: "text-pink-500", activeBg: "bg-pink-50/80 dark:bg-pink-500/10", activeBorder: "border-pink-200 dark:border-pink-500/30", activeText: "text-pink-700 dark:text-pink-400" }
  ];

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex flex-col h-full shrink-0 transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-900/60 flex items-center space-x-3">
        <div className="relative flex items-center justify-center">
          <span className="absolute -inset-1 rounded-xl bg-indigo-500/30 blur-md animate-pulse pointer-events-none" />
          <div className="relative p-2 rounded-lg text-white shadow-lg gradient-brand shadow-indigo-500/25">
            <Terminal className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h1 className="font-semibold text-lg tracking-tight flex items-center gap-1">
            <span className="text-zinc-900 dark:text-white">Code</span>
            <span className="gradient-text-brand font-bold">Arena</span>
          </h1>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono tracking-wider">PREMIUM v1.0</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 font-semibold tracking-wider uppercase px-3 mb-2">
          Navigation
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer ${
                isActive
                  ? `${item.activeText} font-semibold`
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/40"
              }`}
            >
              {/* Sliding Active Pill Background */}
              {isActive && (
                <motion.div
                  layoutId="sidebarActivePill"
                  className={`absolute inset-0 rounded-lg ${item.activeBg} border ${item.activeBorder} shadow-2xs`}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}

              {/* Hover Left Border Accent for Inactive Items */}
              {!isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-r-full opacity-0 -translate-x-full group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              )}

              <Icon className={`w-4 h-4 shrink-0 z-10 transition-colors ${isActive ? item.color : "text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-400"}`} />
              <span className="truncate z-10">{item.label}</span>
            </button>
          );
        })}

        {/* Admin Navigation */}
        {activeUser?.role === "ADMIN" && (
          <>
            <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 font-semibold tracking-wider uppercase px-3 mt-6 mb-2">
              Administration
            </div>
            <button
              onClick={() => onTabChange("admin")}
              className={`relative w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer ${
                currentTab === "admin"
                  ? "text-purple-700 dark:text-purple-400 font-semibold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-500/10"
              }`}
            >
              {currentTab === "admin" && (
                <motion.div
                  layoutId="sidebarActivePill"
                  className="absolute inset-0 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 shadow-2xs"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}

              {currentTab !== "admin" && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-purple-500 rounded-r-full opacity-0 -translate-x-full group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              )}

              <Terminal className={`w-4 h-4 shrink-0 z-10 ${currentTab === "admin" ? "text-purple-500" : "text-zinc-400 dark:text-zinc-500 group-hover:text-purple-400"}`} />
              <span className="truncate z-10">Admin Panel</span>
            </button>
          </>
        )}
      </nav>

      {/* User Session Info */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-900/80 space-y-3 bg-white dark:bg-zinc-950 transition-colors duration-200">
        <div className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-500/10 dark:to-purple-500/10 border border-indigo-100 dark:border-indigo-500/20 shadow-2xs hover:shadow-indigo-500/5 transition-all">
          {/* Animated online status ring around user avatar */}
          <div className="relative shrink-0 flex items-center justify-center">
            <span className="absolute -inset-0.5 rounded-full bg-emerald-500/40 animate-ping opacity-60" />
            <div className="relative w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono text-white font-bold gradient-brand shadow-[0_0_10px_rgba(16,185,129,0.3)] ring-2 ring-emerald-500/40">
              {activeUser?.username?.substring(0, 2).toUpperCase() || "U"}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate font-mono">
              {activeUser?.username || "Guest"}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono font-medium text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
                Online
              </span>
            </div>
          </div>
        </div>

        {/* Deliberate Exit Button Hover State */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono text-zinc-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 hover:shadow-[0_0_15px_rgba(244,63,94,0.15)] border border-transparent hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          <span className="font-semibold tracking-wider uppercase">Exit Arena</span>
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}