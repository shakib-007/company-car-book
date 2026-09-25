"use client";

import { useState } from "react";
import { api, newId } from "@/lib/api";
import { usePolling } from "@/hooks/usePolling";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { DeleteIcon, EditIcon, IconAction } from "@/components/ui/IconAction";
import { Modal } from "@/components/ui/Modal";
import { DriverForm, type DriverFormValues } from "@/components/forms/DriverForm";
import type { Driver, User } from "@/lib/types";
import { defer } from "@/lib/defer";

function parseLeave(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function DriversPage() {
  const { data, loading, reload } = usePolling(async () => {
    const [drivers, users, cars] = await Promise.all([api.getDrivers(), api.getUsers(), api.getCars()]);
    return { drivers, users, cars };
  }, 10000);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<{ driver: Driver; user?: User } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const drivers = data?.drivers || [];
  const users = data?.users || [];
  const cars = data?.cars || [];

  function userFor(userId: string) {
    return users.find((user) => user.id === userId);
  }

  function carFor(carId: string) {
    return cars.find((car) => car.id === carId);
  }

  async function createDriver(values: DriverFormValues) {
    const userId = newId();
    await Promise.all([
      api.createUser({
        id: userId,
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone,
        role: "driver",
        department: "Transport",
        status: "active",
      }),
      api.createDriver({
        id: newId(),
        userId,
        phone: values.phone,
        licenseNumber: values.licenseNumber,
        carId: values.carId,
        onLeaveDates: parseLeave(values.onLeaveDates),
      }),
    ]);
    setCreating(false);
    defer(reload());
  }

  async function updateDriver(values: DriverFormValues) {
    if (!editing) return;
    const patch: Partial<User> = {
      name: values.name,
      email: values.email,
      phone: values.phone,
    };
    if (values.password) patch.password = values.password;
    await Promise.all([
      api.updateUser(editing.driver.userId, patch),
      api.updateDriver(editing.driver.id, {
        phone: values.phone,
        licenseNumber: values.licenseNumber,
        carId: values.carId,
        onLeaveDates: parseLeave(values.onLeaveDates),
      }),
    ]);
    setEditing(null);
    defer(reload());
  }

  async function removeDriver(driver: Driver) {
    if (!confirm("Delete this driver?")) return;
    setDeletingId(driver.id);
    try {
      await Promise.all([
        api.deleteDriver(driver.id),
        api.updateUser(driver.userId, { status: "inactive" }),
      ]);
      defer(reload());
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Drivers"
        subtitle="Each driver has a default car"
        actions={
          <Button type="button" onClick={() => setCreating(true)}>
            Add driver
          </Button>
        }
      />
      {loading && !data ? (
        <LoadingState />
      ) : drivers.length === 0 ? (
        <EmptyState title="No drivers yet" hint="Create a driver account and assign a default car." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">License</th>
                <th className="px-4 py-3">Default car</th>
                <th className="px-4 py-3">Leave dates</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => {
                const user = userFor(driver.userId);
                const car = carFor(driver.carId);
                return (
                  <tr key={driver.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">{user?.name || driver.userId}</td>
                    <td className="px-4 py-3">{driver.phone}</td>
                    <td className="px-4 py-3">{driver.licenseNumber}</td>
                    <td className="px-4 py-3">{car ? `${car.model} (${car.plateNumber})` : "-"}</td>
                    <td className="px-4 py-3">{driver.onLeaveDates.join(", ") || "-"}</td>
                    <td className="px-4 py-3">{user ? <StatusBadge status={user.status} /> : "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <IconAction label="Edit" tone="secondary" onClick={() => setEditing({ driver, user })}>
                          <EditIcon />
                        </IconAction>
                        <IconAction
                          label="Delete"
                          tone="danger"
                          loading={deletingId === driver.id}
                          onClick={() => removeDriver(driver)}
                        >
                          <DeleteIcon />
                        </IconAction>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Modal title="Add driver" open={creating} onClose={() => setCreating(false)}>
        <DriverForm cars={cars} onSubmit={createDriver} />
      </Modal>
      <Modal title="Edit driver" open={Boolean(editing)} onClose={() => setEditing(null)}>
        {editing ? (
          <DriverForm driver={editing.driver} user={editing.user} cars={cars} onSubmit={updateDriver} />
        ) : null}
      </Modal>
    </div>
  );
}
