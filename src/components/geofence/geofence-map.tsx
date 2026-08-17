"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { GeofenceEvent } from "@/lib/types";
import { providerLabel } from "@/lib/activity";
import { formatDateTime } from "@/lib/format";
import { providerConfig } from "@/components/ui";

function MapResizeSync({ fullscreen }: { fullscreen: boolean }) {
  const map = useMap();

  useEffect(() => {
    const timeout = window.setTimeout(() => map.invalidateSize(), 100);
    return () => window.clearTimeout(timeout);
  }, [fullscreen, map]);

  return null;
}

function MapViewport({
  latitude,
  longitude,
  radiusKm,
  events,
}: {
  latitude: number;
  longitude: number;
  radiusKm: number;
  events: GeofenceEvent[];
}) {
  const map = useMap();

  useEffect(() => {
    const latitudeOffset = radiusKm / 111;
    const longitudeOffset =
      radiusKm / (111 * Math.max(Math.cos((latitude * Math.PI) / 180), 0.1));
    const bounds: [number, number][] = [
      [latitude - latitudeOffset, longitude - longitudeOffset],
      [latitude + latitudeOffset, longitude + longitudeOffset],
      ...events.map(
        (event) => [event.latitude, event.longitude] as [number, number],
      ),
    ];

    map.fitBounds(bounds, {
      animate: false,
      maxZoom: 15,
      padding: [36, 36],
    });
  }, [events, latitude, longitude, map, radiusKm]);

  return null;
}

function MapClickHandler({
  onCenterChange,
}: {
  onCenterChange: (latitude: number, longitude: number) => void;
}) {
  useMapEvents({
    click(event) {
      onCenterChange(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export function GeofenceMap({
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
  const [fullscreen, setFullscreen] = useState(false);
  const mapFrameRef = useRef<HTMLDivElement>(null);

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
      className="geofence-map-frame relative bg-white"
    >
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        scrollWheelZoom
        style={{ height: fullscreen ? "100vh" : "500px" }}
      >
        <MapResizeSync fullscreen={fullscreen} />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewport
          latitude={latitude}
          longitude={longitude}
          radiusKm={radiusKm}
          events={events}
        />
        <MapClickHandler onCenterChange={onCenterChange} />
        <Circle
          center={[latitude, longitude]}
          radius={radiusKm * 1000}
          pathOptions={{
            color: "#0f766e",
            fillColor: "#14b8a6",
            fillOpacity: 0.14,
            weight: 2,
          }}
        />
        <CircleMarker
          center={[latitude, longitude]}
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
                    {event.distanceKm.toFixed(2)} km from center · {event.state}
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
      <button
        type="button"
        onClick={async () => {
          if (document.fullscreenElement) {
            await document.exitFullscreen();
            return;
          }
          await mapFrameRef.current?.requestFullscreen();
        }}
        className="absolute right-4 top-4 z-[600] grid size-10 place-items-center rounded-xl border border-white bg-white/95 text-[#002556] shadow-lg backdrop-blur transition hover:bg-white"
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
