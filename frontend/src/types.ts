export interface TestCase {
  id: number;
  isHidden: boolean;
  inputData: string;
  expectedOutput?: string;
}

export interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  acceptanceRate: string;
  testCases: TestCase[];
  tags?: string;
}

export interface SubmissionResult {
  id: number;
  testCaseId: number;
  passed: boolean;
  executionTimeMs: number;
  memoryUsedKb: number;
  stdout: string | null;
  stderr: string | null;
}

export interface Submission {
  id: number;
  userId: number;
  problemId: number;
  language: "PYTHON" | "JAVA" | "CPP";
  status: "RUNNING" | "ACCEPTED" | "WRONG_ANSWER" | "COMPILATION_ERROR" | "TIME_LIMIT_EXCEEDED" | "MEMORY_LIMIT_EXCEEDED" | "RUNTIME_ERROR";
  submittedAt: string;
  results: SubmissionResult[];
  sourceCode: string;
  problemTitle?: string;
}

export interface LeaderboardUser {
  userId: number;
  username: string;
  problemsSolved: number;
  accuracy: number;
  rankPosition: number;
}

export interface StreakData {
  dailyCounts: Record<string, number>;
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
}

export interface User {
  id: number;
  username: string;
  role: string; // "ADMIN" | "USER" — from LoginResponse.role
}
