"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const startSchema = Yup.object({
  startOdometer: Yup.number().min(0, "Cannot be negative"),
});

const endSchema = Yup.object({
  endOdometer: Yup.number().min(0, "Cannot be negative"),
});

export function StartTripForm({
  onSubmit,
}: {
  onSubmit: (startOdometer: number) => Promise<void>;
}) {
  return (
    <Formik
      initialValues={{ startOdometer: 0 }}
      validationSchema={startSchema}
      onSubmit={async (values, helpers) => {
        try {
          await onSubmit(Number(values.startOdometer) || 0);
        } finally {
          helpers.setSubmitting(false);
        }
      }}
    >
      {(formik) => (
        <Form className="space-y-4">
          <Field
            label="Start odometer (optional)"
            name="startOdometer"
            type="number"
            min={0}
            formik={formik}
            placeholder="45210"
            required={false}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={formik.isSubmitting}>
              {formik.isSubmitting ? "Starting" : "Start trip"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export function EndTripForm({
  onSubmit,
}: {
  onSubmit: (endOdometer: number) => Promise<void>;
}) {
  return (
    <Formik
      initialValues={{ endOdometer: 0 }}
      validationSchema={endSchema}
      onSubmit={async (values, helpers) => {
        try {
          await onSubmit(Number(values.endOdometer) || 0);
        } finally {
          helpers.setSubmitting(false);
        }
      }}
    >
      {(formik) => (
        <Form className="space-y-4">
          <Field
            label="End odometer (optional)"
            name="endOdometer"
            type="number"
            min={0}
            formik={formik}
            placeholder="45248"
            required={false}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={formik.isSubmitting}>
              {formik.isSubmitting ? "Ending" : "End trip"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
