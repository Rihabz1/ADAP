import { getStore } from "./data/csv-loader";
import { normalizeRecord } from "./data/normalization";
import { sortActivities } from "./activity";
import { providers, type NormalizedRider, type ProviderRecord } from "./types";
import type { NormalizedActivity, Provider } from "./types";

function toNumber(value: string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isCompleted(row: ProviderRecord) {
  const status =
    "order_status" in row
      ? row.order_status
      : "trip_status" in row
        ? row.trip_status
        : "parcel_status" in row
          ? row.parcel_status
          : "";
  return /completed|delivered/i.test(status);
}

export async function getRiderDirectory(): Promise<NormalizedRider[]> {
  const store = getStore();
  const riders = new Map<string, NormalizedRider>();

  for (const provider of providers) {
    const rows = store[provider].rows as ProviderRecord[];
    for (const row of rows) {
      if (!row.rider_id) continue;
      const key = `${provider}:${row.rider_id}`;
      const existing = riders.get(key);
      const completed = isCompleted(row) ? 1 : 0;
      if (existing) {
        existing.activityCount += 1;
        existing.completedCount += completed;
        continue;
      }
      riders.set(key, {
        provider,
        providerName: row.provider_name || provider,
        riderId: row.rider_id,
        riderName: row.rider_name || row.rider_id,
        riderPhone: row.rider_phone || "",
        riderRole: row.rider_role || "",
        vehicleType: row.rider_vehicle_type || "",
        vehicleNumber: row.rider_vehicle_number || "",
        joinedAt: row.rider_joined_at || "",
        rating: row.rider_rating ? toNumber(row.rider_rating) : null,
        status: row.rider_status || "",
        primaryArea: row.rider_primary_area || "",
        datasetActivityCount: toNumber(row.rider_dataset_activity_count),
        datasetCompletedCount: toNumber(row.rider_dataset_completed_count),
        totalCompletedActivities: toNumber(row.rider_total_completed_activities),
        firstActivityAt: row.rider_first_activity_at || null,
        lastActivityAt: row.rider_last_activity_at || null,
        activityCount: 1,
        completedCount: completed,
      });
    }
  }

  return [...riders.values()].sort(
    (a, b) =>
      Date.parse(b.lastActivityAt ?? "") - Date.parse(a.lastActivityAt ?? "") ||
      a.riderName.localeCompare(b.riderName),
  );
}

export async function getRiderDetail(
  provider: Provider,
  riderId: string,
): Promise<{ rider: NormalizedRider; activities: NormalizedActivity[] } | null> {
  const riders = await getRiderDirectory();
  const rider = riders.find(
    (item) => item.provider === provider && item.riderId === riderId,
  );
  if (!rider) return null;

  const rows = (getStore()[provider].rows as ProviderRecord[]).filter(
    (row) => row.rider_id === riderId,
  );
  const activities = sortActivities(
    rows.map((row) => normalizeRecord(provider, row)),
    "desc",
  );

  return { rider, activities };
}
