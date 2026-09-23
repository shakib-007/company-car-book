"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { api } from "@/lib/api";
import { homePath } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { AuthSplit } from "@/components/auth/AuthSplit";

const schema = Yup.object({
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginPage() {
  const { setSession } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState("");

  return (
    <AuthSplit formSide="left">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Sign in</h1>
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={schema}
        onSubmit={async (values, helpers) => {
          setFormError("");
          try {
            const users = await api.getUsers({ email: values.email });
            const user = users.find((item) => item.password === values.password);
            if (!user) {
              setFormError("Invalid email or password.");
              helpers.setSubmitting(false);
              return;
            }
            if (user.status === "pending") {
              setFormError("Your registration is pending admin approval.");
              helpers.setSubmitting(false);
              return;
            }
            if (user.status !== "active") {
              setFormError("This account is inactive. Contact an admin.");
              helpers.setSubmitting(false);
              return;
            }
            setSession({
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            });
            router.replace(homePath(user.role));
          } catch {
            setFormError("Cannot reach the API. Start json-server on port 3001.");
            helpers.setSubmitting(false);
          }
        }}
      >
        {(formik) => (
          <Form className="space-y-4">
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
              placeholder="Enter your password"
            />
            {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
            <Button type="submit" className="w-full" loading={formik.isSubmitting}>
              {formik.isSubmitting ? "Signing in" : "Sign in"}
            </Button>
          </Form>
        )}
      </Formik>
      <p className="mt-6 text-center text-sm text-slate-600">
        Employee without an account?{" "}
        <Link href="/register" className="font-medium text-teal-700 hover:underline">
          Register
        </Link>
      </p>
    </AuthSplit>
  );
}
