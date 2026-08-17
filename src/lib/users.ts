import { getStore } from "./data/csv-loader";
import { latestActivity } from "./activity";
import { getAllActivities } from "./providers";
import type { NormalizedUser } from "./types";

export async function getUser(identifier: string) {
  const { activities, failures } = await getAllActivities(identifier);
  if (!activities.length) return null;
  const first = activities[0];
  return {
    user: {
      userId: first.userId,
      phone: first.phone,
      customerName: first.customerName,
    },
    activities,
    failures,
  };
}
export async function getDirectory(): Promise<NormalizedUser[]> {
  const ids = [...getStore().foodi.byUserId.keys()].sort();
  return Promise.all(
    ids.map(async (id) => {
      const result = await getAllActivities(id);
      const first = result.activities[0];
      return {
        userId: id,
        phone: first?.phone ?? "",
        customerName: first?.customerName ?? id,
        totalActivities: result.activities.length,
        latestActivity: latestActivity(result.activities)?.occurredAt ?? null,
        activeProviders: new Set(result.activities.map((a) => a.provider)).size,
      };
    }),
  );
}
