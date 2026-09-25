"use client";

import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { usePolling } from "@/hooks/usePolling";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { TripRequestForm, type TripFormValues } from "@/components/forms/TripRequestForm";
import { beginNavigation } from "@/components/ui/NavigationProgress";

export default function EditRequestPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { session } = useAuth();
  const router = useRouter();
  const { data, loading } = usePolling(() => api.getTripRequest(id), 0, [id]);

  if (loading && !data) return <LoadingState />;
  if (!data) return <EmptyState title="Request not found" />;
  if (session && data.employeeId !== session.id) {
    return <EmptyState title="You can only edit your own requests" />;
  }
  if (!["pending", "assigned"].includes(data.status)) {
    return <EmptyState title="This request can no longer be edited" />;
  }

  async function submit(values: TripFormValues) {
    await api.updateTripRequest(id, {
      pickup: values.pickup,
      destination: values.destination,
      startDateTime: new Date(values.startDateTime).toISOString(),
      endDateTime: new Date(values.endDateTime).toISOString(),
      tripType: values.tripType,
      passengers: Number(values.passengers),
      reason: values.reason,
      priority: values.priority,
    });
    beginNavigation();
    await router.push(`/employee/requests/${id}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Edit request" subtitle="Changes are allowed while the request is pending or assigned" />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <TripRequestForm initial={data} submitLabel="Save changes" onSubmit={submit} />
      </div>
    </div>
  );
}
