"use client";

import { api } from "@/lib/api";
import { usePolling } from "@/hooks/usePolling";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { LiveMap } from "@/components/maps/LiveMap";
import type { LiveTrip } from "@/components/maps/LiveMapInner";

export default function LiveMapPage() {
  const { data, loading } = usePolling(async () => {
    const [requests, locations, users, drivers] = await Promise.all([
      api.getTripRequests({ status: "in_progress" }),
      api.getLocations(),
      api.getUsers(),
      api.getDrivers(),
    ]);
    const trips: LiveTrip[] = requests.map((request) => {
      const employee = users.find((user) => user.id === request.employeeId);
      const driver = drivers.find((item) => item.id === request.driverId);
      const driverUser = users.find((user) => user.id === driver?.userId);
      const points = locations
        .filter((point) => point.requestId === request.id)
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      return {
        request,
        employeeName: employee?.name || "Employee",
        driverName: driverUser?.name || "Driver",
        points,
      };
    });
    return trips;
  }, 8000);

  return (
    <div>
      <PageHeader title="Live map" subtitle="Each in-progress trip is shown on its assigned route" />
      {loading && !data ? (
        <LoadingState />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No trips in progress" hint="Start a trip as a driver to see live tracking." />
      ) : (
        <LiveMap trips={data} />
      )}
    </div>
  );
}
