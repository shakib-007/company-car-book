import type { CarStatus, TripStatus, UserStatus } from "@/lib/types";
import { labelStatus } from "@/lib/datetime";

const styles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800",
  assigned: "bg-sky-50 text-sky-800",
  accepted: "bg-indigo-50 text-indigo-800",
  in_progress: "bg-teal-50 text-teal-800",
  completed: "bg-emerald-50 text-emerald-800",
  rejected: "bg-red-50 text-red-800",
  cancelled: "bg-slate-100 text-slate-600",
  active: "bg-emerald-50 text-emerald-800",
  inactive: "bg-slate-100 text-slate-600",
  available: "bg-emerald-50 text-emerald-800",
  on_trip: "bg-teal-50 text-teal-800",
  urgent: "bg-red-50 text-red-700",
  normal: "bg-slate-100 text-slate-600",
};

export function StatusBadge({
  status,
}: {
  status: TripStatus | UserStatus | CarStatus | "urgent" | "normal";
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${styles[status] || "bg-slate-100 text-slate-700"}`}
    >
      {labelStatus(status as TripStatus)}
    </span>
  );
}
