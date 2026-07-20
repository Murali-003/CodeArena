import { useState, useEffect } from "react";
import { User, Submission, LeaderboardUser } from "../types";
import { User2, Calendar, Award, Code, CheckCircle, ShieldAlert, BookOpen, Clock } from "lucide-react";
import { motion } from "motion/react";
import { api } from "../api";

interface ProfileTabProps {
  userId: number;
}

export default function ProfileTab({ userId }: ProfileTabProps) {
  const [profileData, setProfileData] = useState<LeaderboardUser | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const subsData = await api.get(`/api/submissions/user/${userId}`);
        setSubmissions(Array.isArray(subsData) ? subsData : (subsData.content ?? []));

        try {
          const userData = await api.get(`/api/leaderboard/user/${userId}`);
          setProfileData(userData);
        } catch (userErr: any) {
          if (userErr.status === 404) {
            setProfileData({
              userId,
              username: "demo_guest",
              problemsSolved: 0,
              accuracy: 0,
              rankPosition: 0
            });
          } else {
            throw userErr;
          }
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl" />
          <div className="h-32 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl" />
          <div className="h-32 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Profile Loading Mismatch</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">{error}</p>
      </div>
    );
  }

  // Calculate difficulty splits
  const solvedSubmissions = submissions.filter((s) => s.status === "ACCEPTED");
  const uniqueSolvedProblemIds = Array.from(new Set(solvedSubmissions.map((s) => s.problemId)));

  let easySolved = 0;
  let mediumSolved = 0;
  let hardSolved = 0;

  uniqueSolvedProblemIds.forEach((id) => {
    if (id === 1 || id === 2) easySolved++;
    else if (id === 3 || id === 4 || id === 5) mediumSolved++;
    else hardSolved++;
  });

  const totalEasyCount = 2;
  const totalMediumCount = 3;
  const totalHardCount = 1;

  // Language stats
  const langCounts: Record<string, number> = {};
  submissions.forEach((sub) => {
    langCounts[sub.language] = (langCounts[sub.language] || 0) + 1;
  });

  const getAccuracyColor = (pct: number) => {
    if (pct >= 80) return "text-emerald-500 dark:text-emerald-400";
    if (pct >= 50) return "text-indigo-500 dark:text-indigo-400";
    if (pct > 0) return "text-amber-500 dark:text-amber-400";
    return "text-zinc-500";
  };

  const isTop3Rank = profileData?.rankPosition && profileData.rankPosition >= 1 && profileData.rankPosition <= 3;

  return (
    <div className="space-y-6">
      {/* Coder Card Profile with Staggered Entrance */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-white dark:bg-[#0f172a] border border-zinc-200/90 dark:border-slate-800/80 rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm transition-all duration-200 hover:shadow-md"
      >
        {/* Decorative Ambient Background Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Profile Avatar with Rotating Glowing Ring */}
        <div className="relative shrink-0 flex items-center justify-center group">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60 blur-sm animate-spin-slow group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative w-20 h-20 rounded-xl bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 flex items-center justify-center text-indigo-500 shadow-inner">
            <User2 className="w-10 h-10" />
          </div>
        </div>

        {/* Main Details */}
        <div className="flex-1 text-center md:text-left space-y-2 min-w-0 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 font-mono tracking-tight flex items-center justify-center md:justify-start gap-2">
                {profileData?.username || "demo_coder"}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-slate-400 font-mono mt-0.5">
                MOCK_USER_ID: <span className="text-zinc-700 dark:text-zinc-300">{userId}</span>
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-md uppercase tracking-wide">
                Active Solved
              </span>
              <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-slate-400 bg-zinc-100 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700/60 px-2.5 py-1 rounded-md uppercase tracking-wide">
                Demo Session
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 pt-2 text-xs font-mono text-zinc-500 dark:text-slate-400 border-t border-zinc-150 dark:border-slate-800/60">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400 dark:text-slate-500" />
              <span>Session Logged: <span className="text-zinc-800 dark:text-zinc-200">Live Today</span></span>
            </div>

            {/* Prominent Global Rank Badge with Trophy Gold Glow */}
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>
                Global Rank:{" "}
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded-full border text-xs transition-all ${
                    isTop3Rank
                      ? "text-yellow-400 bg-yellow-500/15 border-yellow-500/30 shadow-[0_0_12px_rgba(234,179,8,0.35)] animate-pulse"
                      : "text-yellow-600 dark:text-yellow-500"
                  }`}
                >
                  #{profileData?.rankPosition || "N/A"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Breakdown Bento Grid with Staggered Entrance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Algorithmic Accuracy */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
          className="bg-white dark:bg-[#0f172a] border border-zinc-200/90 dark:border-slate-800/80 rounded-xl p-5 space-y-4 shadow-sm hover:border-indigo-500/30 transition-all duration-200"
        >
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <CheckCircle className="w-4 h-4 text-indigo-500" />
            Evaluation Accuracy
          </div>
          <div className="space-y-1.5 font-mono">
            <div className={`text-4xl font-extrabold tracking-tight tabular-nums ${getAccuracyColor(profileData?.accuracy || 0)}`}>
              {profileData?.accuracy || 0.0}%
            </div>
            <p className="text-xs text-zinc-500 dark:text-slate-400 font-sans leading-relaxed">
              Calculated dynamically as <span className="text-zinc-700 dark:text-zinc-300 font-mono">accepted / total submissions</span>. Strive for high accuracy on first submissions.
            </p>
          </div>
        </motion.div>

        {/* Card 2: Language Footprint */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
          className="bg-white dark:bg-[#0f172a] border border-zinc-200/90 dark:border-slate-800/80 rounded-xl p-5 space-y-4 shadow-sm hover:border-indigo-500/30 transition-all duration-200"
        >
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <Code className="w-4 h-4 text-indigo-500" />
            Language Footprint
          </div>
          <div className="space-y-3 font-mono text-xs">
            {Object.keys(langCounts).length === 0 ? (
              <p className="text-xs text-zinc-500 dark:text-slate-400 font-sans">
                No languages compiled yet. Code editor solves will record language distribution metrics here.
              </p>
            ) : (
              Object.entries(langCounts).map(([lang, count]) => {
                const targetPct = Math.min(100, (count / submissions.length) * 100);
                return (
                  <div key={lang} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-zinc-700 dark:text-zinc-200">{lang}</span>
                      <span className="text-zinc-500 dark:text-slate-400">{count} submissions</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden border border-zinc-200 dark:border-slate-800">
                      <motion.div
                        className="bg-indigo-500 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${targetPct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Card 3: Solved Challenges Progress Splits */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15, ease: "easeOut" }}
          className="bg-white dark:bg-[#0f172a] border border-zinc-200/90 dark:border-slate-800/80 rounded-xl p-5 space-y-4 shadow-sm hover:border-indigo-500/30 transition-all duration-200"
        >
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            Solved Challenges
          </div>
          <div className="space-y-3.5 font-mono text-xs">
            {/* Easy Progress */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Easy</span>
                <span className="text-zinc-600 dark:text-slate-300 tabular-nums">{easySolved} / {totalEasyCount}</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden border border-zinc-200 dark:border-slate-800">
                <motion.div
                  className="bg-emerald-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(easySolved / totalEasyCount) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Medium Progress */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-amber-600 dark:text-amber-400 font-bold">Medium</span>
                <span className="text-zinc-600 dark:text-slate-300 tabular-nums">{mediumSolved} / {totalMediumCount}</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden border border-zinc-200 dark:border-slate-800">
                <motion.div
                  className="bg-amber-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(mediumSolved / totalMediumCount) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Hard Progress */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-rose-600 dark:text-rose-400 font-bold">Hard</span>
                <span className="text-zinc-600 dark:text-slate-300 tabular-nums">{hardSolved} / {totalHardCount}</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden border border-zinc-200 dark:border-slate-800">
                <motion.div
                  className="bg-rose-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(hardSolved / totalHardCount) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Submissions Timeline with Hover Highlight & Left Accent */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2, ease: "easeOut" }}
        className="bg-white dark:bg-[#0f172a] border border-zinc-200/90 dark:border-slate-800/80 rounded-xl p-5 space-y-4 shadow-sm transition-all duration-200"
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-150 dark:border-slate-800/60 bg-zinc-50/70 dark:bg-slate-900/50 -mx-5 -mt-5 p-5 rounded-t-xl">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <Clock className="w-4 h-4 text-indigo-500" />
            Recent Log History
          </div>
          <span className="text-[10px] font-mono text-zinc-500 dark:text-slate-400 font-semibold">
            Recent: {submissions.slice(0, 5).length} logs
          </span>
        </div>

        {submissions.length === 0 ? (
          <p className="text-xs text-zinc-500 dark:text-slate-400 font-mono py-4 text-center">
            No compilation attempts recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-zinc-150 dark:divide-slate-800/40">
            {submissions.slice(0, 5).map((sub) => (
              <div
                key={sub.id}
                className="relative group py-3.5 px-3 rounded-lg flex items-center justify-between text-xs font-mono hover:bg-zinc-50 dark:hover:bg-slate-900/40 transition-all duration-200 overflow-hidden"
              >
                {/* Left accent bar animation on hover */}
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-r-full opacity-0 -translate-x-full group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />

                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      sub.status === "ACCEPTED" ? "bg-emerald-500 animate-pulse" : "bg-zinc-400 dark:bg-slate-600"
                    }`}
                  />
                  <div>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {sub.problemTitle || `Problem #${sub.problemId}`}
                    </span>
                    <span className="ml-2.5 text-zinc-500 dark:text-slate-400 text-[10px] uppercase tracking-wide bg-zinc-100 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700/60 px-1.5 py-0.5 rounded">
                      {sub.language}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`font-semibold ${
                      sub.status === "ACCEPTED"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {sub.status}
                  </span>
                  <div className="text-[10px] text-zinc-400 dark:text-slate-500 mt-0.5">
                    {new Date(sub.submittedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
