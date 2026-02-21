"use client";

import { useState } from "react";

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] =
    useState("");
  const [newPassword, setNewPassword] =
    useState("");
  const [message, setMessage] =
    useState("");

  async function handleChange() {
    const res = await fetch(
      "/api/auth/change-password",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      setMessage("Password changed.");
    } else {
      setMessage(data.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="bg-[#1e293b] p-8 rounded-xl space-y-4 w-full max-w-md">
        <h2 className="text-xl text-cyan-400 font-bold">
          Change Password
        </h2>

        <input
          type="password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) =>
            setOldPassword(e.target.value)
          }
          className="w-full p-3 rounded-xl bg-[#0f172a] border border-cyan-500/30 text-white"
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) =>
            setNewPassword(e.target.value)
          }
          className="w-full p-3 rounded-xl bg-[#0f172a] border border-purple-500/30 text-white"
        />

        <button
          onClick={handleChange}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
        >
          Update Password
        </button>

        {message && (
          <div className="text-sm text-green-400">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
