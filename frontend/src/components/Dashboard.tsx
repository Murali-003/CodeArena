import { useState, useEffect } from "react";
import { Problem, Submission, StreakData, LeaderboardUser } from "../types";
import StreakHeatmap from "./StreakHeatmap";
import {
  Trophy,
  Flame,
  Play,
  Terminal,
  ArrowRight,
  Compass,
  History,
  CheckCircle2,
  BarChart3
} from "lucide-react";
import { api } from "../api";

interface DashboardProps {
  userId: number;
  onNavigateToTab: (tab: string) => void;
  onSelectProblem: (problemId: number) => void;
}

export default function Dashboard({ userId, onNavigateToTab, onSelectProblem }: DashboardProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [recommendedProblems, setRecommendedProblems] = useState<Problem[]>([]);
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [streakInfo, setStreakInfo] = useState<StreakData | null>(null);
  const [userRank, setUserRank] = useState<LeaderboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      setError(null);
      try {
        const [subsRes, probsRes, streakRes, rankRes] = await Promise.allSettled([
          api.get(`/api/submissions/user/${userId}`),
          api.get("/api/problems"),
          api.get(`/api/streak/user/${userId}`),
          api.get(`/api/leaderboard/user/${userId}`)
        ]);

        if (subsRes.status === "fulfilled") {
          const subsData = subsRes.value;
          setSubmissions(Array.isArray(subsData) ? subsData : (subsData?.content ?? []));
        }

        if (probsRes.status === "fulfilled") {
          const probsData = probsRes.value;
          const probsList = Array.isArray(probsData) ? probsData : (probsData?.content ?? []);
          setAllProblems(probsList);
          setRecommendedProblems(probsList.slice(0, 4));
        }

        if (streakRes.status === "fulfilled") {
          setStreakInfo(streakRes.value);
        }

        if (rankRes.status === "fulfilled") {
          setUserRank(rankRes.value);
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred loading dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [userId]);

  // Derived metrics for Stat Cards & Breakdown
  const solvedProblemIds = new Set(
    submissions.filter((s) => s.status === "ACCEPTED").map((s) => s.problemId)
  );
  const solvedCount = solvedProblemIds.size;
  const totalProblemsCount = allProblems.length;

  // Easy / Medium / Hard Breakdown
  const easyProblems = allProblems.filter((p) => (p.difficulty || "").toUpperCase() === "EASY");
  const mediumProblems = allProblems.filter((p) => (p.difficulty || "").toUpperCase() === "MEDIUM");
  const hardProblems = allProblems.filter((p) => (p.difficulty || "").toUpperCase() === "HARD");

  const solvedEasy = easyProblems.filter((p) => solvedProblemIds.has(p.id)).length;
  const solvedMedium = mediumProblems.filter((p) => solvedProblemIds.has(p.id)).length;
  const solvedHard = hardProblems.filter((p) => solvedProblemIds.has(p.id)).length;

  const totalSubmissions = submissions.length;
  const acceptedSubmissions = submissions.filter((s) => s.status === "ACCEPTED").length;
  const accuracy = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

  const currentStreak = streakInfo?.currentStreak ?? 0;
  const rankDisplay = userRank?.rankPosition ? `#${userRank.rankPosition}` : "N/A";

  const getDifficultyPill = (diff: string) => {
    const d = (diff || "").toUpperCase();
    if (d === "EASY") {
      return "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide";
    }
    if (d === "MEDIUM") {
      return "text-amber-700 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide";
    }
    return "text-rose-700 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/25 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide";
  };

  const getStatusBadge = (status: Submission["status"]) => {
    if (status === "ACCEPTED") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          ACCEPTED
        </span>
      );
    }
    if (status === "RUNNING") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full animate-pulse">
          RUNNING
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white dark:bg-slate-900/60 border border-zinc-200 dark:border-slate-800/80 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-white dark:bg-slate-900/60 border border-zinc-200 dark:border-slate-800/80 rounded-xl lg:col-span-1" />
          <div className="h-64 bg-white dark:bg-slate-900/60 border border-zinc-200 dark:border-slate-800/80 rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-3">
        <h3 className="text-sm font-semibold text-rose-500">Unable to load dashboard</h3>
        <p className="text-xs text-zinc-500 dark:text-slate-400 max-w-sm mx-auto">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards - Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Problems Solved */}
        <div className="bg-white dark:bg-[#0f172a] border border-zinc-200/90 dark:border-slate-800/80 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-200 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-blue-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-zinc-500 dark:text-slate-400 uppercase tracking-wider">
              Problems Solved
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-white font-mono tracking-tight">
              {solvedCount}
            </span>
            <span className="text-xs font-mono text-zinc-400 dark:text-slate-500">
              / {totalProblemsCount} Total
            </span>
          </div>
          <div className="mt-3 w-full bg-zinc-100 dark:bg-slate-800/60 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${totalProblemsCount > 0 ? (solvedCount / totalProblemsCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Card 2: Current Streak */}
        <div className="bg-white dark:bg-[#0f172a] border border-zinc-200/90 dark:border-slate-800/80 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-amber-500/30 dark:hover:border-amber-500/30 transition-all duration-200 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-zinc-500 dark:text-slate-400 uppercase tracking-wider">
              Current Streak
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-white font-mono tracking-tight">
              {currentStreak}
            </span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 font-mono">
              Days active 🔥
            </span>
          </div>
          <p className="mt-3 text-[11px] font-mono text-zinc-400 dark:text-slate-500">
            Keep submitting daily to build streak!
          </p>
        </div>

        {/* Card 3: Arena Rank */}
        <div className="bg-white dark:bg-[#0f172a] border border-zinc-200/90 dark:border-slate-800/80 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-yellow-500/30 dark:hover:border-yellow-500/30 transition-all duration-200 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-500/10 to-amber-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-zinc-500 dark:text-slate-400 uppercase tracking-wider">
              Arena Standing
            </span>
            <div className="p-2.5 rounded-xl bg-yellow-500/10 dark:bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-white font-mono tracking-tight">
              {rankDisplay}
            </span>
          </div>
          <p className="mt-3 text-[11px] font-mono text-zinc-400 dark:text-slate-500">
            {userRank ? `Contender • Accuracy: ${userRank.accuracy}%` : "Solve tasks to join leaderboard"}
          </p>
        </div>

        {/* Card 4: Submissions */}
        <div className="bg-white dark:bg-[#0f172a] border border-zinc-200/90 dark:border-slate-800/80 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all duration-200 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-zinc-500 dark:text-slate-400 uppercase tracking-wider">
              Total Runs
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Terminal className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-white font-mono tracking-tight">
              {totalSubmissions}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
              {accuracy}% Acc.
            </span>
          </div>
          <p className="mt-3 text-[11px] font-mono text-zinc-400 dark:text-slate-500">
            {acceptedSubmissions} Accepted evaluations
          </p>
        </div>
      </div>

      {/* Progress Breakdown & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Difficulty Breakdown Visualizer */}
        <div className="bg-white dark:bg-[#0f172a] border border-zinc-200/90 dark:border-slate-800/80 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-150 dark:border-slate-800/60 mb-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                Difficulty Breakdown
              </h3>
              <span className="text-[11px] font-mono text-zinc-400 dark:text-slate-400">
                {solvedCount} Solved
              </span>
            </div>

            <div className="space-y-4 font-mono">
              {/* Easy Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Easy
                  </span>
                  <span className="text-zinc-500 dark:text-slate-400 text-[11px]">
                    <strong className="text-zinc-800 dark:text-zinc-200">{solvedEasy}</strong> / {easyProblems.length}
                  </span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-slate-800/60 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${easyProblems.length > 0 ? (solvedEasy / easyProblems.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Medium Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Medium
                  </span>
                  <span className="text-zinc-500 dark:text-slate-400 text-[11px]">
                    <strong className="text-zinc-800 dark:text-zinc-200">{solvedMedium}</strong> / {mediumProblems.length}
                  </span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-slate-800/60 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${mediumProblems.length > 0 ? (solvedMedium / mediumProblems.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Hard Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Hard
                  </span>
                  <span className="text-zinc-500 dark:text-slate-400 text-[11px]">
                    <strong className="text-zinc-800 dark:text-zinc-200">{solvedHard}</strong> / {hardProblems.length}
                  </span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-slate-800/60 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${hardProblems.length > 0 ? (solvedHard / hardProblems.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab("problems")}
            className="mt-6 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span>Explore Problem Archive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Streak & Contribution Activity Component */}
        <div className="lg:col-span-2">
          <StreakHeatmap userId={userId} />
        </div>
      </div>

      {/* Split Bento Grid: Recommended Problems & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Coding Challenges */}
        <section className="bg-white dark:bg-[#0f172a] border border-zinc-200/90 dark:border-slate-800/80 rounded-xl p-5 flex flex-col h-full min-h-0 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between pb-3.5 border-b border-zinc-150 dark:border-slate-800/60 mb-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-500" />
              Recommended Arenas
            </h3>
            <button
              onClick={() => onNavigateToTab("problems")}
              className="text-[11px] font-mono font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors flex items-center gap-1 uppercase cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {recommendedProblems.length === 0 ? (
              <p className="text-xs text-zinc-400 dark:text-slate-500 font-mono">No recommended challenges available.</p>
            ) : (
              recommendedProblems.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProblem(p.id)}
                  className="p-3.5 bg-zinc-50/70 hover:bg-zinc-100/80 dark:bg-slate-900/40 dark:hover:bg-slate-800/50 border border-zinc-200/80 dark:border-slate-800/70 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 rounded-xl flex items-center justify-between cursor-pointer group transition-all duration-200 shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                      {p.title}
                      {solvedProblemIds.has(p.id) && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-500 dark:text-slate-400 bg-zinc-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-slate-700/60">
                        {p.category}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 dark:text-slate-500">
                        Acceptance: {p.acceptanceRate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={getDifficultyPill(p.difficulty)}>
                      {p.difficulty}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white text-zinc-400 dark:text-slate-400 transition-all">
                      <Play className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent Solves Activity Timeline */}
        <section className="bg-white dark:bg-[#0f172a] border border-zinc-200/90 dark:border-slate-800/80 rounded-xl p-5 flex flex-col h-full min-h-0 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between pb-3.5 border-b border-zinc-150 dark:border-slate-800/60 mb-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-500" />
              Your Recent Runs
            </h3>
            <button
              onClick={() => onNavigateToTab("submissions")}
              className="text-[11px] font-mono font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors flex items-center gap-1 uppercase cursor-pointer"
            >
              <span>Full History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {submissions.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-center text-zinc-500 space-y-1.5">
                <Terminal className="w-5 h-5 text-zinc-400 dark:text-slate-600" />
                <div className="text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-400 dark:text-slate-500">
                  No recent evaluations
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-slate-600 max-w-xs font-sans">
                  Solve recommended tasks to log evaluation results.
                </p>
              </div>
            ) : (
              submissions.slice(0, 4).map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 bg-zinc-50/70 dark:bg-slate-900/40 border border-zinc-200/80 dark:border-slate-800/70 rounded-xl flex items-center justify-between transition-colors"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {sub.problemTitle || `Problem #${sub.problemId}`}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-wider bg-zinc-200/60 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700/60 px-1.5 py-0.5 rounded">
                        {sub.language}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 dark:text-slate-500">
                        {new Date(sub.submittedAt).toLocaleDateString()} {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div>
                    {getStatusBadge(sub.status)}
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
