import {
  ArrowDown,
  Database,
  GitMerge,
  Server,
  ShieldCheck,
} from "lucide-react";
import { PageTitle } from "@/components/ui";
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageTitle
        eyebrow="About this project"
        title="Transparent by design"
        description="ADAP illustrates multi-source analysis patterns without connecting to real services, devices, or private users."
      />
      <section className="card p-6 sm:p-8">
        <h2 className="text-xl font-bold">Purpose and safety boundary</h2>
        <p className="mt-3 leading-7 text-slate-600">
          This application correlates only the four included CSV datasets. It
          performs descriptive statistics, historical location plotting, and
          deterministic geofence calculations. It does not provide live
          tracking, criminal prediction, guilt scoring, facial recognition, or
          autonomous targeting.
        </p>
      </section>
      <section className="card mt-5 p-6 sm:p-8">
        <p className="eyebrow">Deployment architecture</p>
        <h2 className="mt-2 text-xl font-bold">
          From private files to focused results
        </h2>
        <div className="mt-8 grid justify-items-center gap-3 text-center">
          <div className="rounded-xl bg-[#10243a] px-8 py-4 text-white">
            <ShieldCheck className="mx-auto mb-2 text-teal-300" />
            Next.js Dashboard
          </div>
          <ArrowDown className="text-slate-300" />
          <div className="rounded-xl border border-slate-200 bg-white px-8 py-4">
            <Server className="mx-auto mb-2 text-blue-600" />
            Validated Route Handlers
          </div>
          <ArrowDown className="text-slate-300" />
          <div className="grid w-full gap-3 sm:grid-cols-4">
            {["Foodpanda", "Daraz", "Pathao", "Uber"].map((v) => (
              <div
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-sm font-bold"
                key={v}
              >
                <GitMerge className="mx-auto mb-2 text-teal-700" size={18} />
                {v} Adapter
              </div>
            ))}
          </div>
          <ArrowDown className="text-slate-300" />
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-8 py-4">
            <Database className="mx-auto mb-2 text-slate-600" />
            Server-only CSV + in-memory indexes
          </div>
        </div>
      </section>
      <section className="mt-5 grid gap-5 md:grid-cols-3">
        {[
          {
            t: "Provider adapters",
            d: "A stable adapter interface keeps UI code independent of the CSV implementation.",
          },
          {
            t: "Normalization",
            d: "All provider records become one typed activity model while retaining relevant metadata.",
          },
          {
            t: "Server filtering",
            d: "Only requested user activities, statistics, or locations cross the API boundary.",
          },
        ].map((x) => (
          <div className="card p-5" key={x.t}>
            <h3 className="font-bold">{x.t}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{x.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
