"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const links = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Run Campaign", href: "/run-campagian" },
  { name: "Upload Data", href: "/upload" },
  { name: "Slots", href: "/slots" },
  { name: "Global Search", href: "/global-search" },
  { name: "Admin", href: "/admin" },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-[#111122] border-r border-cyan-500/30 p-6">
      <h2 className="text-xl font-bold neon-text mb-8">
        Campaign OS
      </h2>

      <div className="space-y-4">
        {links.map((link, index) => (
          <motion.div
            key={index}
            whileHover={{ x: 5 }}
            className="text-gray-300 hover:text-cyan-400 transition"
          >
            <Link href={link.href}>{link.name}</Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
