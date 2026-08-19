"use client";
import { Clock, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { NormalizedActivity } from "@/lib/types";

type Range = "all" | "10d" | "1m" | "custom";

function startOfDay(value: string) {
  return Date.parse(`${value}T00:00:00+06:00`);
}

function endOfDay(value: string) {
  return Date.parse(`${value}T23:59:59+06:00`);
}

export function RiderTimeline({
  activities,
}: {
  activities: NormalizedActivity[];
}) {
  const [range, setRange] = useState<Range>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const filtered = useMemo(() => {
    const newest = activities[0]?.occurredAt;
    const newestDate = newest ? new Date(newest) : new Date();
    const automaticFrom =
      range === "10d"
        ? new Date(newestDate.getTime() - 10 * 24 * 60 * 60 * 1000)
        : range === "1m"
          ? new Date(newestDate.getTime() - 30 * 24 * 60 * 60 * 1000)
          : null;
    return activities.filter((activity) => {
      const time = Date.parse(activity.occurredAt);
      if (automaticFrom && time < automaticFrom.getTime()) return false;
      if (range === "custom" && from && time < startOfDay(from)) return false;
      if (range === "custom" && to && time > endOfDay(to)) return false;
      return true;
    });
  }, [activities, from, range, to]);
  const selectedStyle = {
    background: "#E6F7FA",
    borderColor: "#03809A",
    boxShadow: "0 0 0 3px rgb(3 128 154 / 0.14)",
    color: "#002556",
  };

  return (
    <section className="card p-5">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Delivery / ride history</p>
          <h2 className="mt-1 text-xl font-bold text-[#0B2A55]">Timeline</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {filtered.length} of {activities.length} activities
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          {[
            ["all", "All time"],
            ["10d", "Last 10 days"],
            ["1m", "Last 1 month"],
            ["custom", "Custom"],
          ].map(([value, label]) => (
            <button
              key={value}
              className="btn-secondary px-3 py-2 text-sm"
              style={range === value ? selectedStyle : undefined}
              aria-pressed={range === value}
              onClick={() => setRange(value as Range)}
            >
              {label}
            </button>
          ))}
          {range === "custom" && (
            <>
              <label className="text-xs font-bold uppercase text-slate-500">
                From
                <input
                  className="field mt-1 w-38 py-2 text-sm"
                  type="date"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                  max={to || undefined}
                />
              </label>
              <label className="text-xs font-bold uppercase text-slate-500">
                To
                <input
                  className="field mt-1 w-38 py-2 text-sm"
                  type="date"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  min={from || undefined}
                />
              </label>
            </>
          )}
        </div>
      </div>
      <ol className="space-y-4">
        {filtered.map((activity) => (
          <li
            key={`${activity.provider}-${activity.id}`}
            className="relative border-l-2 border-cyan-100 pl-5"
          >
            <span className="absolute -left-[7px] top-1.5 size-3 rounded-full bg-[#03809A] ring-4 ring-cyan-50" />
            <div className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-white/70 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">
                  {activity.activityType.replaceAll("_", " ")}
                </p>
                <h3 className="mt-1 font-bold text-[#002556]">
                  {activity.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {activity.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={13} />
                    {formatDateTime(activity.occurredAt)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={13} />
                    {activity.origin
                      ? `${activity.origin.area} to ${activity.destination?.area ?? "N/A"}`
                      : activity.destination?.area ?? "N/A"}
                  </span>
                </div>
              </div>
              <div className="flex flex-row items-center gap-2 sm:flex-col sm:items-end">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs capitalize text-slate-600">
                  {activity.status.replaceAll("_", " ")}
                </span>
                <span className="font-bold text-[#0B2A55]">
                  {activity.amount != null
                    ? formatMoney(activity.amount)
                    : "N/A"}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ol>
      {!filtered.length && (
        <div className="grid min-h-40 place-items-center text-center text-sm text-slate-500">
          No rider activity found for this time range.
        </div>
      )}
    </section>
  );
}
