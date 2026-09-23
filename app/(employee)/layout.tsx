"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { AppShell } from "@/components/layout/AppShell";
import { EMPLOYEE_NAV } from "@/lib/constants";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="employee">
      <AppShell items={EMPLOYEE_NAV}>{children}</AppShell>
    </RoleGuard>
  );
}
