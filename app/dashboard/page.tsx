"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function DashboardPage() {
  const [data, setData] = useState({
    whatsapp: { total: 0, used: 0, unused: 0 },
    email: { total: 0, used: 0, unused: 0 },
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const res = await fetch("/api/dashboard");
      const result = await res.json();

      setData({
        whatsapp: result.whatsapp || { total: 0, used: 0, unused: 0 },
        email: result.email || { total: 0, used: 0, unused: 0 },
      });
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-14">

        {/* ========================= TOP METRICS SECTION ========================= */}

        <div className="grid md:grid-cols-2 gap-10">

          {/* WhatsApp Section */}
          <div className="bg-gradient-to-br from-orange-500 to-yellow-400 p-8 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold text-black mb-6">
              WhatsApp Metrics
            </h2>

            <div className="grid grid-cols-3 gap-6">

              <MetricCard
                title="Total Numbers"
                value={data.whatsapp.total}
              />

              <MetricCard
                title="Used Numbers"
                value={data.whatsapp.used}
              />

              <MetricCard
                title="Unused Numbers"
                value={data.whatsapp.unused}
              />

            </div>
          </div>

          {/* Email Section */}
          <div className="bg-gradient-to-br from-yellow-400 to-orange-300 p-8 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold text-black mb-6">
              Email Metrics
            </h2>

            <div className="grid grid-cols-3 gap-6">

              <MetricCard
                title="Total Emails"
                value={data.email.total}
              />

              <MetricCard
                title="Used Emails"
                value={data.email.used}
              />

              <MetricCard
                title="Unused Emails"
                value={data.email.unused}
              />

            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-black opacity-30"></div>

        {/* ========================= ACTION SECTION ========================= */}

        <div className="grid md:grid-cols-3 gap-8">

          <ActionCard title="Request Data" link="/run-campagian" />
          <ActionCard title="Add Data" link="/upload" />
          <ActionCard title="Failed Campaigns" link="/failed" />
          <ActionCard title="Slots Information" link="/slots" />
          <ActionCard title="Admin" link="/admin" />
          <ActionCard title="Global Search" link="/global-search" />

        </div>

      </div>
    </DashboardLayout>
  );
}

/* ========================= METRIC CARD ========================= */

function MetricCard({ title, value }: any) {
  return (
    <div className="bg-yellow-500 rounded-xl p-6 text-center border-4 border-white shadow-lg hover:scale-105 transition">
      <p className="text-black font-medium text-sm mb-2">
        {title}
      </p>
      <p className="text-2xl font-bold text-black">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

/* ========================= ACTION CARD ========================= */

function ActionCard({ title, link }: any) {
  return (
    <Link href={link}>
      <div className="bg-yellow-500 p-6 rounded-xl border-4 border-white text-center font-semibold text-black shadow-lg hover:scale-105 hover:shadow-2xl transition cursor-pointer">
        {title}
      </div>
    </Link>
  );
}
