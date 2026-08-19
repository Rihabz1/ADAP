import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { RiderTimeline } from "@/components/rider-timeline";
import { ProviderBadge, PageTitle } from "@/components/ui";
import { providerLabel } from "@/lib/activity";
import { formatDateTime } from "@/lib/format";
import { getRiderDetail } from "@/lib/riders";
import { providers, type Provider } from "@/lib/types";

export const dynamic = "force-dynamic";

function isProvider(value: string): value is Provider {
  return providers.includes(value as Provider);
}

export default async function RiderDetailPage({
  params,
}: {
  params: Promise<{ provider: string; riderId: string }>;
}) {
  const resolved = await params;
  if (!isProvider(resolved.provider)) notFound();
  const detail = await getRiderDetail(
    resolved.provider,
    decodeURIComponent(resolved.riderId),
  );
  if (!detail) notFound();
  const { rider, activities } = detail;

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle
        eyebrow={`${providerLabel[rider.provider]} rider timeline`}
        title={rider.riderName}
        action={
          <Link href="/riders" className="btn-secondary">
            <ArrowLeft size={16} />
            Riders
          </Link>
        }
      />
      <section className="card mb-6 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <ProviderBadge provider={rider.provider} />
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize text-slate-600">
                {rider.status || "Unknown"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                <Star size={13} fill="currentColor" />
                {rider.rating?.toFixed(2) ?? "N/A"}
              </span>
            </div>
            <p className="font-mono text-sm text-slate-500">{rider.riderId}</p>
          </div>
          <div className="grid gap-4 text-sm sm:grid-cols-3 lg:min-w-[34rem]">
            <div>
              <p className="eyebrow">Contact</p>
              <p className="mt-1 font-mono">{rider.riderPhone || "N/A"}</p>
            </div>
            <div>
              <p className="eyebrow">Vehicle</p>
              <p className="mt-1">
                {[rider.vehicleType, rider.vehicleNumber].filter(Boolean).join(" · ") ||
                  "N/A"}
              </p>
            </div>
            <div>
              <p className="eyebrow">Primary Area</p>
              <p className="mt-1">{rider.primaryArea || "N/A"}</p>
            </div>
            <div>
              <p className="eyebrow">Dataset Activity</p>
              <p className="mt-1">
                {rider.activityCount} rows, {rider.completedCount} completed
              </p>
            </div>
            <div>
              <p className="eyebrow">Total Completed</p>
              <p className="mt-1">{rider.totalCompletedActivities}</p>
            </div>
            <div>
              <p className="eyebrow">Last Activity</p>
              <p className="mt-1">
                {rider.lastActivityAt ? formatDateTime(rider.lastActivityAt) : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </section>
      <RiderTimeline activities={activities} />
    </div>
  );
}
