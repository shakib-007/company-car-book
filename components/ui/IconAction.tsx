import type { ReactNode } from "react";

export function IconAction({
  label,
  tone,
  onClick,
  children,
}: {
  label: string;
  tone: "secondary" | "danger";
  onClick: () => void;
  children: ReactNode;
}) {
  const tones = {
    secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

export function EditIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m13.5 6.5 3 3" />
    </svg>
  );
}

export function DeleteIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M9 7V5h6v2M8 7l1 12h6l1-12" />
    </svg>
  );
}
