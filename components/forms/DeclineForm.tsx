"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const schema = Yup.object({
  driverDeclineReason: Yup.string()
    .trim()
    .min(5, "Please explain why (at least 5 characters)")
    .required("A reason is required"),
});

export function DeclineForm({ onSubmit }: { onSubmit: (reason: string) => Promise<void> }) {
  return (
    <Formik
      initialValues={{ driverDeclineReason: "" }}
      validationSchema={schema}
      onSubmit={async (values, helpers) => {
        try {
          await onSubmit(values.driverDeclineReason.trim());
        } finally {
          helpers.setSubmitting(false);
        }
      }}
    >
      {(formik) => (
        <Form className="space-y-4">
          <Field
            label="Decline reason"
            name="driverDeclineReason"
            as="textarea"
            formik={formik}
            placeholder="I am on another trip or unavailable at this time"
          />
          <div className="flex justify-end">
            <Button type="submit" variant="danger" loading={formik.isSubmitting}>
              {formik.isSubmitting ? "Sending" : "Decline trip"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
