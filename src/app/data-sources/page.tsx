import { AlertTriangle, CheckCircle2, Database } from "lucide-react";
import { PageTitle, providerConfig } from "@/components/ui";
import { adapters } from "@/lib/providers";
import { providerLabel } from "@/lib/activity";
import { formatDate } from "@/lib/format";
export const dynamic = "force-dynamic";
export default async function DataSourcesPage() {
  const statuses = await Promise.all(adapters.map((a) => a.getStatus()));
  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle
        eyebrow="Integration health"
        title="Data Sources"
        description="Server-side provider adapters backed by validated CSV records. Raw datasets are never served as public assets."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        {statuses.map((s) => {
          const c = providerConfig[s.provider];
          const Icon = c.icon;
          return (
            <article key={s.provider} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <span
                    className="grid size-11 place-items-center rounded-xl"
                    style={{ background: c.soft, color: c.color }}
                  >
                    <Icon />
                  </span>
                  <div>
                    <h2 className="font-bold">{providerLabel[s.provider]}</h2>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600">
                      <CheckCircle2 size={13} />
                      Connected
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                  CSV adapter
                </span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="eyebrow">Records</p>
                  <b className="mt-1 block">{s.records.toLocaleString()}</b>
                </div>
                <div>
                  <p className="eyebrow">Data subjects</p>
                  <b className="mt-1 block">{s.users}</b>
                </div>
                <div>
                  <p className="eyebrow">Oldest</p>
                  <b className="mt-1 block text-sm">
                    {s.oldestRecord && formatDate(s.oldestRecord)}
                  </b>
                </div>
                <div>
                  <p className="eyebrow">Latest</p>
                  <b className="mt-1 block text-sm">
                    {s.latestRecord && formatDate(s.latestRecord)}
                  </b>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Database size={13} />
                  {s.validRows.toLocaleString()} valid rows
                </span>
                <span className="flex items-center gap-1.5">
                  <AlertTriangle size={13} />
                  {s.invalidRows} invalid rows
                </span>
                <span className="ml-auto">Response {s.responseMs} ms</span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
