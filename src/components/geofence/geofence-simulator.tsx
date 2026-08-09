"use client";
import { FormEvent, useEffect, useState } from "react";
import { Bell, MapPin, Play, Save, ShieldCheck } from "lucide-react";
import type { Geofence, GeofenceEvent, LocationEvent } from "@/lib/types";
import { simulateGeofence } from "@/lib/geofence";
import { formatDateTime } from "@/lib/format";
import { audit, keys, readLocal, writeLocal } from "@/lib/client-storage";
import { PageTitle, ProviderBadge, StatCard } from "@/components/ui";

const dhakaPlaces = [
  { id: "mirpur-10", name: "Mirpur 10", latitude: 23.8069, longitude: 90.3687 },
  {
    id: "dhanmondi",
    name: "Dhanmondi",
    latitude: 23.746728,
    longitude: 90.375971,
  },
  { id: "airport", name: "Airport", latitude: 23.8433, longitude: 90.3978 },
  { id: "gulshan", name: "Gulshan", latitude: 23.792564, longitude: 90.408049 },
  { id: "banani", name: "Banani", latitude: 23.793947, longitude: 90.406377 },
  { id: "uttara", name: "Uttara", latitude: 23.876002, longitude: 90.379516 },
  {
    id: "motijheel",
    name: "Motijheel",
    latitude: 23.732726,
    longitude: 90.417369,
  },
  {
    id: "mohammadpur",
    name: "Mohammadpur",
    latitude: 23.765822,
    longitude: 90.358595,
  },
  {
    id: "farmgate",
    name: "Farmgate",
    latitude: 23.758501,
    longitude: 90.389573,
  },
  {
    id: "bashundhara",
    name: "Bashundhara",
    latitude: 23.815516,
    longitude: 90.4256,
  },
  {
    id: "old-dhaka",
    name: "Old Dhaka",
    latitude: 23.710334,
    longitude: 90.407459,
  },
] as const;

export function GeofenceSimulator() {
  const [identifier, setIdentifier] = useState("01000000001");
  const [selectedPlace, setSelectedPlace] = useState("custom");
  const [name, setName] = useState("Custom Zone");
  const [lat, setLat] = useState("23.8103");
  const [lon, setLon] = useState("90.4125");
  const [radius, setRadius] = useState("2");
  const [events, setEvents] = useState<GeofenceEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Geofence[]>([]);
  useEffect(() => setSaved(readLocal(keys.geofences, [])), []);
  async function run(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch(
      `/api/users/${encodeURIComponent(identifier.trim())}/locations`,
    );
    const body = await response.json();
    if (!response.ok) {
      setError(body.error?.message ?? "Unable to load locations");
      setLoading(false);
      return;
    }
    const fence = {
      id: crypto.randomUUID(),
      name: name.trim(),
      latitude: Number(lat),
      longitude: Number(lon),
      radiusKm: Number(radius),
    };
    setEvents(simulateGeofence(body.data as LocationEvent[], fence));
    audit("GEOFENCE_SIMULATION_EXECUTED", `${identifier}: ${name}`);
    setLoading(false);
  }
  const save = () => {
    const fence = {
      id: crypto.randomUUID(),
      name,
      latitude: Number(lat),
      longitude: Number(lon),
      radiusKm: Number(radius),
    };
    const next = [fence, ...saved];
    setSaved(next);
    writeLocal(keys.geofences, next);
    audit("GEOFENCE_SAVED", name);
  };
  const inside = events.filter((e) => e.state === "inside");
  const entered = events.filter((e) => e.transition === "entered");
  const exited = events.filter((e) => e.transition === "exited");
  const daily = new Map<string, Set<string>>();
  events.forEach((e) => {
    const day = e.occurredAt.slice(0, 10);
    daily.set(day, (daily.get(day) ?? new Set()).add(e.provider));
  });
  const multi = [...daily.values()].filter((s) => s.size > 1).length;
  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle
        eyebrow="Historical simulation"
        title="Geofence Simulator"
        description="Evaluate recorded coordinates against a circle. This does not monitor devices or real-time GPS."
      />
      <div className="mb-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <ShieldCheck className="shrink-0" size={19} />
        <p>
          <b>Historical geofence simulation.</b> Transitions occur between
          discrete records; they do not prove the path taken between those
          points.
        </p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <aside className="space-y-5">
          <form onSubmit={run} className="card space-y-4 p-5">
            <div>
              <p className="eyebrow">Simulation inputs</p>
              <h2 className="mt-1 font-bold">Create circle geofence</h2>
            </div>
            <label className="block text-xs font-bold text-slate-500">
              User phone number
              <input
                className="field mt-1"
                value={identifier}
                onChange={(e) =>
                  setIdentifier(e.target.value.replace(/\D/g, ""))
                }
                inputMode="tel"
                maxLength={11}
                required
                pattern="[0-9]{11}"
              />
            </label>
            <label className="block text-xs font-bold text-slate-500">
              Location
              <select
                className="field mt-1"
                value={selectedPlace}
                onChange={(event) => {
                  const value = event.target.value;
                  setSelectedPlace(value);
                  if (value === "custom") {
                    setName("Custom Zone");
                    setLat("23.8103");
                    setLon("90.4125");
                    return;
                  }
                  const place = dhakaPlaces.find((item) => item.id === value);
                  if (!place) return;
                  setName(place.name);
                  setLat(String(place.latitude));
                  setLon(String(place.longitude));
                }}
              >
                <option value="custom">Custom</option>
                <optgroup label="Known places in Dhaka">
                  {dhakaPlaces.map((place) => (
                    <option key={place.id} value={place.id}>
                      {place.name} — {place.latitude}, {place.longitude}
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>
            <label className="block text-xs font-bold text-slate-500">
              Name
              <input
                className="field mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                readOnly={selectedPlace !== "custom"}
                maxLength={60}
                required
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-bold text-slate-500">
                Center latitude
                <input
                  className="field mt-1"
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  readOnly={selectedPlace !== "custom"}
                  required
                />
              </label>
              <label className="block text-xs font-bold text-slate-500">
                Center longitude
                <input
                  className="field mt-1"
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  readOnly={selectedPlace !== "custom"}
                  required
                />
              </label>
            </div>
            <label className="block text-xs font-bold text-slate-500">
              Radius (km)
              <input
                className="field mt-1"
                type="number"
                min="0.1"
                max="100"
                step="0.1"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                required
              />
            </label>
            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <button className="btn-primary flex-1" disabled={loading}>
                <Play size={16} />
                {loading ? "Analyzing…" : "Run simulation"}
              </button>
              <button
                type="button"
                onClick={save}
                className="btn-secondary"
                aria-label="Save geofence"
              >
                <Save size={16} />
              </button>
            </div>
          </form>
          {saved.length > 0 && (
            <div className="card p-5">
              <p className="eyebrow">Saved locally</p>
              <div className="mt-3 space-y-2">
                {saved.map((f) => (
                  <button
                    key={f.id}
                    className="w-full rounded-lg border border-slate-100 p-3 text-left text-sm hover:bg-slate-50"
                    onClick={() => {
                      setSelectedPlace("custom");
                      setName(f.name);
                      setLat(String(f.latitude));
                      setLon(String(f.longitude));
                      setRadius(String(f.radiusKm));
                    }}
                  >
                    <b>{f.name}</b>
                    <span className="mt-1 block text-xs text-slate-500">
                      {f.radiusKm} km radius
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
        <section>
          {events.length ? (
            <>
              <div className="mb-5 grid gap-3 sm:grid-cols-3">
                <StatCard
                  label="Inside records"
                  value={inside.length}
                  icon={<MapPin size={18} className="text-teal-700" />}
                />
                <StatCard label="Entered zone" value={entered.length} />
                <StatCard label="Exited zone" value={exited.length} />
              </div>
              <div className="card mb-5 p-5">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-amber-600" />
                  <h2 className="font-bold">Alerts</h2>
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">
                    INFORMATIONAL
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Alert
                    text={`${inside.length} activities recorded inside ${name}`}
                    active={inside.length > 0}
                  />
                  <Alert
                    text={`${multi} days include multiple providers`}
                    active={multi > 0}
                  />
                  <Alert
                    text={`${entered.length} historical entries detected`}
                    active={entered.length > 0}
                  />
                  <Alert
                    text={`${exited.length} historical exits detected`}
                    active={exited.length > 0}
                  />
                </div>
              </div>
              <div className="card table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Provider</th>
                      <th>Recorded area</th>
                      <th>Distance</th>
                      <th>State / transition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events
                      .filter((e) => e.state === "inside" || e.transition)
                      .slice()
                      .reverse()
                      .slice(0, 100)
                      .map((e, i) => (
                        <tr key={`${e.activityId}-${e.role}-${i}`}>
                          <td className="text-sm text-slate-500">
                            {formatDateTime(e.occurredAt)}
                          </td>
                          <td>
                            <ProviderBadge provider={e.provider} />
                          </td>
                          <td>
                            {e.area}{" "}
                            <span className="text-xs text-slate-400">
                              ({e.role})
                            </span>
                          </td>
                          <td>{e.distanceKm.toFixed(2)} km</td>
                          <td>
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-bold ${e.state === "inside" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                            >
                              {e.transition ?? e.state}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="card grid min-h-[480px] place-items-center p-8 text-center">
              <div>
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-teal-50 text-teal-700">
                  <MapPin />
                </span>
                <h2 className="mt-4 font-bold">
                  Ready to analyze historical points
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Run the demonstration to calculate Haversine distance and
                  transitions for a user.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
function Alert({ text, active }: { text: string; active: boolean }) {
  return (
    <div
      className={`rounded-lg border p-3 text-sm ${active ? "border-blue-100 bg-blue-50 text-blue-900" : "border-slate-100 bg-slate-50 text-slate-500"}`}
    >
      <span
        className={`mr-2 inline-block size-2 rounded-full ${active ? "bg-blue-500" : "bg-slate-300"}`}
      />
      {text}
    </div>
  );
}
