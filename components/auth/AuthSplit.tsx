"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { AuthBrandPanel } from "./AuthBrandPanel";

export function AuthSplit({
  formSide,
  children,
}: {
  formSide: "left" | "right";
  children: ReactNode;
}) {
  const formFirst = formSide === "left";

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className={`flex w-full flex-1 lg:w-1/2 ${formFirst ? "lg:order-1" : "lg:order-2"}`}>
        <motion.div
          className="flex min-h-screen w-full items-center justify-center bg-slate-100 px-4 py-8 sm:py-10 lg:min-h-full lg:px-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            {children}
          </div>
        </motion.div>
      </div>
      <div className={`hidden lg:block lg:w-1/2 ${formFirst ? "lg:order-2" : "lg:order-1"}`}>
        <AuthBrandPanel />
      </div>
    </div>
  );
}
