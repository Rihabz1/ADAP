"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  CalendarDays,
  ChevronDown,
  Clock3,
  Download,
  FileText,
  MapPin,
  MessageSquarePlus,
  Network,
  Plus,
} from "lucide-react";
import type { CaseNote, NormalizedActivity, Provider } from "@/lib/types";
import { calculateAnalytics } from "@/lib/analytics";
import {
  filterActivities,
  latestActivity,
  providerLabel,
  toLocations,
} from "@/lib/activity";
import { formatDate, formatDateTime, formatTime } from "@/lib/format";
import { audit, keys, readLocal, writeLocal } from "@/lib/client-storage";
import {
  PageTitle,
  ProviderBadge,
  StatCard,
  providerConfig,
} from "@/components/ui";
import { ActivityTable } from "./activity-table";

type Mode = "overview" | "profile";
export function UserProfileView({
  activities,
  mode = "overview",
  initialProvider,
  initialFrom = "",
  initialTo = "",
}: {
  activities: NormalizedActivity[];
  mode?: Mode;
  initialProvider?: Provider;
  initialFrom?: string;
  initialTo?: string;
}) {
  const user = activities[0];
  const [providers, setProviders] = useState<Provider[]>(
    initialProvider
      ? [initialProvider]
      : ["foodi", "pathao", "rokomari", "steadfast"],
  );
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [status, setStatus] = useState("");
  const [limit, setLimit] = useState(mode === "profile" ? 30 : 10);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [note, setNote] = useState("");
  useEffect(() => {
    localStorage.setItem("adap:last-user", user.userId);
    setBookmarks(new Set(readLocal<string[]>(keys.bookmarks, [])));
    setNotes(
      readLocal<Record<string, CaseNote[]>>(keys.notes, {})[user.userId] ?? [],
    );
    audit("PROFILE_VIEWED", user.userId);
  }, [user.userId]);
  const filtered = useMemo(
    () =>
      filterActivities(activities, {
        providers,
        from: from || undefined,
        to: to || undefined,
        status: status || undefined,
      }),
    [activities, providers, from, to, status],
  );
  const analytics = useMemo(() => calculateAnalytics(filtered), [filtered]);
  const latest = latestActivity(filtered);
  const statuses = [...new Set(activities.map((a) => a.status))].sort();
  const toggleBookmark = (id: string) => {
    const next = new Set(bookmarks);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setBookmarks(next);
    writeLocal(keys.bookmarks, [...next]);
    audit("ACTIVITY_BOOKMARKED", id);
  };
  const addNote = () => {
    const text = note.trim();
    if (!text) return;
    const item = {
      id: crypto.randomUUID(),
      author: "System Admin",
      createdAt: new Date().toISOString(),
      text,
    };
    const next = [item, ...notes];
    setNotes(next);
    setNote("");
    const all = readLocal<Record<string, CaseNote[]>>(keys.notes, {});
    all[user.userId] = next;
    writeLocal(keys.notes, all);
    audit("NOTE_ADDED", user.userId);
  };
  const preset = (days: number) => {
    const max = Math.max(...activities.map((a) => Date.parse(a.occurredAt)));
    const start = new Date(max - days * 86400000);
    setFrom(start.toISOString().slice(0, 10));
    setTo(new Date(max).toISOString().slice(0, 10));
  };
  const clear = () => {
    setProviders(["foodi", "pathao", "rokomari", "steadfast"]);
    setFrom("");
    setTo("");
    setStatus("");
  };
  const exportCsv = () => {
    const fields = [
      "id",
      "provider",
      "occurredAt",
      "status",
      "title",
      "origin",
      "destination",
      "amount",
    ];
    const quote = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
    const csv = [
      fields.join(","),
      ...filtered.map((a) =>
        [
          a.id,
          a.provider,
          a.occurredAt,
          a.status,
          a.title,
          a.origin?.area,
          a.destination?.area,
          a.amount,
        ]
          .map(quote)
          .join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${user.phone}-filtered-activities.csv`;
    link.click();
    URL.revokeObjectURL(url);
    audit("CSV_EXPORTED", `${user.userId} (${filtered.length})`);
  };
  const activeProvider = initialProvider;
  const visible = activeProvider
    ? filtered.filter((a) => a.provider === activeProvider)
    : filtered;
  const calendar = Object.entries(
    activities.reduce<Record<string, number>>((acc, a) => {
      const d = a.occurredAt.slice(0, 10);
      acc[d] = (acc[d] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort()
    .slice(-84);
  const daily = Object.entries(
    activities.reduce<Record<string, NormalizedActivity[]>>((acc, item) => {
      const d = item.occurredAt.slice(0, 10);
      (acc[d] ??= []).push(item);
      return acc;
    }, {}),
  )
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 4);
  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="xl:min-h-[calc(100vh-6.5rem)]">
        <PageTitle
          eyebrow="User profile"
          title={user.customerName}
          description={user.phone}
          compact
          action={
            <div className="flex flex-wrap gap-2 no-print">
              <button onClick={exportCsv} className="btn-secondary">
                <Download size={16} />
                Export CSV
              </button>
              <Link
                href={`/users/${user.userId}/report`}
                className="btn-primary"
                onClick={() => audit("REPORT_GENERATED", user.userId)}
              >
                <FileText size={16} />
                Generate report
              </Link>
            </div>
          }
        />
        <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 [&>.card]:p-4 [&_.metric]:whitespace-nowrap [&_.metric]:text-[1.75rem]">
          <StatCard label="Total activities" value={filtered.length} />
          <StatCard
            label="Latest activity"
            value={latest ? formatDate(latest.occurredAt) : "—"}
          />
          <StatCard
            label="Active providers"
            value={new Set(filtered.map((a) => a.provider)).size}
          />
          <StatCard
            label="Most frequent"
            value={
              analytics.mostActiveProvider === "—"
                ? "—"
                : providerLabel[analytics.mostActiveProvider]
            }
          />
          <StatCard label="Frequent area" value={analytics.mostFrequentArea} />
          <StatCard label="6-month count" value={activities.length} />
        </section>
        {latest && (
          <section className="card mb-4 overflow-hidden">
            <div className="grid lg:grid-cols-[200px_1fr]">
              <div className="bg-gradient-to-br from-[#002556] to-[#03809A] p-4 text-white">
                <p className="text-[10px] font-bold tracking-[.16em] text-cyan-100">
                  LATEST RECORDED ACTIVITY
                </p>
                <div className="mt-2.5">
                  <ProviderBadge provider={latest.provider} />
                </div>
                <p className="mt-2.5 text-base font-bold">
                  {formatDate(latest.occurredAt)}
                </p>
                <p className="mt-1 text-xs text-cyan-50/80">
                  {formatTime(latest.occurredAt)} · Asia/Dhaka
                </p>
              </div>
              <div className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-lg font-bold">{latest.title}</p>
                  <p className="mt-1.5 text-sm text-slate-500">
                    {latest.origin
                      ? `${latest.origin.area} → ${latest.destination?.area}`
                      : `Recorded delivery location: ${latest.destination?.area}`}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-400">
                    Provider record updated{" "}
                    {formatDateTime(latest.sourceUpdatedAt)}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold capitalize text-emerald-700">
                    {latest.status.replaceAll("_", " ")}
                  </span>
                  <p className="mt-3 text-xs uppercase tracking-wider text-slate-400">
                    {latest.activityType.replaceAll("_", " ")}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
        <section className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(["foodi", "pathao", "rokomari", "steadfast"] as Provider[]).map(
            (provider) => {
              const items = activities.filter((a) => a.provider === provider);
              const last = latestActivity(items);
              const c = providerConfig[provider];
              const Icon = c.icon;
              return (
                <Link
                  href={`/users/${user.phone}/profile?provider=${provider}`}
                  key={provider}
                  className="card p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex justify-between">
                    <span
                      className="grid size-9 place-items-center rounded-xl"
                      style={{ background: c.soft, color: c.color }}
                    >
                      <Icon size={19} />
                    </span>
                    <span className="text-xs text-slate-400">
                      View records →
                    </span>
                  </div>
                  <p className="eyebrow mt-3">{providerLabel[provider]}</p>
                  <p className="mt-1.5 font-bold">
                    {items.length}{" "}
                    {provider === "pathao"
                      ? "rides"
                      : provider === "steadfast"
                        ? "parcels"
                        : "orders"}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    Latest:{" "}
                    {last ? formatDateTime(last.occurredAt) : "No records"}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {last?.origin
                      ? `${last.origin.area} → ${last.destination?.area}`
                      : `Delivery: ${last?.destination?.area ?? "—"}`}
                  </p>
                </Link>
              );
            },
          )}
        </section>
      </div>
      {(mode === "profile" || initialProvider) && (
        <>
          <section className="card mb-5 p-4 no-print">
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/users/${user.phone}/profile`}
                className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${!initialProvider ? "border-[#03809A] bg-[#03809A]/[0.06] text-[#002556] hover:bg-[#03809A]/[0.1]" : "border-slate-200 bg-white/60 text-slate-400 hover:border-slate-300 hover:text-slate-600"}`}
              >
                Overview
              </Link>
              {(["foodi", "pathao", "rokomari", "steadfast"] as Provider[]).map(
                (p) => (
                  <Link
                    key={p}
                    href={`/users/${user.phone}/profile?provider=${p}`}
                    onClick={() => audit("PROVIDER_FILTERED", p)}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${initialProvider === p ? "border-[#03809A] bg-[#03809A]/[0.06] text-[#002556] hover:bg-[#03809A]/[0.1]" : "border-slate-200 bg-white/60 text-slate-400 hover:border-slate-300 hover:text-slate-600"}`}
                  >
                    {providerLabel[p]}
                  </Link>
                ),
              )}
              <span className="hidden flex-1 xl:block" />
              <button
                onClick={() => preset(7)}
                className="btn-secondary text-xs"
              >
                7 days
              </button>
              <button
                onClick={() => preset(30)}
                className="btn-secondary text-xs"
              >
                30 days
              </button>
              <button
                onClick={() => preset(90)}
                className="btn-secondary text-xs"
              >
                90 days
              </button>
              <button
                onClick={() => preset(183)}
                className="btn-secondary text-xs"
              >
                6 months
              </button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="text-xs font-bold text-slate-500">
                Date From
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="field mt-1"
                />
              </label>
              <label className="text-xs font-bold text-slate-500">
                Date To
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="field mt-1"
                />
              </label>
              <label className="text-xs font-bold text-slate-500">
                Status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="field mt-1"
                >
                  <option value="">All statuses</option>
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>
          <section className="card">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <p className="eyebrow">
                  {initialProvider
                    ? `${providerLabel[initialProvider]} records`
                    : "Unified timeline"}
                </p>
                <h2 className="mt-1 font-bold">
                  {visible.length} filtered activities
                </h2>
              </div>
              {!visible.length && (
                <button className="btn-secondary" onClick={clear}>
                  Clear filters
                </button>
              )}
            </div>
            {visible.length ? (
              <>
                <ActivityTable
                  activities={visible.slice(0, limit)}
                  provider={initialProvider}
                  bookmarks={bookmarks}
                  onBookmark={toggleBookmark}
                />
                {limit < visible.length && (
                  <div className="p-4 text-center">
                    <button
                      className="btn-secondary"
                      onClick={() => setLimit((v) => v + 30)}
                    >
                      Load more <ChevronDown size={16} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-10 text-center text-sm text-slate-500">
                No activities found for the selected period.
              </div>
            )}
          </section>
        </>
      )}
      {mode === "overview" && !initialProvider && (
        <div className="grid gap-5 xl:grid-cols-[1.4fr_.6fr]">
          <div className="space-y-5">
            <section className="card">
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <div>
                  <p className="eyebrow">Unified timeline</p>
                  <h2 className="mt-1 font-bold">Recent recorded events</h2>
                </div>
                <Link
                  href={`/users/${user.userId}/profile`}
                  className="text-sm font-bold text-teal-700"
                >
                  View all →
                </Link>
              </div>
              <ActivityTable
                activities={activities.slice(0, 10)}
                bookmarks={bookmarks}
                onBookmark={toggleBookmark}
              />
            </section>
            <section className="card p-5">
              <p className="eyebrow">Correlated day view</p>
              <h2 className="mt-1 font-bold">Daily Activity View</h2>
              <div className="mt-4 space-y-5">
                {daily.map(([date, items]) => (
                  <div key={date}>
                    <Link
                      href={`/users/${user.userId}/profile?from=${date}&to=${date}`}
                      className="text-sm font-bold text-teal-700"
                    >
                      {formatDate(date)} →
                    </Link>
                    <div className="mt-2 space-y-2">
                      {items.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 rounded-lg bg-slate-50 p-3"
                        >
                          <span className="w-12 text-xs font-bold text-slate-500">
                            {formatTime(item.occurredAt)}
                          </span>
                          <ProviderBadge provider={item.provider} />
                          <span className="truncate text-sm">
                            {item.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="card p-5">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-teal-700" />
                <h2 className="font-bold">Activity Calendar</h2>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Latest 84 recorded days. Darker cells contain more events.
              </p>
              <div className="mt-5 flex flex-wrap gap-1">
                {calendar.map(([date, count]) => (
                  <Link
                    title={`${date}: ${count} events`}
                    href={`/users/${user.userId}/profile?from=${date}&to=${date}`}
                    key={date}
                    className="size-4 rounded-sm"
                    style={{
                      background: `rgba(15,118,110,${Math.min(0.2 + count / 8, 0.95)})`,
                    }}
                    aria-label={`${date}: ${count} activities`}
                  />
                ))}
              </div>
            </section>
            <section className="card p-5">
              <div className="flex items-center gap-2">
                <MessageSquarePlus size={18} className="text-teal-700" />
                <h2 className="font-bold">System Admin Notes</h2>
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNote()}
                  className="field"
                  maxLength={500}
                  placeholder="Add a demonstration note…"
                />
                <button
                  onClick={addNote}
                  className="btn-primary"
                  aria-label="Add note"
                >
                  <Plus size={17} />
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {notes.map((n) => (
                  <div className="rounded-lg bg-slate-50 p-3" key={n.id}>
                    <p className="text-sm">{n.text}</p>
                    <p className="mt-2 text-[11px] text-slate-400">
                      {n.author} · {formatDateTime(n.createdAt)}
                    </p>
                  </div>
                ))}
                {!notes.length && (
                  <p className="text-xs text-slate-400">
                    No analyst notes yet.
                  </p>
                )}
              </div>
            </section>
          </div>
          <aside className="space-y-5">
            <section className="card p-5">
              <div className="flex items-center gap-2">
                <Network size={18} className="text-teal-700" />
                <h2 className="font-bold">Activity summary</h2>
              </div>
              <dl className="mt-5 space-y-4 text-sm">
                {[
                  [
                    "Most active provider",
                    analytics.mostActiveProvider === "—"
                      ? "—"
                      : providerLabel[analytics.mostActiveProvider],
                  ],
                  ["Most frequent area", analytics.mostFrequentArea],
                  ["Most active day", analytics.mostActiveDay],
                  ["Most active range", analytics.mostActiveTimeRange],
                  ["Recorded events", analytics.total],
                ].map(([k, v]) => (
                  <div
                    className="flex justify-between gap-3 border-b border-slate-100 pb-3"
                    key={k}
                  >
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="font-bold text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <section className="card p-5">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-teal-700" />
                <h2 className="font-bold">Frequently Recorded Areas</h2>
              </div>
              <div className="mt-4 space-y-3">
                {analytics.topAreas.slice(0, 7).map((x) => (
                  <div className="flex items-center gap-3 text-sm" key={x.area}>
                    <span className="w-24 truncate">{x.area}</span>
                    <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-teal-600"
                        style={{
                          width: `${(x.count / (analytics.topAreas[0]?.count || 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <b>{x.count}</b>
                  </div>
                ))}
              </div>
            </section>
            <section className="card p-5">
              <div className="flex items-center gap-2">
                <Clock3 size={18} className="text-teal-700" />
                <h2 className="font-bold">Recent Recorded Locations</h2>
              </div>
              <div className="mt-4 space-y-4">
                {toLocations(activities)
                  .slice(-10)
                  .reverse()
                  .map((l, i) => (
                    <div
                      className="border-l-2 border-slate-200 pl-3"
                      key={`${l.activityId}-${l.role}-${i}`}
                    >
                      <b className="block text-sm">{l.area}</b>
                      <span className="text-xs text-slate-500">
                        {providerLabel[l.provider]} {l.role} ·{" "}
                        {formatDateTime(l.occurredAt)}
                      </span>
                    </div>
                  ))}
              </div>
            </section>
            <section className="card p-5">
              <div className="flex items-center gap-2">
                <Bookmark size={18} className="text-teal-700" />
                <h2 className="font-bold">Saved Activities</h2>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {bookmarks.size} activity bookmarks stored in this browser.
              </p>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
