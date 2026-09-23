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
import { EndTripForm, StartTripForm } from "@/components/forms/TripLogForms";

export default function DriverTripDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { session } = useAuth();
  const router = useRouter();
  const [declineOpen, setDeclineOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const { data, loading, reload } = usePolling(
    async () => {
      const [request, logs, users, cars, drivers] = await Promise.all([
        api.getTripRequest(id),
        api.getTripLogs({ requestId: id }),
        api.getUsers(),
        api.getCars(),
        api.getDrivers(),
      ]);
      return { request, logs, users, cars, drivers };
    },
    8000,
    [id],
  );

  if (loading && !data) return <LoadingState />;
  if (!data) return <EmptyState title="Trip not found" />;

  const { request, logs, users, cars, drivers } = data;
  const driver = drivers.find((item) => item.userId === session?.id);
  if (driver && request.driverId !== driver.id) {
    return <EmptyState title="This trip is not assigned to you" />;
  }

  const employee = users.find((user) => user.id === request.employeeId);
  const car = cars.find((item) => item.id === request.carId);
  const log = logs[0];

  async function accept() {
    await api.updateTripRequest(request.id, { status: "accepted" });
    await notifyAdmins(
      "Driver accepted",
      `${session?.name || "A driver"} accepted the trip to ${request.destination}.`,
      "accepted",
      request.id,
    );
    await reload();
  }

  async function decline(reason: string) {
    await api.updateTripRequest(request.id, {
      status: "pending",
      driverId: null,
      carId: null,
      driverDeclineReason: reason,
    });
    await notifyAdmins(
      "Driver declined",
      `${session?.name || "A driver"} declined the trip to ${request.destination}: ${reason}`,
      "declined",
      request.id,
    );
    setDeclineOpen(false);
    router.push("/driver/trips");
  }

  async function startTrip(startOdometer: number) {
    await api.updateTripRequest(request.id, { status: "in_progress" });
    if (request.carId) {
      await api.updateCar(request.carId, { status: "on_trip" });
    }
    if (log) {
      await api.updateTripLog(log.id, {
        startedAt: new Date().toISOString(),
        startOdometer,
        endedAt: "",
        endOdometer: 0,
      });
    } else {
      await api.createTripLog({
        id: newId(),
        requestId: request.id,
        startedAt: new Date().toISOString(),
        endedAt: "",
        startOdometer,
        endOdometer: 0,
      });
    }
    await notifyAdmins(
      "Trip started",
      `${session?.name || "A driver"} started the trip to ${request.destination}.`,
      "started",
      request.id,
    );
    await notifyUser(
      request.employeeId,
      "Trip started",
      `Your trip to ${request.destination} is now in progress.`,
      "started",
      request.id,
    );
    setStartOpen(false);
    await reload();
  }

  async function endTrip(endOdometer: number) {
    await api.updateTripRequest(request.id, { status: "completed" });
    if (request.carId) {
      await api.updateCar(request.carId, { status: "available" });
    }
    if (log) {
      await api.updateTripLog(log.id, {
        endedAt: new Date().toISOString(),
        endOdometer,
      });
    }
    await notifyAdmins(
      "Trip completed",
      `${session?.name || "A driver"} completed the trip to ${request.destination}.`,
      "completed",
      request.id,
    );
    await notifyUser(
      request.employeeId,
      "Trip completed",
      `Your trip to ${request.destination} is complete. You can rate the driver.`,
      "completed",
      request.id,
    );
    setEndOpen(false);
    await reload();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Trip details" subtitle={employee ? `Passenger: ${employee.name}` : undefined} />
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
            <Button type="button" onClick={accept}>
              Accept trip
            </Button>
            <Button type="button" variant="danger" onClick={() => setDeclineOpen(true)}>
              Decline
            </Button>
          </>
        ) : null}
        {request.status === "accepted" ? (
          <Button type="button" onClick={() => setStartOpen(true)}>
            Start trip
          </Button>
        ) : null}
        {request.status === "in_progress" ? (
          <Button type="button" onClick={() => setEndOpen(true)}>
            End trip
          </Button>
        ) : null}
        <Button type="button" variant="ghost" onClick={() => router.push("/driver/trips")}>
          Back
        </Button>
      </div>
      {request.status === "in_progress" ? (
        <p className="text-sm text-slate-500">
          Location sharing is on. Your browser may ask for GPS permission so the live map can update every 20 seconds.
        </p>
      ) : null}

      <Modal title="Decline trip" open={declineOpen} onClose={() => setDeclineOpen(false)}>
        <DeclineForm onSubmit={decline} />
      </Modal>
      <Modal title="Start trip" open={startOpen} onClose={() => setStartOpen(false)}>
        <StartTripForm onSubmit={startTrip} />
      </Modal>
      <Modal title="End trip" open={endOpen} onClose={() => setEndOpen(false)}>
        <EndTripForm onSubmit={endTrip} />
      </Modal>
    </div>
  );
}
