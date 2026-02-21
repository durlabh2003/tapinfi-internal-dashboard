"use client";

import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#141428]/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl flex-nowrap items-center gap-4 px-6 sm:px-8">
        
        {/* Element 1: Decorative Accent Bar */}
        <div className="h-6 w-1 flex-none rounded-full bg-gradient-to-b from-cyan-400 to-purple-600" />
        
        {/* Element 2: Title (Pushed to left, but part of same row) */}
        <h1 className="mr-auto whitespace-nowrap text-xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
          Enterprise <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Manager</span>
        </h1>

        {/* Element 3: Logout Button */}
        <motion.button
          whileHover={{ 
            scale: 1.05, 
            boxShadow: "0px 0px 20px rgba(139, 92, 246, 0.5)" 
          }}
          whileTap={{ scale: 0.95 }}
          className="whitespace-nowrap rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/20 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          Logout
        </motion.button>
      </div>
    </nav>
  );
}