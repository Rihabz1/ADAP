import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Car,
  Check,
  Database,
  MapPinned,
  Package,
  ShieldCheck,
  ShoppingBag,
  Utensils,
} from "lucide-react";

const sources = [
  {
    name: "Foodi",
    label: "Food delivery events",
    icon: Utensils,
    color: "#db3263",
  },
  {
    name: "Rokomari",
    label: "Commerce order events",
    icon: ShoppingBag,
    color: "#ef6b2e",
  },
  {
    name: "Steadfast Courier",
    label: "Parcel delivery events",
    icon: Package,
    color: "#16a269",
  },
  { name: "Pathao", label: "Recorded ride events", icon: Car, color: "#334155" },
];
export default function Home() {
  redirect("/login");
  return (
    <div className="min-h-screen bg-[#071426] text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-teal-400 text-[#071426]">
            <ShieldCheck />
          </span>
          <span>
            <b className="block">ADAP</b>
            <small className="text-[10px] uppercase tracking-wider text-slate-400">
              Application Data Analysis Platform
            </small>
          </span>
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/5"
        >
          Sign in
        </Link>
      </nav>
      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.15fr_.85fr] lg:pt-24">
          <div>
            <h1 className="max-w-3xl text-5xl font-bold leading-[1.06] tracking-[-.045em] sm:text-6xl">
              See the complete picture across every recorded activity.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              A production-style demonstration of secure, server-side activity
              correlation across four provider datasets.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/login?next=/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-5 py-3 font-bold text-[#071426] hover:bg-teal-300"
              >
                Open dashboard <ArrowRight size={18} />
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-5 text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <Check size={14} className="text-teal-300" />
                Server-side filtering
              </span>
              <span className="flex items-center gap-2">
                <Check size={14} className="text-teal-300" />
                No private APIs
              </span>
              <span className="flex items-center gap-2">
                <Check size={14} className="text-teal-300" />
                Historical data only
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-8 rounded-full bg-teal-400/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d1d32] p-5 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold tracking-widest text-slate-500">
                    SYSTEM OVERVIEW
                  </p>
                  <p className="mt-1 font-bold">Provider activity mesh</p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">
                  4 connected
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {sources.map(({ name, label, icon: Icon, color }) => (
                  <div
                    key={name}
                    className="rounded-xl border border-white/8 bg-white/[.035] p-4"
                  >
                    <div className="mb-8 flex items-center justify-between">
                      <span
                        className="grid size-9 place-items-center rounded-lg"
                        style={{ background: `${color}22`, color }}
                      >
                        <Icon size={18} />
                      </span>
                      <span className="size-2 rounded-full bg-emerald-400" />
                    </div>
                    <p className="font-bold">{name}</p>
                    <p className="mt-1 text-xs text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-white/8 bg-white/[.025] p-4 text-center">
                <div>
                  <Database className="mx-auto text-teal-300" size={18} />
                  <b className="mt-2 block text-sm">5,708</b>
                  <small className="text-slate-500">Events</small>
                </div>
                <div>
                  <MapPinned className="mx-auto text-teal-300" size={18} />
                  <b className="mt-2 block text-sm">Recorded</b>
                  <small className="text-slate-500">Locations</small>
                </div>
                <div>
                  <BarChart3 className="mx-auto text-teal-300" size={18} />
                  <b className="mt-2 block text-sm">Dynamic</b>
                  <small className="text-slate-500">Analytics</small>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="border-t border-white/10 bg-white/[.025]">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <p className="mb-5 text-xs font-bold tracking-widest text-slate-500">
              EXPLORE EXAMPLE PROFILES
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {["USR001", "USR025", "USR050", "USR100"].map((id) => (
                <Link
                  key={id}
                  href={`/login?next=/users/${id}`}
                  className="group flex items-center justify-between rounded-xl border border-white/10 px-4 py-4 hover:border-teal-300/40"
                >
                  <b>{id}</b>
                  <ArrowRight
                    size={17}
                    className="text-slate-500 group-hover:text-teal-300"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
