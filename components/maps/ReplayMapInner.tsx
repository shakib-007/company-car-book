"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import { formatDateTime } from "@/lib/datetime";
import type { LocationPoint } from "@/lib/types";
import { ensureLeafletIcons } from "./leafletIcons";
import { Button } from "@/components/ui/Button";

ensureLeafletIcons();

const DHAKA: [number, number] = [23.7465, 90.3742];

function Fit({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 0) return;
    map.fitBounds(positions, { padding: [24, 24] });
  }, [map, positions]);
  return null;
}

export default function ReplayMapInner({ points }: { points: LocationPoint[] }) {
  const positions = useMemo(
    () => points.map((point) => [point.lat, point.lng] as [number, number]),
    [points],
  );
  const [index, setIndex] = useState(positions.length ? positions.length - 1 : 0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing || positions.length === 0) return;
    if (index >= positions.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setIndex((current) => current + 1), 700);
    return () => window.clearTimeout(timer);
  }, [index, playing, positions.length]);

  const center = positions[0] || DHAKA;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
        <Button
          type="button"
          onClick={() => {
            setIndex(0);
            setPlaying(true);
          }}
        >
          Play replay
        </Button>
        <Button type="button" variant="secondary" onClick={() => setPlaying(false)}>
          Pause
        </Button>
        <p className="text-xs text-slate-500">
          {points[index] ? formatDateTime(points[index].timestamp) : "No GPS points"}
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <MapContainer center={center} zoom={13} className="h-full w-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {positions.length > 1 ? (
            <Polyline positions={positions} pathOptions={{ color: "#0369a1" }} />
          ) : null}
          {positions[index] ? <Marker position={positions[index]} /> : null}
          <Fit positions={positions} />
        </MapContainer>
      </div>
    </div>
  );
}
