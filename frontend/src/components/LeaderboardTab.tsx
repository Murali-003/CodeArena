import { useState, useEffect } from "react";
import { LeaderboardUser } from "../types";
import { Trophy, Medal, Star, ShieldAlert, Award, Swords } from "lucide-react";
import { motion } from "motion/react";
import { api } from "../api";

interface LeaderboardTabProps {
  userId: number;
  onNavigateToProblems: () => void;
}

export default function LeaderboardTab({ userId, onNavigateToProblems }: LeaderboardTabProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardUser | null>(null);
  const [userRank404, setUserRank404] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);
      setUserRank404(false);
      try {
        const globalData = await api.get("/api/leaderboard");
        setLeaderboard(Array.isArray(globalData) ? globalData : (globalData.content ?? []));

        try {
          const userData = await api.get(`/api/leaderboard/user/${userId}`);
          setCurrentUserRank(userData);
        } catch (userErr: any) {
          if (userErr.status === 404) {
            setUserRank404(true);
            setCurrentUserRank(null);
          } else {
            console.warn("Failed to retrieve current user ranking metrics.", userErr);
          }
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [userId]);

  const getMedalIcon = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-7 h-7 rounded-full bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(234,179,8,0.4)] text-yellow-400">
          <Trophy className="w-4 h-4" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-7 h-7 rounded-full bg-slate-400/15 border border-slate-400/30 flex items-center justify-center shadow-[0_0_12px_rgba(148,163,184,0.3)] text-slate-300">
          <Medal className="w-4 h-4" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-7 h-7 rounded-full bg-amber-600/15 border border-amber-600/30 flex items-center justify-center shadow-[0_0_12px_rgba(217,119,6,0.3)] text-amber-500">
          <Award className="w-4 h-4" />
        </div>
      );
    }
    return (
      <span className="font-mono text-zinc-500 dark:text-slate-400 w-7 h-7 flex items-center justify-center text-xs font-bold">
        {rank}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-white dark:bg-slate-900/60 border border-zinc-200 dark:border-slate-800/80 rounded-xl" />
        <div className="bg-white dark:bg-slate-900/60 border border-zinc-200 dark:border-slate-800/80 rounded-xl overflow-hidden divide-y divide-zinc-200 dark:divide-slate-800">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-6 bg-zinc-200 dark:bg-slate-800 h-6 rounded-full" />
                <div className="w-28 bg-zinc-200 dark:bg-slate-800 h-4 rounded" />
              </div>
              <div className="w-20 bg-zinc-200 dark:bg-slate-800 h-4 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-3 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Leaderboard Server Unreachable</h3>
        <p className="text-xs text-zinc-500 dark:text-slate-400 max-w-sm mx-auto">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Rank Highlight Card with Premium Treatment */}
      {userRank404 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="bg-white dark:bg-[#0f172a] border border-zinc-200/90 dark:border-slate-800/80 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
        >
          <div className="space-y-1.5 max-w-xl">
            <h3 className="text-sm font-bold font-mono text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Swords className="w-4 h-4 text-indigo-500" />
              Not Ranked Yet
            </h3>
            <p className="text-xs text-zinc-600 dark:text-slate-400 leading-relaxed font-sans">
              Your handle is registered, but you do not appear on the arena ranks. Submit a challenge solution to catalog your initial leaderboard position.
            </p>
          </div>
          <button
            onClick={onNavigateToProblems}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white rounded-xl transition-all font-mono shadow-md self-start md:self-center uppercase tracking-wide cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            Submit First Code
          </button>
        </motion.div>
      ) : currentUserRank ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative overflow-hidden border border-indigo-500/30 dark:border-indigo-500/40 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 rounded-xl p-6 shadow-[0_0_20px_rgba(99,102,241,0.12)] flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all duration-200"
        >
          {/* Subtle animated shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse" />

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-1 rounded-md shadow-2xs">
              Your Arena Standings
            </span>
            <div className="flex items-center gap-3.5 mt-1">
              <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 flex items-center justify-center text-xl font-bold text-yellow-500 font-mono shadow-sm">
                #{currentUserRank.rankPosition}
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 font-mono flex items-center gap-1.5">
                  {currentUserRank.username} <span className="text-xs text-indigo-500 font-normal">(You)</span>
                </h4>
                <p className="text-[11px] font-mono text-zinc-500 dark:text-slate-400">
                  Arena Standing • Active Contender
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2 font-mono text-xs text-zinc-500 dark:text-slate-400">
            <div className="flex items-center justify-between gap-4 py-1 border-b border-zinc-200/80 dark:border-slate-800/80">
              <span className="text-zinc-500 dark:text-slate-400">Problems Solved:</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-bold">{currentUserRank.problemsSolved}</span>
            </div>
            <div className="flex items-center justify-between gap-4 py-1 border-b border-zinc-200/80 dark:border-slate-800/80">
              <span className="text-zinc-500 dark:text-slate-400">Overall Accuracy:</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-bold">{currentUserRank.accuracy}%</span>
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* Leaderboard Table Container */}
      <div className="bg-white dark:bg-[#0f172a] border border-zinc-200/90 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-sm transition-all duration-200">
        <div className="p-5 border-b border-zinc-200 dark:border-slate-800/80 flex justify-between items-center bg-zinc-50/70 dark:bg-slate-900/50">
          <div>
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Global Arena Standings
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-slate-400 mt-0.5">
              Top-performing algorithmic solvers cataloged
            </p>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 dark:text-slate-400">
            Total Players: {leaderboard.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-slate-800/80 text-[10px] font-mono text-zinc-500 dark:text-slate-400 uppercase tracking-wider select-none bg-zinc-50/70 dark:bg-slate-900/50">
                <th className="py-3.5 px-6 font-semibold w-24">Rank</th>
                <th className="py-3.5 px-6 font-semibold">Coder Handle</th>
                <th className="py-3.5 px-6 font-semibold text-center">Problems Solved</th>
                <th className="py-3.5 px-6 font-semibold text-center">Submission Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 dark:divide-slate-800/50 text-sm font-mono">
              {leaderboard.map((player, index) => {
                const isSelf = player.userId === userId;
                return (
                  <motion.tr
                    key={player.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.03, ease: "easeOut" }}
                    className={`transition-all duration-200 hover:bg-zinc-50/80 dark:hover:bg-slate-800/40 ${
                      isSelf
                        ? "bg-indigo-500/10 dark:bg-indigo-500/15 border-l-4 border-l-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                        : ""
                    }`}
                  >
                    <td className="py-4 px-6 text-zinc-500">
                      <div className="flex items-center justify-center">
                        {getMedalIcon(player.rankPosition)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`font-semibold ${
                          isSelf
                            ? "text-indigo-600 dark:text-indigo-400 font-bold"
                            : "text-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        {player.username}
                      </span>
                      {isSelf && (
                        <span className="ml-2 text-[9px] font-bold text-indigo-500 bg-indigo-500/15 border border-indigo-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider font-sans shadow-2xs">
                          You
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center text-zinc-800 dark:text-zinc-200 tabular-nums font-bold">
                      {player.problemsSolved}
                    </td>
                    <td className="py-4 px-6 text-center text-zinc-500 dark:text-slate-400 tabular-nums">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-zinc-200 dark:bg-slate-900 h-2 rounded-full overflow-hidden hidden sm:block border border-zinc-200 dark:border-slate-800">
                          <motion.div
                            className="bg-indigo-500 h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, player.accuracy)}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                        <span>{player.accuracy}%</span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
