"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import type { Car, Driver, User } from "@/lib/types";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export type DriverFormValues = {
  name: string;
  email: string;
  password: string;
  phone: string;
  licenseNumber: string;
  carId: string;
  onLeaveDates: string;
};

export function DriverForm({
  driver,
  user,
  cars,
  onSubmit,
}: {
  driver?: Driver;
  user?: User;
  cars: Car[];
  onSubmit: (values: DriverFormValues) => Promise<void>;
}) {
  const isEdit = Boolean(driver);
  const schema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Enter a valid email").required("Email is required"),
    password: isEdit
      ? Yup.string()
      : Yup.string().min(6, "At least 6 characters").required("Password is required"),
    phone: Yup.string().required("Phone is required"),
    licenseNumber: Yup.string().required("License number is required"),
    carId: Yup.string().required("Default car is required"),
    onLeaveDates: Yup.string(),
  });

  return (
    <Formik<DriverFormValues>
      initialValues={{
        name: user?.name || "",
        email: user?.email || "",
        password: "",
        phone: driver?.phone || user?.phone || "",
        licenseNumber: driver?.licenseNumber || "",
        carId: driver?.carId || cars.find((car) => car.status !== "inactive")?.id || "",
        onLeaveDates: driver?.onLeaveDates.join(", ") || "",
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
          <Field label="Name" name="name" formik={formik} placeholder="Karim Uddin" />
          <Field
            label="Email"
            name="email"
            type="email"
            formik={formik}
            placeholder="driver@company.com"
          />
          <Field
            label={isEdit ? "Password (leave blank to keep)" : "Password"}
            name="password"
            type="password"
            formik={formik}
            placeholder={isEdit ? "Leave blank to keep current password" : "At least 6 characters"}
            required={!isEdit}
          />
          <Field label="Phone" name="phone" formik={formik} placeholder="+8801XXXXXXXXX" />
          <Field
            label="License number"
            name="licenseNumber"
            formik={formik}
            placeholder="DH-1234567"
          />
          <Field
            label="Default car"
            name="carId"
            as="select"
            formik={formik}
            options={[
              { value: "", label: "Select a car" },
              ...cars.map((car) => ({
                value: car.id,
                label: `${car.model} (${car.plateNumber})`,
              })),
            ]}
          />
          <Field
            label="Leave dates"
            name="onLeaveDates"
            formik={formik}
            placeholder="2026-09-25, 2026-09-26"
            required={false}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={formik.isSubmitting}>
              {formik.isSubmitting ? "Saving" : "Save driver"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
