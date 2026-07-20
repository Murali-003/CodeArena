import { useState, useEffect, useMemo } from "react";
import { Problem, Submission } from "../types";
import {
  CheckCircle2,
  HelpCircle,
  ArrowUpRight,
  ShieldAlert,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Circle
} from "lucide-react";
import { api } from "../api";

interface ProblemsTabProps {
  userId: number;
  searchQuery: string;
  onSelectProblem: (problemId: number) => void;
}

export default function ProblemsTab({ userId, searchQuery, onSelectProblem }: ProblemsTabProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [localSearch, setLocalSearch] = useState<string>("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [probsData, subsData] = await Promise.all([
          api.get("/api/problems"),
          api.get(`/api/submissions/user/${userId}`)
        ]);

        setProblems(Array.isArray(probsData) ? probsData : (probsData.content ?? []));
        setSubmissions(Array.isArray(subsData) ? subsData : (subsData.content ?? []));
      } catch (err: any) {
        setError(err.message || "Failed to fetch problem repository.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  // Derive categories list dynamically
  const categories = useMemo(() => {
    const set = new Set<string>();
    problems.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [problems]);

  // Determine status of each problem for current user
  const getProblemStatus = (problemId: number): "Solved" | "Attempted" | "Unsolved" => {
    const userProblemSubs = submissions.filter((s) => s.problemId === problemId);
    if (userProblemSubs.length === 0) return "Unsolved";
    const hasAccepted = userProblemSubs.some((s) => s.status === "ACCEPTED");
    return hasAccepted ? "Solved" : "Attempted";
  };

  const getDifficultyPill = (diffStr: string | null | undefined) => {
    const diff = (diffStr || "").toUpperCase();
    if (diff === "EASY") {
      return "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide";
    }
    if (diff === "MEDIUM") {
      return "text-amber-700 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide";
    }
    return "text-rose-700 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/25 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide";
  };

  const getStatusIcon = (status: "Solved" | "Attempted" | "Unsolved") => {
    if (status === "Solved") {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>Solved</span>
        </span>
      );
    }
    if (status === "Attempted") {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
          <span>Attempted</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 dark:text-slate-500 font-mono">
        <Circle className="w-3.5 h-3.5 shrink-0 text-zinc-300 dark:text-slate-600" />
        <span>Todo</span>
      </span>
    );
  };

  // Combined search term from header search prop and local search box
  const activeSearch = searchQuery || localSearch;

  // Filter logical pipeline
  const filteredProblems = useMemo(() => {
    return problems.filter((prob) => {
      const status = getProblemStatus(prob.id);
      const matchesSearch =
        (prob.title || "").toLowerCase().includes(activeSearch.toLowerCase()) ||
        (prob.category || "").toLowerCase().includes(activeSearch.toLowerCase());
      const matchesDifficulty =
        selectedDifficulty === "All" || (prob.difficulty || "").toUpperCase() === selectedDifficulty.toUpperCase();
      const matchesStatus = selectedStatus === "All" || status === selectedStatus;
      const matchesCategory = selectedCategory === "All" || prob.category === selectedCategory;

      return matchesSearch && matchesDifficulty && matchesStatus && matchesCategory;
    });
  }, [problems, submissions, activeSearch, selectedDifficulty, selectedStatus, selectedCategory]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSearch, selectedDifficulty, selectedStatus, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / pageSize));
  const paginatedProblems = filteredProblems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-16 bg-white dark:bg-slate-900/60 border border-zinc-200 dark:border-slate-800/80 rounded-xl" />
        <div className="bg-white dark:bg-slate-900/60 border border-zinc-200 dark:border-slate-800/80 rounded-xl overflow-hidden divide-y divide-zinc-200 dark:divide-slate-800">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="p-5 flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-zinc-200 dark:bg-slate-800 rounded w-48" />
                <div className="h-3 bg-zinc-150 dark:bg-slate-800/60 rounded w-24" />
              </div>
              <div className="h-6 bg-zinc-200 dark:bg-slate-800 rounded w-16" />
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
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Problem Repository Unavailable</h3>
        <p className="text-xs text-zinc-500 dark:text-slate-400 max-w-sm mx-auto">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sticky Filter & Search Bar */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-white/90 dark:bg-[#0f172a]/90 border border-zinc-200/90 dark:border-slate-800/80 rounded-xl p-4 shadow-sm transition-all duration-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Local Search Input */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-zinc-400 dark:text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search title or category..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-zinc-100/80 dark:bg-slate-900/60 border border-zinc-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none rounded-lg pl-9 pr-4 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-slate-500 font-sans transition-all"
            />
          </div>

          {/* Difficulty & Status Selectors */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            {/* Difficulty Filter */}
            <div className="flex items-center gap-1 bg-zinc-100/70 dark:bg-slate-900/60 p-1 rounded-lg border border-zinc-200/80 dark:border-slate-800/80">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-slate-500 uppercase tracking-wider px-2 select-none">
                Difficulty:
              </span>
              {["All", "Easy", "Medium", "Hard"].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    selectedDifficulty === diff
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold border border-zinc-200 dark:border-slate-700 shadow-2xs"
                      : "text-zinc-500 dark:text-slate-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-zinc-100/70 dark:bg-slate-900/60 p-1 rounded-lg border border-zinc-200/80 dark:border-slate-800/80">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-slate-500 uppercase tracking-wider px-2 select-none">
                Status:
              </span>
              {["All", "Solved", "Attempted", "Unsolved"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    selectedStatus === status
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold border border-zinc-200 dark:border-slate-700 shadow-2xs"
                      : "text-zinc-500 dark:text-slate-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Category Select Dropdown */}
            {categories.length > 2 && (
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400 dark:text-slate-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-zinc-100/70 dark:bg-slate-900/60 border border-zinc-200/80 dark:border-slate-800/80 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-zinc-800 dark:text-zinc-200">
                      Category: {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Problems List Card Table */}
      <div className="bg-white dark:bg-[#0f172a] border border-zinc-200/90 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-sm transition-all duration-200">
        {filteredProblems.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700/60 text-zinc-400 dark:text-slate-500 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-bold text-zinc-600 dark:text-slate-300 uppercase tracking-wider font-mono">
              No Matching Challenges Found
            </h3>
            <p className="text-xs text-zinc-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              We couldn't find any challenges matching your current filters. Try resetting your search parameters.
            </p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-slate-800/80 font-mono text-[10px] text-zinc-500 dark:text-slate-400 uppercase tracking-wider select-none bg-zinc-50/70 dark:bg-slate-900/50">
                    <th className="py-3.5 px-6 font-semibold w-32">Status</th>
                    <th className="py-3.5 px-6 font-semibold">Title</th>
                    <th className="py-3.5 px-6 font-semibold">Category</th>
                    <th className="py-3.5 px-6 font-semibold">Difficulty</th>
                    <th className="py-3.5 px-6 font-semibold">Acceptance</th>
                    <th className="py-3.5 px-6 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 dark:divide-slate-800/50 font-sans text-sm">
                  {paginatedProblems.map((prob) => {
                    const status = getProblemStatus(prob.id);
                    const isSolved = status === "Solved";
                    const isAttempted = status === "Attempted";

                    return (
                      <tr
                        key={prob.id}
                        onClick={() => onSelectProblem(prob.id)}
                        className={`group cursor-pointer transition-all duration-150 ${
                          isSolved
                            ? "bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04] hover:bg-emerald-500/[0.06] dark:hover:bg-emerald-500/[0.08]"
                            : isAttempted
                            ? "bg-amber-500/[0.02] dark:bg-amber-500/[0.04] hover:bg-amber-500/[0.06] dark:hover:bg-amber-500/[0.08]"
                            : "hover:bg-zinc-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <td className="py-4 px-6 font-mono">
                          {getStatusIcon(status)}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {prob.title}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xs font-mono text-zinc-600 dark:text-slate-300 bg-zinc-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-slate-700/60">
                            {prob.category || "General"}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono">
                          <span className={getDifficultyPill(prob.difficulty)}>
                            {prob.difficulty}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-zinc-500 dark:text-slate-400 tabular-nums">
                          {prob.acceptanceRate}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectProblem(prob.id);
                            }}
                            className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 transition-all border border-indigo-500/20 hover:border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 px-3.5 py-1.5 rounded-lg cursor-pointer shadow-2xs"
                          >
                            <span>Solve</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Strip */}
            <div className="p-4 border-t border-zinc-200 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-3 bg-zinc-50/50 dark:bg-slate-900/30 text-xs font-mono">
              <span className="text-zinc-500 dark:text-slate-400">
                Showing <strong className="text-zinc-800 dark:text-zinc-200">{(currentPage - 1) * pageSize + 1}</strong> to{" "}
                <strong className="text-zinc-800 dark:text-zinc-200">{Math.min(currentPage * pageSize, filteredProblems.length)}</strong> of{" "}
                <strong className="text-zinc-800 dark:text-zinc-200">{filteredProblems.length}</strong> problems
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-zinc-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 font-bold text-zinc-700 dark:text-zinc-300">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-zinc-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
