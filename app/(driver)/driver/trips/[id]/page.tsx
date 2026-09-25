"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, newId } from "@/lib/api";
import { notifyAdmins, notifyUser } from "@/lib/notifications";
import { formatDateTime } from "@/lib/datetime";
import { useAuth } from "@/hooks/useAuth";
import { usePolling } from "@/hooks/usePolling";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DeclineForm } from "@/components/forms/DeclineForm";
import { DriverTripMap } from "@/components/maps/DriverTripMap";
import { beginNavigation } from "@/components/ui/NavigationProgress";
import { defer } from "@/lib/defer";

export default function DriverTripDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { session } = useAuth();
  const router = useRouter();
  const [declineOpen, setDeclineOpen] = useState(false);
  const [accepting, setAccepting] = useState(false);

  const { data, loading, reload } = usePolling(
    async () => {
      const [request, logs, users, cars, drivers, locations] = await Promise.all([
        api.getTripRequest(id),
        api.getTripLogs({ requestId: id }),
        api.getUsers(),
        api.getCars(),
        api.getDrivers(),
        api.getLocations({ requestId: id }),
      ]);
      return { request, logs, users, cars, drivers, locations };
    },
    8000,
    [id],
  );

  if (loading && !data) return <LoadingState />;
  if (!data) return <EmptyState title="Trip not found" />;

  const { request, logs, users, cars, drivers, locations } = data;
  const driver = drivers.find((item) => item.userId === session?.id);
  if (driver && request.driverId !== driver.id) {
    return <EmptyState title="This trip is not assigned to you" />;
  }

  const employee = users.find((user) => user.id === request.employeeId);
  const car = cars.find((item) => item.id === request.carId);
  const log = logs[0];

  async function accept() {
    setAccepting(true);
    try {
      await api.updateTripRequest(request.id, { status: "accepted" });
      defer(
        notifyAdmins(
          "Driver accepted",
          `${session?.name || "A driver"} accepted the trip to ${request.destination}.`,
          "accepted",
          request.id,
        ),
      );
      await reload();
    } finally {
      setAccepting(false);
    }
  }

  async function decline(reason: string) {
    await api.updateTripRequest(request.id, {
      status: "pending",
      driverId: null,
      carId: null,
      driverDeclineReason: reason,
    });
    defer(
      notifyAdmins(
        "Driver declined",
        `${session?.name || "A driver"} declined the trip to ${request.destination}: ${reason}`,
        "declined",
        request.id,
      ),
    );
    setDeclineOpen(false);
    beginNavigation();
    await router.push("/driver/trips");
  }

  async function startTrip() {
    const startedAt = new Date().toISOString();
    await Promise.all([
      api.updateTripRequest(request.id, { status: "in_progress" }),
      request.carId ? api.updateCar(request.carId, { status: "on_trip" }) : Promise.resolve(),
      log
        ? api.updateTripLog(log.id, {
            startedAt,
            startOdometer: 0,
            endedAt: "",
            endOdometer: 0,
          })
        : api.createTripLog({
            id: newId(),
            requestId: request.id,
            startedAt,
            endedAt: "",
            startOdometer: 0,
            endOdometer: 0,
          }),
    ]);
    defer(
      Promise.all([
        notifyAdmins(
          "Trip started",
          `${session?.name || "A driver"} started the trip to ${request.destination}.`,
          "started",
          request.id,
        ),
        notifyUser(
          request.employeeId,
          "Trip started",
          `Your trip to ${request.destination} is now in progress.`,
          "started",
          request.id,
        ),
      ]),
    );
    await reload();
  }

  async function endTrip() {
    await Promise.all([
      api.updateTripRequest(request.id, { status: "completed" }),
      request.carId ? api.updateCar(request.carId, { status: "available" }) : Promise.resolve(),
      log
        ? api.updateTripLog(log.id, {
            endedAt: new Date().toISOString(),
            endOdometer: 0,
          })
        : Promise.resolve(),
    ]);
    defer(
      Promise.all([
        notifyAdmins(
          "Trip completed",
          `${session?.name || "A driver"} completed the trip to ${request.destination}.`,
          "completed",
          request.id,
        ),
        notifyUser(
          request.employeeId,
          "Trip completed",
          `Your trip to ${request.destination} is complete. You can rate the driver.`,
          "completed",
          request.id,
        ),
      ]),
    );
    await reload();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Trip details" subtitle={employee ? `Passenger: ${employee.name}` : undefined} />
      <DriverTripMap
        requestId={request.id}
        pickup={request.pickup}
        destination={request.destination}
        status={request.status}
        startedAt={log?.startedAt}
        passengerName={employee?.name}
        points={locations}
        onStart={startTrip}
        onEnd={endTrip}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={request.status} />
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Priority</dt>
            <dd className="mt-1">
              <StatusBadge status={request.priority} />
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Pickup</dt>
            <dd className="mt-1">{request.pickup}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Destination</dt>
            <dd className="mt-1">{request.destination}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Start</dt>
            <dd className="mt-1">{formatDateTime(request.startDateTime)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">End</dt>
            <dd className="mt-1">{formatDateTime(request.endDateTime)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Car</dt>
            <dd className="mt-1">{car ? `${car.model} (${car.plateNumber})` : "-"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Admin note</dt>
            <dd className="mt-1">{request.adminNote || "-"}</dd>
          </div>
        </dl>
      </div>
      <div className="flex flex-wrap gap-2">
        {request.status === "assigned" ? (
          <>
            <Button type="button" loading={accepting} onClick={accept}>
              {accepting ? "Accepting" : "Accept trip"}
            </Button>
            <Button type="button" variant="danger" onClick={() => setDeclineOpen(true)}>
              Decline
            </Button>
          </>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            beginNavigation();
            router.push("/driver/trips");
          }}
        >
          Back
        </Button>
      </div>

      <Modal title="Decline trip" open={declineOpen} onClose={() => setDeclineOpen(false)}>
        <DeclineForm onSubmit={decline} />
      </Modal>
    </div>
  );
}
