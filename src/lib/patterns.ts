import type { NormalizedActivity } from "./types";

export type ParcelActivity = NormalizedActivity & {
  origin: NonNullable<NormalizedActivity["origin"]>;
  destination: NonNullable<NormalizedActivity["destination"]>;
};

export interface PatternSelection {
  id: string;
  label: string;
  pickupArea: string;
  deliveryArea: string;
  parcels: ParcelActivity[];
}

export interface RoutePattern extends PatternSelection {
  percentage: number;
  firstSeen: string;
  lastSeen: string;
}

export interface LocationPattern extends PatternSelection {
  area: string;
  role: "pickup" | "delivery";
  count: number;
}

const canonical = (value: string) => value.trim().toLocaleLowerCase();

const byOccurredAt = (a: ParcelActivity, b: ParcelActivity) =>
  Date.parse(a.occurredAt) - Date.parse(b.occurredAt);

export function getSteadfastParcels(
  activities: NormalizedActivity[],
): ParcelActivity[] {
  return activities
    .filter(
      (activity): activity is ParcelActivity =>
        activity.provider === "steadfast" &&
        Boolean(activity.origin) &&
        Boolean(activity.destination),
    )
    .sort(byOccurredAt);
}

export function groupRoutes(parcels: ParcelActivity[]): RoutePattern[] {
  const grouped = new Map<string, ParcelActivity[]>();
  for (const parcel of parcels) {
    const key = `${canonical(parcel.origin.area)}\u0000${canonical(parcel.destination.area)}`;
    grouped.set(key, [...(grouped.get(key) ?? []), parcel]);
  }

  return [...grouped.entries()]
    .map(([key, items]) => {
      const sorted = [...items].sort(byOccurredAt);
      const pickupArea = sorted[0].origin.area;
      const deliveryArea = sorted[0].destination.area;
      return {
        id: `route:${key}`,
        label: `${pickupArea} → ${deliveryArea}`,
        pickupArea,
        deliveryArea,
        parcels: sorted,
        percentage: parcels.length ? (sorted.length / parcels.length) * 100 : 0,
        firstSeen: sorted[0].occurredAt,
        lastSeen: sorted.at(-1)!.occurredAt,
      };
    })
    .sort(
      (a, b) =>
        b.parcels.length - a.parcels.length || a.label.localeCompare(b.label),
    );
}

export function groupLocations(
  parcels: ParcelActivity[],
  role: "pickup" | "delivery",
): LocationPattern[] {
  const grouped = new Map<string, ParcelActivity[]>();
  for (const parcel of parcels) {
    const area = role === "pickup" ? parcel.origin.area : parcel.destination.area;
    const key = canonical(area);
    grouped.set(key, [...(grouped.get(key) ?? []), parcel]);
  }

  return [...grouped.entries()]
    .map(([key, items]) => {
      const area =
        role === "pickup" ? items[0].origin.area : items[0].destination.area;
      const counterpart = new Set(
        items.map((item) =>
          role === "pickup" ? item.destination.area : item.origin.area,
        ),
      );
      return {
        id: `${role}:${key}`,
        label: `${role === "pickup" ? "Pickup" : "Delivery"}: ${area}`,
        area,
        role,
        count: items.length,
        pickupArea:
          role === "pickup"
            ? area
            : counterpart.size === 1
              ? [...counterpart][0]
              : "Multiple locations",
        deliveryArea:
          role === "delivery"
            ? area
            : counterpart.size === 1
              ? [...counterpart][0]
              : "Multiple locations",
        parcels: [...items].sort(byOccurredAt),
      };
    })
    .sort((a, b) => b.count - a.count || a.area.localeCompare(b.area));
}

export function summarizeStatuses(parcels: ParcelActivity[]) {
  const count = (values: string[]) =>
    parcels.filter((parcel) =>
      values.includes(parcel.status.toLocaleLowerCase().replaceAll(" ", "_")),
    ).length;
  return {
    delivered: count(["delivered"]),
    cancelled: count(["cancelled", "canceled"]),
    inTransit: count(["in_transit"]),
  };
}

export type TrendRange = "7d" | "30d" | "90d" | "6m" | "all";

const rangeDays: Record<Exclude<TrendRange, "all">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "6m": 183,
};

export function buildParcelTrend(
  parcels: ParcelActivity[],
  range: TrendRange,
) {
  if (!parcels.length) return [];
  const latest = Math.max(...parcels.map((parcel) => Date.parse(parcel.occurredAt)));
  const threshold =
    range === "all"
      ? Number.NEGATIVE_INFINITY
      : latest - (rangeDays[range] - 1) * 86_400_000;
  const counts = new Map<string, number>();
  for (const parcel of parcels) {
    if (Date.parse(parcel.occurredAt) < threshold) continue;
    const date = parcel.occurredAt.slice(0, 10);
    counts.set(date, (counts.get(date) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, parcels]) => ({ date, parcels }));
}
