"use client";

import L from "leaflet";

let ready = false;

export function ensureLeafletIcons() {
  if (ready || typeof window === "undefined") return;
  const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
  L.Marker.prototype.options.icon = icon;
  ready = true;
}

export function stopMarkerIcon(label: "A" | "B", color: string) {
  return L.divIcon({
    className: "place-pin",
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    html: `<div style="display:flex;flex-direction:column;align-items:center">
      <div style="width:28px;height:28px;border-radius:999px;background:${color};color:#fff;font:700 13px/28px sans-serif;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.25)">${label}</div>
      <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${color}"></div>
    </div>`,
  });
}

export function driverMarkerIcon(heading: number | null) {
  const rotation = heading ?? 0;
  return L.divIcon({
    className: "driver-pin",
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    html: `<div class="driver-pulse" style="width:48px;height:48px;display:flex;align-items:center;justify-content:center">
      <svg width="44" height="44" viewBox="0 0 44 44" style="transform:rotate(${rotation}deg);filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))">
        <circle cx="22" cy="22" r="20" fill="#ffffff"/>
        <path d="M16 31c0 .8.7 1.5 1.5 1.5h9c.8 0 1.5-.7 1.5-1.5V20.2c0-.5-.2-1-.6-1.3l-2.2-1.8A2.4 2.4 0 0 0 23.5 16h-3a2.4 2.4 0 0 0-1.7.7l-2.2 1.8c-.4.3-.6.8-.6 1.3V31z" fill="#111827"/>
        <path d="M18.2 19.4c.5-.6 1.5-1 3.8-1s3.3.4 3.8 1l.6 1.5H17.6l.6-1.5z" fill="#5eead4"/>
        <circle cx="18.3" cy="28.4" r="1.2" fill="#e2e8f0"/>
        <circle cx="25.7" cy="28.4" r="1.2" fill="#e2e8f0"/>
      </svg>
    </div>`,
  });
}
