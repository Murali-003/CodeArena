import { useState, useEffect } from "react";
import { User, Submission, LeaderboardUser } from "../types";
import { User2, Calendar, Award, Code, CheckCircle, ShieldAlert, BookOpen, Clock } from "lucide-react";

interface ProfileTabProps {
  userId: number;
}

import { api } from "../api";

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
        setSubmissions(subsData.content ?? subsData);

        try {
          const userData = await api.get(`/api/leaderboard/user/${userId}`);
          setProfileData(userData);
        } catch (userErr: any) {
          if (userErr.status === 404) {
            // Non-ranked user with 0 submissions is expected, create safe fallback container
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
  const solvedSubmissions = submissions.filter(s => s.status === "ACCEPTED");
  const uniqueSolvedProblemIds = Array.from(new Set(solvedSubmissions.map(s => s.problemId)));
  
  // Since we know problem difficulties (static or fetched), we look them up
  // Problem IDs: 1 (Easy), 2 (Easy), 3 (Medium), 4 (Medium), 5 (Medium)
  let easySolved = 0;
  let mediumSolved = 0;
  let hardSolved = 0;

  uniqueSolvedProblemIds.forEach(id => {
    if (id === 1 || id === 2) easySolved++;
    else if (id === 3 || id === 4 || id === 5) mediumSolved++;
    else hardSolved++;
  });

  const totalEasyCount = 2;
  const totalMediumCount = 3;
  const totalHardCount = 1; // placeholder for Hard

  // Language stats
  const langCounts: Record<string, number> = {};
  submissions.forEach(sub => {
    langCounts[sub.language] = (langCounts[sub.language] || 0) + 1;
  });

  const getAccuracyColor = (pct: number) => {
    if (pct >= 80) return "text-emerald-655 dark:text-emerald-400";
    if (pct >= 50) return "text-blue-600 dark:text-blue-400";
    if (pct > 0) return "text-amber-600 dark:text-amber-500";
    return "text-zinc-500";
  };

  return (
    <div className="space-y-6">
      {/* Coder Card Profile */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm transition-colors duration-200">
        {/* Decorative Grid Light */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Profile Avatar */}
        <div className="w-20 h-20 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-blue-500 shadow-inner shrink-0">
          <User2 className="w-10 h-10" />
        </div>

        {/* Main Details */}
        <div className="flex-1 text-center md:text-left space-y-2 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 font-mono tracking-tight flex items-center justify-center md:justify-start gap-2">
                {profileData?.username || "demo_coder"}
              </h2>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                MOCK_USER_ID: <span className="text-zinc-700 dark:text-zinc-400">{userId}</span>
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] font-mono font-bold text-blue-650 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md uppercase tracking-wide">
                Active Solved
              </span>
              <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-md uppercase tracking-wide">
                Demo Session
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 pt-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 border-t border-zinc-150 dark:border-zinc-900/60">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <span>Session Logged: <span className="text-zinc-850 dark:text-zinc-200">Live Today</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <span>Global Rank: <span className="text-yellow-600 dark:text-yellow-500 font-bold">#{profileData?.rankPosition || "N/A"}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Breakdown Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Algorithmic Accuracy Card */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 space-y-4 shadow-sm transition-colors duration-200">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
            <CheckCircle className="w-4 h-4 text-blue-500" />
            Evaluation Accuracy
          </div>
          <div className="space-y-1.5 font-mono">
            <div className={`text-4xl font-extrabold tracking-tight tabular-nums ${getAccuracyColor(profileData?.accuracy || 0)}`}>
              {profileData?.accuracy || 0.0}%
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed">
              Calculated dynamically as <span className="text-zinc-700 dark:text-zinc-400 font-mono">accepted / total submissions</span>. Strive for high accuracy on first submissions.
            </p>
          </div>
        </div>

        {/* Categories / Language footprint */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 space-y-4 shadow-sm transition-colors duration-200">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
            <Code className="w-4 h-4 text-blue-500" />
            Language Footprint
          </div>
          <div className="space-y-3 font-mono text-xs">
            {Object.keys(langCounts).length === 0 ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-450 font-sans">No languages compiled yet. Code editor solves will record language distribution metrics here.</p>
            ) : (
              Object.entries(langCounts).map(([lang, count]) => (
                <div key={lang} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-zinc-750 dark:text-zinc-300">{lang}</span>
                    <span className="text-zinc-500">{count} submissions</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
                    <div
                      className="bg-blue-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (count / submissions.length) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Problems Solved Progress Splits */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 space-y-4 shadow-sm transition-colors duration-200">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-blue-500" />
            Solved Challenges
          </div>
          <div className="space-y-3.5 font-mono text-xs">
            {/* Easy Progress */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-emerald-605 dark:text-emerald-400 font-bold">Easy</span>
                <span className="text-zinc-650 dark:text-zinc-400 tabular-nums">{easySolved} / {totalEasyCount}</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${(easySolved / totalEasyCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Medium Progress */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-amber-605 dark:text-amber-400 font-bold">Medium</span>
                <span className="text-zinc-650 dark:text-zinc-400 tabular-nums">{mediumSolved} / {totalMediumCount}</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${(mediumSolved / totalMediumCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Hard Progress */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-rose-605 dark:text-rose-400 font-bold">Hard</span>
                <span className="text-zinc-650 dark:text-zinc-400 tabular-nums">{hardSolved} / {totalHardCount}</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${(hardSolved / totalHardCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent submissions timeline */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 space-y-4 shadow-sm transition-colors duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-150 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/10 -mx-5 -mt-5 p-5 rounded-t-xl">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
            <Clock className="w-4 h-4 text-blue-500" />
            Recent Log History
          </div>
          <span className="text-[10px] font-mono text-zinc-500 font-semibold">Recent: {submissions.slice(0, 5).length} logs</span>
        </div>

        {submissions.length === 0 ? (
          <p className="text-xs text-zinc-500 font-mono py-4 text-center">No compilation attempts recorded yet.</p>
        ) : (
          <div className="divide-y divide-zinc-150 dark:divide-zinc-900/40">
            {submissions.slice(0, 5).map((sub) => (
              <div key={sub.id} className="py-3.5 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${sub.status === "ACCEPTED" ? "bg-emerald-500 animate-pulse" : "bg-zinc-400 dark:bg-zinc-600"}`} />
                  <div>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">{sub.problemTitle || `Problem #${sub.problemId}`}</span>
                    <span className="ml-2.5 text-zinc-500 text-[10px] uppercase tracking-wide bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/40 px-1.5 py-0.5 rounded">
                      {sub.language}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${sub.status === "ACCEPTED" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {sub.status}
                  </span>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {new Date(sub.submittedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
