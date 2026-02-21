"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function LabelPage() {
  const [channel, setChannel] = useState("WhatsApp");
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");

  async function addLabel() {
    await fetch("/api/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel,
        value,
        label,
        user: "internal",
      }),
    });

    alert("Label Added");
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-xl">
        <h1 className="text-2xl neon-text font-bold">
          Label Management
        </h1>

        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="input"
        >
          <option>WhatsApp</option>
          <option>Email</option>
        </select>

        <input
          placeholder="Contact / Email"
          onChange={(e) => setValue(e.target.value)}
          className="input"
        />

        <input
          placeholder="Label"
          onChange={(e) => setLabel(e.target.value)}
          className="input"
        />

        <button onClick={addLabel} className="neon-button">
          Add Label
        </button>
      </div>
    </DashboardLayout>
  );
}
