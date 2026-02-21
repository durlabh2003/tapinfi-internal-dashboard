"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";

export default function FailedCampaignPage() {
  const [slotId, setSlotId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleFailedUpload() {
    if (!file || !slotId) {
      setStatus("Provide Slot ID and file.");
      return;
    }

    setLoading(true);
    setStatus("");

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(
          e.target?.result as ArrayBuffer
        );

        const workbook = XLSX.read(data, {
          type: "array",
        });

        const sheet =
          workbook.Sheets[workbook.SheetNames[0]];

        const json = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
        });

        const failedValues = json
          .flat()
          .map((v: any) => String(v).trim())
          .filter(Boolean);

        const res = await fetch(
          "/api/report-failed",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              slotId,
              values: failedValues,
            }),
          }
        );

        const result = await res.json();

        if (!res.ok) {
          setStatus(result.message || "Error occurred");
        } else {
          setStatus(
            "Failed values reconciled successfully."
          );
        }

      } catch (err) {
        setStatus("Processing failed.");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-[#0f172a] border border-cyan-500/40 rounded-2xl p-8 shadow-xl space-y-8">

          {/* Title */}
          <h1 className="text-3xl font-bold text-cyan-400">
            Report Failed Campaign
          </h1>

          {/* Grid Layout */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Slot ID */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">
                Slot ID
              </label>
              <input
                type="number"
                placeholder="Enter Slot ID"
                value={slotId}
                onChange={(e) =>
                  setSlotId(e.target.value)
                }
                className="w-full p-3 rounded-xl bg-[#1e293b] border border-cyan-500/30 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">
                Upload Failed File
              </label>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) =>
                  setFile(
                    e.target.files?.[0] || null
                  )
                }
                className="w-full p-3 rounded-xl bg-[#1e293b] border border-purple-500/30 text-white focus:outline-none"
              />
            </div>

          </div>

          {/* Button */}
          <button
            onClick={handleFailedUpload}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:scale-[1.02] transition-transform text-white font-semibold"
          >
            {loading
              ? "Processing..."
              : "Process Failed Data"}
          </button>

          {/* Status */}
          {status && (
            <div className="text-sm text-green-400">
              {status}
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
