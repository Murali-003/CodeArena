import { useState, useEffect } from "react";
import AuthScreen from "./components/AuthScreen";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import ProblemsTab from "./components/ProblemsTab";
import ProblemDetail from "./components/ProblemDetail";
import LeaderboardTab from "./components/LeaderboardTab";
import ProfileTab from "./components/ProfileTab";
import SubmissionsTab from "./components/SubmissionsTab";
import StreakHeatmap from "./components/StreakHeatmap";
import AdminTab from "./components/AdminTab";
import { User } from "./types";
import { Flame, Calendar, Info, Shield, Trophy } from "lucide-react";

export default function App() {
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [appInitializing, setAppInitializing] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  // Initialize theme from localStorage on bootstrap
  useEffect(() => {
    const cachedTheme = localStorage.getItem("codearena_theme");
    // Default to dark mode for our premium experience
    const initialTheme = cachedTheme === "light" ? "light" : "dark";
    setTheme(initialTheme);
  }, []);

  // Sync theme with DOM and localStorage
  useEffect(() => {
    if (!theme) return;
    const root = window.document.documentElement;
    const body = window.document.body;
    if (theme === "dark") {
      root.classList.add("dark");
      body.classList.add("dark");
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
    }
    localStorage.setItem("codearena_theme", theme);
  }, [theme]);

  // Load user session from local storage on bootstrap
  useEffect(() => {
    const cached = localStorage.getItem("codearena_session_user");
    if (cached) {
      try {
        setActiveUser(JSON.parse(cached));
      } catch (e) {
        localStorage.removeItem("codearena_session_user");
      }
    }
    setAppInitializing(false);
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLoginSuccess = (user: User) => {
    setActiveUser(user);
    localStorage.setItem("codearena_session_user", JSON.stringify(user));
    setCurrentTab("dashboard");
    setSelectedProblemId(null);
  };

  const handleLogout = () => {
    setActiveUser(null);
    localStorage.removeItem("codearena_session_user");
    setCurrentTab("dashboard");
    setSelectedProblemId(null);
  };

  const handleUserSwitch = (user: User) => {
    setActiveUser(user);
    localStorage.setItem("codearena_session_user", JSON.stringify(user));
    // Keep tab, reload stats for new active user context
  };

  if (appInitializing) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex items-center justify-center font-mono text-xs text-zinc-500 dark:text-zinc-400">
        <span className="animate-pulse">Loading CodeArena Environment...</span>
      </div>
    );
  }

  // Not logged in -> Show Auth Screen
  if (!activeUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Helper to render current tab content
  const renderTabContent = () => {
    if (selectedProblemId !== null) {
      return (
        <ProblemDetail
          userId={activeUser.id}
          problemId={selectedProblemId}
          onBack={() => setSelectedProblemId(null)}
          onSubmissionSuccess={() => {
            // Callback if anything needs to reload on solution submit
          }}
        />
      );
    }

    switch (currentTab) {
      case "dashboard":
        return (
          <Dashboard
            userId={activeUser.id}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
            onSelectProblem={(id) => setSelectedProblemId(id)}
          />
        );
      case "problems":
        return (
          <ProblemsTab
            userId={activeUser.id}
            searchQuery={searchQuery}
            onSelectProblem={(id) => setSelectedProblemId(id)}
          />
        );
      case "submissions":
        return <SubmissionsTab userId={activeUser.id} />;
      case "leaderboard":
        return (
          <LeaderboardTab
            userId={activeUser.id}
            onNavigateToProblems={() => setCurrentTab("problems")}
          />
        );
      case "streak":
        return (
          <div className="space-y-6">
            <div className="bg-zinc-100 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 p-5 rounded-xl flex flex-col md:flex-row justify-between gap-5">
              <div className="space-y-1 max-w-2xl">
                <h3 className="text-sm font-bold font-mono text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                  Streak Evaluation Architecture
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  CodeArena evaluates consistency daily. Every successfully processed grading record is cataloged. Daily totals are indexed chronologically to calculate consecutive days streaks.
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 px-4 py-3 rounded-lg flex items-center gap-3 self-start font-mono text-xs">
                <Info className="w-4 h-4 text-blue-500 shrink-0" />
                <div className="text-[11px] text-zinc-500 leading-normal">
                  <strong>Expected Endpoint:</strong><br />
                  <code className="text-zinc-700 dark:text-zinc-300">GET /api/streak/user/{"{userId}"}</code>
                </div>
              </div>
            </div>

            {/* Mount contribution grid */}
            <StreakHeatmap userId={activeUser.id} />
          </div>
        );
      case "profile":
        return <ProfileTab userId={activeUser.id} />;
      case "admin":
        return activeUser.role === "ADMIN" ? (
          <AdminTab />
        ) : (
          <div className="p-8 text-center text-zinc-500 font-mono text-xs text-red-500">
            Access Denied: Insufficient permissions.
          </div>
        );
      default:
        return (
          <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 font-mono text-xs">
            Module under construction.
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-800 dark:text-zinc-200 overflow-hidden font-sans antialiased selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-zinc-900 dark:selection:text-white transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={selectedProblemId !== null ? "problems" : currentTab}
        onTabChange={(tab) => {
          setSelectedProblemId(null);
          setCurrentTab(tab);
        }}
        activeUser={activeUser}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header bar */}
        <Header
          activeUser={activeUser}
          onUserSwitch={handleUserSwitch}
          theme={theme || "dark"}
          onToggleTheme={handleToggleTheme}
          onSearchQueryChange={(query) => {
            setSearchQuery(query);
            // If user typing, jump to problems list
            if (query && currentTab !== "problems" && selectedProblemId === null) {
              setCurrentTab("problems");
            }
          }}
        />

        {/* Structured Dashboard Contents */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Render active module */}
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
