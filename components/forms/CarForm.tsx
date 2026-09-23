"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import type { Car, CarStatus } from "@/lib/types";
import { FUEL_TYPES } from "@/lib/constants";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export type CarFormValues = {
  model: string;
  plateNumber: string;
  capacity: number;
  fuelType: string;
  status: CarStatus;
};

const schema = Yup.object({
  model: Yup.string().required("Model is required"),
  plateNumber: Yup.string().required("Plate number is required"),
  capacity: Yup.number().min(1, "Capacity must be at least 1").required(),
  fuelType: Yup.string().required("Fuel type is required"),
  status: Yup.mixed<CarStatus>().oneOf(["available", "on_trip", "inactive"]).required(),
});

export function CarForm({
  initial,
  onSubmit,
}: {
  initial?: Partial<Car>;
  onSubmit: (values: CarFormValues) => Promise<void>;
}) {
  return (
    <Formik<CarFormValues>
      initialValues={{
        model: initial?.model || "",
        plateNumber: initial?.plateNumber || "",
        capacity: initial?.capacity || 4,
        fuelType: initial?.fuelType || "petrol",
        status: initial?.status || "available",
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
        <Form className="space-y-4">
          <Field label="Model" name="model" formik={formik} placeholder="Toyota Premio" />
          <Field label="Plate number" name="plateNumber" formik={formik} placeholder="DHA-11-1234" />
          <Field label="Capacity" name="capacity" type="number" min={1} formik={formik} placeholder="4" />
          <Field
            label="Fuel type"
            name="fuelType"
            as="select"
            formik={formik}
            options={FUEL_TYPES.map((fuel) => ({ value: fuel, label: fuel }))}
          />
          <Field
            label="Status"
            name="status"
            as="select"
            formik={formik}
            options={[
              { value: "available", label: "Available" },
              { value: "on_trip", label: "On trip" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={formik.isSubmitting}>
              {formik.isSubmitting ? "Saving" : "Save car"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
