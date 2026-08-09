"use client";
import { Bookmark, BookmarkCheck } from "lucide-react";
import type { NormalizedActivity, Provider } from "@/lib/types";
import { formatDateTime, formatMoney } from "@/lib/format";
import { ProviderBadge } from "@/components/ui";
export function ActivityTable({
  activities,
  provider,
  bookmarks,
  onBookmark,
}: {
  activities: NormalizedActivity[];
  provider?: Provider;
  bookmarks: Set<string>;
  onBookmark: (id: string) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            {!provider && <th>Provider</th>}
            <th>Activity</th>
            <th>Recorded area / sequence</th>
            {provider && <th>Details</th>}
            <th>Amount</th>
            <th>Status</th>
            <th>
              <span className="sr-only">Bookmark</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {activities.map((a) => (
            <tr key={`${a.provider}-${a.id}`}>
              <td className="text-sm text-slate-500">
                {formatDateTime(a.occurredAt)}
              </td>
              {!provider && (
                <td>
                  <ProviderBadge provider={a.provider} />
                </td>
              )}
              <td>
                <b className="block text-sm">{a.title}</b>
                <span className="text-xs text-slate-500">
                  {a.activityType.replaceAll("_", " ")}
                </span>
              </td>
              <td className="text-sm">
                {a.origin
                  ? `${a.origin.area} → ${a.destination?.area ?? "—"}`
                  : (a.destination?.area ?? "—")}
              </td>
              {provider && (
                <td className="max-w-64 truncate text-xs text-slate-500">
                  {Object.entries(a.metadata)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" · ")}
                </td>
              )}
              <td>{a.amount != null ? formatMoney(a.amount) : "—"}</td>
              <td>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs capitalize">
                  {a.status.replaceAll("_", " ")}
                </span>
              </td>
              <td>
                <button
                  onClick={() => onBookmark(a.id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-teal-700"
                  aria-label={`${bookmarks.has(a.id) ? "Remove" : "Add"} bookmark`}
                >
                  {bookmarks.has(a.id) ? (
                    <BookmarkCheck size={17} />
                  ) : (
                    <Bookmark size={17} />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
