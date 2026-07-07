import { useState, useEffect } from "react";
import { Problem, Submission } from "../types";
import StreakHeatmap from "./StreakHeatmap";
import { LayoutDashboard, Compass, History, Trophy, Flame, Play, Terminal, HelpCircle, ArrowRight } from "lucide-react";

interface DashboardProps {
  userId: number;
  onNavigateToTab: (tab: string) => void;
  onSelectProblem: (problemId: number) => void;
}

import { api } from "../api";

export default function Dashboard({ userId, onNavigateToTab, onSelectProblem }: DashboardProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [recommendedProblems, setRecommendedProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      setError(null);
      try {
        const [subsData, probsData] = await Promise.all([
          api.get(`/api/submissions/user/${userId}`),
          api.get("/api/problems")
        ]);

        setSubmissions(subsData.content ?? subsData);
        // Select 3 random/first problems as recommended
        const probsList = Array.isArray(probsData) ? probsData : (probsData.content ?? []);
        setRecommendedProblems(probsList.slice(0, 3));
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred loading home logs.");
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [userId]);

  const getDifficultyColor = (diff: string) => {
    const d = (diff || "").toUpperCase();
    if (d === "EASY") return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/10 dark:border-emerald-500/20";
    if (d === "MEDIUM") return "text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/10 dark:border-amber-500/20";
    return "text-rose-600 dark:text-rose-400 bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/10 dark:border-rose-500/20";
  };

  const getStatusColor = (status: Submission["status"]) => {
    if (status === "ACCEPTED") return "text-emerald-600 dark:text-emerald-400 border-emerald-500/15 dark:border-emerald-500/25 bg-emerald-500/5";
    if (status === "RUNNING") return "text-blue-600 dark:text-blue-400 border-blue-500/15 dark:border-blue-500/25 bg-blue-500/5";
    return "text-rose-600 dark:text-rose-400 border-rose-500/15 dark:border-rose-500/25 bg-rose-500/5";
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl" />
          <div className="h-64 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Streak Activity Heatmap */}
      <section>
        <StreakHeatmap userId={userId} />
      </section>

      {/* Main split bento grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Coding Challenges */}
        <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 flex flex-col h-full min-h-0 overflow-hidden transition-colors duration-200 shadow-sm">
          <div className="flex items-center justify-between pb-3.5 border-b border-zinc-150 dark:border-zinc-900 mb-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-500" />
              Recommended Arenas
            </h3>
            <button
              onClick={() => onNavigateToTab("problems")}
              className="text-[11px] font-mono font-bold text-blue-600 hover:text-blue-500 dark:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-1 uppercase cursor-pointer"
            >
              <span>Repository</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {recommendedProblems.length === 0 ? (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">No recommended items cataloged.</p>
            ) : (
              recommendedProblems.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProblem(p.id)}
                  className="p-3 bg-zinc-50 hover:bg-zinc-100/80 dark:bg-zinc-900/20 dark:hover:bg-zinc-900/60 border border-zinc-150 dark:border-zinc-900 rounded-lg flex items-center justify-between cursor-pointer group transition-all"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {p.title}
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-850/60 rounded">
                      {p.category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs font-mono">
                    <span className={`text-[10px] tracking-wide font-semibold px-2 py-0.5 rounded border ${getDifficultyColor(p.difficulty)}`}>
                      {p.difficulty}
                    </span>
                    <Play className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent Solves Activity Timeline */}
        <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 flex flex-col h-full min-h-0 overflow-hidden transition-colors duration-200 shadow-sm">
          <div className="flex items-center justify-between pb-3.5 border-b border-zinc-150 dark:border-zinc-900 mb-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-500" />
              Your Recent Runs
            </h3>
            <button
              onClick={() => onNavigateToTab("submissions")}
              className="text-[11px] font-mono font-bold text-blue-600 hover:text-blue-500 dark:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-1 uppercase cursor-pointer"
            >
              <span>History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {submissions.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-center text-zinc-500 space-y-1.5">
                <Terminal className="w-5 h-5 text-zinc-400 dark:text-zinc-600" />
                <div className="text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">No recent evaluations</div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-600 max-w-xs font-sans">Solve recommended tasks to log evaluation results.</p>
              </div>
            ) : (
              submissions.slice(0, 3).map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-150 dark:border-zinc-900 rounded-lg flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      {sub.problemTitle || `Problem #${sub.problemId}`}
                    </h4>
                    <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 px-1 rounded">
                      {sub.language}
                    </span>
                  </div>

                  <div className="text-right font-mono text-[10px]">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getStatusColor(sub.status)}`}>
                      {sub.status}
                    </span>
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
