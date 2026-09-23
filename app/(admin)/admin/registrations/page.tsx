"use client";

import { api } from "@/lib/api";
import { usePolling } from "@/hooks/usePolling";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";

export default function RegistrationsPage() {
  const { data, loading, reload } = usePolling(() => api.getUsers({ role: "employee" }), 8000);
  const pending = (data || []).filter((user) => user.status === "pending");

  async function setStatus(id: string, status: "active" | "inactive") {
    await api.updateUser(id, { status });
    await reload();
  }

  return (
    <div>
      <PageHeader title="Registrations" subtitle="Approve or reject pending employee accounts" />
      {loading && !data ? (
        <LoadingState />
      ) : pending.length === 0 ? (
        <EmptyState title="No pending registrations" hint="New employee sign-ups will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.department}</td>
                  <td className="px-4 py-3">{user.phone}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button type="button" onClick={() => setStatus(user.id, "active")}>
                        Approve
                      </Button>
                      <Button type="button" variant="danger" onClick={() => setStatus(user.id, "inactive")}>
                        Reject
                      </Button>
                    </div>
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
