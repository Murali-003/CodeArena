import { useState, useEffect } from "react";
import { StreakData } from "../types";
import { Calendar, Award, Flame, Zap, Trophy, HelpCircle } from "lucide-react";

interface StreakHeatmapProps {
  userId: number;
}

import { api } from "../api";

export default function StreakHeatmap({ userId }: StreakHeatmapProps) {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number } | null>(null);

  useEffect(() => {
    async function fetchStreak() {
      setLoading(true);
      setError(null);
      try {
        const data: StreakData = await api.get(`/api/streak/user/${userId}`);
        setStreakData(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong while fetching streaks.");
      } finally {
        setLoading(false);
      }
    }
    fetchStreak();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-6 space-y-6 animate-pulse transition-colors">
        <div className="flex justify-between items-center">
          <div className="h-5 bg-zinc-200 dark:bg-zinc-900 rounded w-48" />
          <div className="h-5 bg-zinc-200 dark:bg-zinc-900 rounded w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-200 dark:bg-zinc-900 rounded-lg" />
          ))}
        </div>
        <div className="h-32 bg-zinc-200 dark:bg-zinc-900 rounded-lg w-full" />
      </div>
    );
  }

  if (error || !streakData) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-8 text-center space-y-3 transition-colors">
        <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
          <Calendar className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Unable to load contribution activity</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">{error || "Data is missing."}</p>
      </div>
    );
  }

  // Generate 180 days leading to current local time "2026-07-07"
  const endDate = new Date("2026-07-07T05:52:55-07:00");
  const daysToShow = 182; // 26 weeks exactly
  const daysArray: Date[] = [];
  
  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(endDate.getDate() - i);
    daysArray.push(d);
  }

  // Create lookup dictionary of dateStrings to submission counts
  const countsMap: Record<string, number> = {};
  let totalSubmissions = 0;
  
  if (streakData.dailyCounts) {
    // Backend returns Map<String, Integer> (which is Record<string, number> in JS)
    Object.entries(streakData.dailyCounts).forEach(([date, count]) => {
      countsMap[date] = count as number;
      totalSubmissions += count as number;
    });
  }

  const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-950/20";
    if (count === 1) return "bg-blue-100 dark:bg-blue-950/80 border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400";
    if (count <= 3) return "bg-blue-300 dark:bg-blue-800/80 border-blue-400 dark:border-blue-700/40 text-blue-700 dark:text-blue-200";
    if (count <= 5) return "bg-blue-500 dark:bg-blue-600 border-blue-500/40 text-white dark:text-blue-50";
    return "bg-blue-600 dark:bg-blue-400 border-blue-700 dark:border-blue-300/40 text-white dark:text-zinc-950 font-bold";
  };

  // Group columns into 26 weeks
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  // Align starting day of the week to columns correctly
  daysArray.forEach((date) => {
    currentWeek.push(date);
    if (currentWeek.length === 7 || date === daysArray[daysArray.length - 1]) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Calculate Month labels positioning
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthLabels: { label: string; colIndex: number }[] = [];
  let prevMonth = -1;

  weeks.forEach((week, colIdx) => {
    const firstDay = week[0];
    if (firstDay && firstDay.getMonth() !== prevMonth) {
      prevMonth = firstDay.getMonth();
      monthLabels.push({ label: months[prevMonth], colIndex: colIdx });
    }
  });

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-6 space-y-6 relative overflow-hidden transition-colors duration-200">
      {/* bento highlights */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-zinc-150 dark:border-zinc-900 gap-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            Submission Activity
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Contribution history spanning the last 6 months</p>
        </div>
        <div className="text-xs font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <span>Period:</span>
          <span className="text-blue-500 dark:text-blue-400 font-semibold uppercase">Current Period</span>
        </div>
      </div>

      {/* Bento statistics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-150 dark:border-zinc-900 rounded-lg p-3.5 space-y-1">
          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">Total Submissions</div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight tabular-nums">
            {totalSubmissions}
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-150 dark:border-zinc-900 rounded-lg p-3.5 space-y-1">
          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">Active Days</div>
          <div className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight tabular-nums">
            {streakData.totalActiveDays} <span className="text-xs font-sans text-zinc-400 dark:text-zinc-500 font-normal">days</span>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-150 dark:border-zinc-900 rounded-lg p-3.5 space-y-1 relative overflow-hidden">
          <Flame className="w-10 h-10 text-orange-500/5 absolute right-2 bottom-1" />
          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-500" /> Current Streak
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 tracking-tight tabular-nums">
            {streakData.currentStreak} <span className="text-xs font-sans text-zinc-400 dark:text-zinc-500 font-normal">days</span>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-150 dark:border-zinc-900 rounded-lg p-3.5 space-y-1 relative overflow-hidden">
          <Trophy className="w-10 h-10 text-yellow-500/5 absolute right-2 bottom-1" />
          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold flex items-center gap-1">
            <Trophy className="w-3 h-3 text-yellow-500" /> Longest Streak
          </div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500 tracking-tight tabular-nums">
            {streakData.longestStreak} <span className="text-xs font-sans text-zinc-400 dark:text-zinc-500 font-normal">days</span>
          </div>
        </div>
      </div>

      {/* Contribution Grid */}
      <div className="bg-zinc-50 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900/60 p-5 rounded-lg space-y-3">
        {/* Months headers */}
        <div className="relative h-4 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
          {monthLabels.map((item, idx) => (
            <span
              key={idx}
              className="absolute font-semibold"
              style={{ left: `${(item.colIndex / weeks.length) * 100}%` }}
            >
              {item.label}
            </span>
          ))}
        </div>

        <div className="flex">
          {/* Days labels */}
          <div className="flex flex-col justify-between text-[9px] font-mono text-zinc-500 dark:text-zinc-600 w-8 pr-2 h-[84px] py-1 select-none shrink-0 font-medium">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
            <span>Sun</span>
          </div>

          {/* Grid columns */}
          <div className="flex-1 flex gap-[3px] overflow-x-auto pb-2 scrollbar-thin">
            {weeks.map((week, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-[3px] shrink-0">
                {week.map((date, rowIdx) => {
                  const dateStr = date.toISOString().split("T")[0];
                  const count = countsMap[dateStr] || 0;
                  return (
                    <div
                      key={rowIdx}
                      onMouseEnter={() => setHoveredCell({ date: dateStr, count })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`w-[10px] h-[10px] rounded-[1.5px] border-[0.5px] cursor-pointer transition-all duration-150 ${getIntensityClass(
                        count
                      )} hover:scale-125 hover:z-10`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-900/40">
          <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
            <HelpCircle className="w-3 h-3 text-zinc-500" />
            <span>Hover on a cell to inspect submission volume</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span>Less</span>
            <div className="w-[8px] h-[8px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-950/20 rounded-[1px]" />
            <div className="w-[8px] h-[8px] bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900/40 rounded-[1px]" />
            <div className="w-[8px] h-[8px] bg-blue-300 dark:bg-blue-800/80 border border-blue-400 dark:border-blue-700/40 rounded-[1px]" />
            <div className="w-[8px] h-[8px] bg-blue-500 dark:bg-blue-600 border border-blue-500/40 rounded-[1px]" />
            <div className="w-[8px] h-[8px] bg-blue-600 dark:bg-blue-400 border border-blue-700 dark:border-blue-300/40 rounded-[1px]" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Floating Tooltip info */}
      {hoveredCell && (
        <div className="absolute bottom-4 left-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded shadow-lg text-[11px] font-mono">
          <span className="text-blue-600 dark:text-blue-400 font-bold">{hoveredCell.count} submissions</span> on {hoveredCell.date}
        </div>
      )}
    </div>
  );
}
