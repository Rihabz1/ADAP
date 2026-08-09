"use client";
import { useEffect, useState } from "react";
import { FileClock, Trash2 } from "lucide-react";
import type { AuditEvent } from "@/lib/types";
import { keys, readLocal, writeLocal } from "@/lib/client-storage";
import { formatDateTime } from "@/lib/format";
import { PageTitle } from "@/components/ui";
export function AuditLog() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  useEffect(() => setEvents(readLocal(keys.audit, [])), []);
  const clear = () => {
    setEvents([]);
    writeLocal(keys.audit, []);
  };
  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle
        eyebrow="Local demonstration trail"
        title="Audit Log"
        description="Records selected UI actions in localStorage. It does not capture credentials or sensitive browser information."
        action={
          <button onClick={clear} className="btn-secondary">
            <Trash2 size={16} />
            Clear local log
          </button>
        }
      />
      <div className="card overflow-hidden">
        {events.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Analyst</th>
                  <th>Action</th>
                  <th>Target</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td className="text-sm text-slate-500">
                      {formatDateTime(e.createdAt)}
                    </td>
                    <td>{e.author}</td>
                    <td>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold">
                        {e.action}
                      </span>
                    </td>
                    <td className="max-w-lg truncate font-mono text-xs">
                      {e.target}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid min-h-80 place-items-center p-8 text-center">
            <div>
              <FileClock className="mx-auto text-slate-300" size={36} />
              <h2 className="mt-4 font-bold">No local audit events yet</h2>
              <p className="mt-2 text-sm text-slate-500">
                Search for a user or interact with a profile to begin the trail.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
