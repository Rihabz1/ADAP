import { formatInTimeZone } from "date-fns-tz";
import { countBy, latestActivity, toLocations } from "./activity";
import type { NormalizedActivity, Provider } from "./types";

const modes = (counts: Record<string, number>) =>
  Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
export function calculateAnalytics(items: NormalizedActivity[]) {
  const byProvider = countBy(items.map((a) => a.provider));
  const byMonth = countBy(
    items.map((a) => formatInTimeZone(a.occurredAt, "Asia/Dhaka", "MMM yyyy")),
  );
  const byWeekday = countBy(
    items.map((a) => formatInTimeZone(a.occurredAt, "Asia/Dhaka", "EEEE")),
  );
  const byHour = countBy(
    items.map((a) => formatInTimeZone(a.occurredAt, "Asia/Dhaka", "HH")),
  );
  const areas = countBy(toLocations(items).map((l) => l.area));
  const statuses = countBy(items.map((a) => a.status));
  const amounts = items.filter((a) => a.amount != null).map((a) => a.amount!);
  const first =
    [...items].sort(
      (a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt),
    )[0] ?? null;
  const timeBuckets = countBy(
    items.map((a) => {
      const h = Number(formatInTimeZone(a.occurredAt, "Asia/Dhaka", "H"));
      return h < 6
        ? "00:00–06:00"
        : h < 12
          ? "06:00–12:00"
          : h < 18
            ? "12:00–18:00"
            : "18:00–24:00";
    }),
  );
  return {
    total: items.length,
    byProvider,
    byMonth,
    byWeekday,
    byHour,
    statuses,
    topAreas: Object.entries(areas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([area, count]) => ({ area, count })),
    latest: latestActivity(items),
    first,
    averageValue: amounts.length
      ? amounts.reduce((a, b) => a + b, 0) / amounts.length
      : 0,
    mostActiveProvider: modes(byProvider) as Provider | "—",
    mostFrequentArea: modes(areas),
    mostActiveDay: modes(byWeekday),
    mostActiveTimeRange: modes(timeBuckets),
    providerPercentages: Object.fromEntries(
      Object.entries(byProvider).map(([key, value]) => [
        key,
        Math.round((value / Math.max(items.length, 1)) * 100),
      ]),
    ),
  };
}
