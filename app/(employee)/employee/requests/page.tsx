"use client";

import Link from "next/link";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/datetime";
import { useAuth } from "@/hooks/useAuth";
import { usePolling } from "@/hooks/usePolling";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";

export default function EmployeeRequestsPage() {
  const { session } = useAuth();
  const { data, loading } = usePolling(
    async () => {
      if (!session) return [];
      return api.getTripRequests({ employeeId: session.id });
    },
    8000,
    [session?.id],
  );
  const requests = (data || []).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <PageHeader
        title="My requests"
        subtitle="Live status of your trip bookings"
        actions={
          <Link href="/employee/requests/new">
            <Button type="button">New request</Button>
          </Link>
        }
      />
      {loading && !data ? (
        <LoadingState />
      ) : requests.length === 0 ? (
        <EmptyState title="You have no trip requests yet" hint="Create a request to book a company car." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Admin note</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    {request.pickup} → {request.destination}
                  </td>
                  <td className="px-4 py-3">{formatDateTime(request.startDateTime)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={request.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">{request.adminNote || "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/employee/requests/${request.id}`} className="font-medium text-teal-700 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
