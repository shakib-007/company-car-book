"use client";

import { motion } from "framer-motion";

export function AuthBrandPanel() {
  return (
    <div className="relative flex h-full min-h-[240px] w-full flex-col justify-center overflow-hidden bg-teal-800 px-8 py-12 text-white lg:min-h-screen lg:px-16">
      <motion.div
        className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-teal-500/30"
        animate={{ x: [0, 24, 0], y: [0, 18, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-emerald-400/20"
        animate={{ x: [0, -20, 0], y: [0, -16, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-16 top-24 h-24 w-24 rounded-full border border-white/20"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-lg">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-100"
        >
          Apex Fleet
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mt-4 text-4xl font-semibold leading-tight lg:text-5xl"
        >
          Company Car Booking
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mt-4 max-w-md text-sm leading-relaxed text-teal-50 lg:text-base"
        >
          Request trips, assign drivers, and follow every journey from pickup to drop-off.
        </motion.p>
        <motion.div
          className="mt-10 h-1 w-24 rounded-full bg-teal-300"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        />
      </div>
    </div>
  );
}
