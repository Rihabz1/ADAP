"use client";
import { useMemo, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
} from "react-leaflet";
import { Layers3, Route } from "lucide-react";
import type { LocationEvent, Provider } from "@/lib/types";
import { providerLabel, sortLocationEventsAscending } from "@/lib/activity";
import { formatDateTime } from "@/lib/format";
import { providerConfig, PageTitle } from "@/components/ui";
import { audit } from "@/lib/client-storage";
export function ActivityMap({
  locations,
  identifier,
  name,
}: {
  locations: LocationEvent[];
  identifier: string;
  name: string;
}) {
  const [selected, setSelected] = useState<Provider[]>([
    "foodpanda",
    "daraz",
    "pathao",
    "uber",
  ]);
  const [sequence, setSequence] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const visible = useMemo(
    () =>
      sortLocationEventsAscending(
        locations.filter(
          (location) =>
            selected.includes(location.provider) &&
            (!from || location.occurredAt.slice(0, 10) >= from) &&
            (!to || location.occurredAt.slice(0, 10) <= to),
        ),
      ),
    [locations, selected, from, to],
  );
  const center: [number, number] = visible.length
    ? [
        visible[visible.length - 1].latitude,
        visible[visible.length - 1].longitude,
      ]
    : [23.8103, 90.4125];
  const toggle = (p: Provider) =>
    setSelected((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageTitle
        eyebrow="Historical recorded points"
        title={`${name} activity map`}
        description="This map visualizes only recorded event coordinates. It does not infer exact routes or continuous movement."
      />
      <div className="card mb-4 flex flex-wrap items-center gap-2 p-4">
        {(Object.keys(providerConfig) as Provider[]).map((p) => (
          <button
            onClick={() => toggle(p)}
            key={p}
            className={`rounded-lg border px-3 py-2 text-xs font-bold ${selected.includes(p) ? "border-teal-600 bg-teal-50 text-teal-800" : "border-slate-200 text-slate-400"}`}
          >
            {providerLabel[p]}
          </button>
        ))}
        <span className="flex-1" />
        <label className="text-xs text-slate-500">
          From
          <input
            type="date"
            className="field ml-2 w-auto py-2"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
        </label>
        <label className="text-xs text-slate-500">
          To
          <input
            type="date"
            className="field ml-2 w-auto py-2"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </label>
        <button
          className={`btn-secondary ${sequence ? "border-teal-600 text-teal-700" : ""}`}
          onClick={() => {
            setSequence(!sequence);
            audit("MAP_SEQUENCE_TOGGLED", identifier);
          }}
        >
          <Route size={16} />
          Activity Sequence
        </button>
      </div>
      <div className="card relative p-2">
        <MapContainer
          key={`${center[0]}-${center[1]}`}
          center={center}
          zoom={12}
          scrollWheelZoom
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {visible.map((l, i) => (
            <CircleMarker
              key={`${l.activityId}-${l.role}-${i}`}
              center={[l.latitude, l.longitude]}
              radius={7}
              pathOptions={{
                color: "white",
                weight: 2,
                fillColor: providerConfig[l.provider].color,
                fillOpacity: 0.95,
              }}
            >
              <Popup>
                <div className="min-w-44">
                  <b>{providerLabel[l.provider]}</b>
                  {sequence && <p>Sequence #{i + 1}</p>}
                  <p>{l.title}</p>
                  <p>
                    <b>Recorded {l.role}:</b> {l.area}
                  </p>
                  <p>{formatDateTime(l.occurredAt)}</p>
                  <p className="capitalize">{l.status}</p>
                </div>
              </Popup>
              {sequence && (
                <Tooltip
                  permanent
                  direction="center"
                  opacity={1}
                  className={`sequence-number-label sequence-${l.provider}`}
                >
                  {i + 1}
                </Tooltip>
              )}
            </CircleMarker>
          ))}
          {sequence && visible.length > 1 && (
            <Polyline
              positions={visible.map((l) => [l.latitude, l.longitude])}
              pathOptions={{
                color: "#0f766e",
                weight: 2,
                dashArray: "6 7",
                opacity: 0.65,
              }}
            />
          )}
        </MapContainer>
        <div className="absolute bottom-5 left-5 z-[500] rounded-lg bg-white/95 p-3 text-xs shadow-lg">
          <p className="mb-2 flex items-center gap-1.5 font-bold">
            <Layers3 size={14} />
            Legend
          </p>
          {(Object.keys(providerConfig) as Provider[]).map((p) => (
            <div key={p} className="mb-1 flex items-center gap-2">
              <i
                className="size-2.5 rounded-full"
                style={{ background: providerConfig[p].color }}
              />
              {providerLabel[p]}
            </div>
          ))}
        </div>
      </div>
      {sequence && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <b>Historical event sequence · Earliest to latest.</b> Numbers merge
          all selected providers into one ascending chronology. With one
          provider selected, only that provider is numbered. Lines connect
          recorded points and do not represent the exact route traveled.
        </div>
      )}
      <p className="mt-3 text-xs text-slate-500">
        Showing {visible.length} recorded location points.
      </p>
    </div>
  );
}
