"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import { clearSession, getSession, saveSession } from "@/lib/auth";
import type { Session } from "@/lib/types";

export function useAuth() {
  const [session, setSessionState] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    setSessionState(getSession());
    setReady(true);
  }, []);

  const setSession = useCallback((next: Session | null) => {
    if (next) saveSession(next);
    else clearSession();
    setSessionState(next);
  }, []);

  return { session, ready, setSession };
}
