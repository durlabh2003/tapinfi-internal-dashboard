"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] =
    useState("");
  const [message, setMessage] =
    useState("");

  async function handleReset() {
    const res = await fetch(
      "/api/auth/reset-password",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      setMessage(
        "Password reset successfully."
      );
    } else {
      setMessage(data.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="bg-[#1e293b] p-8 rounded-xl w-full max-w-md space-y-6">
        <h2 className="text-2xl text-cyan-400 font-bold">
          Reset Password
        </h2>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full p-3 rounded-xl bg-[#0f172a] border border-purple-500/30 text-white"
        />

        <button
          onClick={handleReset}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
        >
          Reset Password
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
