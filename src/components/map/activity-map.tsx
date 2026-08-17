"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { Layers3, Maximize2, Minimize2, Route } from "lucide-react";
import type { LocationEvent, Provider } from "@/lib/types";
import { providerLabel, sortLocationEventsAscending } from "@/lib/activity";
import { formatDateTime } from "@/lib/format";
import { providerConfig, PageTitle } from "@/components/ui";
import { audit } from "@/lib/client-storage";

function MapResizeSync({ fullscreen }: { fullscreen: boolean }) {
  const map = useMap();
  useEffect(() => {
    const timeout = window.setTimeout(() => map.invalidateSize(), 100);
    return () => window.clearTimeout(timeout);
  }, [fullscreen, map]);
  return null;
}

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
    "foodi",
    "pathao",
    "rokomari",
    "steadfast",
  ]);
  const [sequence, setSequence] = useState(false);
  const [sequenceNoticeVisible, setSequenceNoticeVisible] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const mapFrameRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sequenceNoticeVisible) return;
    const timeout = window.setTimeout(
      () => setSequenceNoticeVisible(false),
      2000,
    );
    return () => window.clearTimeout(timeout);
  }, [sequenceNoticeVisible]);
  useEffect(() => {
    const syncFullscreenState = () =>
      setFullscreen(document.fullscreenElement === mapFrameRef.current);
    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () =>
      document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);
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
    <div className="activity-map-page mx-auto max-w-[1500px]">
      <PageTitle
        eyebrow="Historical recorded points"
        title={`${name} activity map`}
        compact
      />
      <div className="card mb-3 flex flex-wrap items-center gap-2 p-3">
        {(Object.keys(providerConfig) as Provider[]).map((p) => (
          <button
            onClick={() => toggle(p)}
            key={p}
            className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${selected.includes(p) ? "border-[#03809A] bg-[#03809A]/[0.06] text-[#002556]" : "border-slate-200 bg-white/60 text-slate-400"}`}
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
          className={`btn-secondary ${sequence ? "border-[#03809A] text-[#03809A]" : ""}`}
          onClick={() => {
            const nextSequence = !sequence;
            setSequence(nextSequence);
            setSequenceNoticeVisible(nextSequence);
            audit("MAP_SEQUENCE_TOGGLED", identifier);
          }}
        >
          <Route size={16} />
          Activity Sequence
        </button>
      </div>
      <div ref={mapFrameRef} className="activity-map-frame card relative p-2">
        <MapContainer
          key={`${center[0]}-${center[1]}`}
          center={center}
          zoom={12}
          scrollWheelZoom
        >
          <MapResizeSync fullscreen={fullscreen} />
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
        {sequenceNoticeVisible && (
          <div className="absolute left-1/2 top-5 z-[600] max-w-sm -translate-x-1/2 rounded-xl border border-amber-200/80 bg-amber-50/95 p-3 text-xs leading-5 text-amber-900 shadow-lg backdrop-blur">
            <b>Historical event sequence · Earliest to latest.</b> Lines connect
            recorded points and do not represent the exact route traveled.
          </div>
        )}
        <button
          type="button"
          onClick={async () => {
            if (document.fullscreenElement) {
              await document.exitFullscreen();
              return;
            }
            await mapFrameRef.current?.requestFullscreen();
          }}
          className="absolute right-5 top-5 z-[600] grid size-10 place-items-center rounded-xl border border-white bg-white/95 text-[#002556] shadow-lg backdrop-blur transition hover:bg-white"
          aria-label={
            fullscreen ? "Exit full screen map" : "Open full screen map"
          }
          title={fullscreen ? "Exit full screen" : "Full screen"}
        >
          {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
        <div className="absolute bottom-5 right-5 z-[500] rounded-full border border-white bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-lg backdrop-blur">
          {visible.length} recorded points
        </div>
      </div>
    </div>
  );
}
