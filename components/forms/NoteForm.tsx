"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const schema = Yup.object({
  adminNote: Yup.string().trim().min(5, "Please add a note (at least 5 characters)").required("A note is required"),
});

export function NoteForm({
  submitLabel,
  onSubmit,
}: {
  submitLabel: string;
  onSubmit: (adminNote: string) => Promise<void>;
}) {
  return (
    <Formik
      initialValues={{ adminNote: "" }}
      validationSchema={schema}
      onSubmit={async (values, helpers) => {
        try {
          await onSubmit(values.adminNote.trim());
        } finally {
          helpers.setSubmitting(false);
        }
      }}
    >
      {(formik) => (
        <Form className="space-y-4">
          <Field
            label="Admin note"
            name="adminNote"
            as="textarea"
            formik={formik}
            placeholder="Explain why this request is rejected or cancelled"
          />
          <div className="flex justify-end">
            <Button type="submit" variant="danger" loading={formik.isSubmitting}>
              {formik.isSubmitting ? "Saving" : submitLabel}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
