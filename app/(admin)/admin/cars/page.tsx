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
import { CarForm, type CarFormValues } from "@/components/forms/CarForm";
import type { Car } from "@/lib/types";

export default function CarsPage() {
  const { data, loading, reload } = usePolling(() => api.getCars(), 10000);
  const [editing, setEditing] = useState<Car | null>(null);
  const [creating, setCreating] = useState(false);
  const cars = data || [];

  async function createCar(values: CarFormValues) {
    await api.createCar({ id: newId(), ...values, capacity: Number(values.capacity) });
    setCreating(false);
    await reload();
  }

  async function updateCar(values: CarFormValues) {
    if (!editing) return;
    await api.updateCar(editing.id, { ...values, capacity: Number(values.capacity) });
    setEditing(null);
    await reload();
  }

  async function removeCar(id: string) {
    if (!confirm("Delete this car?")) return;
    await api.deleteCar(id);
    await reload();
  }

  return (
    <div>
      <PageHeader
        title="Cars"
        subtitle="Company vehicles"
        actions={
          <Button type="button" onClick={() => setCreating(true)}>
            Add car
          </Button>
        }
      />
      {loading && !data ? (
        <LoadingState />
      ) : cars.length === 0 ? (
        <EmptyState title="No cars yet" hint="Add a vehicle to start assigning trips." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Plate</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Fuel</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{car.model}</td>
                  <td className="px-4 py-3">{car.plateNumber}</td>
                  <td className="px-4 py-3">{car.capacity}</td>
                  <td className="px-4 py-3 capitalize">{car.fuelType}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={car.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <IconAction label="Edit" tone="secondary" onClick={() => setEditing(car)}>
                        <EditIcon />
                      </IconAction>
                      <IconAction label="Delete" tone="danger" onClick={() => removeCar(car.id)}>
                        <DeleteIcon />
                      </IconAction>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal title="Add car" open={creating} onClose={() => setCreating(false)}>
        <CarForm onSubmit={createCar} />
      </Modal>
      <Modal title="Edit car" open={Boolean(editing)} onClose={() => setEditing(null)}>
        {editing ? <CarForm initial={editing} onSubmit={updateCar} /> : null}
      </Modal>
    </div>
  );
}
