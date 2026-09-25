"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { EndTripForm, StartTripForm } from "@/components/forms/TripLogForms";
import type { LocationPoint, TripStatus } from "@/lib/types";
import { useLivePosition } from "@/hooks/useLivePosition";
import {
  bearingDegrees,
  drivingRoute,
  formatTripSpan,
  geocodePlace,
  pointAlongLine,
  type LatLng,
  type RouteResult,
} from "@/lib/places";
import { driverMarkerIcon, ensureLeafletIcons, stopMarkerIcon } from "./leafletIcons";

ensureLeafletIcons();

const DHAKA: [number, number] = [23.7809, 90.4143];

const PICKUP_ICON = stopMarkerIcon("A", "#0f766e");
const DROPOFF_ICON = stopMarkerIcon("B", "#b91c1c");

export type DriverTripMapProps = {
  requestId: string;
  pickup: string;
  destination: string;
  status: TripStatus;
  passengerName?: string;
  startedAt?: string;
  points: LocationPoint[];
  onStart: () => Promise<void>;
  onEnd: () => Promise<void>;
};

function MapController({
  points,
  driver,
  following,
  mode,
  onUserMove,
}: {
  points: [number, number][];
  driver: [number, number] | null;
  following: boolean;
  mode: "live" | "overview";
  onUserMove: () => void;
}) {
  const map = useMap();
  const userMoved = useRef(false);
  const fitted = useRef(false);
  const includedDriver = useRef(false);
  const modeRef = useRef(mode);

  useMapEvents({
    dragstart() {
      userMoved.current = true;
      onUserMove();
    },
  });

  useEffect(() => {
    if (modeRef.current !== mode) {
      modeRef.current = mode;
      if (mode === "overview") {
        userMoved.current = false;
        fitted.current = false;
        includedDriver.current = false;
      }
    }
    if (following && driver) {
      map.panTo(driver, { animate: true });
      return;
    }
    if (userMoved.current) return;
    const firstDriver = Boolean(driver) && !includedDriver.current;
    if (fitted.current && !firstDriver) return;
    const all = driver ? [...points, driver] : points;
    if (all.length === 0) return;
    if (all.length === 1) map.setView(all[0], 14);
    else {
      map.fitBounds(all, {
        paddingTopLeft: [40, 48],
        paddingBottomRight: [40, 120],
        maxZoom: 15,
      });
    }
    fitted.current = true;
    if (driver) includedDriver.current = true;
  }, [points, driver, following, mode, map]);

  return null;
}

function statusLabel(status: TripStatus): string {
  if (status === "in_progress") return "On trip";
  if (status === "accepted") return "Head to pickup";
  if (status === "assigned") return "Assigned trip";
  if (status === "completed") return "Trip completed";
  return "Trip";
}

export default function DriverTripMapInner({
  pickup,
  destination,
  status,
  passengerName,
  onStart,
  onEnd,
}: DriverTripMapProps) {
  const tracking = status === "in_progress";
  const { position: live, error: locationError } = useLivePosition(tracking);
  const previousFix = useRef<LatLng | null>(null);
  const [following, setFollowing] = useState(tracking);
  const [places, setPlaces] = useState<{ pickup: LatLng | null; destination: LatLng | null }>({
    pickup: null,
    destination: null,
  });
  const [planned, setPlanned] = useState<RouteResult | null>(null);
  const [placeNote, setPlaceNote] = useState("");

  useEffect(() => {
    if (status === "in_progress") setFollowing(true);
    else setFollowing(false);
  }, [status]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([geocodePlace(pickup), geocodePlace(destination)]).then(([from, to]) => {
      if (cancelled) return;
      setPlaces({ pickup: from, destination: to });
      if (!from || !to) {
        setPlaceNote("Pickup or drop-off could not be placed on the map. Your live location still shows.");
      } else {
        setPlaceNote("");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pickup, destination]);

  useEffect(() => {
    if (!places.pickup || !places.destination) return;
    let cancelled = false;
    drivingRoute(places.pickup, places.destination).then((result) => {
      if (!cancelled) setPlanned(result);
    });
    return () => {
      cancelled = true;
    };
  }, [places.pickup, places.destination]);

  const routeEnds = useMemo(() => {
    if (!planned || planned.line.length === 0) return null;
    if (status === "completed") return pointAlongLine(planned.line, 1);
    if (status === "in_progress") return null;
    return pointAlongLine(planned.line, 0);
  }, [planned, status]);

  const heading = useMemo(() => {
    if (!live) return 0;
    if (live.heading != null) return live.heading;
    if (!previousFix.current) return 0;
    return bearingDegrees(previousFix.current, live);
  }, [live]);

  useEffect(() => {
    if (live) previousFix.current = { lat: live.lat, lng: live.lng };
  }, [live]);

  const carPosition = tracking
    ? live
      ? { lat: live.lat, lng: live.lng, heading }
      : null
    : (routeEnds ?? (places.pickup ? { ...places.pickup, heading: 0 } : null));

  const locationNote = tracking
    ? locationError || (live ? "" : "Waiting for your location. The car moves only when GPS updates.")
    : "";

  const overview = useMemo(() => {
    const list: [number, number][] = [];
    if (places.pickup) list.push([places.pickup.lat, places.pickup.lng]);
    if (places.destination) list.push([places.destination.lat, places.destination.lng]);
    return list;
  }, [places.pickup, places.destination]);

  const driverPoint = useMemo<[number, number] | null>(
    () => (carPosition ? [carPosition.lat, carPosition.lng] : null),
    [carPosition],
  );

  const driverIcon = useMemo(() => driverMarkerIcon(carPosition?.heading ?? null), [carPosition?.heading]);

  const eta = planned;
  const etaCaption = status === "in_progress" ? "to drop-off" : "assigned route";

  return (
    <div className="driver-trip-map relative h-full">
      <MapContainer center={DHAKA} zoom={12} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {planned && planned.line.length > 1 ? (
          <Polyline positions={planned.line} pathOptions={{ color: "#0f766e", weight: 5 }} />
        ) : null}
        {places.pickup ? <Marker position={[places.pickup.lat, places.pickup.lng]} icon={PICKUP_ICON} /> : null}
        {places.destination ? (
          <Marker position={[places.destination.lat, places.destination.lng]} icon={DROPOFF_ICON} />
        ) : null}
        {driverPoint ? <Marker position={driverPoint} icon={driverIcon} zIndexOffset={800} /> : null}
        <MapController
          points={overview}
          driver={driverPoint}
          following={following}
          mode={status === "in_progress" ? "live" : "overview"}
          onUserMove={() => setFollowing(false)}
        />
      </MapContainer>

      <button
        type="button"
        className="absolute right-3 top-3 z-[1000] flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-800 shadow-lg ring-1 ring-black/5"
        aria-label="Center on this trip"
        onClick={() => setFollowing(true)}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21" />
        </svg>
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1000] p-2">
        <div className="pointer-events-auto rounded-xl bg-white/95 px-3 py-2.5 shadow-lg ring-1 ring-black/10 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">
                {statusLabel(status)}
                {passengerName ? <span className="font-medium normal-case tracking-normal text-slate-700"> · {passengerName}</span> : null}
              </p>
              <p className="truncate text-xs text-slate-600">
                {pickup} → {destination}
              </p>
            </div>
            {eta ? (
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {formatTripSpan(eta.distanceMeters, eta.durationSeconds)}
                </p>
                <p className="text-[11px] text-slate-500">{etaCaption}</p>
              </div>
            ) : null}
          </div>
          {status === "accepted" ? (
            <div className="mt-2">
              <StartTripForm onSubmit={onStart} />
            </div>
          ) : null}
          {status === "in_progress" ? (
            <div className="mt-2">
              <EndTripForm onSubmit={onEnd} />
            </div>
          ) : null}
          {locationNote || placeNote ? (
            <p className="mt-1.5 text-xs text-slate-500">{locationNote || placeNote}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
