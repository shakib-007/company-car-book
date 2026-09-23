"use client";

import Link from "next/link";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/datetime";
import { useAuth } from "@/hooks/useAuth";
import { usePolling } from "@/hooks/usePolling";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function DriverTripsPage() {
  const { session } = useAuth();
  const { data, loading } = usePolling(
    async () => {
      if (!session) return [];
      const drivers = await api.getDrivers({ userId: session.id });
      const driver = drivers[0];
      if (!driver) return [];
      const requests = await api.getTripRequests({ driverId: driver.id });
      return requests.filter((request) =>
        ["assigned", "accepted", "in_progress", "completed"].includes(request.status),
      );
    },
    8000,
    [session?.id],
  );
  const trips = (data || []).slice().sort((a, b) => a.startDateTime.localeCompare(b.startDateTime));

  return (
    <div>
      <PageHeader title="My trips" subtitle="Assigned, accepted, and active trips" />
      {loading && !data ? (
        <LoadingState />
      ) : trips.length === 0 ? (
        <EmptyState title="No trips assigned" hint="When an admin assigns you a request, it will show up here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    {trip.pickup} → {trip.destination}
                  </td>
                  <td className="px-4 py-3">{formatDateTime(trip.startDateTime)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={trip.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/driver/trips/${trip.id}`} className="font-medium text-teal-700 hover:underline">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
