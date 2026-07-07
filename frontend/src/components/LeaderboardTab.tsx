import { useState, useEffect } from "react";
import { LeaderboardUser } from "../types";
import { Trophy, Medal, Star, ShieldAlert, Award, ChevronUp, Swords, HelpCircle } from "lucide-react";

interface LeaderboardTabProps {
  userId: number;
  onNavigateToProblems: () => void;
}

import { api } from "../api";

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
        setLeaderboard(globalData);

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
    if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-500 shrink-0" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-zinc-400 shrink-0" />;
    if (rank === 3) return <Award className="w-4 h-4 text-amber-600 shrink-0" />;
    return <span className="font-mono text-zinc-500 dark:text-zinc-400 w-4 h-4 text-center text-xs font-bold">{rank}</span>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl animate-pulse" />
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-900">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-5 flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-5 bg-zinc-100 dark:bg-zinc-900 h-5 rounded" />
                <div className="w-24 bg-zinc-100 dark:bg-zinc-900 h-4 rounded" />
              </div>
              <div className="w-16 bg-zinc-100 dark:bg-zinc-900 h-4 rounded" />
            </div>
          ))}
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
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Leaderboard Server Unreachable</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Rank Highlight Card */}
      {userRank404 ? (
        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <h3 className="text-sm font-bold font-mono text-zinc-800 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Swords className="w-4 h-4 text-blue-500" />
              Not Ranked Yet
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-500 leading-relaxed">
              Your handle is registered, but you do not appear on the arena ranks. This occurs because you have **zero submissions**. Solving a single challenge successfully (or unsuccessfully) will catalog your initial leaderboard record.
            </p>
          </div>
          <button
            onClick={onNavigateToProblems}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white rounded-lg transition-all font-mono shadow-md self-start md:self-center uppercase tracking-wide cursor-pointer"
          >
            Submit First Code
          </button>
        </div>
      ) : currentUserRank ? (
        <div className="bg-white dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-850 rounded-xl p-6 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors duration-200 shadow-sm">
          {/* Subtle glow */}
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-500 uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md">
              Your Ranks Metrics
            </span>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-lg font-bold text-yellow-500 font-mono">
                #{currentUserRank.rankPosition}
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 font-mono flex items-center gap-1">
                  {currentUserRank.username} <span className="text-xs text-zinc-500 font-normal">(You)</span>
                </h4>
                <p className="text-[11px] font-mono text-zinc-500">
                  Arena Standing • Active Contender
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2 font-mono text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center justify-between gap-4 py-1 border-b border-zinc-200 dark:border-zinc-900">
              <span className="text-zinc-500">Problems Solved:</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-bold">{currentUserRank.problemsSolved}</span>
            </div>
            <div className="flex items-center justify-between gap-4 py-1 border-b border-zinc-200 dark:border-zinc-900">
              <span className="text-zinc-500">Overall Accuracy:</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-bold">{currentUserRank.accuracy}%</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Leaderboard Table Container */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl overflow-hidden shadow-sm transition-colors duration-200">
        <div className="p-5 border-b border-zinc-150 dark:border-zinc-900 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/10">
          <div>
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Global Arena Standings
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Top-performing algorithmic solvers cataloged</p>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            Total Players: {leaderboard.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-zinc-150 dark:border-zinc-900 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none bg-zinc-50 dark:bg-zinc-900/10">
                <th className="py-3 px-6 font-semibold w-20">Rank</th>
                <th className="py-3 px-6 font-semibold">Coder Handle</th>
                <th className="py-3 px-6 font-semibold text-center">Problems Solved</th>
                <th className="py-3 px-6 font-semibold text-center">Submission Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 dark:divide-zinc-900/50 text-sm font-mono">
              {leaderboard.map((player) => {
                const isSelf = player.userId === userId;
                return (
                  <tr
                    key={player.userId}
                    className={`transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/20 ${isSelf ? "bg-blue-500/5 border-l-2 border-l-blue-500" : ""}`}
                  >
                    <td className="py-4 px-6 text-zinc-500">
                      <div className="flex items-center justify-center w-6">
                        {getMedalIcon(player.rankPosition)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-semibold ${isSelf ? "text-blue-600 dark:text-blue-400 font-bold" : "text-zinc-700 dark:text-zinc-300"}`}>
                        {player.username}
                      </span>
                      {isSelf && (
                        <span className="ml-2 text-[9px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider font-sans">
                          You
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center text-zinc-800 dark:text-zinc-200 tabular-nums font-bold">
                      {player.problemsSolved}
                    </td>
                    <td className="py-4 px-6 text-center text-zinc-500 dark:text-zinc-400 tabular-nums">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-zinc-150 dark:bg-zinc-900 h-2 rounded overflow-hidden hidden sm:block border border-zinc-200 dark:border-zinc-850">
                          <div
                            className="bg-blue-600 h-full rounded"
                            style={{ width: `${Math.min(100, player.accuracy)}%` }}
                          />
                        </div>
                        <span>{player.accuracy}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
