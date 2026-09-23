"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, newId } from "@/lib/api";
import { notifyAdmins, notifyDriverUser, notifyUser } from "@/lib/notifications";
import { formatDateTime } from "@/lib/datetime";
import { useAuth } from "@/hooks/useAuth";
import { usePolling } from "@/hooks/usePolling";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { RatingForm } from "@/components/forms/RatingForm";

export default function EmployeeRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { session } = useAuth();
  const router = useRouter();
  const { data, loading, reload } = usePolling(
    async () => {
      const [request, ratings, users, drivers, cars] = await Promise.all([
        api.getTripRequest(id),
        api.getRatings({ requestId: id }),
        api.getUsers(),
        api.getDrivers(),
        api.getCars(),
      ]);
      return { request, ratings, users, drivers, cars };
    },
    8000,
    [id],
  );

  if (loading && !data) return <LoadingState />;
  if (!data) return <EmptyState title="Request not found" />;
  if (session && data.request.employeeId !== session.id) {
    return <EmptyState title="You can only view your own requests" />;
  }

  const { request, ratings, users, drivers, cars } = data;
  const driver = drivers.find((item) => item.id === request.driverId);
  const driverUser = users.find((user) => user.id === driver?.userId);
  const car = cars.find((item) => item.id === request.carId);
  const canEdit = ["pending", "assigned"].includes(request.status);
  const existingRating = ratings[0];

  async function cancel() {
    if (!confirm("Cancel this trip request?")) return;
    await api.updateTripRequest(request.id, { status: "cancelled" });
    await notifyUser(
      request.employeeId,
      "Trip cancelled",
      `Your trip to ${request.destination} was cancelled.`,
      "cancelled",
      request.id,
    );
    if (request.driverId) {
      await notifyDriverUser(
        request.driverId,
        "Trip cancelled",
        `The trip to ${request.destination} was cancelled.`,
        "cancelled",
        request.id,
      );
    }
    await notifyAdmins(
      "Trip cancelled",
      `${session?.name || "An employee"} cancelled a trip to ${request.destination}.`,
      "cancelled",
      request.id,
    );
    await reload();
  }

  async function rate(rating: number, comment: string) {
    if (!request.driverId) return;
    await api.createRating({
      id: newId(),
      requestId: request.id,
      driverId: request.driverId,
      rating,
      comment,
    });
    await reload();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Trip request"
        subtitle={formatDateTime(request.createdAt)}
        actions={
          canEdit ? (
            <>
              <Link href={`/employee/requests/${request.id}/edit`}>
                <Button type="button" variant="secondary">
                  Edit
                </Button>
              </Link>
              <Button type="button" variant="danger" onClick={cancel}>
                Cancel
              </Button>
            </>
          ) : null
        }
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 text-sm">
          <Item label="Status">
            <StatusBadge status={request.status} />
          </Item>
          <Item label="Priority">
            <StatusBadge status={request.priority} />
          </Item>
          <Item label="Pickup">{request.pickup}</Item>
          <Item label="Destination">{request.destination}</Item>
          <Item label="Start">{formatDateTime(request.startDateTime)}</Item>
          <Item label="End">{formatDateTime(request.endDateTime)}</Item>
          <Item label="Type">{request.tripType.replace("_", " ")}</Item>
          <Item label="Passengers">{request.passengers}</Item>
          <Item label="Reason">{request.reason}</Item>
          <Item label="Driver">{driverUser?.name || "-"}</Item>
          <Item label="Car">{car ? `${car.model} (${car.plateNumber})` : "-"}</Item>
          <Item label="Admin note">{request.adminNote || "-"}</Item>
        </dl>
      </div>
      {request.status === "completed" ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Rate this trip</h2>
          {existingRating ? (
            <p className="text-sm text-slate-600">
              You rated this trip {existingRating.rating}/5
              {existingRating.comment ? ` — ${existingRating.comment}` : "."}
            </p>
          ) : (
            <RatingForm onSubmit={rate} />
          )}
        </div>
      ) : null}
      <Button type="button" variant="ghost" onClick={() => router.push("/employee/requests")}>
        Back to list
      </Button>
    </div>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-slate-800">{children}</dd>
    </div>
  );
}
