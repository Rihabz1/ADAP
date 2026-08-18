"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Network,
  Package,
  Route,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDate } from "@/lib/format";
import {
  buildParcelTrend,
  getSteadfastParcels,
  groupLocations,
  groupRoutes,
  summarizeStatuses,
  type LocationPattern,
  type PatternSelection,
  type TrendRange,
} from "@/lib/patterns";
import type { NormalizedActivity } from "@/lib/types";
import { PageTitle, StatCard } from "@/components/ui";

const ranges: { value: TrendRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "6m", label: "6 months" },
  { value: "all", label: "All" },
];

export function PatternsDashboard({
  activities,
}: {
  activities: NormalizedActivity[];
}) {
  const user = activities[0];
  const parcels = useMemo(() => getSteadfastParcels(activities), [activities]);
  const routes = useMemo(() => groupRoutes(parcels), [parcels]);
  const pickups = useMemo(() => groupLocations(parcels, "pickup"), [parcels]);
  const deliveries = useMemo(
    () => groupLocations(parcels, "delivery"),
    [parcels],
  );
  const connections = useMemo(
    () => [...pickups, ...deliveries].sort((a, b) => b.count - a.count),
    [pickups, deliveries],
  );
  const [range, setRange] = useState<TrendRange>("6m");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const trend = useMemo(() => buildParcelTrend(parcels, range), [parcels, range]);
  const selected =
    [...routes, ...connections].find((item) => item.id === selectedId) ??
    routes[0] ??
    connections[0];

  const frequentLocation = useMemo(() => {
    const totals = new Map<string, { area: string; count: number }>();
    for (const item of connections) {
      const key = item.area.trim().toLocaleLowerCase();
      const current = totals.get(key);
      totals.set(key, {
        area: current?.area ?? item.area,
        count: (current?.count ?? 0) + item.count,
      });
    }
    return [...totals.values()].sort(
      (a, b) => b.count - a.count || a.area.localeCompare(b.area),
    )[0];
  }, [connections]);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageTitle
        eyebrow="Steadfast courier analysis"
        title={`${user.customerName} parcel patterns`}
        description="Recurring routes and location frequency calculated dynamically from this user's current Steadfast parcel records."
        compact
        action={
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <span className="size-2 rounded-full bg-emerald-500" />
            Recurring Pattern
          </span>
        }
      />

      <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5 [&>.card]:p-4 [&_.metric]:text-2xl">
        <StatCard
          label="Total parcels"
          value={parcels.length}
          icon={<Package size={18} className="text-emerald-600" />}
        />
        <StatCard
          label="Unique pickups"
          value={pickups.length}
          icon={<MapPin size={18} className="text-cyan-600" />}
        />
        <StatCard
          label="Unique deliveries"
          value={deliveries.length}
          icon={<MapPin size={18} className="text-blue-600" />}
        />
        <StatCard
          label="Most frequent route"
          value={routes[0]?.label ?? "No route"}
          helper={routes[0] ? `${routes[0].parcels.length} parcels` : undefined}
          icon={<Route size={18} className="text-indigo-600" />}
        />
        <StatCard
          label="Frequent location"
          value={frequentLocation?.area ?? "No location"}
          helper={
            frequentLocation ? `${frequentLocation.count} touchpoints` : undefined
          }
          icon={<Network size={18} className="text-violet-600" />}
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.65fr)]">
        <div className="space-y-4">
          <section className="card overflow-hidden p-5 sm:p-6">
            <SectionHeading
              eyebrow="High Frequency"
              title="Star network"
              description="Line weight represents parcel volume. Select a connection to inspect its parcels."
            />
            <StarNetwork
              userName={user.customerName}
              connections={connections.slice(0, 10)}
              selectedId={selected?.id}
              onSelect={setSelectedId}
            />
          </section>

          <section className="card overflow-hidden p-5 sm:p-6">
            <SectionHeading
              eyebrow="Recurring Pattern"
              title="Recurring routes"
              description={`${routes.length} unique pickup-to-delivery routes`}
            />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-y border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 pr-4 font-bold">Route</th>
                    <th className="px-3 py-3 font-bold">Parcels</th>
                    <th className="px-3 py-3 font-bold">Share</th>
                    <th className="px-3 py-3 font-bold">First seen</th>
                    <th className="py-3 pl-3 font-bold">Last seen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {routes.map((route) => (
                    <tr
                      key={route.id}
                      onClick={() => setSelectedId(route.id)}
                      className={`cursor-pointer transition hover:bg-cyan-50/60 ${selected?.id === route.id ? "bg-cyan-50/80" : ""}`}
                    >
                      <td className="py-3 pr-4 font-semibold text-[#0B2A55]">
                        <span className="inline-flex items-center gap-2">
                          {route.pickupArea}
                          <ArrowRight size={14} className="text-cyan-600" />
                          {route.deliveryArea}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-bold">{route.parcels.length}</td>
                      <td className="px-3 py-3 text-slate-500">
                        {route.percentage.toFixed(1)}%
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        {formatDate(route.firstSeen)}
                      </td>
                      <td className="py-3 pl-3 text-slate-500">
                        {formatDate(route.lastSeen)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <SectionHeading
                eyebrow="Activity Trend"
                title="Parcel activity over time"
                description="Based on booking time; ranges end at the latest recorded parcel."
              />
              <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
                {ranges.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setRange(option.value)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${range === option.value ? "bg-white text-[#0B2A55] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trend} margin={{ top: 8, right: 10, left: -20 }}>
                <defs>
                  <linearGradient id="parcelTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#03809A" stopOpacity={0.34} />
                    <stop offset="100%" stopColor="#03809A" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => formatDate(value).replace(/ \d{4}$/, "")}
                  tick={{ fontSize: 11 }}
                  minTickGap={24}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={(value) => formatDate(String(value))} />
                <Area
                  type="monotone"
                  dataKey="parcels"
                  name="Parcels"
                  stroke="#03809A"
                  strokeWidth={3}
                  fill="url(#parcelTrend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <LocationList
              title="Pickup locations"
              items={pickups}
              selectedId={selected?.id}
              onSelect={setSelectedId}
            />
            <LocationList
              title="Delivery locations"
              items={deliveries}
              selectedId={selected?.id}
              onSelect={setSelectedId}
            />
          </section>
        </div>

        <div>
          <PatternDetails selection={selected} />
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-1 font-bold text-[#0B2A55]">{title}</h2>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function StarNetwork({
  userName,
  connections,
  selectedId,
  onSelect,
}: {
  userName: string;
  connections: LocationPattern[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const max = Math.max(...connections.map((item) => item.count), 1);
  return (
    <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-cyan-50/50 p-2">
      <svg
        viewBox="0 0 800 440"
        className="h-auto min-h-[320px] w-full"
        role="img"
        aria-label="User and frequent parcel location network"
      >
        <defs>
          <marker id="pickupArrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 z" fill="#06b6d4" />
          </marker>
          <marker id="deliveryArrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 z" fill="#2563eb" />
          </marker>
          <filter id="nodeShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#0f2a52" floodOpacity=".13" />
          </filter>
        </defs>
        {connections.map((item, index) => {
          const angle = (Math.PI * 2 * index) / connections.length - Math.PI / 2;
          const x = 400 + Math.cos(angle) * 310;
          const y = 220 + Math.sin(angle) * 165;
          const selected = selectedId === item.id;
          const color = item.role === "pickup" ? "#06b6d4" : "#2563eb";
          const lineWidth = 2 + (item.count / max) * 8;
          const fromCenter = item.role === "delivery";
          return (
            <g
              key={item.id}
              role="button"
              tabIndex={0}
              aria-label={`${item.label}, ${item.count} parcels`}
              onClick={() => onSelect(item.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") onSelect(item.id);
              }}
              className="cursor-pointer outline-none"
            >
              <line
                x1={fromCenter ? 400 : x}
                y1={fromCenter ? 220 : y}
                x2={fromCenter ? x : 400}
                y2={fromCenter ? y : 220}
                stroke={color}
                strokeWidth={selected ? lineWidth + 3 : lineWidth}
                strokeOpacity={selected ? 0.95 : 0.48}
                markerEnd={`url(#${item.role}Arrow)`}
              />
              <rect
                x={(x + 400) / 2 - 17}
                y={(y + 220) / 2 - 12}
                width="34"
                height="24"
                rx="12"
                fill="white"
                stroke={color}
              />
              <text
                x={(x + 400) / 2}
                y={(y + 220) / 2 + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="#0B2A55"
              >
                {item.count}
              </text>
              <circle
                cx={x}
                cy={y}
                r={selected ? 34 : 30}
                fill="white"
                stroke={color}
                strokeWidth={selected ? 4 : 2}
                filter="url(#nodeShadow)"
              />
              <circle cx={x} cy={y - 5} r="6" fill={color} opacity=".9" />
              <text x={x} y={y + 52} textAnchor="middle" fontSize="12" fontWeight="700" fill="#0B2A55">
                {truncate(item.area, 18)}
              </text>
              <text x={x} y={y + 67} textAnchor="middle" fontSize="9" fontWeight="700" fill={color}>
                {item.role.toUpperCase()}
              </text>
            </g>
          );
        })}
        <circle cx="400" cy="220" r="62" fill="#002556" filter="url(#nodeShadow)" />
        <circle cx="400" cy="220" r="53" fill="#03809A" opacity=".34" />
        <text x="400" y="214" textAnchor="middle" fontSize="13" fontWeight="700" fill="white">
          SELECTED USER
        </text>
        <text x="400" y="235" textAnchor="middle" fontSize="14" fontWeight="700" fill="white">
          {truncate(userName, 21)}
        </text>
      </svg>
      <div className="flex flex-wrap justify-center gap-4 pb-2 text-xs text-slate-500">
        <span><i className="mr-1.5 inline-block size-2 rounded-full bg-cyan-500" />Pickup connection</span>
        <span><i className="mr-1.5 inline-block size-2 rounded-full bg-blue-600" />Delivery connection</span>
      </div>
    </div>
  );
}

function LocationList({
  title,
  items,
  selectedId,
  onSelect,
}: {
  title: string;
  items: LocationPattern[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const max = items[0]?.count ?? 1;
  return (
    <section className="card p-5">
      <p className="eyebrow">High Frequency</p>
      <h2 className="mb-4 mt-1 font-bold">{title}</h2>
      <div className="space-y-2">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`w-full rounded-xl border p-3 text-left transition hover:border-cyan-200 hover:bg-cyan-50/40 ${selectedId === item.id ? "border-cyan-300 bg-cyan-50/70" : "border-slate-100 bg-white/50"}`}
          >
            <div className="flex items-center gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{item.area}</span>
              <span className="text-xs font-bold text-[#03809A]">{item.count}</span>
            </div>
            <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-100">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-[#03809A] to-cyan-400"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function PatternDetails({ selection }: { selection?: PatternSelection }) {
  if (!selection) {
    return (
      <section className="card grid min-h-80 place-items-center p-6 text-center">
        <div>
          <Package className="mx-auto text-slate-300" size={36} />
          <h2 className="mt-3 font-bold">No Steadfast parcels</h2>
          <p className="mt-1 text-sm text-slate-500">This user has no parcel patterns to display.</p>
        </div>
      </section>
    );
  }
  const statuses = summarizeStatuses(selection.parcels);
  const ordered = [...selection.parcels].sort(
    (a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt),
  );
  return (
    <section className="card top-24 overflow-hidden xl:sticky">
      <div className="bg-gradient-to-br from-[#002556] to-[#03809A] p-5 text-white">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-cyan-100">Pattern details</p>
        <h2 className="mt-2 text-lg font-bold">{selection.label}</h2>
        <span className="mt-3 inline-flex rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold backdrop-blur">
          Recurring Pattern
        </span>
      </div>
      <div className="p-5">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <Detail label="Pickup area" value={selection.pickupArea} />
          <Detail label="Delivery area" value={selection.deliveryArea} />
          <Detail label="Total parcels" value={selection.parcels.length} />
          <Detail label="Delivered" value={statuses.delivered} tone="emerald" />
          <Detail label="Cancelled" value={statuses.cancelled} tone="rose" />
          <Detail label="In transit" value={statuses.inTransit} tone="blue" />
          <Detail label="First seen" value={formatDate(ordered[0].occurredAt)} />
          <Detail label="Last seen" value={formatDate(ordered.at(-1)!.occurredAt)} />
        </dl>
        <div className="mt-5 border-t border-slate-100 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold">Related parcel IDs</h3>
            <span className="text-xs text-slate-400">{selection.parcels.length} total</span>
          </div>
          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {[...selection.parcels]
              .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
              .map((parcel) => (
                <div key={parcel.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs">
                  <span className="font-mono font-bold text-[#0B2A55]">{parcel.id}</span>
                  <span className="truncate text-slate-500">{parcel.status.replaceAll("_", " ")}</span>
                </div>
              ))}
          </div>
        </div>
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs leading-5 text-blue-800">
          <CalendarDays className="mt-0.5 shrink-0" size={15} />
          Descriptive historical pattern only. No risk or intent is inferred.
        </div>
      </div>
    </section>
  );
}

function Detail({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone?: "emerald" | "rose" | "blue";
}) {
  const color =
    tone === "emerald"
      ? "text-emerald-700"
      : tone === "rose"
        ? "text-rose-700"
        : tone === "blue"
          ? "text-blue-700"
          : "text-[#0B2A55]";
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className={`mt-1 font-bold ${color}`}>{value}</dd>
    </div>
  );
}

function truncate(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}
