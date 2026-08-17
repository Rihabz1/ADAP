"use client";
import { useMemo, useState } from "react";
import { BarChart3, Clock, MapPin, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { NormalizedActivity, Provider } from "@/lib/types";
import { calculateAnalytics } from "@/lib/analytics";
import { filterActivities, providerLabel } from "@/lib/activity";
import { formatDateTime, formatMoney } from "@/lib/format";
import { PageTitle, StatCard, providerConfig } from "@/components/ui";
const weekdays = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];
export function AnalyticsDashboard({
  activities,
}: {
  activities: NormalizedActivity[];
}) {
  const user = activities[0];
  const [selected, setSelected] = useState<Provider[]>([
    "foodi",
    "pathao",
    "rokomari",
    "steadfast",
  ]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const filtered = useMemo(
    () =>
      filterActivities(activities, {
        providers: selected,
        from: from || undefined,
        to: to || undefined,
      }),
    [activities, selected, from, to],
  );
  const a = useMemo(() => calculateAnalytics(filtered), [filtered]);
  const providerData = (Object.keys(providerConfig) as Provider[]).map(
    (provider) => ({
      name: providerLabel[provider].replace(" Courier", ""),
      value: a.byProvider[provider] ?? 0,
      provider,
    }),
  );
  const monthData = Object.entries(a.byMonth)
    .map(([name, value]) => ({ name, value }))
    .sort((x, y) => Date.parse(`1 ${x.name}`) - Date.parse(`1 ${y.name}`));
  const dayData = weekdays.map((name) => ({
    name: name.slice(0, 3),
    value: a.byWeekday[name] ?? 0,
  }));
  const hourData = Array.from({ length: 24 }, (_, hour) => ({
    name: String(hour).padStart(2, "0"),
    value: a.byHour[String(hour).padStart(2, "0")] ?? 0,
  }));
  const statusData = Object.entries(a.statuses).map(([name, value]) => ({
    name,
    value,
  }));
  const toggle = (p: Provider) =>
    setSelected((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageTitle
        eyebrow="Descriptive statistics"
        title={`${user.customerName} analytics`}
        description="Calculated dynamically from this user's selected recorded activities."
      />
      <section className="card mb-5 p-4">
        <div className="flex flex-wrap gap-2">
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
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label className="text-xs text-slate-500">
            To
            <input
              type="date"
              className="field ml-2 w-auto py-2"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
        </div>
      </section>
      <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Recorded events"
          value={a.total}
          icon={<BarChart3 size={18} className="text-teal-700" />}
        />
        <StatCard
          label="Most active day"
          value={a.mostActiveDay}
          icon={<TrendingUp size={18} className="text-teal-700" />}
        />
        <StatCard
          label="Frequent area"
          value={a.mostFrequentArea}
          icon={<MapPin size={18} className="text-teal-700" />}
        />
        <StatCard
          label="Average value"
          value={formatMoney(a.averageValue)}
          icon={<Clock size={18} className="text-teal-700" />}
        />
      </section>
      <div className="grid gap-5 xl:grid-cols-2">
        <Chart title="Activities by Provider">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={providerData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {providerData.map((d) => (
                  <Cell
                    key={d.provider}
                    fill={providerConfig[d.provider].color}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Chart>
        <Chart title="Activity Over Time">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0f766e"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Chart>
        <Chart title="Activity by Day of Week">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dayData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Chart>
        <Chart title="Activity by Hour">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={hourData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" interval={2} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Chart>
        <Chart title="Most Frequent Areas">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart layout="vertical" data={a.topAreas}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="area" width={95} />
              <Tooltip />
              <Bar dataKey="count" fill="#0f766e" radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Chart>
        <Chart title="Status Distribution">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
              >
                {statusData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      ["#0f766e", "#2563eb", "#f59e0b", "#dc3264", "#64748b"][
                        i % 5
                      ]
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            {statusData.map((x, i) => (
              <span key={x.name}>
                <i
                  className="mr-1 inline-block size-2 rounded-full"
                  style={{
                    background: [
                      "#0f766e",
                      "#2563eb",
                      "#f59e0b",
                      "#dc3264",
                      "#64748b",
                    ][i % 5],
                  }}
                />
                {x.name}: {x.value}
              </span>
            ))}
          </div>
        </Chart>
      </div>
      <section className="card mt-5 p-5">
        <p className="eyebrow">Period bounds</p>
        <div className="mt-3 flex flex-wrap gap-6 text-sm">
          <span>
            First event:{" "}
            <b>{a.first ? formatDateTime(a.first.occurredAt) : "—"}</b>
          </span>
          <span>
            Latest event:{" "}
            <b>{a.latest ? formatDateTime(a.latest.occurredAt) : "—"}</b>
          </span>
          <span>
            Most active time: <b>{a.mostActiveTimeRange}</b>
          </span>
        </div>
      </section>
    </div>
  );
}
function Chart({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5">
      <p className="eyebrow mb-1">Analysis</p>
      <h2 className="mb-5 font-bold">{title}</h2>
      {children}
    </section>
  );
}
