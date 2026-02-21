"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AdminPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    const res = await fetch("/api/audit");
    const data = await res.json();
    setLogs(data);
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl neon-text font-bold">
          Audit Logs
        </h1>

        {logs.map((log) => (
          <div key={log.id} className="neon-card p-4">
            <div>User: {log.user_email}</div>
            <div>Action: {log.action_type}</div>
            <div>Entity: {log.entity}</div>
            <div>Date: {log.created_at}</div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
