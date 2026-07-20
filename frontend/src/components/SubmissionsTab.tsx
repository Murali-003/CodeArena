import React, { useState, useEffect } from "react";
import { Submission, SubmissionResult } from "../types";
import { api } from "../api";
import {
  History,
  ShieldAlert,
  FileCode,
  CheckCircle,
  AlertTriangle,
  Eye,
  ArrowLeft,
  RefreshCw,
  Clock,
  HardDrive
} from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

interface SubmissionsTabProps {
  userId: number;
}

// Custom CodeMirror 6 Theme & Syntax Highlighting matching ProblemDetail specifications
const customIdeTheme = EditorView.theme({
  "&": {
    backgroundColor: "#0d1117",
    color: "#e5e7eb",
    height: "100%",
    fontSize: "13px",
    fontFamily: '"JetBrains Mono", monospace',
  },
  ".cm-content": {
    caretColor: "#60a5fa",
    paddingTop: "8px",
    paddingBottom: "8px",
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "#60a5fa",
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
    backgroundColor: "#1e293b !important",
  },
  ".cm-gutters": {
    backgroundColor: "#0d1117",
    color: "#64748b",
    borderRight: "1px solid rgba(255, 255, 255, 0.06)",
    paddingRight: "6px",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    textAlign: "right",
    minWidth: "2.2rem",
    paddingRight: "8px",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
    color: "#94a3b8",
  },
  ".cm-activeLine": {
    backgroundColor: "#161b22",
  },
});

const customHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: "#60a5fa", fontWeight: "bold" },
  { tag: [t.name, t.deleted, t.character, t.macroName, t.variableName], color: "#e5e7eb" },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.propertyName, t.function(t.name)], color: "#38bdf8" },
  { tag: [t.string, t.regexp, t.special(t.string)], color: "#4ade80" },
  { tag: [t.number, t.bool, t.null, t.integer, t.float], color: "#c084fc" },
  { tag: [t.comment, t.lineComment, t.blockComment], color: "#64748b", fontStyle: "italic" },
  { tag: [t.operator, t.punctuation, t.separator], color: "#93c5fd" },
  { tag: [t.className, t.typeName, t.standard(t.typeName)], color: "#38bdf8", fontWeight: "600" },
  { tag: t.definition(t.variableName), color: "#e5e7eb" },
]);

const ideExtensions = [
  customIdeTheme,
  syntaxHighlighting(customHighlightStyle),
];

const getLanguageExtension = (lang: string) => {
  const l = (lang || "").toUpperCase();
  if (l === "PYTHON") return python();
  if (l === "JAVA") return java();
  if (l === "CPP" || l === "C++") return cpp();
  return python();
};

export default function SubmissionsTab({ userId }: SubmissionsTabProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [expandedSubId, setExpandedSubId] = useState<number | null>(null);
  const [subDetailLoading, setSubDetailLoading] = useState(false);

  async function fetchSubmissions() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/api/submissions/user/${userId}`);
      setSubmissions(Array.isArray(data) ? data : (data.content ?? []));
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred loading submissions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubmissions();
  }, [userId]);

  const handleViewCode = async (subId: number) => {
    setSubDetailLoading(true);
    try {
      const subDetail = await api.get(`/api/submissions/${subId}?includeOutput=true`);
      setSelectedSub(subDetail);
    } catch (err: any) {
      alert(err.message || "Could not retrieve submission details");
    } finally {
      setSubDetailLoading(false);
    }
  };

  const toggleExpand = (subId: number) => {
    setExpandedSubId((prev) => (prev === subId ? null : subId));
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "ACCEPTED") {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 rounded-full px-2.5 py-0.5 font-mono">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          <span>Accepted</span>
        </span>
      );
    }
    if (s === "RUNNING" || s === "PENDING") {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 rounded-full px-2.5 py-0.5 font-mono animate-pulse">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Running</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/25 rounded-full px-2.5 py-0.5 font-mono">
        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
        <span>{status}</span>
      </span>
    );
  };

  // Compute metrics from results array
  const getSubmissionMetrics = (sub: Submission) => {
    if (!sub.results || sub.results.length === 0) {
      return { runtime: "N/A", memory: "N/A" };
    }
    const totalRuntime = sub.results.reduce((acc, r) => acc + (r.executionTimeMs || 0), 0);
    const maxMemory = Math.max(...sub.results.map((r) => r.memoryUsedKb || 0));
    return {
      runtime: `${totalRuntime} ms`,
      memory: `${maxMemory} KB`
    };
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-16 bg-white dark:bg-slate-900/60 border border-zinc-200 dark:border-slate-800/80 rounded-xl" />
        <div className="h-64 bg-white dark:bg-slate-900/60 border border-zinc-200 dark:border-slate-800/80 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-3 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">History Engine Unavailable</h3>
        <p className="text-xs text-zinc-500 dark:text-slate-400 max-w-sm mx-auto">{error}</p>
        <button
          onClick={fetchSubmissions}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Retry Load
        </button>
      </div>
    );
  }

  // Detailed View Mode
  if (selectedSub) {
    const passedRatio =
      selectedSub.passedTestCases !== undefined && selectedSub.totalTestCases !== undefined
        ? `${selectedSub.passedTestCases} / ${selectedSub.totalTestCases}`
        : "N/A";

    return (
      <div className="space-y-6">
        {/* Back Header */}
        <div className="flex justify-between items-center bg-white dark:bg-[#0f172a] border border-zinc-200/90 dark:border-slate-800/80 p-4 rounded-xl shadow-sm">
          <button
            onClick={() => setSelectedSub(null)}
            className="flex items-center gap-2 text-xs font-mono font-semibold text-zinc-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO SUBMISSION LOGS</span>
          </button>
          <span className="text-[11px] font-mono text-zinc-400 dark:text-slate-500">
            SUBMISSION ID: <strong className="text-zinc-800 dark:text-zinc-200">#{selectedSub.id}</strong>
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Metadata Card */}
          <div className="bg-white dark:bg-[#0f172a] border border-zinc-200/90 dark:border-slate-800/80 rounded-xl p-5 space-y-4 shadow-sm">
            <h4 className="text-xs font-mono text-zinc-400 dark:text-slate-400 uppercase tracking-wider font-bold">
              Evaluation Summary
            </h4>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-150 dark:border-slate-800/60">
                <span className="text-zinc-500 dark:text-slate-400">Problem:</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-bold truncate max-w-[160px]">
                  {selectedSub.problemTitle || `#${selectedSub.problemId}`}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-zinc-150 dark:border-slate-800/60">
                <span className="text-zinc-500 dark:text-slate-400">Language:</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-bold uppercase">{selectedSub.language}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-zinc-150 dark:border-slate-800/60">
                <span className="text-zinc-500 dark:text-slate-400">Result:</span>
                {getStatusBadge(selectedSub.status)}
              </div>

              {/* Test cases counter card */}
              <div className="bg-zinc-50 dark:bg-slate-900/50 border border-zinc-200/80 dark:border-slate-800/80 rounded-xl p-4 mt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-mono uppercase text-zinc-400 dark:text-slate-400 font-bold">
                      Test Cases Passed
                    </p>
                    <h2 className="mt-1 text-2xl font-extrabold font-mono text-zinc-900 dark:text-white">
                      {passedRatio}
                    </h2>
                  </div>
                  {selectedSub.status === "ACCEPTED" ? (
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Source Code Preview Panel with Read-Only CodeMirror */}
          <div className="bg-white dark:bg-[#0f172a] border border-zinc-200/90 dark:border-slate-800/80 rounded-xl p-5 md:col-span-2 space-y-3 shadow-sm flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-150 dark:border-slate-800/60">
              <span className="text-xs font-mono text-zinc-500 dark:text-slate-400 flex items-center gap-2 font-semibold">
                <FileCode className="w-4 h-4 text-indigo-500" />
                Submitted Source Code
              </span>
              <span className="text-[10px] font-mono text-zinc-400 dark:text-slate-500 uppercase bg-zinc-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-slate-800">
                {selectedSub.language}
              </span>
            </div>

            {selectedSub.sourceCode ? (
              <div className="rounded-xl border border-zinc-200/80 dark:border-slate-800/80 overflow-hidden max-h-[350px] flex flex-col bg-[#0d1117]">
                <CodeMirror
                  value={selectedSub.sourceCode}
                  height="100%"
                  maxHeight="350px"
                  theme="dark"
                  extensions={[getLanguageExtension(selectedSub.language), ...ideExtensions]}
                  editable={false}
                  readOnly={true}
                  basicSetup={{
                    lineNumbers: true,
                    highlightActiveLine: false,
                    foldGutter: false,
                  }}
                  className="w-full text-xs overflow-auto"
                />
              </div>
            ) : (
              <div className="p-4 bg-zinc-50 dark:bg-slate-900/80 border border-zinc-200/80 dark:border-slate-800/80 rounded-xl text-xs font-mono text-zinc-500 italic">
                // No source code available for this submission.
              </div>
            )}
          </div>
        </div>

        {/* Test Case Breakdown Panel */}
        {selectedSub.results && selectedSub.results.length > 0 && (
          <div className="bg-white dark:bg-[#0f172a] border border-zinc-200/90 dark:border-slate-800/80 rounded-xl p-5 space-y-4 shadow-sm">
            <h4 className="text-xs font-mono text-zinc-400 dark:text-slate-400 uppercase tracking-wider font-bold">
              Test Case Assertions
            </h4>
            <div className="space-y-2.5 font-mono text-xs">
              {selectedSub.results.map((r, idx) => (
                <div
                  key={r.id || idx}
                  className="p-3 bg-zinc-50/70 dark:bg-slate-900/40 border border-zinc-200/80 dark:border-slate-800/70 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${r.passed ? "bg-emerald-500" : "bg-rose-500"}`} />
                    <span className="text-zinc-800 dark:text-zinc-200 font-semibold">Test Case #{idx + 1}</span>
                    <span className="text-[10px] text-zinc-500 dark:text-slate-400 bg-zinc-150 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700/60 px-1.5 py-0.5 rounded">
                      ID: {r.testCaseId}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px]">
                    <div className="flex items-center gap-1 text-zinc-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-zinc-800 dark:text-zinc-200 font-bold">{r.executionTimeMs} ms</span>
                    </div>
                    <div className="flex items-center gap-1 text-zinc-500 dark:text-slate-400">
                      <HardDrive className="w-3.5 h-3.5" />
                      <span className="text-zinc-800 dark:text-zinc-200 font-bold">{r.memoryUsedKb} KB</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                        r.passed
                          ? "text-emerald-700 dark:text-emerald-400 border-emerald-500/25 bg-emerald-500/10"
                          : "text-rose-700 dark:text-rose-400 border-rose-500/25 bg-rose-500/10"
                      }`}
                    >
                      {r.passed ? "Passed" : "Failed"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main Submissions Log Table
  return (
    <div className="space-y-6">
      {/* Title & Refresh Strip */}
      <div className="flex justify-between items-center bg-white dark:bg-[#0f172a] border border-zinc-200/90 dark:border-slate-800/80 p-4 rounded-xl shadow-sm">
        <div>
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-500" />
            Submission Evaluation History
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-slate-400 mt-0.5">
            Chronological record of code evaluation runs
          </p>
        </div>
        <button
          onClick={fetchSubmissions}
          className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-zinc-200 dark:border-slate-700 rounded-lg text-zinc-600 dark:text-slate-300 transition-colors flex items-center justify-center cursor-pointer"
          title="Refresh Submissions"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700/60 text-zinc-400 dark:text-slate-500 flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <h4 className="text-xs font-bold font-mono text-zinc-600 dark:text-slate-300 uppercase tracking-wider">
            No Submissions Cataloged
          </h4>
          <p className="text-xs text-zinc-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            You haven't submitted any solutions yet. Head over to the Problems repository to evaluate your code.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0f172a] border border-zinc-200/90 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-sm transition-all duration-200">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left border-collapse font-sans">
              <colgroup>
                <col className="w-[170px]" />
                <col className="w-[220px]" />
                <col className="w-[110px]" />
                <col className="w-[100px]" />
                <col className="w-[100px]" />
                <col className="w-[180px]" />
                <col className="w-[120px]" />
              </colgroup>
              <thead>
                <tr className="border-b border-zinc-200 dark:border-slate-800/80 font-mono text-[10px] text-zinc-500 dark:text-slate-400 uppercase tracking-wider select-none bg-zinc-50/70 dark:bg-slate-900/50">
                  <th className="py-3.5 px-6 font-semibold w-[170px]">Status</th>
                  <th className="py-3.5 px-6 font-semibold w-[220px]">Problem</th>
                  <th className="py-3.5 px-6 font-semibold w-[110px]">Language</th>
                  <th className="py-3.5 px-6 font-semibold w-[100px]">Runtime</th>
                  <th className="py-3.5 px-6 font-semibold w-[100px]">Memory</th>
                  <th className="py-3.5 px-6 font-semibold w-[180px]">Submitted Time</th>
                  <th className="py-3.5 px-6 text-right font-semibold w-[120px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-slate-800/50 text-xs font-mono">
                {submissions.map((sub) => {
                  const metrics = getSubmissionMetrics(sub);
                  const isExpanded = expandedSubId === sub.id;

                  return (
                    <React.Fragment key={sub.id}>
                      <tr
                        className="hover:bg-zinc-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                        onClick={() => toggleExpand(sub.id)}
                      >
                        <td className="py-3.5 px-6 w-[170px]">{getStatusBadge(sub.status)}</td>
                        <td className="py-3.5 px-6 w-[220px]">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 block truncate" title={sub.problemTitle || `Problem #${sub.problemId}`}>
                            {sub.problemTitle || `Problem #${sub.problemId}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 w-[110px]">
                          <span className="text-[10px] text-zinc-600 dark:text-slate-300 font-bold bg-zinc-100 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700/60 px-2 py-0.5 rounded-md uppercase">
                            {sub.language}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 w-[100px] text-zinc-600 dark:text-slate-400 tabular-nums">
                          {metrics.runtime}
                        </td>
                        <td className="py-3.5 px-6 w-[100px] text-zinc-600 dark:text-slate-400 tabular-nums">
                          {metrics.memory}
                        </td>
                        <td className="py-3.5 px-6 w-[180px] text-zinc-500 dark:text-slate-400 tabular-nums">
                          {new Date(sub.submittedAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-6 w-[120px] text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewCode(sub.id);
                            }}
                            className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold text-[11px]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Read-Only CodeMirror Row */}
                      {isExpanded && (
                        <tr className="bg-zinc-50/80 dark:bg-slate-900/60">
                          <td colSpan={7} className="p-4 px-6">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-[11px] font-mono text-zinc-500 dark:text-slate-400">
                                <span className="font-semibold">Quick Code Preview ({sub.language}):</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewCode(sub.id);
                                  }}
                                  className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                >
                                  View full breakdown →
                                </button>
                              </div>
                              {sub.sourceCode ? (
                                <div className="rounded-lg border border-zinc-200/80 dark:border-slate-800/80 overflow-hidden max-h-48 flex flex-col bg-[#0d1117]">
                                  <CodeMirror
                                    value={sub.sourceCode}
                                    height="100%"
                                    maxHeight="192px"
                                    theme="dark"
                                    extensions={[getLanguageExtension(sub.language), ...ideExtensions]}
                                    editable={false}
                                    readOnly={true}
                                    basicSetup={{
                                      lineNumbers: true,
                                      highlightActiveLine: false,
                                      foldGutter: false,
                                    }}
                                    className="w-full text-xs overflow-auto"
                                  />
                                </div>
                              ) : (
                                <div className="p-3 bg-white dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 rounded-lg text-xs font-mono text-zinc-400 italic">
                                  // No source code available for this submission.
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
