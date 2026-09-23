"use client";

import dynamic from "next/dynamic";
import { LoadingState } from "@/components/ui/LoadingState";
import type { LocationPoint } from "@/lib/types";

const Inner = dynamic(() => import("./ReplayMapInner"), {
  ssr: false,
  loading: () => <LoadingState label="Loading map..." />,
});

export function ReplayMap({ points }: { points: LocationPoint[] }) {
  return (
    <div className="h-[70vh] overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Inner points={points} />
    </div>
  );
}
