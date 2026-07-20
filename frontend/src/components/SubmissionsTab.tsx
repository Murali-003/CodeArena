import { useState, useEffect } from "react";
import { Submission, SubmissionResult } from "../types";
import { api } from "../api";
import { History, ShieldAlert, FileCode, CheckCircle, AlertTriangle, Eye, ArrowLeft, RefreshCw, Layers } from "lucide-react";

// interface SubmissionsTabProps {
//   userId: number;
// }
export interface Submission {
    id: number;
    problemId: number;
    problemTitle?: string;
    language: string;
    status: string;
    submittedAt: string;
    sourceCode?: string;
    results?: SubmissionResult[];

    passedTestCases?: number;
    totalTestCases?: number;
}

export default function SubmissionsTab({ userId }: SubmissionsTabProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [subDetailLoading, setSubDetailLoading] = useState(false);

  async function fetchSubmissions() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/api/submissions/user/${userId}`);
      setSubmissions(data.content ?? data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
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
      alert(err.message || "Could not retrieve details");
    } finally {
      setSubDetailLoading(false);
    }
  };

  const getStatusColor = (status: Submission["status"]) => {
    if (status === "ACCEPTED") return "text-emerald-650 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/15 dark:border-emerald-500/20";
    if (status === "RUNNING") return "text-blue-600 dark:text-blue-400 bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/15 dark:border-blue-500/20";
    return "text-rose-655 dark:text-rose-400 bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/15 dark:border-rose-500/20";
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg" />
        <div className="h-44 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">History Engine Unavailable</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">{error}</p>
        <button
          onClick={fetchSubmissions}
          className="px-3.5 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 font-mono rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          Retry Load
        </button>
      </div>
    );
  }

  if (selectedSub) {
    return (
      <div className="space-y-6">
        {/* Detail Header / Back */}
        <div className="flex justify-between items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-4 rounded-xl transition-colors duration-200 shadow-sm">
          <button
            onClick={() => setSelectedSub(null)}
            className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO LOGS</span>
          </button>
          <span className="text-[10px] font-mono text-zinc-500">
            SUBMISSION_ID: <span className="text-zinc-700 dark:text-zinc-400">#{selectedSub.id}</span>
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Metadata Card */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 space-y-4 shadow-sm transition-colors duration-200">
            <h4 className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">Evaluation Status</h4>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Problem:</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-bold truncate max-w-[155px]">{selectedSub.problemTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Language:</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-bold">{selectedSub.language}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Result:</span>
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getStatusColor(selectedSub.status)}`}>
                  {selectedSub.status}
                </span>
              </div>
             
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 shadow-sm">
    <div className="flex items-center justify-between">

        <div>
            <p className="text-xs font-mono uppercase text-zinc-500">
                Test Case Summary
            </p>

            <h2 className="mt-2 text-2xl font-bold">
                {selectedSub.passedTestCases} / {selectedSub.totalTestCases}
            </h2>

            <p className="text-sm text-zinc-500">
                Test Cases Passed
            </p>
        </div>

        {selectedSub.passedTestCases === selectedSub.totalTestCases ? (
            <CheckCircle className="w-10 h-10 text-emerald-500" />
        ) : (
            <AlertTriangle className="w-10 h-10 text-amber-500" />
        )}

    </div>
</div>
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 md:col-span-2 space-y-4 shadow-sm transition-colors duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-150 dark:border-zinc-900">
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-blue-500" />
                Source Code Preview
              </span>
            </div>
            <pre className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-150 dark:border-zinc-900 rounded-lg text-xs font-mono text-zinc-700 dark:text-zinc-300 overflow-x-auto leading-relaxed max-h-[350px]">
              <code>{selectedSub.sourceCode || "# No source file content archived."}</code>
            </pre>
          </div>
        </div>

        {/* Results Panel */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 space-y-4 shadow-sm transition-colors duration-200">
          <h4 className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">Test Case Assertions</h4>
          <div className="space-y-2.5 font-mono text-xs">
            {selectedSub.results?.length === 0 ? (
              <p className="text-zinc-500 py-2">No individual assertion logs compiled for this run.</p>
            ) : (
              selectedSub.results.map((r, idx) => (
                <div key={r.id} className="p-3 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-150 dark:border-zinc-900/80 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${r.passed ? "bg-emerald-500" : "bg-rose-500"}`} />
                    <span className="text-zinc-650 dark:text-zinc-400 font-semibold">Test Case #{idx + 1}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/40 px-1.5 py-0.5 rounded">
                      ID: {r.testCaseId}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-zinc-550 text-[11px]">
                    <div>
                      Time: <span className="text-zinc-800 dark:text-zinc-300 font-bold">{r.executionTimeMs}ms</span>
                    </div>
                    <div>
                      Memory: <span className="text-zinc-800 dark:text-zinc-300 font-bold">{r.memoryUsedKb}kb</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase border ${
                      r.passed ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : "text-rose-600 dark:text-rose-400 border-rose-500/20 bg-rose-500/5"
                    }`}>
                      {r.passed ? "Passed" : "Failed"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex justify-between items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-4 rounded-xl transition-colors duration-200 shadow-sm">
        <div>
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-500" />
            Submission Log File
          </h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Chronological record of all compiled evaluations</p>
        </div>
        <button
          onClick={fetchSubmissions}
          className="p-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-550 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-all flex items-center justify-center cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-12 text-center space-y-3 shadow-sm transition-colors duration-200">
          <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 flex items-center justify-center mx-auto">
            <History className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">No Submissions Cataloged</h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto font-sans leading-relaxed">
            You haven't submitted any code solutions yet. Select a challenge from the Problems repository to begin compiling and running code.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl overflow-hidden shadow-sm transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-sm">
              <thead>
                <tr className="border-b border-zinc-150 dark:border-zinc-900 font-mono text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none bg-zinc-50 dark:bg-zinc-900/10">
                  <th className="py-3 px-6 font-semibold">Submitted Date</th>
                  <th className="py-3 px-6 font-semibold">Problem</th>
                  <th className="py-3 px-6 font-semibold">Lang</th>
                  <th className="py-3 px-6 font-semibold">Status</th>
                  <th className="py-3 px-6 font-semibold text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-900/40 font-mono text-xs">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/10 transition-colors">
                    <td className="py-3.5 px-6 text-zinc-500">
                      {new Date(sub.submittedAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-semibold text-zinc-750 dark:text-zinc-200">
                        {sub.problemTitle || `Problem #${sub.problemId}`}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/40 px-1.5 py-0.5 rounded uppercase">
                        {sub.language}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getStatusColor(sub.status)}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleViewCode(sub.id)}
                        className="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/20 px-2.5 py-1.5 rounded-lg cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-semibold uppercase font-sans">Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
