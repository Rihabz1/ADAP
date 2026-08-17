import {
  Activity,
  CalendarRange,
  Database,
  PlugZap,
  RefreshCw,
} from "lucide-react";
import { PageTitle, StatCard, providerConfig } from "@/components/ui";
import { SearchBox } from "@/components/search-box";
import { adapters } from "@/lib/providers";
import { providerLabel } from "@/lib/activity";
export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };
export default async function DashboardPage() {
  const statuses = await Promise.all(adapters.map((a) => a.getStatus()));
  const total = statuses.reduce((s, p) => s + p.records, 0);
  const users = Math.max(...statuses.map((s) => s.users));
  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle
        eyebrow="Operations overview"
        title="Activity dashboard"
        description="Search and correlate recorded events across the provider datasets."
        action={
          <span className="flex items-center gap-2 text-xs text-slate-500">
            <RefreshCw size={14} />
            Indexed for this server instance
          </span>
        }
      />
      <section className="card mb-6 overflow-visible bg-[#10243a] p-6 text-white sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[.14em] text-teal-300">
          Cross-provider search
        </p>
        <h2 className="mb-5 mt-2 text-xl font-bold">
          Search user by phone number
        </h2>
        <SearchBox />
        <p className="mt-4 text-xs text-slate-400">
          Try 01809070598, 01645545273, or 01539050502
        </p>
      </section>
      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Users"
          value={users.toLocaleString()}
          helper="Shared identities"
          icon={
            <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Database size={18} />
            </span>
          }
        />
        <StatCard
          label="Connected providers"
          value={statuses.length}
          helper="All adapters operational"
          icon={
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <PlugZap size={18} />
            </span>
          }
        />
        <StatCard
          label="Activity records"
          value={total.toLocaleString()}
          helper="Calculated from CSV datasets"
          icon={
            <span className="rounded-lg bg-violet-50 p-2 text-violet-600">
              <Activity size={18} />
            </span>
          }
        />
        <StatCard
          label="Data coverage"
          value="6 months"
          helper="February–August 2026"
          icon={
            <span className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <CalendarRange size={18} />
            </span>
          }
        />
      </section>
      <section className="card p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="eyebrow">Provider health</p>
            <h2 className="mt-1 font-bold">Connected data sources</h2>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            All systems normal
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {statuses.map((status) => {
            const c = providerConfig[status.provider];
            const Icon = c.icon;
            return (
              <div
                className="rounded-xl border border-slate-200 p-4"
                key={status.provider}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-9 place-items-center rounded-lg"
                    style={{ background: c.soft, color: c.color }}
                  >
                    <Icon size={18} />
                  </span>
                  <div>
                    <b className="block text-sm">
                      {providerLabel[status.provider]}
                    </b>
                    <span className="flex items-center gap-1.5 text-xs text-emerald-600">
                      <i className="size-1.5 rounded-full bg-emerald-500" />
                      Connected
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span>{status.records.toLocaleString()} records</span>
                  <span>{status.responseMs} ms</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
