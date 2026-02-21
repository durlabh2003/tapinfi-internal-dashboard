"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";

type Slot = {
  slot_id: number;
  campaign_type: string;
  count: number;
  created_at: string;
};

export default function SlotsPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [filtered, setFiltered] = useState<Slot[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlots();
  }, []);

  useEffect(() => {
    const result = slots.filter((slot) =>
      String(slot.slot_id).includes(search)
    );
    setFiltered(result);
  }, [search, slots]);

  async function fetchSlots() {
    try {
      const res = await fetch("/api/slots");
      const data = await res.json();

      setSlots(data || []);
      setFiltered(data || []);
    } catch (err) {
      console.error("Error fetching slots:", err);
      setSlots([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold neon-text"
        >
          Campaign Slots
        </motion.h1>

        <input
          type="text"
          placeholder="Search by Slot ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input max-w-md"
        />

        <div className="bg-[#141428] border border-cyan-500/20 rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-6 text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-gray-400">No slots found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-[#1a1a2e] text-gray-300 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Slot ID</th>
                    <th className="px-6 py-4">Channel</th>
                    <th className="px-6 py-4">Count</th>
                    <th className="px-6 py-4">Created At</th>
                    <th className="px-6 py-4">Download</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((slot, index) => (
                    <motion.tr
                      key={slot.slot_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-t border-gray-700 hover:bg-[#1e1e35] transition"
                    >
                      <td className="px-6 py-4 font-mono text-cyan-400">
                        {slot.slot_id}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            slot.campaign_type === "WhatsApp"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {slot.campaign_type}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-purple-400 font-semibold">
                        {slot.count}
                      </td>

                      <td className="px-6 py-4 text-gray-400">
                        {new Date(
                          slot.created_at
                        ).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          dateStyle: "medium",
                          timeStyle: "medium",
                        })}
                      </td>

                      <td className="px-6 py-4">
                        <a
                          href={`/api/slots/download/${slot.slot_id}`}
                          className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/40 transition"
                        >
                          Download
                        </a>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
