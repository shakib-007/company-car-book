"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import type { Priority, TripRequest, TripType } from "@/lib/types";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { toDateTimeLocal } from "@/lib/datetime";

export type TripFormValues = {
  pickup: string;
  destination: string;
  startDateTime: string;
  endDateTime: string;
  tripType: TripType;
  passengers: number;
  reason: string;
  priority: Priority;
};

const schema = Yup.object({
  pickup: Yup.string().required("Pickup is required"),
  destination: Yup.string().required("Destination is required"),
  startDateTime: Yup.string()
    .required("Start date and time is required")
    .test("not-past", "Start cannot be in the past", (value) => {
      if (!value) return false;
      return new Date(value).getTime() >= Date.now() - 60_000;
    }),
  endDateTime: Yup.string()
    .required("End date and time is required")
    .test("after-start", "End must be after start", function afterStart(value) {
      const start = this.parent.startDateTime as string;
      if (!value || !start) return false;
      return new Date(value) > new Date(start);
    }),
  tripType: Yup.mixed<TripType>().oneOf(["one_way", "round_trip"]).required(),
  passengers: Yup.number().min(1, "At least 1 passenger").required("Passengers is required"),
  reason: Yup.string().required("Reason is required"),
  priority: Yup.mixed<Priority>().oneOf(["normal", "urgent"]).required(),
});

export function tripToValues(trip?: Partial<TripRequest>): TripFormValues {
  return {
    pickup: trip?.pickup || "",
    destination: trip?.destination || "",
    startDateTime: trip?.startDateTime ? toDateTimeLocal(trip.startDateTime) : "",
    endDateTime: trip?.endDateTime ? toDateTimeLocal(trip.endDateTime) : "",
    tripType: trip?.tripType || "one_way",
    passengers: trip?.passengers || 1,
    reason: trip?.reason || "",
    priority: trip?.priority || "normal",
  };
}

export function TripRequestForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<TripRequest>;
  submitLabel: string;
  onSubmit: (values: TripFormValues) => Promise<void>;
}) {
  return (
    <Formik
      initialValues={tripToValues(initial)}
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Pickup" name="pickup" formik={formik} placeholder="Gulshan 1 Circle, Dhaka" />
            <Field
              label="Destination"
              name="destination"
              formik={formik}
              placeholder="Motijheel Commercial Area, Dhaka"
            />
            <Field label="Start" name="startDateTime" type="datetime-local" formik={formik} />
            <Field label="End" name="endDateTime" type="datetime-local" formik={formik} />
            <Field
              label="Trip type"
              name="tripType"
              as="select"
              formik={formik}
              options={[
                { value: "one_way", label: "One way" },
                { value: "round_trip", label: "Round trip" },
              ]}
            />
            <Field
              label="Passengers"
              name="passengers"
              type="number"
              min={1}
              formik={formik}
              placeholder="1"
            />
            <Field
              label="Priority"
              name="priority"
              as="select"
              formik={formik}
              options={[
                { value: "normal", label: "Normal" },
                { value: "urgent", label: "Urgent" },
              ]}
            />
          </div>
          <Field
            label="Reason"
            name="reason"
            as="textarea"
            formik={formik}
            placeholder="Client meeting, airport drop, office visit..."
          />
          <div className="flex justify-end">
            <Button type="submit" loading={formik.isSubmitting}>
              {formik.isSubmitting ? "Saving" : submitLabel}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
