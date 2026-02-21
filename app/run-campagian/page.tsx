"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function RunCampaignPage() {
  const [channel, setChannel] = useState("WhatsApp");
  const [interval, setInterval] = useState(1);
  const [duration, setDuration] = useState(60);
  const [dataType, setDataType] = useState("New");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);

  // New: let user directly specify required count
  const [useCustomCount, setUseCustomCount] = useState(false);
  const [requiredCount, setRequiredCount] = useState(100);

  async function startCampaign() {
    try {
      setLoading(true);

      const body: Record<string, unknown> = {
        channel,
        dataType,
        label,
        user: "internal",
      };

      if (useCustomCount) {
        body.requiredCount = requiredCount;
      } else {
        body.interval = interval;
        body.duration = duration;
      }

      const res = await fetch("/api/run-campaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.message);
        setLoading(false);
        return;
      }

      // Auto download file
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "slot.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      alert("Slot generated successfully.");
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-xl space-y-6">
        <h1 className="text-3xl font-bold neon-text">Run Campaign</h1>

        {/* Channel */}
        <div className="space-y-1">
          <label className="text-sm text-gray-400">Channel</label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="input"
          >
            <option>WhatsApp</option>
            <option>Email</option>
          </select>
        </div>

        {/* Data Type */}
        <div className="space-y-1">
          <label className="text-sm text-gray-400">Data Type</label>
          <select
            value={dataType}
            onChange={(e) => setDataType(e.target.value)}
            className="input"
          >
            <option>New</option>
            <option>Old</option>
          </select>
        </div>

        {/* Label */}
        <div className="space-y-1">
          <label className="text-sm text-gray-400">Label (optional)</label>
          <input
            type="text"
            placeholder="Label (optional)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="input"
          />
        </div>

        {/* Count Mode Toggle */}
        <div className="flex items-center gap-3 py-2">
          <span className="text-sm text-gray-400">Count Mode:</span>
          <button
            type="button"
            onClick={() => setUseCustomCount(false)}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
              !useCustomCount
                ? "neon-button"
                : "border border-gray-600 text-gray-400 hover:border-gray-400"
            }`}
          >
            Duration / Interval
          </button>
          <button
            type="button"
            onClick={() => setUseCustomCount(true)}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
              useCustomCount
                ? "neon-button"
                : "border border-gray-600 text-gray-400 hover:border-gray-400"
            }`}
          >
            Custom Count
          </button>
        </div>

        {/* Conditional Fields */}
        {useCustomCount ? (
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Required Count</label>
            <input
              type="number"
              placeholder="e.g. 100, 500, 1000"
              min={1}
              value={requiredCount}
              onChange={(e) => setRequiredCount(Number(e.target.value))}
              className="input"
            />
            <p className="text-xs text-gray-500">
              Directly specify how many contacts to pull (e.g. 100, 500, 1000).
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <label className="text-sm text-gray-400">Interval (minutes)</label>
              <input
                type="number"
                placeholder="Interval (minutes)"
                min={1}
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
                className="input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-400">Duration (minutes)</label>
              <input
                type="number"
                placeholder="Duration (minutes)"
                min={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="input"
              />
              <p className="text-xs text-gray-500">
                Calculated count: <strong>{Math.floor(duration / interval)}</strong> contacts
              </p>
            </div>
          </>
        )}

        <button
          onClick={startCampaign}
          disabled={loading}
          className="neon-button"
        >
          {loading ? "Generating..." : "Start Campaign"}
        </button>
      </div>
    </DashboardLayout>
  );
}
