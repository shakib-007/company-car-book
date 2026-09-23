"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { AppShell } from "@/components/layout/AppShell";
import { TripTracker } from "@/hooks/useTripTracker";
import { useAuth } from "@/hooks/useAuth";
import { DRIVER_NAV } from "@/lib/constants";

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  return (
    <RoleGuard role="driver">
      {session ? <TripTracker userId={session.id} /> : null}
      <AppShell items={DRIVER_NAV}>{children}</AppShell>
    </RoleGuard>
  );
}
