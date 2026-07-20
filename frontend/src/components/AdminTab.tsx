import React, { useState, useEffect } from "react";
import { api } from "../api";
import { Problem, TestCase } from "../types";
import {
  Terminal,
  Plus,
  Edit2,
  Trash2,
  ShieldAlert,
  CheckCircle,
  Database,
} from "lucide-react";

export default function AdminTab() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"details" | "testcases">(
    "details",
  );

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    descriptionMd: "",
    difficulty: "EASY",
    tags: "",

    memoryLimitMb: 256,
    timeLimitMs: 1000,

    hints: [
      {
        displayOrder: 1,
        hintText: "",
        unlockAfterAttempts: 3,
      },
    ],
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Test Case State
  const [tcInput, setTcInput] = useState("");
  const [tcOutput, setTcOutput] = useState("");
  const [tcIsHidden, setTcIsHidden] = useState(false);
  const [tcSaving, setTcSaving] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/api/problems?size=100");
      setProblems(data.content || []);
    } catch (err: any) {
      setError(err.message || "Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (problem?: Problem) => {
    if (problem) {
      setEditingProblem(problem);
      let tagsStr = "";
      if (problem.tags) {
        try {
          const parsed = JSON.parse(problem.tags);
          tagsStr = Array.isArray(parsed) ? parsed.join(", ") : problem.tags;
        } catch {
          tagsStr = problem.tags;
        }
      }
      setFormData({
        title: problem.title || "",
        descriptionMd: problem.description || "",
        difficulty: (problem.difficulty || "EASY").toUpperCase(),
        tags: tagsStr,

        memoryLimitMb: problem.memoryLimitMb ?? 256,
        timeLimitMs: problem.timeLimitMs ?? 1000,

        hints:
          problem.hints && problem.hints.length > 0
            ? problem.hints
            : [
                {
                  displayOrder: 1,
                  hintText: "",
                  unlockAfterAttempts: 3,
                },
              ],
      });
    } else {
      setEditingProblem(null);
      setFormData({
        title: "",
        descriptionMd: "",
        difficulty: "EASY",
        tags: "",
        memoryLimitMb: 256,
        timeLimitMs: 1000,
        hints: [
          {
            displayOrder: 1,
            hintText: "",
            unlockAfterAttempts: 3,
          },
        ],
      });
    }
    setActiveModalTab("details");
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProblem(null);
    setSaveError(null);
    setTcInput("");
    setTcOutput("");
    setTcIsHidden(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      const tagArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      const tagsJson = JSON.stringify(tagArray);

      const payload = {
        title: formData.title,
        descriptionMd: formData.descriptionMd,
        difficulty: formData.difficulty,
        tags: tagsJson,

        memoryLimitMb: formData.memoryLimitMb,
        timeLimitMs: formData.timeLimitMs,

        hints: formData.hints,
      };

      if (editingProblem) {
        await api.put(`/api/problems/${editingProblem.id}`, payload);
      } else {
        const newProb = await api.post("/api/problems", payload);
        setEditingProblem(newProb);
      }

      await fetchProblems();

      if (!editingProblem) {
        // Just created, switch to test cases
        setActiveModalTab("testcases");
      } else {
        handleCloseModal();
      }
    } catch (err: any) {
      setSaveError(err.message || "Failed to save problem");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this problem?"))
      return;
    try {
      await api.delete(`/api/problems/${id}`);
      await fetchProblems();
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const handleAddTestCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProblem) return;
    setTcSaving(true);
    try {
      const payload = {
        inputData: tcInput,
        expectedOutput: tcOutput,
        isHidden: tcIsHidden,
        timeLimitOverride: null,
      };
      const newTc = await api.post(
        `/api/problems/${editingProblem.id}/test-cases`,
        payload,
      );

      const updatedProb = {
        ...editingProblem,
        testCases: [...(editingProblem.testCases || []), newTc],
      };
      setEditingProblem(updatedProb);

      // Update problems list in background
      fetchProblems();

      setTcInput("");
      setTcOutput("");
      setTcIsHidden(false);
    } catch (err: any) {
      alert(`Failed to add testcase: ${err.message}`);
    } finally {
      setTcSaving(false);
    }
  };

  const handleDeleteTestCase = async (tcId: number) => {
    if (!editingProblem) return;
    try {
      await api.delete(`/api/test-cases/${tcId}`);
      const updatedProb = {
        ...editingProblem,
        testCases: editingProblem.testCases.filter((tc: any) => tc.id !== tcId),
      };
      setEditingProblem(updatedProb);
      fetchProblems();
    } catch (err: any) {
      alert(`Failed to delete testcase: ${err.message}`);
    }
  };

  if (loading && problems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 animate-pulse">
          Initializing Admin Interface...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono flex items-center gap-2">
            <Terminal className="w-5 h-5 text-purple-500" />
            Platform Administration
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Manage the master problem set.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Problem
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 text-rose-600">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-900">
                <th className="py-3 px-4 text-xs font-mono font-semibold text-zinc-500 uppercase">
                  ID
                </th>
                <th className="py-3 px-4 text-xs font-mono font-semibold text-zinc-500 uppercase">
                  Title
                </th>
                <th className="py-3 px-4 text-xs font-mono font-semibold text-zinc-500 uppercase">
                  Difficulty
                </th>
                <th className="py-3 px-4 text-xs font-mono font-semibold text-zinc-500 uppercase text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 dark:divide-zinc-900/60">
              {problems.map((prob) => (
                <tr
                  key={prob.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 group"
                >
                  <td className="py-3 px-4 font-mono text-sm text-zinc-500">
                    {prob.id}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {prob.title}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border uppercase">
                      {prob.difficulty || "UNKNOWN"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(prob)}
                        className="p-1.5 text-zinc-500 hover:text-blue-600 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prob.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white font-mono flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-500" />
                {editingProblem ? "Edit Problem" : "Create New Problem"}
              </h3>
              <button onClick={handleCloseModal} className="text-zinc-500">
                ✕
              </button>
            </div>

            {editingProblem && (
              <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30">
                <button
                  onClick={() => setActiveModalTab("details")}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${activeModalTab === "details" ? "border-purple-500 text-purple-600" : "border-transparent text-zinc-500"}`}
                >
                  Problem Details
                </button>
                <button
                  onClick={() => setActiveModalTab("testcases")}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${activeModalTab === "testcases" ? "border-purple-500 text-purple-600" : "border-transparent text-zinc-500"}`}
                >
                  Test Cases ({editingProblem.testCases?.length || 0})
                </button>
              </div>
            )}

            <div className="p-6 overflow-y-auto flex-1">
              {saveError && (
                <div className="mb-6 bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-600">
                  {saveError}
                </div>
              )}

              {activeModalTab === "details" ? (
                <form
                  id="problemForm"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Problem Title
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Difficulty
                      </label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            difficulty: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                      >
                        <option value="EASY">EASY</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HARD">HARD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Tags
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) =>
                          setFormData({ ...formData, tags: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Description (Markdown)
                    </label>
                    <textarea
                      required
                      value={formData.descriptionMd}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          descriptionMd: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white min-h-[250px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Memory Limit (MB)
                      </label>

                      <input
                        type="number"
                        min={64}
                        value={formData.memoryLimitMb}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            memoryLimitMb: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Time Limit (ms)
                      </label>

                      <input
                        type="number"
                        min={100}
                        value={formData.timeLimitMs}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            timeLimitMs: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Hints
                      </label>

                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            hints: [
                              ...formData.hints,
                              {
                                displayOrder: formData.hints.length + 1,
                                hintText: "",
                                unlockAfterAttempts: 3,
                              },
                            ],
                          })
                        }
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs"
                      >
                        + Add Hint
                      </button>
                    </div>

                    {formData.hints.map((hint, index) => (
                      <div
                        key={index}
                        className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-sm">
                            Hint {index + 1}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                hints: formData.hints.filter(
                                  (_, i) => i !== index,
                                ),
                              })
                            }
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>

                        <div>
                          <label className="block text-xs mb-1">
                            Unlock After Attempts
                          </label>

                          <input
                            type="number"
                            min={1}
                            value={hint.unlockAfterAttempts}
                            onChange={(e) => {
                              const hints = [...formData.hints];
                              hints[index].unlockAfterAttempts = Number(
                                e.target.value,
                              );

                              setFormData({
                                ...formData,
                                hints,
                              });
                            }}
                            className="w-32 px-3 py-2 border rounded-lg dark:bg-zinc-900"
                          />
                        </div>

                        <div>
                          <label className="block text-xs mb-1">
                            Hint Text
                          </label>

                          <textarea
                            rows={3}
                            value={hint.hintText}
                            onChange={(e) => {
                              const hints = [...formData.hints];
                              hints[index].hintText = e.target.value;

                              setFormData({
                                ...formData,
                                hints,
                              });
                            }}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-900"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Test Cases List */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Existing Test Cases
                    </h4>
                    {!editingProblem?.testCases ||
                    editingProblem.testCases.length === 0 ? (
                      <p className="text-sm text-zinc-500">
                        No test cases yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {editingProblem.testCases.map((tc: any, i: number) => (
                          <div
                            key={tc.id}
                            className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 relative"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-mono font-bold text-purple-600">
                                Test Case #{i + 1}
                              </span>
                              <div className="flex items-center gap-3">
                                {tc.isHidden ? (
                                  <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-medium">
                                    Hidden
                                  </span>
                                ) : (
                                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium">
                                    Sample/Visible
                                  </span>
                                )}
                                <button
                                  onClick={() => handleDeleteTestCase(tc.id)}
                                  className="text-rose-500 hover:text-rose-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-xs font-semibold text-zinc-500">
                                  Input
                                </span>
                                <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 p-2 rounded mt-1 border border-zinc-200 dark:border-zinc-800">
                                  {tc.inputData}
                                </pre>
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-zinc-500">
                                  Expected Output
                                </span>
                                <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 p-2 rounded mt-1 border border-zinc-200 dark:border-zinc-800">
                                  {tc.expectedOutput}
                                </pre>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <hr className="border-zinc-200 dark:border-zinc-800" />

                  {/* Add New Test Case Form */}
                  <form
                    onSubmit={handleAddTestCase}
                    className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800"
                  >
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add Test Case
                    </h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Input Data
                        </label>
                        <textarea
                          required
                          value={tcInput}
                          onChange={(e) => setTcInput(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white font-mono text-sm"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Expected Output
                        </label>
                        <textarea
                          required
                          value={tcOutput}
                          onChange={(e) => setTcOutput(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white font-mono text-sm"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tcIsHidden}
                          onChange={(e) => setTcIsHidden(e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Is Hidden (Used for grading, not shown to user)
                        </span>
                      </label>
                      <button
                        type="submit"
                        disabled={tcSaving}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-900 dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                      >
                        {tcSaving ? "Adding..." : "Add Test Case"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 rounded-lg"
              >
                Close
              </button>
              {activeModalTab === "details" && (
                <button
                  type="submit"
                  form="problemForm"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold"
                >
                  {saving
                    ? "Saving..."
                    : editingProblem
                      ? "Save Changes"
                      : "Save & Continue to Test Cases"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
