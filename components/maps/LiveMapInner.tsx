"use client";

import { Fragment, useMemo } from "react";
import { MapContainer, Marker, Popup, Polyline, TileLayer } from "react-leaflet";
import type { LocationPoint, TripRequest } from "@/lib/types";
import { ensureLeafletIcons } from "./leafletIcons";

ensureLeafletIcons();

const DHAKA: [number, number] = [23.7809, 90.4143];

export type LiveTrip = {
  request: TripRequest;
  employeeName: string;
  driverName: string;
  points: LocationPoint[];
};

export default function LiveMapInner({ trips }: { trips: LiveTrip[] }) {
  const center = useMemo<[number, number]>(() => {
    const latest = trips
      .map((trip) => trip.points[trip.points.length - 1])
      .filter(Boolean);
    if (latest[0]) return [latest[0].lat, latest[0].lng];
    return DHAKA;
  }, [trips]);

  return (
    <MapContainer center={center} zoom={13} className="h-full w-full rounded-xl" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {trips.map((trip) => {
        const latest = trip.points[trip.points.length - 1];
        if (!latest) return null;
        const line = trip.points.map((point) => [point.lat, point.lng] as [number, number]);
        return (
          <Fragment key={trip.request.id}>
            {line.length > 1 ? <Polyline positions={line} pathOptions={{ color: "#0d9488" }} /> : null}
            <Marker position={[latest.lat, latest.lng]}>
              <Popup>
                <p className="font-medium">{trip.employeeName}</p>
                <p>Driver: {trip.driverName}</p>
                <p>
                  {trip.request.pickup} → {trip.request.destination}
                </p>
              </Popup>
            </Marker>
          </Fragment>
        );
      })}
    </MapContainer>
  );
}
