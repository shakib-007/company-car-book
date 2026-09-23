"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { notifyDriverUser, notifyUser } from "@/lib/notifications";
import { TRIP_STATUSES } from "@/lib/constants";
import { formatDateTime } from "@/lib/datetime";
import { usePolling } from "@/hooks/usePolling";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AssignForm } from "@/components/forms/AssignForm";
import { NoteForm } from "@/components/forms/NoteForm";
import type { TripRequest } from "@/lib/types";

export default function AdminRequestsPage() {
  const { data, loading, reload } = usePolling(async () => {
    const [requests, users, drivers, cars] = await Promise.all([
      api.getTripRequests(),
      api.getUsers(),
      api.getDrivers(),
      api.getCars(),
    ]);
    return { requests, users, drivers, cars };
  }, 8000);

  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [assigning, setAssigning] = useState<TripRequest | null>(null);
  const [noting, setNoting] = useState<{ request: TripRequest; action: "rejected" | "cancelled" } | null>(
    null,
  );

  const employees = (data?.users || []).filter((user) => user.role === "employee");
  const filtered = useMemo(() => {
    return (data?.requests || []).filter((request) => {
      if (status && request.status !== status) return false;
      if (employeeId && request.employeeId !== employeeId) return false;
      if (date && request.startDateTime.slice(0, 10) !== date) return false;
      return true;
    });
  }, [data, date, employeeId, status]);

  function nameOf(id: string | null) {
    if (!id) return "-";
    const user = data?.users.find((item) => item.id === id);
    if (user) return user.name;
    const driver = data?.drivers.find((item) => item.id === id);
    if (driver) return data?.users.find((item) => item.id === driver.userId)?.name || id;
    return id;
  }

  function carOf(id: string | null) {
    if (!id) return "-";
    const car = data?.cars.find((item) => item.id === id);
    return car ? `${car.model} (${car.plateNumber})` : id;
  }

  async function assign(values: { driverId: string; carId: string }) {
    if (!assigning) return;
    const previousDriverId = assigning.driverId;
    const employee = data?.users.find((user) => user.id === assigning.employeeId);
    const driver = data?.drivers.find((item) => item.id === values.driverId);
    const driverUser = data?.users.find((user) => user.id === driver?.userId);
    await api.updateTripRequest(assigning.id, {
      status: "assigned",
      driverId: values.driverId,
      carId: values.carId,
      driverDeclineReason: "",
    });
    await notifyUser(
      assigning.employeeId,
      "Trip assigned",
      `Your trip to ${assigning.destination} was assigned to ${driverUser?.name || "a driver"}.`,
      "assigned",
      assigning.id,
    );
    if (previousDriverId && previousDriverId !== values.driverId) {
      await notifyDriverUser(
        previousDriverId,
        "Trip reassigned",
        `The trip for ${employee?.name || "an employee"} was reassigned to another driver.`,
        "reassigned",
        assigning.id,
      );
      await notifyDriverUser(
        values.driverId,
        "Trip reassigned to you",
        `You were assigned the trip for ${employee?.name || "an employee"} to ${assigning.destination}.`,
        "reassigned",
        assigning.id,
      );
    } else {
      await notifyDriverUser(
        values.driverId,
        "New assignment",
        `You were assigned a trip for ${employee?.name || "an employee"} to ${assigning.destination}.`,
        "assigned",
        assigning.id,
      );
    }
    setAssigning(null);
    await reload();
  }

  async function applyNote(adminNote: string) {
    if (!noting) return;
    const { request, action } = noting;
    await api.updateTripRequest(request.id, { status: action, adminNote });
    await notifyUser(
      request.employeeId,
      action === "rejected" ? "Trip rejected" : "Trip cancelled",
      adminNote,
      action,
      request.id,
    );
    if (request.driverId) {
      await notifyDriverUser(
        request.driverId,
        action === "rejected" ? "Trip rejected" : "Trip cancelled",
        `A trip you were linked to was ${action}. ${adminNote}`,
        action,
        request.id,
      );
    }
    setNoting(null);
    await reload();
  }

  return (
    <div>
      <PageHeader title="Trip requests" subtitle="Filter, assign, reject, or cancel bookings" />
      <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Status</span>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            {TRIP_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Date</span>
          <input
            type="date"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Employee</span>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
          >
            <option value="">All employees</option>
            {employees.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {loading && !data ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState title="No requests match the filters" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Driver / car</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((request) => (
                <tr key={request.id} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-3">{nameOf(request.employeeId)}</td>
                  <td className="px-4 py-3">
                    <p>{request.pickup}</p>
                    <p className="text-slate-500">→ {request.destination}</p>
                  </td>
                  <td className="px-4 py-3">
                    {formatDateTime(request.startDateTime)}
                    <p className="text-slate-500">{formatDateTime(request.endDateTime)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={request.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={request.status} />
                    {request.adminNote ? (
                      <p className="mt-1 text-xs text-slate-500">{request.adminNote}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <p>{nameOf(request.driverId)}</p>
                    <p className="text-slate-500">{carOf(request.carId)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      {["pending", "assigned", "accepted"].includes(request.status) ? (
                        <Button type="button" onClick={() => setAssigning(request)}>
                          {request.driverId ? "Reassign" : "Assign"}
                        </Button>
                      ) : null}
                      {["pending", "assigned"].includes(request.status) ? (
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => setNoting({ request, action: "rejected" })}
                        >
                          Reject
                        </Button>
                      ) : null}
                      {!["completed", "rejected", "cancelled"].includes(request.status) ? (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setNoting({ request, action: "cancelled" })}
                        >
                          Cancel
                        </Button>
                      ) : null}
                      {request.status === "completed" ? (
                        <Link
                          href={`/admin/replay/${request.id}`}
                          className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Replay route
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal title="Assign driver" open={Boolean(assigning)} onClose={() => setAssigning(null)} wide>
        {assigning && data ? (
          <AssignForm
            request={assigning}
            drivers={data.drivers}
            users={data.users}
            cars={data.cars}
            requests={data.requests}
            onSubmit={assign}
          />
        ) : null}
      </Modal>
      <Modal
        title={noting?.action === "rejected" ? "Reject request" : "Cancel request"}
        open={Boolean(noting)}
        onClose={() => setNoting(null)}
      >
        <NoteForm
          submitLabel={noting?.action === "rejected" ? "Reject" : "Cancel trip"}
          onSubmit={applyNote}
        />
      </Modal>
    </div>
  );
}
