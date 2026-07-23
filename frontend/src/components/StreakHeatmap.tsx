import React, { useState, useEffect, useRef } from "react";
import { StreakData } from "../types";
import { Calendar, Flame, Trophy, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { api } from "../api";

interface StreakHeatmapProps {
  userId: number;
}

export default function StreakHeatmap({ userId }: StreakHeatmapProps) {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{
    date: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      <div className="bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-slate-800/80 rounded-xl p-6 space-y-6 animate-pulse transition-colors">
        <div className="flex justify-between items-center">
          <div className="h-5 bg-zinc-200 dark:bg-slate-800 rounded w-48" />
          <div className="h-5 bg-zinc-200 dark:bg-slate-800 rounded w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-zinc-200 dark:bg-slate-800 rounded-lg"
            />
          ))}
        </div>
        <div className="h-32 bg-zinc-200 dark:bg-slate-800 rounded-lg w-full" />
      </div>
    );
  }

  if (error || !streakData) {
    return (
      <div className="bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-3 transition-colors">
        <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <Calendar className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Unable to load contribution activity
        </h3>
        <p className="text-xs text-zinc-500 dark:text-slate-400 max-w-sm mx-auto">
          {error || "Data is missing."}
        </p>
      </div>
    );
  }

  // BUG FIX: End date is actual current date, normalized to local midnight
  const today = new Date();
  const todayNormalized = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  // Day of week: Mon=0, Tue=1, ..., Sun=6
  const currentWeekday = (todayNormalized.getDay() + 6) % 7;

  // Monday of the current week
  const thisWeekMonday = new Date(todayNormalized);
  thisWeekMonday.setDate(todayNormalized.getDate() - currentWeekday);

  // Sunday of the current week (end of grid)
  const thisWeekSunday = new Date(thisWeekMonday);
  thisWeekSunday.setDate(thisWeekMonday.getDate() + 6);

  // Monday 25 weeks back (total 26 weeks = 182 days)
  const startMonday = new Date(thisWeekMonday);
  startMonday.setDate(thisWeekMonday.getDate() - 25 * 7);

  // Group days into 26 aligned calendar week columns (Mon-Sun)
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  let currentDate = new Date(startMonday);

  while (currentDate <= thisWeekSunday) {
    currentWeek.push(new Date(currentDate));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Format YYYY-MM-DD in local time to avoid UTC conversion shifts
  const formatDateKey = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Dictionary lookup for date -> submission count
  const countsMap: Record<string, number> = {};
  let totalSubmissions = 0;

  if (streakData.dailyCounts) {
    Object.entries(streakData.dailyCounts).forEach(([date, count]) => {
      countsMap[date] = count as number;
      totalSubmissions += count as number;
    });
  }

  const getIntensityClass = (count: number) => {
    if (count === 0)
      return "bg-zinc-100 dark:bg-slate-900 border-zinc-200 dark:border-slate-800/80 hover:shadow-[0_0_8px_rgba(148,163,184,0.3)]";
    if (count === 1)
      return "bg-blue-100 dark:bg-blue-950/80 border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 hover:shadow-[0_0_8px_rgba(96,165,250,0.5)]";
    if (count <= 3)
      return "bg-blue-300 dark:bg-blue-800/80 border-blue-400 dark:border-blue-700/40 text-blue-700 dark:text-blue-200 hover:shadow-[0_0_8px_rgba(59,130,246,0.6)]";
    if (count <= 5)
      return "bg-blue-500 dark:bg-blue-600 border-blue-500/40 text-white dark:text-blue-50 hover:shadow-[0_0_10px_rgba(37,99,235,0.7)]";
    return "bg-blue-600 dark:bg-blue-400 border-blue-700 dark:border-blue-300/40 text-white dark:text-zinc-950 font-bold hover:shadow-[0_0_12px_rgba(59,130,246,0.8)]";
  };

  // Month labels positioning
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthLabels: { label: string; colIndex: number }[] = [];
  let prevMonth = -1;

  weeks.forEach((week, colIdx) => {
    for (const day of week) {
      if (day.getMonth() !== prevMonth) {
        prevMonth = day.getMonth();
        monthLabels.push({ label: months[prevMonth], colIndex: colIdx });
        break;
      }
    }
  });

  const handleCellMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    dateStr: string,
    count: number,
  ) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const cellRect = e.currentTarget.getBoundingClientRect();
    const x = cellRect.left - containerRect.left + cellRect.width / 2;
    const y = cellRect.top - containerRect.top - 36;
    setHoveredCell({ date: dateStr, count, x, y });
  };

  const isNewBest =
    streakData.longestStreak === streakData.currentStreak &&
    streakData.currentStreak > 0;

  const statCards = [
    {
      title: "Total Submissions",
      value: totalSubmissions,
      unit: null,
      icon: null,
    },
    {
      title: "Active Days",
      value: streakData.totalActiveDays,
      unit: "days",
      icon: null,
    },
    {
      title: "Current Streak",
      value: streakData.currentStreak,
      unit: "days",
      icon: Flame,
      color: "orange",
      hasFlameGlow: streakData.currentStreak > 0,
    },
    {
      title: "Longest Streak",
      value: streakData.longestStreak,
      unit: "days",
      icon: Trophy,
      color: "yellow",
      isNewBest,
    },
  ];

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-[#0f172a] border border-zinc-200/90 dark:border-slate-800/80 rounded-xl p-6 space-y-6 relative overflow-hidden shadow-sm transition-all duration-200"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-zinc-150 dark:border-slate-800/60 gap-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            Submission Activity
          </h2>
          <p className="text-xs text-zinc-500 dark:text-slate-400 mt-0.5">
            Contribution history spanning the last 6 months
          </p>
        </div>
        <div className="text-xs font-mono text-zinc-600 dark:text-slate-400 bg-zinc-50 dark:bg-slate-900/60 border border-zinc-200 dark:border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <span>Period:</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
            Current Period
          </span>
        </div>
      </div>

      {/* Bento statistics grid with Staggered Entrance */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06, ease: "easeOut" }}
              className="bg-zinc-50/70 dark:bg-slate-900/40 border border-zinc-200/80 dark:border-slate-800/70 rounded-xl p-3.5 space-y-1 relative overflow-hidden hover:border-indigo-500/30 transition-all duration-200"
            >
              {card.title === "Current Streak" && card.hasFlameGlow && (
                <div className="absolute -right-2 -bottom-2 w-14 h-14 bg-orange-500/10 rounded-full blur-lg animate-pulse pointer-events-none" />
              )}

              <div className="text-[10px] text-zinc-500 dark:text-slate-400 uppercase tracking-wider font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1">
                  {Icon && (
                    <Icon
                      className={`w-3 h-3 ${
                        card.color === "orange"
                          ? "text-orange-500"
                          : card.color === "yellow"
                            ? "text-yellow-500"
                            : ""
                      } ${card.hasFlameGlow ? "animate-pulse" : ""}`}
                    />
                  )}
                  {card.title}
                </span>

                {card.isNewBest && (
                  <span className="text-[9px] font-bold text-yellow-400 bg-yellow-500/15 border border-yellow-500/30 px-1.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.3)] animate-pulse">
                    NEW BEST
                  </span>
                )}
              </div>

              <div
                className={`text-2xl font-bold tracking-tight tabular-nums ${
                  card.color === "orange"
                    ? "text-orange-600 dark:text-orange-400"
                    : card.color === "yellow"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-zinc-900 dark:text-white"
                }`}
              >
                {card.value}{" "}
                {card.unit && (
                  <span className="text-xs font-sans text-zinc-400 dark:text-slate-500 font-normal">
                    {card.unit}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Contribution Grid Container */}
      <div className="bg-zinc-50/60 dark:bg-slate-900/20 border border-zinc-200/80 dark:border-slate-800/60 p-5 rounded-xl space-y-3">
        {/* Months headers */}
        <div className="relative h-4 ml-8 font-mono text-[10px] text-zinc-500 dark:text-slate-400 select-none">
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
          {/* Days labels (Row 0=Mon, Row 2=Wed, Row 4=Fri, Row 6=Sun) */}
          <div className="flex flex-col justify-between text-[9px] font-mono text-zinc-500 dark:text-slate-500 w-8 pr-2 h-[88px] py-0.5 select-none shrink-0 font-medium">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
            <span>Sun</span>
          </div>

          {/* Grid columns */}
          <div className="flex-1 flex gap-[3.5px] overflow-x-auto pb-2 scrollbar-thin">
            {weeks.map((week, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-[3.5px] shrink-0">
                {week.map((date, rowIdx) => {
                  const dateStr = formatDateKey(date);
                  const count = countsMap[dateStr] || 0;
                  return (
                    <div
                      key={rowIdx}
                      onMouseEnter={(e) =>
                        handleCellMouseEnter(e, dateStr, count)
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`w-[10.5px] h-[10.5px] rounded-[2px] border-[0.5px] cursor-pointer transition-all duration-150 ${getIntensityClass(
                        count,
                      )} hover:scale-125 hover:z-10`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 dark:text-slate-400 pt-2 border-t border-zinc-200 dark:border-slate-800/50">
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-slate-400">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-400 dark:text-slate-500" />
            <span>Hover on a cell to inspect submission volume</span>
          </div>
          <div className="flex items-center space-x-1.5 select-none">
            <span>Less</span>
            <div className="w-[8.5px] h-[8.5px] bg-zinc-100 dark:bg-slate-900 border border-zinc-200 dark:border-slate-800/80 rounded-[1px]" />
            <div className="w-[8.5px] h-[8.5px] bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900/40 rounded-[1px]" />
            <div className="w-[8.5px] h-[8.5px] bg-blue-300 dark:bg-blue-800/80 border border-blue-400 dark:border-blue-700/40 rounded-[1px]" />
            <div className="w-[8.5px] h-[8.5px] bg-blue-500 dark:bg-blue-600 border border-blue-500/40 rounded-[1px]" />
            <div className="w-[8.5px] h-[8.5px] bg-blue-600 dark:bg-blue-400 border border-blue-700 dark:border-blue-300/40 rounded-[1px]" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Floating Dynamic Cursor Tooltip */}
      {hoveredCell && (
        <div
          className="absolute pointer-events-none z-30 -translate-x-1/2 bg-zinc-900/90 dark:bg-slate-900/95 text-white border border-zinc-700 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-xl text-[11px] font-mono whitespace-nowrap backdrop-blur-xs transition-all duration-75"
          style={{ left: `${hoveredCell.x}px`, top: `${hoveredCell.y}px` }}
        >
          <span className="text-blue-400 font-bold">
            {hoveredCell.count} submissions
          </span>{" "}
          on {hoveredCell.date}
        </div>
      )}
    </div>
  );
}
