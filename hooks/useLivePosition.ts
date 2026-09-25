"use client";

import { useEffect, useState } from "react";

export type LivePosition = {
  lat: number;
  lng: number;
  heading: number | null;
  accuracy: number;
};

export function useLivePosition(enabled: boolean) {
  const [position, setPosition] = useState<LivePosition | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Location is not available in this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setError(null);
        const heading = pos.coords.heading;
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          heading: typeof heading === "number" && Number.isFinite(heading) ? heading : null,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Allow location access to show your car on the map."
            : "Waiting for a GPS fix.",
        );
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [enabled]);

  return { position, error };
}
