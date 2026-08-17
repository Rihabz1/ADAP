"use client";
import Link from "next/link";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { NormalizedUser } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { audit } from "@/lib/client-storage";
import { examplePhoneNumbers } from "@/lib/search-examples";
export function UsersDirectory({ users }: { users: NormalizedUser[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"id" | "activity">("id");
  const [page, setPage] = useState(1);
  const filtered = useMemo(
    () =>
      users
        .filter((u) => u.phone.includes(query.trim()))
        .sort((a, b) =>
          sort === "id"
            ? a.userId.localeCompare(b.userId)
            : b.totalActivities - a.totalActivities,
        ),
    [users, query, sort],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 15));
  const visible = filtered.slice((page - 1) * 15, page * 15);
  return (
    <>
      <div className="card mb-5 flex flex-col gap-3 p-4 sm:flex-row">
        <label className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />
          <span className="sr-only">Search user directory</span>
          <input
            className="field has-leading-icon"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value.replace(/\D/g, ""));
              setPage(1);
            }}
            placeholder={`Try ${examplePhoneNumbers[0]}`}
            list="directory-phone-suggestions"
            inputMode="tel"
            maxLength={11}
          />
          <datalist id="directory-phone-suggestions">
            {examplePhoneNumbers.map((phone) => (
              <option value={phone} key={phone} />
            ))}
          </datalist>
        </label>
        <button
          className="btn-secondary"
          onClick={() => setSort(sort === "id" ? "activity" : "id")}
        >
          <ArrowUpDown size={16} />
          Sort: {sort === "id" ? "User ID" : "Activity count"}
        </button>
      </div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Total Activities</th>
              <th>Latest Activity</th>
              <th>Active Providers</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((u) => (
              <tr key={u.userId} className="hover:bg-slate-50">
                <td>
                  <Link
                    href={`/users/${u.userId}`}
                    onClick={() => audit("PROFILE_VIEWED", u.userId)}
                    className="font-bold text-teal-700"
                  >
                    {u.userId}
                  </Link>
                </td>
                <td>{u.customerName}</td>
                <td className="font-mono text-sm">{u.phone}</td>
                <td>{u.totalActivities}</td>
                <td className="text-sm text-slate-500">
                  {u.latestActivity ? formatDateTime(u.latestActivity) : "—"}
                </td>
                <td>{u.activeProviders}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-5 py-4 text-sm text-slate-500">
          <span>
            {filtered.length} users · Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            <button
              className="btn-secondary p-2"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="btn-secondary p-2"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
