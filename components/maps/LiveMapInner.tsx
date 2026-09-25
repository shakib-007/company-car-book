"use client";

import { Fragment, useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, Polyline, TileLayer, useMap } from "react-leaflet";
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

function FitTrips({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 12);
      return;
    }
    map.fitBounds(points, { padding: [40, 40], maxZoom: 12 });
  }, [map, points]);
  return null;
}

export default function LiveMapInner({ trips }: { trips: LiveTrip[] }) {
  const latestPoints = useMemo<[number, number][]>(
    () =>
      trips
        .map((trip) => trip.points[trip.points.length - 1])
        .filter(Boolean)
        .map((point) => [point.lat, point.lng]),
    [trips],
  );

  return (
    <MapContainer center={latestPoints[0] || DHAKA} zoom={13} className="h-full w-full rounded-xl" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitTrips points={latestPoints} />
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
