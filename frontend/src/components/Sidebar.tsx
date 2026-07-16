// import { LayoutDashboard, Code, History, Trophy, Calendar, User as UserIcon, LogOut, Terminal } from "lucide-react";
// import { User } from "../types";

// interface SidebarProps {
//   currentTab: string;
//   onTabChange: (tab: string) => void;
//   activeUser: User | null;
//   onLogout: () => void;
// }

// export default function Sidebar({ currentTab, onTabChange, activeUser, onLogout }: SidebarProps) {
//   const menuItems = [
//     { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
//     { id: "problems", label: "Problems", icon: Code },
//     { id: "submissions", label: "Submissions", icon: History },
//     { id: "leaderboard", label: "Leaderboard", icon: Trophy },
//     { id: "streak", label: "Streak & Activity", icon: Calendar },
//     { id: "profile", label: "Profile", icon: UserIcon }
//   ];

//   return (
//     <aside className="w-64 border-r border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex flex-col h-full shrink-0 transition-colors duration-200">
//       {/* Brand */}
//       <div className="p-6 border-b border-zinc-200 dark:border-zinc-900/60 flex items-center space-x-3">
//         <div className="p-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-500 rounded-md">
//           <Terminal className="w-5 h-5" />
//         </div>
//         <div>
//           <h1 className="font-display font-semibold text-lg tracking-tight text-zinc-900 dark:text-white flex items-center gap-1">
//             Code<span className="text-blue-500">Arena</span>
//           </h1>
//           <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono tracking-wider">PREMIUM v1.0</p>
//         </div>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
//         <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 font-semibold tracking-wider uppercase px-3 mb-2">
//           Navigation
//         </div>
//         {menuItems.map((item) => {
//           const Icon = item.icon;
//           const isActive = currentTab === item.id;
//           return (
//             <button
//               key={item.id}
//               onClick={() => onTabChange(item.id)}
//               className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
//                 isActive
//                   ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 shadow-sm"
//                   : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/40 border border-transparent"
//               }`}
//             >
//               <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-500" : "text-zinc-400 dark:text-zinc-500"}`} />
//               <span className="truncate">{item.label}</span>
//             </button>
//           );
//         })}

//         {/* Admin Navigation */}
//         {activeUser?.role === "ADMIN" && (
//           <>
//             <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 font-semibold tracking-wider uppercase px-3 mt-6 mb-2">
//               Administration
//             </div>
//             <button
//               onClick={() => onTabChange("admin")}
//               className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
//                 currentTab === "admin"
//                   ? "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 shadow-sm"
//                   : "text-zinc-500 dark:text-zinc-400 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 border border-transparent"
//               }`}
//             >
//               <Terminal className={`w-4 h-4 shrink-0 ${currentTab === "admin" ? "text-purple-500" : "text-zinc-400 dark:text-zinc-500"}`} />
//               <span className="truncate">Admin Panel</span>
//             </button>
//           </>
//         )}
//       </nav>

//       {/* User Session Info / Sandbox Indicator */}
//       <div className="p-4 border-t border-zinc-200 dark:border-zinc-900/80 space-y-3 bg-white dark:bg-zinc-950 transition-colors duration-200">
//         <div className="flex items-center space-x-2 px-2 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900">
//           <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold shrink-0">
//             {activeUser?.username?.substring(0, 2).toUpperCase() || "U"}
//           </div>
//           <div className="min-w-0 flex-1">
//             <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate font-mono">
//               {activeUser?.username || "Guest"}
//             </div>
//             <div className="flex items-center gap-1.5 mt-0.5">
//               <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
//               <span className="text-[9px] font-mono font-medium text-blue-600 dark:text-blue-400 tracking-wide uppercase">
//                 Demo Mode
//               </span>
//             </div>
//           </div>
//         </div>

//         <button
//           onClick={onLogout}
//           className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/5 transition-all border border-transparent hover:border-red-500/10"
//         >
//           <span className="font-semibold tracking-wider uppercase">Exit Arena</span>
//           <LogOut className="w-3.5 h-3.5" />
//         </button>
//       </div>
//     </aside>
//   );
// }

import { LayoutDashboard, Code, History, Trophy, Calendar, User as UserIcon, LogOut, Terminal } from "lucide-react";
import { User } from "../types";

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  activeUser: User | null;
  onLogout: () => void;
}

export default function Sidebar({ currentTab, onTabChange, activeUser, onLogout }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-500", activeBg: "bg-blue-50 dark:bg-blue-500/10", activeBorder: "border-blue-200 dark:border-blue-500/30", activeText: "text-blue-700 dark:text-blue-400" },
    { id: "problems", label: "Problems", icon: Code, color: "text-indigo-500", activeBg: "bg-indigo-50 dark:bg-indigo-500/10", activeBorder: "border-indigo-200 dark:border-indigo-500/30", activeText: "text-indigo-700 dark:text-indigo-400" },
    { id: "submissions", label: "Submissions", icon: History, color: "text-amber-500", activeBg: "bg-amber-50 dark:bg-amber-500/10", activeBorder: "border-amber-200 dark:border-amber-500/30", activeText: "text-amber-700 dark:text-amber-400" },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy, color: "text-yellow-500", activeBg: "bg-yellow-50 dark:bg-yellow-500/10", activeBorder: "border-yellow-200 dark:border-yellow-500/30", activeText: "text-yellow-700 dark:text-yellow-500" },
    { id: "streak", label: "Streak & Activity", icon: Calendar, color: "text-orange-500", activeBg: "bg-orange-50 dark:bg-orange-500/10", activeBorder: "border-orange-200 dark:border-orange-500/30", activeText: "text-orange-700 dark:text-orange-400" },
    { id: "profile", label: "Profile", icon: UserIcon, color: "text-pink-500", activeBg: "bg-pink-50 dark:bg-pink-500/10", activeBorder: "border-pink-200 dark:border-pink-500/30", activeText: "text-pink-700 dark:text-pink-400" }
  ];

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex flex-col h-full shrink-0 transition-colors duration-200">
      {/* Brand */}
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-900/60 flex items-center space-x-3">
        <div className="p-2 rounded-lg text-white shadow-md gradient-brand">
          <Terminal className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-display font-semibold text-lg tracking-tight flex items-center gap-1">
            <span className="text-zinc-900 dark:text-white">Code</span>
            <span className="gradient-text-brand font-bold">Arena</span>
          </h1>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono tracking-wider">PREMIUM v1.0</p>
        </div>
      </div>

      {/* Navigation */}
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
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? `${item.activeBg} ${item.activeText} border ${item.activeBorder} shadow-sm`
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/40 border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? item.color : "text-zinc-400 dark:text-zinc-500"}`} />
              <span className="truncate">{item.label}</span>
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
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                currentTab === "admin"
                  ? "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 border border-transparent"
              }`}
            >
              <Terminal className={`w-4 h-4 shrink-0 ${currentTab === "admin" ? "text-purple-500" : "text-zinc-400 dark:text-zinc-500"}`} />
              <span className="truncate">Admin Panel</span>
            </button>
          </>
        )}
      </nav>

      {/* User Session Info */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-900/80 space-y-3 bg-white dark:bg-zinc-950 transition-colors duration-200">
        <div className="flex items-center space-x-2 px-2 py-1.5 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 border border-indigo-100 dark:border-indigo-500/20">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono text-white font-bold shrink-0 gradient-brand">
            {activeUser?.username?.substring(0, 2).toUpperCase() || "U"}
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

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/5 transition-all border border-transparent hover:border-red-500/10"
        >
          <span className="font-semibold tracking-wider uppercase">Exit Arena</span>
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}