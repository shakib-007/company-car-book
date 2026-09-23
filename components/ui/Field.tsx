"use client";

import type { FormikProps } from "formik";

type Option = { value: string; label: string };

type Props = {
  label: string;
  name: string;
  type?: string;
  as?: "input" | "textarea" | "select";
  options?: Option[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik: FormikProps<any>;
  min?: string | number;
  max?: string | number;
  rows?: number;
  placeholder?: string;
  required?: boolean;
};

function fallbackPlaceholder(label: string, type: string, as: string): string | undefined {
  if (as === "select" || type === "datetime-local" || type === "date") return undefined;
  const lower = label.replace(/\(.*?\)/g, "").trim().toLowerCase();
  if (as === "textarea") return `Type ${lower} here`;
  if (type === "email") return "name@company.com";
  if (type === "password") return "Enter password";
  if (type === "number") return "0";
  return `Enter ${lower}`;
}

export function Field({
  label,
  name,
  type = "text",
  as = "input",
  options,
  formik,
  min,
  max,
  rows,
  placeholder,
  required = true,
}: Props) {
  const touched = formik.touched[name];
  const error = formik.errors[name];
  const showError = Boolean(touched && error);
  const hint = placeholder ?? fallbackPlaceholder(label, type, as);
  const cls =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";

  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </span>
      {as === "textarea" ? (
        <textarea
          name={name}
          rows={rows ?? 3}
          className={cls}
          placeholder={hint}
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      ) : as === "select" ? (
        <select
          name={name}
          className={cls}
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          min={min}
          max={max}
          className={cls}
          placeholder={hint}
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      )}
      {showError ? <span className="text-xs text-red-600">{String(error)}</span> : null}
    </label>
  );
}
