"use client";
import { useEffect, useMemo, useState } from "react";
import { Printer } from "lucide-react";
import type { CaseNote, NormalizedActivity, Provider } from "@/lib/types";
import { calculateAnalytics } from "@/lib/analytics";
import { providerLabel } from "@/lib/activity";
import { formatDateTime, formatMoney } from "@/lib/format";
import { audit, keys, readLocal } from "@/lib/client-storage";
import { ProviderBadge } from "@/components/ui";
export function ReportView({
  activities,
}: {
  activities: NormalizedActivity[];
}) {
  const user = activities[0];
  const a = useMemo(() => calculateAnalytics(activities), [activities]);
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  useEffect(() => {
    setNotes(
      readLocal<Record<string, CaseNote[]>>(keys.notes, {})[user.userId] ?? [],
    );
    setBookmarks(readLocal(keys.bookmarks, []));
  }, [user.userId]);
  const evidence = activities.filter((x) => bookmarks.includes(x.id));
  return (
    <article className="mx-auto max-w-5xl bg-white p-6 sm:p-10">
      <div className="no-print mb-6 flex justify-end">
        <button
          className="btn-primary"
          onClick={() => {
            audit("REPORT_PRINTED", user.userId);
            window.print();
          }}
        >
          <Printer size={16} />
          Print / Save as PDF
        </button>
      </div>
      <header className="border-b-2 border-slate-900 pb-6">
        <div className="flex justify-between gap-6">
          <div>
            <p className="eyebrow">ADAP</p>
            <h1 className="mt-2 text-3xl font-bold">
              Activity Analysis Report
            </h1>
            <p className="mt-2 text-slate-500">
              Application Data Analysis Platform
            </p>
          </div>
          <div className="text-right text-sm">
            <b>Generated</b>
            <p>{formatDateTime(new Date())}</p>
            <p className="mt-2 text-xs text-slate-500">System Admin</p>
          </div>
        </div>
      </header>
      <section className="mt-8 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="eyebrow">User profile</p>
          <h2 className="mt-2 text-xl font-bold">{user.customerName}</h2>
          <p className="mt-1">
            {user.userId} · {user.phone}
          </p>
          <p className="mt-2 text-xs text-slate-500">User</p>
        </div>
        <div>
          <p className="eyebrow">Date range</p>
          <p className="mt-2">
            <b>{a.first && formatDateTime(a.first.occurredAt)}</b>
          </p>
          <p className="text-slate-400">to</p>
          <p>
            <b>{a.latest && formatDateTime(a.latest.occurredAt)}</b>
          </p>
        </div>
      </section>
      <section className="mt-8">
        <h2 className="border-b border-slate-200 pb-2 text-lg font-bold">
          Summary
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            ["Events", a.total],
            [
              "Most active",
              a.mostActiveProvider === "—"
                ? "—"
                : providerLabel[a.mostActiveProvider],
            ],
            ["Frequent area", a.mostFrequentArea],
            ["Active day", a.mostActiveDay],
            ["Avg. value", formatMoney(a.averageValue)],
          ].map(([k, v]) => (
            <div className="rounded-lg bg-slate-50 p-3" key={k}>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                {k}
              </p>
              <b className="mt-1 block text-sm">{v}</b>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="border-b border-slate-200 pb-2 text-lg font-bold">
          Provider Statistics
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {(["foodi", "pathao", "rokomari", "steadfast"] as Provider[]).map((p) => (
            <div className="rounded-lg border border-slate-200 p-3" key={p}>
              <ProviderBadge provider={p} />
              <b className="mt-3 block text-xl">{a.byProvider[p] ?? 0}</b>
              <small className="text-slate-500">recorded events</small>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="border-b border-slate-200 pb-2 text-lg font-bold">
          Latest Activities
        </h2>
        <ReportTable activities={activities.slice(0, 15)} />
      </section>
      <section className="mt-8">
        <h2 className="border-b border-slate-200 pb-2 text-lg font-bold">
          Top Areas
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {a.topAreas.map((x) => (
            <div className="rounded-lg bg-slate-50 p-3 text-sm" key={x.area}>
              <b>{x.area}</b>
              <span className="block text-xs text-slate-500">
                {x.count} points
              </span>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="border-b border-slate-200 pb-2 text-lg font-bold">
          Selected Bookmarked Activities
        </h2>
        {evidence.length ? (
          <ReportTable activities={evidence} />
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            No activities were bookmarked in this browser when the report was
            generated.
          </p>
        )}
      </section>
      <section className="mt-8">
        <h2 className="border-b border-slate-200 pb-2 text-lg font-bold">
          System Admin Notes
        </h2>
        {notes.length ? (
          <div className="mt-3 space-y-3">
            {notes.map((n) => (
              <div className="rounded-lg bg-slate-50 p-3 text-sm" key={n.id}>
                <p>{n.text}</p>
                <small className="mt-2 block text-slate-500">
                  {n.author} · {formatDateTime(n.createdAt)}
                </small>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            No analyst notes were stored for this profile.
          </p>
        )}
      </section>
      <footer className="mt-10 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-500">
        This report contains demonstration records only. It is descriptive, not
        predictive, and must not be interpreted as criminal intelligence,
        real-time tracking, or information about a real person.
      </footer>
    </article>
  );
}
function ReportTable({ activities }: { activities: NormalizedActivity[] }) {
  return (
    <div className="table-wrap mt-3">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Provider</th>
            <th>Activity</th>
            <th>Area</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((x) => (
            <tr key={`${x.provider}-${x.id}`}>
              <td className="text-xs">{formatDateTime(x.occurredAt)}</td>
              <td>{providerLabel[x.provider]}</td>
              <td>{x.title}</td>
              <td>
                {x.origin
                  ? `${x.origin.area} → ${x.destination?.area}`
                  : x.destination?.area}
              </td>
              <td className="capitalize">{x.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
