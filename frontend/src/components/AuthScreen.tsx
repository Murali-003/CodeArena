import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Terminal,
  Shield,
  ArrowRight,
  User,
  AlertCircle,
  Lock,
} from "lucide-react";
import { api } from "../api";
import Lottie from "lottie-react";
import dashboardCoding from "../assets/lottie/DashboardCoding.json";

interface AuthScreenProps {
  onLoginSuccess: (user: {
    id: number;
    username: string;
    role: string;
  }) => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }
    if (!isLogin && !email.trim()) {
      setError("Email is required for registration");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? { username: username.trim(), password: password.trim() }
        : {
            username: username.trim(),
            email: email.trim(),
            password: password.trim(),
          };

      const response = await api.post(endpoint, payload);

      // Backend returns LoginResponse (token, userId, username, role)
      onLoginSuccess({
        id: response.userId,
        username: response.username,
        role: response.role || "USER",
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAuth();
  };
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0a0f1f] to-[#111827] flex items-center justify-center p-4 selection:bg-zinc-800 selection:text-white">
      {" "}
      {/* Decorative subtle ambient lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-6xl bg-zinc-950 border border-zinc-900 rounded-2xl shadow-2xl relative overflow-hidden"
      >
        {/* Terminal Header Accents */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        <div className="grid lg:grid-cols-2 min-h-[700px]">
          {/* Left Side */}
          <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-10 border-r border-zinc-900">
            <Lottie
              animationData={dashboardCoding}
              loop
              className="w-[340px] h-[340px]"
            />

            <h2 className="text-3xl font-bold text-white mt-6">
              Code. Compete. Conquer.
            </h2>

            <p className="text-zinc-400 text-center mt-3 max-w-sm leading-relaxed">
              Practice coding problems, improve your programming skills, climb
              the leaderboard and become a better developer.
            </p>

            {/* <div className="mt-8 space-y-3 text-sm text-zinc-300">
              <div>✓ Live Code Execution</div>
              <div>✓ Hidden Test Cases</div>
              <div>✓ Global Leaderboards</div>
              <div>✓ Daily Streak Tracking</div>
            </div> */}
          </div>

          {/* Right Side */}
          <div className="flex items-center justify-center p-8">
            <div className="w-full max-w-md">
              {/* CodeArena Brand Logo */}
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-blue-500 shadow-inner">
                  <Terminal className="w-7 h-7" />{" "}
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-1.5">
                    Code<span className="text-blue-500">Arena</span>
                  </h1>
                  <p className="text-xs text-zinc-500 font-mono tracking-wider">
                    FRONTEND COMPANION
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-zinc-100">
                    {isLogin ? "Welcome Developer" : "Create Account"}
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1">
                    {isLogin
                      ? "Join the arena to solve challenges, log submissions, and track your streak."
                      : "Register a new handle to enter the arena."}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5"
                    >
                      Developer Handle
                    </label>
                    <div className="relative">
                      <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g., rust_lord"
                        disabled={loading}
                        className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono"
                      />
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                    </div>
                  </div>

                  {!isLogin && (
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5"
                      >
                        Email
                      </label>
                      <div className="relative">
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          disabled={loading}
                          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono"
                        />
                        <User className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                      </div>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={loading}
                        className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono"
                      />
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start space-x-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs"
                    >
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
                  >
                    <span>
                      {loading
                        ? "Authenticating..."
                        : isLogin
                          ? "Enter Arena"
                          : "Register"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {/* Divider */}
                  <div className="flex items-center my-5">
                    <div className="flex-1 border-t border-zinc-800"></div>

                    <span className="px-3 text-xs text-zinc-500 font-mono">
                      OR
                    </span>

                    <div className="flex-1 border-t border-zinc-800"></div>
                  </div>

                  {/* Google Login */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full bg-white hover:bg-zinc-100 border border-zinc-300 rounded-lg py-3 flex items-center justify-center gap-3 transition-all shadow-sm"
                  >
                    <img
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google"
                      className="w-5 h-5"
                    />

                    <span className="text-zinc-900 font-medium">
                      Continue with Google
                    </span>
                  </button>
                </form>

                <div className="relative my-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-xs text-blue-500 hover:text-blue-400 transition-colors font-mono"
                  >
                    {isLogin
                      ? "Need an account? Register ->"
                      : "<- Back to Login"}
                  </button>
                </div>

                {/* Gaps Banner */}
                <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-lg p-3.5 space-y-2">
                  <div className="flex items-center space-x-2 text-zinc-400">
                    <Shield className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs font-semibold tracking-wider font-mono text-[10px] uppercase">
                      SECURITY NOTE
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
                    JWT tokens are strictly delivered via secure{" "}
                    <strong>HttpOnly cookies</strong>, preventing XSS-based
                    exfiltration. The frontend relies solely on HTTP
                    interceptors to manage state passively.
                  </p>{" "}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
