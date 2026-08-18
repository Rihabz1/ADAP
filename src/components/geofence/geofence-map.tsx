"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { divIcon } from "leaflet";
import type {
  Geofence,
  GeofenceEvent,
  GeofencePoint,
} from "@/lib/types";
import { providerLabel } from "@/lib/activity";
import { formatDateTime } from "@/lib/format";
import { polygonCenter } from "@/lib/geofence";
import { providerConfig } from "@/components/ui";

const polygonVertexIcon = divIcon({
  className: "geofence-vertex-marker",
  html: "<span></span>",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function MapResizeSync({ fullscreen }: { fullscreen: boolean }) {
  const map = useMap();

  useEffect(() => {
    const timeout = window.setTimeout(() => map.invalidateSize(), 100);
    return () => window.clearTimeout(timeout);
  }, [fullscreen, map]);

  return null;
}

function MapViewport({
  fence,
  draftPoints,
  preserveView,
  events,
}: {
  fence: Geofence | null;
  draftPoints: GeofencePoint[];
  preserveView: boolean;
  events: GeofenceEvent[];
}) {
  const map = useMap();

  useEffect(() => {
    if (preserveView) return;
    const zonePoints: [number, number][] =
      fence?.shape === "polygon"
        ? fence.points.map((point) => [point.latitude, point.longitude])
        : draftPoints.length
          ? draftPoints.map((point) => [point.latitude, point.longitude])
          : fence
            ? [
                [fence.latitude - fence.radiusKm / 111, fence.longitude],
                [fence.latitude + fence.radiusKm / 111, fence.longitude],
              ]
            : [[23.8103, 90.4125]];
    const bounds: [number, number][] = [
      ...zonePoints,
      ...events.map(
        (event) => [event.latitude, event.longitude] as [number, number],
      ),
    ];
    if (bounds.length === 1) {
      map.setView(bounds[0], 13, { animate: false });
      return;
    }
    map.fitBounds(bounds, {
      animate: false,
      maxZoom: 15,
      padding: [36, 36],
    });
  }, [draftPoints, events, fence, map, preserveView]);

  return null;
}

function MapClickHandler({
  enabled,
  onMapClick,
}: {
  enabled: boolean;
  onMapClick: (latitude: number, longitude: number) => void;
}) {
  useMapEvents({
    click(event) {
      if (enabled) onMapClick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export function GeofenceMap({
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
  const [fullscreen, setFullscreen] = useState(false);
  const mapFrameRef = useRef<HTMLDivElement>(null);
  const polygonPoints =
    fence?.shape === "polygon" ? fence.points : draftPoints;
  const center =
    fence?.shape === "polygon"
      ? polygonCenter(fence.points)
      : fence
        ? { latitude: fence.latitude, longitude: fence.longitude }
        : polygonCenter(
            draftPoints.length
              ? draftPoints
              : [{ latitude: 23.8103, longitude: 90.4125 }],
          );

  useEffect(() => {
    const syncFullscreenState = () =>
      setFullscreen(document.fullscreenElement === mapFrameRef.current);
    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () =>
      document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  return (
    <div
      ref={mapFrameRef}
      className={`geofence-map-frame bg-white ${fullscreen ? "is-expanded fixed inset-0 z-[9999] h-screen w-screen" : "relative"}`}
    >
      <MapContainer
        center={[center.latitude, center.longitude]}
        zoom={13}
        scrollWheelZoom
        style={{ height: fullscreen ? "100vh" : "500px" }}
        className={drawingPolygon ? "cursor-crosshair" : undefined}
      >
        <MapResizeSync fullscreen={fullscreen} />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewport
          fence={fence}
          draftPoints={draftPoints}
          preserveView={polygonPoints.length > 0}
          events={events}
        />
        <MapClickHandler
          enabled={fence?.shape !== "polygon" || drawingPolygon}
          onMapClick={onMapClick}
        />
        {fence && fence.shape !== "polygon" && (
          <>
            <Circle
              center={[fence.latitude, fence.longitude]}
              radius={fence.radiusKm * 1000}
              pathOptions={{
                color: "#0f766e",
                fillColor: "#14b8a6",
                fillOpacity: 0.14,
                weight: 2,
              }}
            />
            <CircleMarker
              center={[fence.latitude, fence.longitude]}
              radius={7}
              pathOptions={{
                color: "white",
                fillColor: "#0f766e",
                fillOpacity: 1,
                weight: 3,
              }}
            >
              <Tooltip direction="top" offset={[0, -7]}>
                Geofence center
              </Tooltip>
            </CircleMarker>
          </>
        )}
        {polygonPoints.length >= 3 ? (
          <Polygon
            positions={polygonPoints.map((point) => [point.latitude, point.longitude])}
            pathOptions={{
              color: "#2563eb",
              fillColor: "#38bdf8",
              fillOpacity: drawingPolygon ? 0.12 : 0.2,
              weight: 3,
              dashArray: drawingPolygon ? "7 6" : undefined,
            }}
          />
        ) : polygonPoints.length >= 2 ? (
          <Polyline
            positions={polygonPoints.map((point) => [point.latitude, point.longitude])}
            pathOptions={{ color: "#2563eb", weight: 3, dashArray: "7 6" }}
          />
        ) : null}
        {polygonPoints.map((point, index) => (
          <Marker
            key={`${point.latitude}-${point.longitude}-${index}`}
            position={[point.latitude, point.longitude]}
            icon={polygonVertexIcon}
            draggable
            bubblingMouseEvents={false}
            eventHandlers={{
              dragend(event) {
                const position = event.target.getLatLng();
                onPointChange(index, position.lat, position.lng);
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -10]}>
              Drag vertex {index + 1} to reshape zone
            </Tooltip>
          </Marker>
        ))}
        {events.map((event, index) => {
          const transitionColor =
            event.transition === "entered"
              ? "#2563eb"
              : event.transition === "exited"
                ? "#d97706"
                : providerConfig[event.provider].color;
          return (
            <CircleMarker
              key={`${event.activityId}-${event.role}-${index}`}
              center={[event.latitude, event.longitude]}
              radius={event.transition ? 8 : 5}
              bubblingMouseEvents={false}
              pathOptions={{
                color: transitionColor,
                fillColor: event.state === "inside" ? "#10b981" : "#64748b",
                fillOpacity: 0.92,
                weight: event.transition ? 3 : 2,
              }}
            >
              <Popup>
                <div className="min-w-48">
                  <b>{providerLabel[event.provider]}</b>
                  <p>{event.title}</p>
                  <p>
                    <b>Recorded {event.role}:</b> {event.area}
                  </p>
                  <p>{formatDateTime(event.occurredAt)}</p>
                  <p>
                    {event.distanceKm.toFixed(2)} km reference distance ·{" "}
                    {event.state}
                  </p>
                  {event.transition && (
                    <p className="capitalize">
                      <b>Transition:</b> {event.transition}
                    </p>
                  )}
                </div>
              </Popup>
              {event.transition && (
                <Tooltip direction="top" offset={[0, -7]}>
                  {event.transition === "entered" ? "Entry" : "Exit"}
                </Tooltip>
              )}
            </CircleMarker>
          );
        })}
      </MapContainer>
      {drawingPolygon && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-[600] -translate-x-1/2 rounded-full bg-[#002556]/95 px-4 py-2 text-xs font-bold text-white shadow-lg">
          Click map to add vertex {draftPoints.length + 1}
        </div>
      )}
      <button
        type="button"
        onClick={async () => {
          if (fullscreen) {
            if (document.fullscreenElement) await document.exitFullscreen();
            setFullscreen(false);
            return;
          }
          setFullscreen(true);
          try {
            await mapFrameRef.current?.requestFullscreen();
          } catch {
            // Keep the fixed full-window fallback when native fullscreen is unavailable.
          }
        }}
        className="absolute right-4 top-4 z-[1000] grid size-10 place-items-center rounded-xl border border-white bg-white/95 text-[#002556] shadow-lg backdrop-blur transition hover:bg-white"
        aria-label={fullscreen ? "Exit full screen map" : "Open full screen map"}
        title={fullscreen ? "Exit full screen" : "Full screen"}
      >
        {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </button>
      <div className="pointer-events-none absolute bottom-4 left-4 z-[500] rounded-lg bg-white/95 p-3 text-xs shadow-lg">
        <p className="mb-2 font-bold">Geofence legend</p>
        <div className="mb-1 flex items-center gap-2">
          <i className="size-2.5 rounded-full bg-emerald-500" /> Inside record
        </div>
        <div className="mb-1 flex items-center gap-2">
          <i className="size-2.5 rounded-full bg-slate-500" /> Outside record
        </div>
        <div className="mb-1 flex items-center gap-2">
          <i className="size-2.5 rounded-full border-2 border-blue-600 bg-white" />
          Entry transition
        </div>
        <div className="flex items-center gap-2">
          <i className="size-2.5 rounded-full border-2 border-amber-600 bg-white" />
          Exit transition
        </div>
      </div>
    </div>
  );
}
