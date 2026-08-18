"use client";

import dynamic from "next/dynamic";
import type { Geofence, GeofenceEvent, GeofencePoint } from "@/lib/types";

const GeofenceMap = dynamic(
  () => import("./geofence-map").then((module) => module.GeofenceMap),
  {
    ssr: false,
    loading: () => <div className="skeleton h-[500px] w-full" />,
  },
);

export function GeofenceMapShell({
  fence,
  draftPoints,
  drawingPolygon,
  events,
  onMapClick,
  onPointChange,
}: {
  fence: Geofence | null;
  draftPoints: GeofencePoint[];
  drawingPolygon: boolean;
  events: GeofenceEvent[];
  onMapClick: (latitude: number, longitude: number) => void;
  onPointChange: (
    index: number,
    latitude: number,
    longitude: number,
  ) => void;
}) {
  return (
    <GeofenceMap
      fence={fence}
      draftPoints={draftPoints}
      drawingPolygon={drawingPolygon}
      events={events}
      onMapClick={onMapClick}
      onPointChange={onPointChange}
    />
  );
}
