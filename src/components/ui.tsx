import { Car, Package, ShoppingBag, Utensils } from "lucide-react";
import type { Provider } from "@/lib/types";
import { providerLabel } from "@/lib/activity";

export const providerConfig = {
  foodi: { icon: Utensils, color: "#dc3264", soft: "#fff0f5" },
  pathao: { icon: Car, color: "#334155", soft: "#f1f5f9" },
  rokomari: { icon: ShoppingBag, color: "#ef6c2f", soft: "#fff4ed" },
  steadfast: { icon: Package, color: "#17a269", soft: "#ecfdf5" },
} as const;
export function ProviderBadge({
  provider,
  compact = false,
}: {
  provider: Provider;
  compact?: boolean;
}) {
  const c = providerConfig[provider];
  const Icon = c.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
      style={{ background: c.soft, color: c.color }}
    >
      <Icon size={13} />
      {compact
        ? providerLabel[provider].replace(" Courier", "")
        : providerLabel[provider]}
    </span>
  );
}
export function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
export function StatCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  helper?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="eyebrow">{label}</p>
        {icon}
      </div>
      <div className="metric text-slate-900">{value}</div>
      {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
    </div>
  );
}
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card grid min-h-64 place-items-center p-8 text-center">
      <div>
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-slate-100 text-slate-500">
          ?
        </div>
        <h2 className="font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-500">{body}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}
