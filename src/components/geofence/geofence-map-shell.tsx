"use client";

import dynamic from "next/dynamic";
import type { GeofenceEvent } from "@/lib/types";

const GeofenceMap = dynamic(
  () => import("./geofence-map").then((module) => module.GeofenceMap),
  {
    ssr: false,
    loading: () => <div className="skeleton h-[500px] w-full" />,
  },
);

export function GeofenceMapShell({
  latitude,
  longitude,
  radiusKm,
  events,
  onCenterChange,
}: {
  latitude: number;
  longitude: number;
  radiusKm: number;
  events: GeofenceEvent[];
  onCenterChange: (latitude: number, longitude: number) => void;
}) {
  return (
    <GeofenceMap
      latitude={latitude}
      longitude={longitude}
      radiusKm={radiusKm}
      events={events}
      onCenterChange={onCenterChange}
    />
  );
}
