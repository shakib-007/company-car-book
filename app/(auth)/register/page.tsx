"use client";

import { useState } from "react";
import Link from "next/link";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { api, newId } from "@/lib/api";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { AuthSplit } from "@/components/auth/AuthSplit";

const schema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  password: Yup.string().min(6, "At least 6 characters").required("Password is required"),
  phone: Yup.string().required("Phone is required"),
  department: Yup.string().required("Department is required"),
});

export default function RegisterPage() {
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState("");

  if (done) {
    return (
      <AuthSplit formSide="right">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Registration submitted</h1>
          <p className="mt-3 text-sm text-slate-600">
            An admin will approve your account before you can sign in.
          </p>
          <Link href="/login" className="mt-6 inline-block font-medium text-teal-700 hover:underline">
            Back to sign in
          </Link>
        </div>
      </AuthSplit>
    );
  }

  return (
    <AuthSplit formSide="right">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Employee registration</h1>
      <Formik
        initialValues={{ name: "", email: "", password: "", phone: "", department: "" }}
        validationSchema={schema}
        onSubmit={async (values, helpers) => {
          setFormError("");
          try {
            const existing = await api.getUsers({ email: values.email });
            if (existing.length) {
              setFormError("An account with this email already exists.");
              return;
            }
            await api.createUser({
              id: newId(),
              name: values.name,
              email: values.email,
              password: values.password,
              phone: values.phone,
              role: "employee",
              department: values.department,
              status: "pending",
            });
            setDone(true);
          } catch {
            setFormError("Cannot reach the API. Start json-server on port 3001.");
          } finally {
            helpers.setSubmitting(false);
          }
        }}
      >
        {(formik) => (
          <Form className="space-y-4">
            <Field label="Full name" name="name" formik={formik} placeholder="Jane Rahman" />
            <Field
              label="Email"
              name="email"
              type="email"
              formik={formik}
              placeholder="name@company.com"
            />
            <Field
              label="Password"
              name="password"
              type="password"
              formik={formik}
              placeholder="At least 6 characters"
            />
            <Field label="Phone" name="phone" formik={formik} placeholder="+8801XXXXXXXXX" />
            <Field
              label="Department"
              name="department"
              formik={formik}
              placeholder="Engineering, Sales, HR..."
            />
            {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
            <Button type="submit" className="w-full" loading={formik.isSubmitting}>
              {formik.isSubmitting ? "Creating account" : "Create account"}
            </Button>
          </Form>
        )}
      </Formik>
      <p className="mt-6 text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-teal-700 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthSplit>
  );
}
