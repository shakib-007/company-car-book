"use client";

import { useEffect, useState } from "react";
import { api, newId } from "@/lib/api";
import type { Driver, TripRequest } from "@/lib/types";

const POST_INTERVAL_MS = 15000;

export function TripTracker({ userId }: { userId: string }) {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [trip, setTrip] = useState<TripRequest | null>(null);

  useEffect(() => {
    api.getDrivers({ userId }).then((rows) => setDriver(rows[0] || null));
  }, [userId]);

  useEffect(() => {
    if (!driver) return;
    let cancelled = false;
    async function poll() {
      const trips = await api.getTripRequests({ driverId: driver!.id, status: "in_progress" });
      if (!cancelled) setTrip(trips[0] || null);
    }
    poll();
    const timer = setInterval(poll, 8000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [driver]);

  useEffect(() => {
    if (!trip) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    let stopped = false;
    let lastPosted = 0;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (stopped || now - lastPosted < POST_INTERVAL_MS) return;
        lastPosted = now;
        void api
          .createLocation({
            id: newId(),
            requestId: trip.id,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            timestamp: new Date().toISOString(),
          })
          .catch(() => undefined);
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );

    return () => {
      stopped = true;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [trip]);

  return null;
}
