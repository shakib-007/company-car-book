"use client";

import { api } from "@/lib/api";
import { toISODate } from "@/lib/datetime";
import { usePolling } from "@/hooks/usePolling";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";

export default function AdminDashboardPage() {
  const { data, loading } = usePolling(async () => {
    const [requests, drivers, cars] = await Promise.all([
      api.getTripRequests(),
      api.getDrivers(),
      api.getCars(),
    ]);
    return { requests, drivers, cars };
  }, 8000);

  if (loading || !data) return <LoadingState />;

  const today = toISODate();
  const todaysTrips = data.requests.filter(
    (request) =>
      !["rejected", "cancelled"].includes(request.status) &&
      request.startDateTime.slice(0, 10) === today,
  );
  const pending = data.requests.filter((request) => request.status === "pending");
  const busyDriverIds = new Set(
    data.requests.filter((request) => request.status === "in_progress").map((request) => request.driverId),
  );
  const availableDrivers = data.drivers.filter(
    (driver) => !busyDriverIds.has(driver.id) && !driver.onLeaveDates.includes(today),
  );
  const availableCars = data.cars.filter((car) => car.status === "available");
  const completed = data.requests.filter((request) => request.status === "completed");

  const cards = [
    { label: "Today's trips", value: todaysTrips.length },
    { label: "Pending requests", value: pending.length },
    { label: "Available drivers", value: availableDrivers.length },
    { label: "Available cars", value: availableCars.length },
    { label: "Completed trips", value: completed.length },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Fleet snapshot for today" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
