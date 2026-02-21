"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!query.trim()) return;

    setLoading(true);
    setResults(null);

    try {
      const res = await fetch("/api/global-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      setResults(data);

    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Title */}
        <h1 className="text-3xl font-bold text-cyan-400">
          Global Search
        </h1>

        {/* Search Bar */}
        <div className="flex gap-4">
          <input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search by Contact, Email, Label or Slot ID"
            className="flex-1 p-3 rounded-xl bg-[#1e293b] border border-cyan-500/30 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <button
            onClick={search}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold hover:scale-[1.03] transition-transform"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-10">

            {/* WhatsApp Results */}
            {results.whatsapp?.length > 0 && (
              <div className="bg-[#0f172a] p-6 rounded-2xl border border-cyan-500/30">
                <h2 className="text-xl font-semibold text-cyan-400 mb-4">
                  WhatsApp Contacts
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-white">
                    <thead className="text-gray-400">
                      <tr>
                        <th className="text-left py-2">
                          Contact
                        </th>
                        <th className="text-left py-2">
                          Slots
                        </th>
                        <th className="text-left py-2">
                          Labels
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.whatsapp.map(
                        (item: any) => (
                          <tr
                            key={item.id}
                            className="border-t border-gray-700"
                          >
                            <td className="py-2">
                              {item.contact_number}
                            </td>
                            <td className="py-2">
                              {item.slot_array?.join(
                                ", "
                              )}
                            </td>
                            <td className="py-2">
                              {item.labels?.join(
                                ", "
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Email Results */}
            {results.email?.length > 0 && (
              <div className="bg-[#0f172a] p-6 rounded-2xl border border-purple-500/30">
                <h2 className="text-xl font-semibold text-purple-400 mb-4">
                  Email Contacts
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-white">
                    <thead className="text-gray-400">
                      <tr>
                        <th className="text-left py-2">
                          Email
                        </th>
                        <th className="text-left py-2">
                          Slots
                        </th>
                        <th className="text-left py-2">
                          Labels
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.email.map(
                        (item: any) => (
                          <tr
                            key={item.id}
                            className="border-t border-gray-700"
                          >
                            <td className="py-2">
                              {item.email_id}
                            </td>
                            <td className="py-2">
                              {item.slot_array?.join(
                                ", "
                              )}
                            </td>
                            <td className="py-2">
                              {item.labels?.join(
                                ", "
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Slot Result */}
            {results.slot?.length > 0 && (
              <div className="bg-[#0f172a] p-6 rounded-2xl border border-pink-500/30">
                <h2 className="text-xl font-semibold text-pink-400 mb-4">
                  Slot Details
                </h2>

                {results.slot.map((slot: any) => (
                  <div
                    key={slot.slot_id}
                    className="text-white space-y-2"
                  >
                    <p>
                      <strong>Slot ID:</strong>{" "}
                      {slot.slot_id}
                    </p>
                    <p>
                      <strong>Type:</strong>{" "}
                      {slot.campaign_type}
                    </p>
                    <p>
                      <strong>Count:</strong>{" "}
                      {slot.count}
                    </p>
                    <p>
                      <strong>Created:</strong>{" "}
                      {new Date(
                        slot.created_at
                      ).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {results.whatsapp?.length === 0 &&
              results.email?.length === 0 &&
              results.slot?.length === 0 && (
                <div className="text-gray-400 text-center">
                  No results found.
                </div>
              )}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
