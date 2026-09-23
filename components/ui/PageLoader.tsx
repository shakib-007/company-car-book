"use client";

import { motion } from "framer-motion";
import { Spinner } from "./Spinner";

export function PageLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col items-center gap-4"
      >
        <Spinner className="h-10 w-10" />
        <p className="text-sm font-medium text-slate-500">Loading</p>
      </motion.div>
    </div>
  );
}
