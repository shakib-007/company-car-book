"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { homePath } from "@/lib/auth";
import type { Role } from "@/lib/types";
import { PageLoader } from "@/components/ui/PageLoader";

export function RoleGuard({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { session, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.role !== role) {
      router.replace(homePath(session.role));
    }
  }, [ready, role, router, session]);

  if (!ready || !session || session.role !== role) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
