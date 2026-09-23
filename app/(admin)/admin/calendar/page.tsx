"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { toISODate } from "@/lib/datetime";
import { usePolling } from "@/hooks/usePolling";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { TimelineView } from "@/components/calendar/TimelineView";

export default function CalendarPage() {
  const [date, setDate] = useState(toISODate());
  const { data, loading } = usePolling(async () => {
    const [requests, drivers, users] = await Promise.all([
      api.getTripRequests(),
      api.getDrivers(),
      api.getUsers(),
    ]);
    return { requests, drivers, users };
  }, 10000);

  return (
    <div>
      <PageHeader
        title="Driver calendar"
        subtitle="Timeline of assigned, accepted, and in-progress bookings"
        actions={
          <label className="text-sm">
            <span className="mr-2 text-slate-600">Date</span>
            <input
              type="date"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
        }
      />
      {loading && !data ? (
        <LoadingState />
      ) : (
        <TimelineView
          date={date}
          drivers={data?.drivers || []}
          users={data?.users || []}
          requests={data?.requests || []}
        />
      )}
    </div>
  );
}
