import Link from "next/link";
import type { Provider } from "@/lib/types";
const tabs: { label: string; slug?: string; query?: Provider }[] = [
  { label: "Overview", slug: "" },
  { label: "Timeline", slug: "/timeline" },
  { label: "Foodpanda", query: "foodpanda" },
  { label: "Daraz", query: "daraz" },
  { label: "Pathao", query: "pathao" },
  { label: "Uber", query: "uber" },
  { label: "Map", slug: "/map" },
  { label: "Analytics", slug: "/analytics" },
];
export function ProfileTabs({
  identifier,
  active,
  provider,
}: {
  identifier: string;
  active: "overview" | "timeline" | "map" | "analytics";
  provider?: Provider;
}) {
  return (
    <nav
      className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200"
      aria-label="User profile sections"
    >
      {tabs.map((t) => {
        const is = t.query
          ? provider === t.query
          : active === t.label.toLowerCase();
        const href = t.query
          ? `/users/${identifier}?provider=${t.query}`
          : `/users/${identifier}${t.slug ?? ""}`;
        return (
          <Link
            key={t.label}
            href={href}
            className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold ${is ? "border-teal-600 text-teal-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
