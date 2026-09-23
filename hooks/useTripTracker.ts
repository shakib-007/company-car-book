"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Driver } from "@/lib/types";

export function TripTracker({ userId }: { userId: string }) {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  useEffect(() => {
    api.getDrivers({ userId }).then((rows) => setDriver(rows[0] || null));
  }, [userId]);

  useEffect(() => {
    if (!driver) return;
    let cancelled = false;
    async function poll() {
      const trips = await api.getTripRequests({ driverId: driver!.id, status: "in_progress" });
      if (!cancelled) setActiveRequestId(trips[0]?.id || null);
    }
    poll();
    const timer = setInterval(poll, 8000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [driver]);

  useEffect(() => {
    if (!activeRequestId || typeof navigator === "undefined" || !navigator.geolocation) return;
    let lastPosted = 0;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        if (now - lastPosted < 20000) return;
        lastPosted = now;
        api
          .createLocation({
            id: crypto.randomUUID(),
            requestId: activeRequestId,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date().toISOString(),
          })
          .catch(() => undefined);
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 10000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [activeRequestId]);

  return null;
}
