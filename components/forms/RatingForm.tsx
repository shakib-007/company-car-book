"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const schema = Yup.object({
  rating: Yup.number().min(1, "Select 1 to 5").max(5).required("Rating is required"),
  comment: Yup.string(),
});

export function RatingForm({ onSubmit }: { onSubmit: (rating: number, comment: string) => Promise<void> }) {
  return (
    <Formik
      initialValues={{ rating: 5, comment: "" }}
      validationSchema={schema}
      onSubmit={async (values, helpers) => {
        try {
          await onSubmit(Number(values.rating), values.comment.trim());
        } finally {
          helpers.setSubmitting(false);
        }
      }}
    >
      {(formik) => (
        <Form className="space-y-4">
          <Field
            label="Rating"
            name="rating"
            as="select"
            formik={formik}
            options={[1, 2, 3, 4, 5].map((value) => ({
              value: String(value),
              label: `${value} star${value === 1 ? "" : "s"}`,
            }))}
          />
          <Field
            label="Comment"
            name="comment"
            as="textarea"
            formik={formik}
            placeholder="How was the drive?"
            required={false}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={formik.isSubmitting}>
              {formik.isSubmitting ? "Saving" : "Submit rating"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
