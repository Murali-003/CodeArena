import React, { useState, useEffect, useRef } from "react";
import { Problem, Submission } from "../types";
import { api } from "../api";
import {
  ArrowLeft,
  ChevronRight,
  Terminal,
  Play,
  CheckCircle2,
  XCircle,
  Code2,
  LockKeyhole,
  Cpu,
  AlertTriangle,
  RotateCcw,
  FastForward,
} from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import acceptedAnimation from "../assets/lottie/Accepted.json";

interface ProblemDetailProps {
  userId: number;
  problemId: number;
  onBack: () => void;
  onSubmissionSuccess?: () => void;
}

const DEFAULT_BOILERPLATE: Record<string, string> = {
  PYTHON: `import sys

def solve():
    # Write your solution here
    pass

if __name__ == "__main__":
    solve()
`,

  JAVA: `import java.util.*;

public class Main {

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // Write your solution here

        sc.close();
    }
}
`,

  CPP: `#include <bits/stdc++.h>
using namespace std;

int main() {

    // Write your solution here

    return 0;
}
`,
};

// Custom CodeMirror 6 Theme & Syntax Highlighting matching LeetCode / IDE specifications
const customIdeTheme = EditorView.theme({
  "&": {
    backgroundColor: "#0d1117",
    color: "#e5e7eb",
    height: "100%",
    fontSize: "13.5px",
    fontFamily: '"JetBrains Mono", monospace',
  },
  ".cm-content": {
    caretColor: "#60a5fa",
    paddingTop: "12px",
    paddingBottom: "12px",
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "#60a5fa",
    borderLeftWidth: "2px",
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection":
    {
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
    minWidth: "2.5rem",
    paddingRight: "8px",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
    color: "#94a3b8",
    fontWeight: "bold",
  },
  ".cm-activeLine": {
    backgroundColor: "#161b22",
  },
});

const customHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: "#60a5fa", fontWeight: "bold" },
  {
    tag: [t.name, t.deleted, t.character, t.macroName, t.variableName],
    color: "#e5e7eb",
  },
  {
    tag: [
      t.function(t.variableName),
      t.function(t.propertyName),
      t.propertyName,
      t.function(t.name),
    ],
    color: "#38bdf8",
  },
  { tag: [t.string, t.regexp, t.special(t.string)], color: "#4ade80" },
  { tag: [t.number, t.bool, t.null, t.integer, t.float], color: "#c084fc" },
  {
    tag: [t.comment, t.lineComment, t.blockComment],
    color: "#64748b",
    fontStyle: "italic",
  },
  { tag: [t.operator, t.punctuation, t.separator], color: "#93c5fd" },
  {
    tag: [t.className, t.typeName, t.standard(t.typeName)],
    color: "#38bdf8",
    fontWeight: "600",
  },
  { tag: t.definition(t.variableName), color: "#e5e7eb" },
]);

const ideExtensions = [
  customIdeTheme,
  syntaxHighlighting(customHighlightStyle),
];

const getLanguageExtension = (lang: "PYTHON" | "JAVA" | "CPP") => {
  switch (lang) {
    case "PYTHON":
      return python();
    case "JAVA":
      return java();
    case "CPP":
      return cpp();
    default:
      return python();
  }
};

export default function ProblemDetail({
  userId,
  problemId,
  onBack,
  onSubmissionSuccess,
}: ProblemDetailProps) {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editor states
  const [language, setLanguage] = useState<"PYTHON" | "JAVA" | "CPP">("PYTHON");
  const [sourceCode, setSourceCode] = useState("");

  // Submissions and polling states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(
    null,
  );
  const [gradingLogs, setGradingLogs] = useState<string[]>([]);

  // Run Code states
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);
  const [customInput, setCustomInput] = useState("");

  const [activeTab, setActiveTab] = useState<"console" | "results">("console");

  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadProblem = async () => {
    console.log("Loading problem again..."); // <-- ADD HERE

    setLoading(true);
    setError(null);

    try {
      const data = await api.get(`/api/problems/${problemId}`);

      console.log("Problem API Response:", data); // <-- ADD HERE
      console.log("Hints received:", data.hints); // <-- ADD HERE

      setProblem(data);

      setSourceCode((prev) => prev || DEFAULT_BOILERPLATE[language]);

      if (data.testCases && data.testCases.length > 0) {
        setCustomInput(data.testCases[0].inputData || "");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load problem details");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadProblem();
  }, [problemId]);

  const handleLanguageChange = (lang: "PYTHON" | "JAVA" | "CPP") => {
    setLanguage(lang);
    setSourceCode(DEFAULT_BOILERPLATE[lang]);
  };

  useEffect(() => {
    if (rateLimitCountdown > 0) {
      countdownTimerRef.current = setTimeout(() => {
        setRateLimitCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setRateLimitError(null);
    }
    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, [rateLimitCountdown]);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleRunCode = async () => {
    if (isRunning || isSubmitting) return;
    setIsRunning(true);
    setActiveTab("console");
    setRunResult(null);

    try {
      const result = await api.post("/api/execute", {
        sourceCode,
        language,
        customInput,
      });
      setRunResult(result);
    } catch (err: any) {
      setRunResult({
        status: "RUNTIME_ERROR",
        stderr: err.message || "Failed to execute code",
        stdout: "",
        execTimeMs: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const startSubmissionPoll = (submissionId: number) => {
    setGradingLogs([
      "Bootstrapping secure execution sandbox...",
      "Mounting compilers & libraries...",
    ]);

    let tickCount = 0;
    pollIntervalRef.current = setInterval(async () => {
      tickCount++;
      try {
        const data: Submission = await api.get(
          `/api/submissions/${submissionId}?includeOutput=true`,
        );
        setCurrentSubmission(data);

        if (data.status === "RUNNING") {
          if (tickCount === 1) {
            setGradingLogs((prev) => [
              ...prev,
              "Compiling source files into AST...",
              "Resolving static namespaces...",
            ]);
          } else if (tickCount === 2) {
            setGradingLogs((prev) => [
              ...prev,
              "Spawning isolated runtime process...",
              "Executing test suite assertions...",
            ]);
          } else {
            setGradingLogs((prev) => [
              ...prev,
              `Evaluating assertion vector ${tickCount}...`,
            ]);
          }
        } else {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

          setIsSubmitting(false);

          await loadProblem(); // <-- add this

          setGradingLogs((prev) => [
            ...prev,
            "Process completed.",
            `Status returned: ${data.status}`,
          ]);

          onSubmissionSuccess?.();
        }
      } catch (err) {
        console.error("Polling error:", err);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setIsSubmitting(false);
      }
    }, 500);
  };

  const handleSubmit = async () => {
    if (isSubmitting || rateLimitCountdown > 0) return;

    setIsSubmitting(true);
    setRateLimitError(null);
    setCurrentSubmission(null);
    setActiveTab("results");

    try {
      const initialSub: Submission = await api.post("/api/submissions", {
        problemId,
        language,
        sourceCode,
      });
      setCurrentSubmission(initialSub);
      startSubmissionPoll(initialSub.id);
    } catch (postErr: any) {
      if (postErr.status === 429) {
        setRateLimitError(postErr.message || "Rate limit exceeded.");
        setRateLimitCountdown(15);
        setIsSubmitting(false);
        setActiveTab("console");
        return;
      }
      alert(postErr.message || "An unexpected submission error occurred");
      setIsSubmitting(false);
    }
  };

  const getDifficultyBadge = (diff: "Easy" | "Medium" | "Hard" | undefined) => {
    if (diff === "Easy")
      return "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-[0_0_10px_rgba(16,185,129,0.15)]";
    if (diff === "Medium")
      return "text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-[0_0_10px_rgba(245,158,11,0.15)]";
    return "text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-[0_0_10px_rgba(239,68,68,0.15)]";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;

      case "WRONG_ANSWER":
        return <XCircle className="w-4 h-4 text-rose-500" />;

      case "TIME_LIMIT_EXCEEDED":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;

      case "MEMORY_LIMIT_EXCEEDED":
        return <Cpu className="w-4 h-4 text-orange-500" />;

      case "RUNTIME_ERROR":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;

      case "COMPILATION_ERROR":
        return <AlertTriangle className="w-4 h-4 text-purple-500" />;

      default:
        return <Terminal className="w-4 h-4 text-zinc-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "text-emerald-600 dark:text-emerald-400";

      case "WRONG_ANSWER":
        return "text-rose-600 dark:text-rose-400";

      case "TIME_LIMIT_EXCEEDED":
        return "text-amber-600 dark:text-amber-400";

      case "MEMORY_LIMIT_EXCEEDED":
        return "text-orange-600 dark:text-orange-400";

      case "RUNTIME_ERROR":
        return "text-red-600 dark:text-red-400";

      case "COMPILATION_ERROR":
        return "text-purple-600 dark:text-purple-400";

      default:
        return "text-zinc-600 dark:text-zinc-300";
    }
  };
  const verdictLabels: Record<string, string> = {
    ACCEPTED: "Accepted",
    WRONG_ANSWER: "Wrong Answer",
    TIME_LIMIT_EXCEEDED: "Time Limit Exceeded",
    MEMORY_LIMIT_EXCEEDED: "Memory Limit Exceeded",
    RUNTIME_ERROR: "Runtime Error",
    COMPILATION_ERROR: "Compilation Error",
    RUNNING: "Running",
    PENDING: "Pending",
    EXECUTED: "Executed",
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-140px)] animate-pulse">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl" />
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl" />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Error
        </h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          {error || "Challenge data missing."}
        </p>
        <button
          onClick={onBack}
          className="text-xs text-blue-600 hover:underline"
        >
          Return to repository
        </button>
      </div>
    );
  }

  return (
    <>
      {currentSubmission?.status === "ACCEPTED" && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <DotLottieReact
            data={acceptedAnimation}
            autoplay
            loop={false}
            style={{
              width: "100vw",
              height: "100vh",
            }}
          />
        </div>
      )}
      <div className="flex flex-col h-[calc(100vh-96px)]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-3 mb-4 shrink-0">
          <div className="flex items-center space-x-3.5">
            <button
              onClick={onBack}
              className="p-1.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-zinc-500 text-xs font-mono select-none">
                Problems
              </span>
              <ChevronRight className="w-3 h-3 text-zinc-400" />
              <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                {problem.title}
              </h2>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleLanguageChange(language)}
              title="Reset code template"
              className="p-1.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0 overflow-hidden pb-4">
          {/* Left column: Description and Testcases */}
          <div className="flex flex-col border border-zinc-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-[#0f172a] min-h-0 shadow-sm overflow-hidden">
            <div className="h-11 border-b border-zinc-150 dark:border-slate-800/60 px-4 flex items-center justify-between bg-zinc-50 dark:bg-slate-900/50">
              <div className="flex space-x-4 text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 relative">
                <span className="text-blue-400 pb-3 mt-1.5 relative">
                  Description
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full animate-pulse" />
                </span>
              </div>
              <span className={getDifficultyBadge(problem.difficulty)}>
                {problem.difficulty}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 font-sans text-sm text-zinc-700 dark:text-zinc-300">
              <h1 className="text-xl font-bold text-zinc-800 dark:text-white mb-2">
                {problem.title}
              </h1>

              <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-zinc-150 dark:border-slate-800/60">
                <span className="text-xs font-mono text-zinc-500 uppercase">
                  Category:
                </span>
                <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-slate-700/60">
                  {problem.category}
                </span>
              </div>

              <div className="space-y-4 font-sans text-sm leading-relaxed">
                <p className="whitespace-pre-wrap">{problem.description}</p>
              </div>

              {/* Test cases with top-accent gradient border */}
              {problem.testCases && problem.testCases.length > 0 && (
                <div className="mt-8 space-y-4">
                  <h3 className="font-bold text-base text-zinc-800 dark:text-white border-b border-zinc-200 dark:border-slate-800/80 pb-2 flex items-center gap-2">
                    <span>Examples</span>
                  </h3>
                  {problem.testCases.map((tc, idx) => (
                    <div
                      key={tc.id}
                      className="bg-zinc-50 dark:bg-slate-900/60 rounded-xl p-4 border border-zinc-200 dark:border-slate-800/80 relative overflow-hidden group shadow-2xs hover:border-indigo-500/30 transition-all duration-200"
                    >
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                      <div className="font-bold text-xs font-mono text-zinc-900 dark:text-zinc-100 mb-2">
                        Example {idx + 1}:
                      </div>
                      <div className="mb-2 font-mono text-xs">
                        <span className="font-semibold text-zinc-500 dark:text-slate-400">
                          Input:{" "}
                        </span>
                        <code className="bg-zinc-200/70 dark:bg-slate-800/80 px-2 py-0.5 rounded text-purple-600 dark:text-purple-400 border border-zinc-300/60 dark:border-slate-700/60">
                          {tc.inputData}
                        </code>
                      </div>
                      <div className="font-mono text-xs">
                        <span className="font-semibold text-zinc-500 dark:text-slate-400">
                          Output:{" "}
                        </span>
                        <code className="bg-zinc-200/70 dark:bg-slate-800/80 px-2 py-0.5 rounded text-emerald-600 dark:text-emerald-400 border border-zinc-300/60 dark:border-slate-700/60">
                          {tc.expectedOutput}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Hints */}
              <div className="mt-8">
                <h3 className="font-bold text-base text-zinc-800 dark:text-white border-b border-zinc-200 dark:border-slate-800/80 pb-2 mb-4">
                  Hints
                </h3>

                {problem.hints && problem.hints.length > 0 ? (
                  <div className="space-y-3">
                    {problem.hints.map((hint, index) => (
                      <div
                        key={hint.id}
                        className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4"
                      >
                        <div className="font-semibold text-amber-400 mb-2">
                          Hint {index + 1}
                        </div>

                        <p className="text-sm whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                          {hint.hintText}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-zinc-200 dark:border-slate-800 bg-zinc-50 dark:bg-slate-900 p-4 text-sm text-zinc-500">
                    No hints unlocked yet.
                    <br />
                    Submit a few incorrect attempts to unlock hints.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column: Code Editor and Results */}
          <div className="flex flex-col border border-zinc-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-[#0f172a] min-h-0 shadow-sm overflow-hidden">
            {/* Editor Header Bar */}
            <div className="h-11 border-b border-zinc-150 dark:border-slate-800/60 px-4 flex items-center justify-between bg-zinc-50 dark:bg-slate-900/50">
              <div className="flex items-center space-x-2.5">
                <Code2 className="w-4 h-4 text-indigo-500" />
                <div className="flex bg-zinc-100 dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-lg p-0.5">
                  {(["PYTHON", "JAVA", "CPP"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                        language === lang
                          ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs border border-zinc-200 dark:border-slate-700"
                          : "text-zinc-500 dark:text-slate-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting}
                  className="bg-zinc-800 hover:bg-zinc-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-zinc-200 hover:text-white disabled:opacity-50 px-4 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_15px_rgba(100,116,139,0.3)] cursor-pointer"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>{isRunning ? "Running..." : "Run Code"}</span>
                </button>

                {rateLimitCountdown > 0 ? (
                  <div className="text-rose-500 font-mono text-xs font-bold px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                    COOLDOWN: {rateLimitCountdown}s
                  </div>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || isRunning}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-50 px-4 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_18px_rgba(147,51,234,0.4)] cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isSubmitting ? "Submitting..." : "Submit"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* CodeMirror Editor Container with Focus Glow */}
            <div className="flex-1 relative min-h-0 bg-[#0d1117] flex overflow-hidden border-b border-zinc-200 dark:border-slate-800/80 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/30 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-200">
              <CodeMirror
                value={sourceCode}
                height="100%"
                className="w-full h-full text-sm"
                theme="dark"
                extensions={[getLanguageExtension(language), ...ideExtensions]}
                onChange={(val) => setSourceCode(val)}
                readOnly={isSubmitting || isRunning}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLine: true,
                  highlightActiveLineGutter: true,
                  foldGutter: false,
                  dropCursor: true,
                  allowMultipleSelections: false,
                  indentOnInput: true,
                }}
              />
            </div>

            {/* Console / Output Tabs */}
            <div className="h-72 bg-white dark:bg-[#0f172a] flex flex-col shrink-0 min-h-0 overflow-hidden">
              <div className="h-10 border-b border-zinc-150 dark:border-slate-800/60 px-4 flex items-center justify-between bg-zinc-50 dark:bg-slate-900/50">
                <div className="flex space-x-5 text-[11px] font-mono font-bold uppercase tracking-wider">
                  <button
                    onClick={() => setActiveTab("console")}
                    className={`pb-2 mt-1.5 transition-all flex items-center gap-1.5 relative cursor-pointer ${
                      activeTab === "console"
                        ? "text-purple-400 font-bold"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Console (Run Code)</span>
                    {activeTab === "console" && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full animate-pulse" />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("results")}
                    className={`pb-2 mt-1.5 transition-all flex items-center gap-1.5 relative cursor-pointer ${
                      activeTab === "results"
                        ? "text-blue-400 font-bold"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Submission Results</span>
                    {activeTab === "results" && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full animate-pulse" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4.5 font-mono text-xs bg-zinc-50/50 dark:bg-slate-900/20">
                {activeTab === "console" ? (
                  <div className="space-y-4 h-full flex flex-col">
                    <div>
                      <label className="block text-zinc-500 dark:text-slate-400 font-bold mb-1 uppercase text-[10px]">
                        Custom Input
                      </label>
                      <textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-lg p-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 resize-none h-20 text-xs font-mono"
                        placeholder="Enter custom input here..."
                      />
                    </div>

                    <div className="flex-1 flex flex-col min-h-[100px]">
                      <label className="block text-zinc-500 dark:text-slate-400 font-bold mb-1 uppercase text-[10px]">
                        Execution Output
                      </label>
                      <div className="flex-1 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-lg p-3 text-zinc-800 dark:text-zinc-200 overflow-y-auto">
                        {isRunning ? (
                          <div className="flex items-center gap-2 text-indigo-400 animate-pulse">
                            <Cpu className="w-4 h-4 animate-spin" />
                            <span>Executing code...</span>
                          </div>
                        ) : runResult ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-slate-800 pb-2">
                              <span
                                className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase border transition-all duration-300 ${
                                  runResult.status === "SUCCESS"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                    : "bg-rose-500/10 text-rose-400 border-rose-500/25 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                                }`}
                              >
                                {runResult.status}
                              </span>

                              <span className="text-zinc-500 dark:text-slate-400 text-[10px]">
                                Time: {runResult.executionTimeMs} ms
                              </span>
                            </div>

                            {runResult.actualOutput && (
                              <div>
                                <div className="text-[10px] text-zinc-400 dark:text-slate-500 font-bold mb-1">
                                  STDOUT
                                </div>
                                <pre className="whitespace-pre-wrap break-words text-xs text-zinc-800 dark:text-slate-200">
                                  {runResult.actualOutput}
                                </pre>
                              </div>
                            )}

                            {runResult.errorMessage && (
                              <div>
                                <div className="text-[10px] text-rose-400 font-bold mb-1">
                                  ERROR
                                </div>
                                <pre className="text-rose-500 dark:text-rose-400 whitespace-pre-wrap break-words bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg text-xs">
                                  {runResult.errorMessage}
                                </pre>
                              </div>
                            )}

                            {!runResult.actualOutput &&
                              !runResult.errorMessage && (
                                <div className="text-zinc-400 dark:text-slate-500 italic">
                                  Process exited with no output.
                                </div>
                              )}
                          </div>
                        ) : (
                          <div className="text-zinc-400 dark:text-slate-500 italic flex items-center justify-center h-full">
                            Click "Run Code" to execute with custom input.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4.5">
                    {rateLimitError && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <div className="font-semibold text-xs font-mono uppercase tracking-wide">
                            Grading rate limit hit
                          </div>
                          <p className="text-[11px] font-sans leading-normal text-rose-500">
                            {rateLimitError}
                          </p>
                        </div>
                      </div>
                    )}

                    {isSubmitting && (
                      <div className="space-y-1.5">
                        {gradingLogs.map((log, idx) => (
                          <div
                            key={idx}
                            className="text-zinc-500 dark:text-slate-400 flex items-center gap-2"
                          >
                            <span className="text-zinc-400 dark:text-slate-600 select-none">
                              ❯
                            </span>
                            <span>{log}</span>
                          </div>
                        ))}
                        <div className="text-indigo-400 font-bold flex items-center gap-2 animate-pulse mt-1">
                          <Cpu className="w-3.5 h-3.5 animate-spin" />
                          <span>
                            {currentSubmission?.status === "RUNNING"
                              ? "Running..."
                              : currentSubmission?.status === "PENDING"
                                ? "Pending..."
                                : "Submitting..."}
                          </span>{" "}
                        </div>
                      </div>
                    )}

                    {!isSubmitting && !currentSubmission && !rateLimitError && (
                      <div className="h-32 flex flex-col items-center justify-center text-center text-zinc-400 dark:text-slate-500 space-y-1 font-sans">
                        <Terminal className="w-6 h-6 text-zinc-300 dark:text-slate-600" />
                        <div className="text-xs font-bold font-mono uppercase text-zinc-500 dark:text-slate-400 tracking-wider">
                          Evaluation idle
                        </div>
                        <p className="text-[11px] text-zinc-400 dark:text-slate-500 max-w-xs leading-relaxed">
                          Submit your code solution to run full suite test
                          executions.
                        </p>
                      </div>
                    )}

                    {currentSubmission &&
                      currentSubmission.status !== "RUNNING" &&
                      currentSubmission.status !== "PENDING" && (
                        <div className="space-y-4 font-mono text-xs">
                          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-slate-800 pb-2">
                            <div className="flex items-center gap-2">
                              {/* {currentSubmission.status === "ACCEPTED" ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-500" />
                            )} */}
                              {getStatusIcon(currentSubmission.status)}
                              <span
                                className={`font-bold text-sm tracking-wide transition-all duration-300 ${getStatusColor(currentSubmission.status)}`}
                              >
                                {verdictLabels[currentSubmission.status] ??
                                  currentSubmission.status}
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-500 dark:text-slate-400">
                              Evaluation finished in{" "}
                              {currentSubmission.results?.[0]
                                ?.executionTimeMs || 84}{" "}
                              ms
                            </span>
                          </div>
                          <div className="mt-3 mb-4 flex items-center gap-2">
                            <span className="text-xs text-zinc-500 dark:text-slate-400">
                              Passed
                            </span>

                            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-xs">
                              {currentSubmission.passedTestCases} /{" "}
                              {currentSubmission.totalTestCases}
                            </span>

                            <span className="text-xs text-zinc-500 dark:text-slate-400">
                              Test Cases
                            </span>
                          </div>
                          <div className="space-y-2">
                            {currentSubmission.results?.map((res, idx) => {
                              const isHidden =
                                !res.actualOutput &&
                                !res.errorMessage &&
                                idx >= 2;

                              if (isHidden) {
                                return (
                                  <div
                                    key={res.id || idx}
                                    className="p-2.5 bg-zinc-100 dark:bg-slate-900/60 border border-zinc-200 dark:border-slate-800 rounded-xl flex items-center justify-between select-none"
                                  >
                                    <div className="flex items-center gap-2 text-zinc-500 dark:text-slate-500">
                                      <LockKeyhole className="w-3.5 h-3.5" />
                                      <span className="font-semibold tracking-wide">
                                        Test Case #{idx + 1} (Hidden Evaluation)
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider bg-zinc-200/50 dark:bg-slate-800 px-2 py-0.5 rounded border border-zinc-300 dark:border-slate-700">
                                      LOCKED
                                    </span>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={res.id || idx}
                                  className="p-2.5 bg-white dark:bg-slate-900/40 border border-zinc-200 dark:border-slate-800/80 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shadow-2xs"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`w-2 h-2 rounded-full ${
                                          res.passed
                                            ? "bg-emerald-500"
                                            : "bg-rose-500"
                                        }`}
                                      />
                                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                        Test Case #{idx + 1}
                                      </span>
                                    </div>
                                    {res.errorMessage && (
                                      <pre className="text-[11px] text-rose-500 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg max-w-lg overflow-x-auto leading-relaxed">
                                        <code>{res.errorMessage}</code>
                                      </pre>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-[11px] text-zinc-500 dark:text-slate-400">
                                    <div className="tabular-nums">
                                      Time:{" "}
                                      <span className="text-zinc-800 dark:text-zinc-200 font-bold">
                                        {res.executionTimeMs}ms
                                      </span>
                                    </div>
                                    <span
                                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                                        res.passed
                                          ? "text-emerald-700 dark:text-emerald-400 border-emerald-500/25 bg-emerald-500/10"
                                          : "text-rose-700 dark:text-rose-400 border-rose-500/25 bg-rose-500/10"
                                      }`}
                                    >
                                      {res.passed ? "Passed" : "Failed"}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
