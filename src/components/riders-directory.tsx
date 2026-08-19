"use client";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatDateTime } from "@/lib/format";
import { providerLabel } from "@/lib/activity";
import { providers, type NormalizedRider, type Provider } from "@/lib/types";
import { ProviderBadge, providerConfig } from "./ui";

export function RidersDirectory({ riders }: { riders: NormalizedRider[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState<Provider | "all">("all");
  const [sort, setSort] = useState<"activity" | "rating" | "name">("activity");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return riders
      .filter((rider) => provider === "all" || rider.provider === provider)
      .filter((rider) =>
        [
          rider.riderName,
          rider.riderId,
          rider.riderPhone,
          rider.primaryArea,
          rider.vehicleNumber,
          rider.providerName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term),
      )
      .sort((a, b) => {
        if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
        if (sort === "name") return a.riderName.localeCompare(b.riderName);
        return (
          b.activityCount - a.activityCount ||
          Date.parse(b.lastActivityAt ?? "") - Date.parse(a.lastActivityAt ?? "")
        );
      });
  }, [provider, query, riders, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / 12));
  const visible = filtered.slice((page - 1) * 12, page * 12);
  const selectedProviderStyle = {
    background: "#E6F7FA",
    borderColor: "#03809A",
    boxShadow: "0 0 0 3px rgb(3 128 154 / 0.14)",
    color: "#002556",
  };
  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="card p-4">
          <p className="eyebrow">Riders</p>
          <p className="metric">{riders.length}</p>
        </div>
        <div className="card p-4">
          <p className="eyebrow">Active</p>
          <p className="metric">
            {riders.filter((rider) => /active/i.test(rider.status)).length}
          </p>
        </div>
        <div className="card p-4">
          <p className="eyebrow">Activities</p>
          <p className="metric">
            {riders.reduce((sum, rider) => sum + rider.activityCount, 0)}
          </p>
        </div>
        <div className="card p-4">
          <p className="eyebrow">Completed</p>
          <p className="metric">
            {riders.reduce((sum, rider) => sum + rider.completedCount, 0)}
          </p>
        </div>
      </div>
      <div className="card my-5 flex flex-col gap-3 p-4 sm:flex-row">
        <label className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />
          <span className="sr-only">Search riders</span>
          <input
            className="field has-leading-icon"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search rider, phone, area, vehicle, provider"
          />
        </label>
        <button
          className="btn-secondary"
          onClick={() => {
            setSort(sort === "activity" ? "rating" : sort === "rating" ? "name" : "activity");
            setPage(1);
          }}
        >
          <ArrowUpDown size={16} />
          Sort: {sort === "activity" ? "Activity" : sort === "rating" ? "Rating" : "Name"}
        </button>
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          className="btn-secondary px-3 py-2 text-sm"
          style={provider === "all" ? selectedProviderStyle : undefined}
          aria-pressed={provider === "all"}
          onClick={() => {
            setProvider("all");
            setPage(1);
          }}
        >
          All providers
        </button>
        {providers.map((item) => {
          const Icon = providerConfig[item].icon;
          return (
            <button
              key={item}
              className="btn-secondary px-3 py-2 text-sm"
              style={provider === item ? selectedProviderStyle : undefined}
              aria-pressed={provider === item}
              onClick={() => {
                setProvider(item);
                setPage(1);
              }}
            >
              <Icon size={16} />
              {providerLabel[item]}
            </button>
          );
        })}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {visible.map((rider) => (
          <article
            key={`${rider.provider}:${rider.riderId}`}
            className="card cursor-pointer p-5 transition hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(15,42,82,0.1)]"
            role="link"
            tabIndex={0}
            onClick={() =>
              router.push(
                `/riders/${rider.provider}/${encodeURIComponent(rider.riderId)}`,
              )
            }
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              router.push(
                `/riders/${rider.provider}/${encodeURIComponent(rider.riderId)}`,
              );
            }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <ProviderBadge provider={rider.provider} compact />
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize text-slate-600">
                    {rider.status || "Unknown"}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-[#002556]">{rider.riderName}</h2>
                <p className="font-mono text-sm text-slate-500">{rider.riderId}</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-700">
                <Star size={15} fill="currentColor" />
                {rider.rating?.toFixed(2) ?? "N/A"}
              </div>
            </div>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="eyebrow">Contact</dt>
                <dd className="mt-1 font-mono">{rider.riderPhone || "N/A"}</dd>
              </div>
              <div>
                <dt className="eyebrow">Vehicle</dt>
                <dd className="mt-1">
                  {[rider.vehicleType, rider.vehicleNumber].filter(Boolean).join(" · ") || "N/A"}
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Primary Area</dt>
                <dd className="mt-1">{rider.primaryArea || "N/A"}</dd>
              </div>
              <div>
                <dt className="eyebrow">Role</dt>
                <dd className="mt-1 capitalize">{rider.riderRole.replaceAll("_", " ") || "N/A"}</dd>
              </div>
              <div>
                <dt className="eyebrow">Dataset Activity</dt>
                <dd className="mt-1">
                  {rider.activityCount} rows, {rider.completedCount} completed
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Provider Counts</dt>
                <dd className="mt-1">
                  {rider.datasetActivityCount} rows, {rider.datasetCompletedCount} completed
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Total Completed</dt>
                <dd className="mt-1">{rider.totalCompletedActivities}</dd>
              </div>
              <div>
                <dt className="eyebrow">Joined</dt>
                <dd className="mt-1">{rider.joinedAt || "N/A"}</dd>
              </div>
              <div>
                <dt className="eyebrow">First Activity</dt>
                <dd className="mt-1">
                  {rider.firstActivityAt ? formatDateTime(rider.firstActivityAt) : "N/A"}
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Last Activity</dt>
                <dd className="mt-1">
                  {rider.lastActivityAt ? formatDateTime(rider.lastActivityAt) : "N/A"}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
        <span>
          {filtered.length} riders · Page {page} of {pages}
        </span>
        <div className="flex gap-2">
          <button className="btn-secondary p-2" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
            <ChevronLeft size={16} />
          </button>
          <button className="btn-secondary p-2" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} aria-label="Next page">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
