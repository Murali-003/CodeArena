import { useState, useEffect } from "react";
import { Problem, Submission } from "../types";
import { CheckCircle2, HelpCircle, ArrowUpRight, ShieldAlert, Sparkles, AlertCircle } from "lucide-react";

interface ProblemsTabProps {
  userId: number;
  searchQuery: string;
  onSelectProblem: (problemId: number) => void;
}

import { api } from "../api";

export default function ProblemsTab({ userId, searchQuery, onSelectProblem }: ProblemsTabProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

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
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  // Determine status of each problem for current user
  const getProblemStatus = (problemId: number) => {
    const userProblemSubs = submissions.filter(s => s.problemId === problemId);
    if (userProblemSubs.length === 0) return "Unsolved";
    const hasAccepted = userProblemSubs.some(s => s.status === "ACCEPTED");
    return hasAccepted ? "Solved" : "Attempted";
  };

  const getDifficultyColor = (diffStr: string | null | undefined) => {
    const diff = (diffStr || "").toUpperCase();
    if (diff === "EASY") return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/10 dark:border-emerald-500/20";
    if (diff === "MEDIUM") return "text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/10 dark:border-amber-500/20";
    return "text-rose-600 dark:text-rose-400 bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/10 dark:border-rose-500/20";
  };

  const getStatusBadge = (status: "Solved" | "Attempted" | "Unsolved") => {
    if (status === "Solved") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          Solved
        </span>
      );
    }
    if (status === "Attempted") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 font-mono">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          Attempted
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 font-mono">
        <HelpCircle className="w-3.5 h-3.5 shrink-0" />
        Unsolved
      </span>
    );
  };

  // Filter logical pipeline
  const filteredProblems = problems.filter((prob) => {
    const status = getProblemStatus(prob.id);
    const matchesSearch =
      (prob.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prob.category || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === "All" || (prob.difficulty || "").toUpperCase() === selectedDifficulty.toUpperCase();
    const matchesStatus = selectedStatus === "All" || status === selectedStatus;

    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg animate-pulse" />
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-900">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="p-6 flex items-center justify-between animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-zinc-100 dark:bg-zinc-900 rounded w-48" />
                <div className="h-3 bg-zinc-100 dark:bg-zinc-900 rounded w-24" />
              </div>
              <div className="h-5 bg-zinc-100 dark:bg-zinc-900 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-8 text-center space-y-3 transition-colors duration-200">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Problem Repository Offline</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters Strip */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-4 shadow-sm transition-colors duration-200">
        {/* Difficulty Selectors */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mr-2 select-none">Difficulty:</span>
          {["All", "Easy", "Medium", "Hard"].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                selectedDifficulty === diff
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold border border-zinc-200 dark:border-zinc-800"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Status Selectors */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mr-2 select-none">Status:</span>
          {["All", "Solved", "Attempted", "Unsolved"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                selectedStatus === status
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold border border-zinc-200 dark:border-zinc-800"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Problems List Card Table */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl overflow-hidden shadow-sm transition-colors duration-200">
        {filteredProblems.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 flex items-center justify-center mx-auto">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-mono">No Matching Challenges</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-600 max-w-sm mx-auto font-sans leading-relaxed">
              We couldn't find any challenges matching your current search parameters or active filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-150 dark:border-zinc-900 font-mono text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none bg-zinc-50 dark:bg-zinc-900/10">
                  <th className="py-3 px-6 font-semibold">Status</th>
                  <th className="py-3 px-6 font-semibold">Title</th>
                  <th className="py-3 px-6 font-semibold">Category</th>
                  <th className="py-3 px-6 font-semibold">Difficulty</th>
                  <th className="py-3 px-6 font-semibold">Acceptance</th>
                  <th className="py-3 px-6 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-900/60 font-sans text-sm">
                {filteredProblems.map((prob) => {
                  const status = getProblemStatus(prob.id);
                  return (
                    <tr
                      key={prob.id}
                      className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-all cursor-pointer"
                      onClick={() => onSelectProblem(prob.id)}
                    >
                      <td className="py-4.5 px-6 font-mono">
                        {getStatusBadge(status)}
                      </td>
                      <td className="py-4.5 px-6">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {prob.title}
                        </span>
                      </td>
                      <td className="py-4.5 px-6">
                        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800/40">
                          {prob.category || "General"}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 font-mono">
                        <span className={`text-[11px] font-semibold tracking-wider px-2 py-0.5 rounded border ${getDifficultyColor(prob.difficulty)}`}>
                          {(prob.difficulty || "").charAt(0).toUpperCase() + (prob.difficulty || "").slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 font-mono text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                        {prob.acceptanceRate}
                      </td>
                      <td className="py-4.5 px-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProblem(prob.id);
                          }}
                          className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 transition-all border border-transparent hover:border-blue-500/15 bg-blue-500/5 hover:bg-blue-500/10 px-3 py-1.5 rounded-lg"
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
        )}
      </div>
    </div>
  );
}
