"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type Props = {
  title: string;
  link: string;
};

export default function DashboardTile({ title, link }: Props) {
  return (
    <Link href={link}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="neon-card neon-border p-8 text-center cursor-pointer"
      >
        <h3 className="text-lg font-semibold neon-text">
          {title}
        </h3>
      </motion.div>
    </Link>
  );
}
