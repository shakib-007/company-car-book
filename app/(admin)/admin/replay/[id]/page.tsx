"use client";

import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/datetime";
import { usePolling } from "@/hooks/usePolling";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReplayMap } from "@/components/maps/ReplayMap";

export default function ReplayPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data, loading } = usePolling(async () => {
    const [request, locations] = await Promise.all([
      api.getTripRequest(id),
      api.getLocations({ requestId: id }),
    ]);
    const points = [...locations].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    return { request, points };
  }, 15000, [id]);

  if (loading && !data) return <LoadingState />;
  if (!data) return <EmptyState title="Trip not found" />;

  return (
    <div>
      <PageHeader
        title="Route replay"
        subtitle={`${data.request.pickup} to ${data.request.destination} · ${formatDateTime(data.request.startDateTime)}`}
      />
      {data.points.length === 0 ? (
        <EmptyState
          title="No GPS points recorded for this trip"
          hint="Points are saved only while the trip is in progress, the driver app stays open, and the browser is allowed to use location. A trip that ends before the first point is stored cannot be replayed."
        />
      ) : (
        <ReplayMap points={data.points} />
      )}
    </div>
  );
}
