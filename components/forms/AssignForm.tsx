"use client";

import { useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import type { Car, Driver, TripRequest, User } from "@/lib/types";
import { getAvailableCars, getAvailableDrivers } from "@/lib/availability";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

type Values = { driverId: string; carId: string };

const schema = Yup.object({
  driverId: Yup.string().required("Select a driver"),
  carId: Yup.string().required("Select a car"),
});

export function AssignForm({
  request,
  drivers,
  users,
  cars,
  requests,
  onSubmit,
}: {
  request: TripRequest;
  drivers: Driver[];
  users: User[];
  cars: Car[];
  requests: TripRequest[];
  onSubmit: (values: Values) => Promise<void>;
}) {
  const availableDrivers = getAvailableDrivers(
    drivers,
    requests,
    request.startDateTime,
    request.endDateTime,
    request.id,
  );
  if (request.driverId && !availableDrivers.some((driver) => driver.id === request.driverId)) {
    const current = drivers.find((driver) => driver.id === request.driverId);
    if (current) availableDrivers.unshift(current);
  }

  const availableCars = getAvailableCars(
    cars,
    requests,
    request.startDateTime,
    request.endDateTime,
    request.id,
  );
  if (request.carId && !availableCars.some((car) => car.id === request.carId)) {
    const current = cars.find((car) => car.id === request.carId);
    if (current) availableCars.unshift(current);
  }

  const userName = (userId: string) => users.find((user) => user.id === userId)?.name || userId;
  const firstDriver = availableDrivers[0];

  return (
    <Formik<Values>
      initialValues={{
        driverId: request.driverId || firstDriver?.id || "",
        carId:
          request.carId ||
          firstDriver?.carId ||
          availableCars[0]?.id ||
          "",
      }}
      validationSchema={schema}
      enableReinitialize
      onSubmit={async (values, helpers) => {
        try {
          await onSubmit(values);
        } finally {
          helpers.setSubmitting(false);
        }
      }}
    >
      {(formik) => (
        <AssignFields
          formik={formik}
          availableDrivers={availableDrivers}
          availableCars={availableCars}
          drivers={drivers}
          userName={userName}
        />
      )}
    </Formik>
  );
}

function AssignFields({
  formik,
  availableDrivers,
  availableCars,
  drivers,
  userName,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik: any;
  availableDrivers: Driver[];
  availableCars: Car[];
  drivers: Driver[];
  userName: (id: string) => string;
}) {
  useEffect(() => {
    const selected = drivers.find((driver: Driver) => driver.id === formik.values.driverId);
    if (selected?.carId) {
      formik.setFieldValue("carId", selected.carId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.driverId]);

  return (
    <Form className="space-y-4">
      {availableDrivers.length === 0 ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          No drivers are free for this window. Check overlapping bookings or leave dates.
        </p>
      ) : null}
      <Field
        label="Driver"
        name="driverId"
        as="select"
        formik={formik}
        options={[
          { value: "", label: "Select driver" },
          ...availableDrivers.map((driver) => ({
            value: driver.id,
            label: `${userName(driver.userId)} (${driver.licenseNumber})`,
          })),
        ]}
      />
      <Field
        label="Car"
        name="carId"
        as="select"
        formik={formik}
        options={[
          { value: "", label: "Select car" },
          ...availableCars.map((car) => ({
            value: car.id,
            label: `${car.model} (${car.plateNumber})`,
          })),
        ]}
      />
      <p className="text-xs text-slate-500">
        Choosing a driver fills the default car. You can override the car before assigning.
      </p>
      <div className="flex justify-end">
        <Button type="submit" loading={formik.isSubmitting} disabled={!formik.values.driverId}>
          {formik.isSubmitting ? "Assigning" : "Assign trip"}
        </Button>
      </div>
    </Form>
  );
}
