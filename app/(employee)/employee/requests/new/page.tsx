"use client";

import { useRouter } from "next/navigation";
import { api, newId } from "@/lib/api";
import { notifyAdmins } from "@/lib/notifications";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/ui/PageHeader";
import { TripRequestForm, type TripFormValues } from "@/components/forms/TripRequestForm";
import { beginNavigation } from "@/components/ui/NavigationProgress";
import { defer } from "@/lib/defer";

export default function NewRequestPage() {
  const { session } = useAuth();
  const router = useRouter();

  async function submit(values: TripFormValues) {
    if (!session) return;
    const request = await api.createTripRequest({
      id: newId(),
      employeeId: session.id,
      pickup: values.pickup,
      destination: values.destination,
      startDateTime: new Date(values.startDateTime).toISOString(),
      endDateTime: new Date(values.endDateTime).toISOString(),
      tripType: values.tripType,
      passengers: Number(values.passengers),
      reason: values.reason,
      priority: values.priority,
      status: "pending",
      driverId: null,
      carId: null,
      adminNote: "",
      driverDeclineReason: "",
      createdAt: new Date().toISOString(),
    });
    defer(
      notifyAdmins(
        "New trip request",
        `${session.name} requested a trip to ${values.destination}.`,
        "request_created",
        request.id,
      ),
    );
    beginNavigation();
    await router.push(`/employee/requests/${request.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="New trip request" subtitle="Pickup, destination, and schedule are required" />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <TripRequestForm submitLabel="Submit request" onSubmit={submit} />
      </div>
    </div>
  );
}
