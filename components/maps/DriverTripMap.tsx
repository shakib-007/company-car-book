"use client";

import dynamic from "next/dynamic";
import { LoadingState } from "@/components/ui/LoadingState";
import type { DriverTripMapProps } from "./DriverTripMapInner";

const Inner = dynamic(() => import("./DriverTripMapInner"), {
  ssr: false,
  loading: () => <LoadingState label="Loading map..." />,
});

export function DriverTripMap(props: DriverTripMapProps) {
  return (
    <div className="relative h-[calc(100dvh-14rem)] min-h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Inner {...props} />
    </div>
  );
}
