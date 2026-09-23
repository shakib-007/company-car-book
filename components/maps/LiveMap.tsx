"use client";

import dynamic from "next/dynamic";
import { LoadingState } from "@/components/ui/LoadingState";
import type { LiveTrip } from "./LiveMapInner";

const Inner = dynamic(() => import("./LiveMapInner"), {
  ssr: false,
  loading: () => <LoadingState label="Loading map..." />,
});

export function LiveMap({ trips }: { trips: LiveTrip[] }) {
  return (
    <div className="h-[70vh] overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Inner trips={trips} />
    </div>
  );
}
