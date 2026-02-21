"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState("");

  async function handleLogin() {
    setLoading(true);
    setError("");

    const res = await fetch(
      "/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    if (!res.ok) {
      const data = await res.json();
      setError(data.message);
      setLoading(false);
      return;
    }

    window.location.href =
      "/dashboard";
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1e293b] p-10 rounded-2xl border border-cyan-500/40 shadow-xl w-full max-w-md space-y-6"
      >
        <h1 className="text-3xl font-bold text-cyan-400 text-center">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full p-3 rounded-xl bg-[#0f172a] border border-cyan-500/30 text-white"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full p-3 rounded-xl bg-[#0f172a] border border-purple-500/30 text-white"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold hover:scale-[1.03] transition"
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>

        {error && (
          <div className="text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="text-center text-sm text-gray-400">
          <a
            href="/forgot-password"
            className="hover:text-cyan-400"
          >
            Forgot Password?
          </a>
        </div>
      </motion.div>
    </div>
  );
}
