"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    const res = await fetch(
      "/api/auth/forgot-password",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    if (res.ok) {
      setMessage(
        "If email exists, reset link sent."
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="bg-[#1e293b] p-8 rounded-xl w-full max-w-md space-y-6">
        <h2 className="text-2xl text-cyan-400 font-bold">
          Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full p-3 rounded-xl bg-[#0f172a] border border-cyan-500/30 text-white"
        />

        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
        >
          Send Reset Link
        </button>

        {message && (
          <div className="text-green-400 text-sm">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
