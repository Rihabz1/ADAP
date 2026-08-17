import {
  Activity,
  CalendarRange,
  Database,
  PlugZap,
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
    <div className="mx-auto max-w-[1400px]">
      <PageTitle
        title="Activity dashboard"
      />
      <section className="card relative z-30 mb-6 overflow-visible p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[20px]">
          <div className="absolute -right-20 -top-24 size-72 rounded-full bg-cyan-100/65 blur-3xl" />
          <div className="absolute -bottom-28 left-1/4 size-64 rounded-full bg-blue-100/50 blur-3xl" />
        </div>
        <div className="relative grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#00A6B6]">
              Cross-provider search
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#0B2A55]">
              Find a user
            </h2>
          </div>
          <div>
            <SearchBox />
          </div>
        </div>
      </section>
      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Users"
          value={users.toLocaleString()}
          helper="Shared identities"
          icon={
            <span className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Database size={18} />
            </span>
          }
        />
        <StatCard
          label="Connected providers"
          value={statuses.length}
          helper="All adapters operational"
          icon={
            <span className="rounded-xl bg-cyan-50 p-2.5 text-cyan-600">
              <PlugZap size={18} />
            </span>
          }
        />
        <StatCard
          label="Activity records"
          value={total.toLocaleString()}
          helper="Calculated from CSV datasets"
          icon={
            <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <Activity size={18} />
            </span>
          }
        />
        <StatCard
          label="Data coverage"
          value="6 months"
          helper="February–August 2026"
          icon={
            <span className="rounded-xl bg-sky-50 p-2.5 text-sky-600">
              <CalendarRange size={18} />
            </span>
          }
        />
      </section>
      <section className="card p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="eyebrow">Provider health</p>
            <h2 className="mt-1 font-bold">Connected data sources</h2>
          </div>
          <span className="rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-1 text-xs font-bold text-emerald-700">
            All systems normal
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {statuses.map((status) => {
            const c = providerConfig[status.provider];
            const Icon = c.icon;
            return (
              <div
                className="rounded-2xl border border-white/90 bg-white/68 p-4 shadow-[0_10px_28px_rgba(15,42,82,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-[0_16px_34px_rgba(15,42,82,0.09)]"
                key={status.provider}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-10 place-items-center rounded-xl"
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
