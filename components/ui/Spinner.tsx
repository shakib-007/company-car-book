"use client";

import { motion } from "framer-motion";

export function Spinner({
  className = "h-8 w-8",
  tone = "brand",
}: {
  className?: string;
  tone?: "brand" | "white";
}) {
  const colors = tone === "white" ? "border-white/40 border-t-white" : "border-teal-200 border-t-teal-600";
  return (
    <motion.span
      aria-hidden
      className={`inline-block rounded-full border-2 ${colors} ${className}`}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.75, ease: "linear" }}
    />
  );
}
