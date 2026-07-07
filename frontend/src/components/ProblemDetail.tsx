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
  FastForward
} from "lucide-react";

interface ProblemDetailProps {
  userId: number;
  problemId: number;
  onBack: () => void;
  onSubmissionSuccess?: () => void;
}

const BOILERPLATES: Record<number, Record<string, string>> = {
  1: {
    PYTHON: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your code here\n        pass`,
    JAVA: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[0];\n    }\n}`,
    CPP: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n};`
  },
  2: {
    PYTHON: `class Solution:\n    def reverseString(self, s: list[str]) -> None:\n        # Write your code here\n        pass`,
    JAVA: `class Solution {\n    public void reverseString(char[] s) {\n        // Write your code here\n    }\n}`,
    CPP: `class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        // Write your code here\n    }\n};`
  }
};

const DEFAULT_BOILERPLATE: Record<string, string> = {
  PYTHON: `# Write your Python code here\n\n`,
  JAVA: `public class Main {\n    public static void main(String[] args) {\n        // Write your Java code here\n    }\n}`,
  CPP: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ code here\n    return 0;\n}`
};

export default function ProblemDetail({ userId, problemId, onBack, onSubmissionSuccess }: ProblemDetailProps) {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editor states
  const [language, setLanguage] = useState<"PYTHON" | "JAVA" | "CPP">("PYTHON");
  const [sourceCode, setSourceCode] = useState("");

  // Submissions and polling states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
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

  useEffect(() => {
    async function loadProblem() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get(`/api/problems/${problemId}`);
        setProblem(data);
        
        let boilerplate = BOILERPLATES[problemId]?.[language];
        if (!boilerplate) {
            boilerplate = DEFAULT_BOILERPLATE[language];
        }
        setSourceCode(boilerplate);
        
        if (data.testCases && data.testCases.length > 0) {
            setCustomInput(data.testCases[0].inputData || "");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load problem details");
      } finally {
        setLoading(false);
      }
    }
    loadProblem();
  }, [problemId]);

  const handleLanguageChange = (lang: "PYTHON" | "JAVA" | "CPP") => {
    setLanguage(lang);
    let boilerplate = BOILERPLATES[problemId]?.[lang];
    if (!boilerplate) {
        boilerplate = DEFAULT_BOILERPLATE[lang];
    }
    setSourceCode(boilerplate);
  };

  useEffect(() => {
    if (rateLimitCountdown > 0) {
      countdownTimerRef.current = setTimeout(() => {
        setRateLimitCountdown(prev => prev - 1);
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
        customInput
      });
      setRunResult(result);
    } catch (err: any) {
      setRunResult({
        status: "RUNTIME_ERROR",
        stderr: err.message || "Failed to execute code",
        stdout: "",
        execTimeMs: 0
      });
    } finally {
      setIsRunning(false);
    }
  };

  const startSubmissionPoll = (submissionId: number) => {
    setGradingLogs(["Bootstrapping secure execution sandbox...", "Mounting compilers & libraries..."]);
    
    let tickCount = 0;
    pollIntervalRef.current = setInterval(async () => {
      tickCount++;
      try {
        const data: Submission = await api.get(`/api/submissions/${submissionId}?includeOutput=true`);
        setCurrentSubmission(data);

        if (data.status === "RUNNING") {
          if (tickCount === 1) {
            setGradingLogs(prev => [...prev, "Compiling source files into AST...", "Resolving static namespaces..."]);
          } else if (tickCount === 2) {
            setGradingLogs(prev => [...prev, "Spawning isolated runtime process...", "Executing test suite assertions..."]);
          } else {
            setGradingLogs(prev => [...prev, `Evaluating assertion vector ${tickCount}...`]);
          }
        } else {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setIsSubmitting(false);
          setGradingLogs(prev => [...prev, "Process completed.", `Status returned: ${data.status}`]);
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
        sourceCode
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

  const getDifficultyColor = (diff: "Easy" | "Medium" | "Hard" | undefined) => {
    if (diff === "Easy") return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/10";
    if (diff === "Medium") return "text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/10";
    return "text-rose-600 dark:text-rose-400 bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/10";
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
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Error</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">{error || "Challenge data missing."}</p>
        <button onClick={onBack} className="text-xs text-blue-600 hover:underline">Return to repository</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-96px)]">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-3 mb-4 shrink-0">
        <div className="flex items-center space-x-3.5">
          <button onClick={onBack} className="p-1.5 bg-zinc-50 dark:bg-transparent border border-zinc-200 dark:border-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-white rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-zinc-500 text-xs font-mono select-none">Problems</span>
            <ChevronRight className="w-3 h-3 text-zinc-400" />
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{problem.title}</h2>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => handleLanguageChange(language)} title="Reset code template" className="p-1.5 bg-zinc-50 dark:bg-transparent border border-zinc-200 dark:border-zinc-900 text-zinc-500 hover:text-zinc-700 rounded-lg">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0 overflow-hidden pb-4">
        {/* Left column: Description and Testcases */}
        <div className="flex flex-col border border-zinc-200 dark:border-zinc-900 rounded-xl bg-white dark:bg-zinc-950 min-h-0 shadow-sm">
          <div className="h-11 border-b border-zinc-150 dark:border-zinc-900 px-4 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/10">
            <div className="flex space-x-4 text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
              <span className="text-blue-600 border-b-2 border-b-blue-600 pb-3 mt-1.5">Description</span>
            </div>
            <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 font-sans text-sm text-zinc-700 dark:text-zinc-300">
            <h1 className="text-xl font-bold font-display text-zinc-800 dark:text-white mb-2">{problem.title}</h1>
            
            <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-zinc-150 dark:border-zinc-900">
              <span className="text-xs font-mono text-zinc-500 uppercase">Category:</span>
              <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">{problem.category}</span>
            </div>

            <div className="space-y-4 font-sans text-sm">
              <p className="whitespace-pre-wrap">{problem.description}</p>
            </div>

            {/* Test cases cleanly separated */}
            {problem.testCases && problem.testCases.length > 0 && (
                <div className="mt-8 space-y-4">
                    <h3 className="font-bold text-lg text-zinc-800 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">Examples</h3>
                    {problem.testCases.map((tc, idx) => (
                        <div key={tc.id} className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
                            <div className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">Example {idx + 1}:</div>
                            <div className="mb-2">
                                <span className="font-semibold text-zinc-600 dark:text-zinc-400">Input: </span>
                                <code className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-400">{tc.inputData}</code>
                            </div>
                            <div>
                                <span className="font-semibold text-zinc-600 dark:text-zinc-400">Output: </span>
                                <code className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-emerald-600 dark:text-emerald-400">{tc.expectedOutput}</code>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>

        {/* Right column: Editor and Results */}
        <div className="flex flex-col border border-zinc-200 dark:border-zinc-900 rounded-xl bg-white dark:bg-zinc-950 min-h-0 shadow-sm">
          <div className="h-11 border-b border-zinc-150 dark:border-zinc-900 px-4 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/10">
            <div className="flex items-center space-x-2.5">
              <Code2 className="w-4 h-4 text-zinc-500" />
              <div className="flex bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5">
                {(["PYTHON", "JAVA", "CPP"] as const).map((lang) => (
                  <button
                    key={lang} onClick={() => handleLanguageChange(lang)}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-md transition-all ${language === lang ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow" : "text-zinc-500"}`}
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
                className="bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white disabled:opacity-50 px-4 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5"
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
                  className="bg-purple-600 hover:bg-purple-500 text-white disabled:bg-purple-800 px-4 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isSubmitting ? "Submitting..." : "Submit"}</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 relative min-h-0 bg-zinc-50 dark:bg-[#09090b] flex overflow-hidden border-b border-zinc-200 dark:border-zinc-900">
            <textarea
              value={sourceCode} onChange={(e) => setSourceCode(e.target.value)}
              disabled={isSubmitting || isRunning} spellCheck={false}
              className="flex-1 bg-transparent p-4.5 font-mono text-sm text-zinc-800 dark:text-zinc-300 focus:outline-none resize-none selection:bg-zinc-200 dark:selection:bg-zinc-800 w-full h-full"
            />
          </div>

          {/* Console / Output Tabs */}
          <div className="h-72 bg-white dark:bg-zinc-950 flex flex-col shrink-0 min-h-0 overflow-hidden">
            <div className="h-10 border-b border-zinc-150 dark:border-zinc-900 px-4 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/25">
              <div className="flex space-x-5 text-[11px] font-mono font-bold uppercase tracking-wider">
                <button
                  onClick={() => setActiveTab("console")}
                  className={`pb-1.5 mt-1.5 transition-all flex items-center gap-1.5 ${activeTab === "console" ? "text-purple-600 border-b-2 border-b-purple-600" : "text-zinc-500 hover:text-zinc-700"}`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Console (Run Code)
                </button>
                <button
                  onClick={() => setActiveTab("results")}
                  className={`pb-1.5 mt-1.5 transition-all flex items-center gap-1.5 ${activeTab === "results" ? "text-blue-600 border-b-2 border-b-blue-600" : "text-zinc-500 hover:text-zinc-700"}`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Submission Results
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4.5 font-mono text-xs bg-zinc-50/50 dark:bg-zinc-950/40">
              {activeTab === "console" ? (
                <div className="space-y-4 h-full flex flex-col">
                    <div>
                        <label className="block text-zinc-500 font-bold mb-1 uppercase text-[10px]">Custom Input</label>
                        <textarea 
                            value={customInput} onChange={e => setCustomInput(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 resize-none h-20"
                            placeholder="Enter custom input here..."
                        />
                    </div>
                    
                    <div className="flex-1 flex flex-col min-h-[100px]">
                        <label className="block text-zinc-500 font-bold mb-1 uppercase text-[10px]">Execution Output</label>
                        <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-3 text-zinc-800 dark:text-zinc-200 overflow-y-auto">
                            {isRunning ? (
                                <div className="flex items-center gap-2 text-zinc-500 animate-pulse">
                                    <Cpu className="w-4 h-4 animate-spin" /> Executing code...
                                </div>
                            ) : runResult ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase border ${
                                            runResult.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                                            'bg-rose-100 text-rose-700 border-rose-200'
                                        }`}>
                                            {runResult.status}
                                        </span>
                                        <span className="text-zinc-500 text-[10px]">Time: {runResult.execTimeMs}ms</span>
                                    </div>
                                    
                                    {runResult.stdout && (
                                        <div>
                                            <div className="text-[10px] text-zinc-400 font-bold mb-1">STDOUT</div>
                                            <pre className="whitespace-pre-wrap break-words">{runResult.stdout}</pre>
                                        </div>
                                    )}
                                    {runResult.stderr && (
                                        <div>
                                            <div className="text-[10px] text-rose-400 font-bold mb-1 mt-2">STDERR / COMPILE ERROR</div>
                                            <pre className="text-rose-500 whitespace-pre-wrap break-words bg-rose-50 dark:bg-rose-950/20 p-2 rounded">{runResult.stderr}</pre>
                                        </div>
                                    )}
                                    {!runResult.stdout && !runResult.stderr && (
                                        <div className="text-zinc-400 italic">Process exited with no output.</div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-zinc-400 italic flex items-center justify-center h-full">Click "Run Code" to execute with custom input.</div>
                            )}
                        </div>
                    </div>
                </div>
              ) : (
                <div className="space-y-4.5">
                  {rateLimitError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-semibold text-xs font-mono uppercase tracking-wide">Grading rate limit hit</div>
                        <p className="text-[11px] font-sans leading-normal text-rose-500">{rateLimitError}</p>
                      </div>
                    </div>
                  )}

                  {isSubmitting && (
                    <div className="space-y-1.5">
                      {gradingLogs.map((log, idx) => (
                        <div key={idx} className="text-zinc-450 dark:text-zinc-500 flex items-center gap-2">
                          <span className="text-zinc-300 dark:text-zinc-700 select-none">❯</span>
                          <span>{log}</span>
                        </div>
                      ))}
                      <div className="text-blue-550 dark:text-blue-400 font-bold flex items-center gap-2 animate-pulse mt-1">
                        <Cpu className="w-3.5 h-3.5 animate-spin" />
                        <span>Grading in progress...</span>
                      </div>
                    </div>
                  )}

                  {!isSubmitting && !currentSubmission && !rateLimitError && (
                    <div className="h-32 flex flex-col items-center justify-center text-center text-zinc-400 dark:text-zinc-500 space-y-1 font-sans">
                      <Terminal className="w-6 h-6 text-zinc-300 dark:text-zinc-600" />
                      <div className="text-xs font-bold font-mono uppercase text-zinc-500 tracking-wider">Evaluation idle</div>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-600 max-w-xs leading-relaxed">Submit your code solution to run full suite test executions.</p>
                    </div>
                  )}

                  {currentSubmission && currentSubmission.status !== "RUNNING" && (
                    <div className="space-y-4 font-mono text-xs">
                      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-2">
                        <div className="flex items-center gap-2">
                          {currentSubmission.status === "ACCEPTED" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-bounce" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500" />
                          )}
                          <span className={`font-bold text-sm tracking-wide ${currentSubmission.status === "ACCEPTED" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                            {currentSubmission.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500">Evaluation finished in {currentSubmission.results?.[0]?.executionTimeMs || 84}ms</span>
                      </div>

                      <div className="space-y-2">
                        {currentSubmission.results?.map((res, idx) => {
                          const isHidden = !res.stdout && !res.stderr && idx >= 2; 
                          
                          if (isHidden) {
                            return (
                              <div key={res.id} className="p-2.5 bg-zinc-100 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 rounded-lg flex items-center justify-between select-none">
                                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-600">
                                  <LockKeyhole className="w-3.5 h-3.5" />
                                  <span className="font-semibold tracking-wide">Test Case #{idx + 1} (Hidden Evaluation)</span>
                                </div>
                                <span className="text-[10px] font-bold text-zinc-550 font-mono uppercase tracking-wider bg-zinc-200/50 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-850 px-2 py-0.5 rounded blur-[1px]">
                                  LOCKED
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div key={res.id} className="p-2.5 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-900 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shadow-sm">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full ${res.passed ? "bg-emerald-500" : "bg-rose-500"}`} />
                                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Test Case #{idx + 1}</span>
                                </div>
                                {res.stderr && (
                                  <pre className="text-[11px] text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/10 border border-rose-150 dark:border-rose-950/20 p-2 rounded max-w-lg overflow-x-auto leading-relaxed">
                                    <code>{res.stderr}</code>
                                  </pre>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-[11px] text-zinc-500">
                                <div className="tabular-nums">Time: <span className="text-zinc-800 dark:text-zinc-300 font-bold">{res.executionTimeMs}ms</span></div>
                                <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                                  res.passed ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : "text-rose-600 dark:text-rose-400 border-rose-500/20 bg-rose-500/5"
                                }`}>
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
  );
}
