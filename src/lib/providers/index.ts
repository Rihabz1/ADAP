import { foodiAdapter } from "./foodi";
import { pathaoAdapter } from "./pathao";
import { rokomariAdapter } from "./rokomari";
import { steadfastAdapter } from "./steadfast";
import type {
  ActivityFilters,
  NormalizedActivity,
  Provider,
} from "@/lib/types";

export const adapters = [
  foodiAdapter,
  pathaoAdapter,
  rokomariAdapter,
  steadfastAdapter,
];

export async function getAllActivities(
  identifier: string,
  filters: ActivityFilters = {},
  simulateFailure?: Provider,
) {
  const selected = filters.providers?.length
    ? adapters.filter((a) => filters.providers!.includes(a.provider))
    : adapters;
  const results = await Promise.allSettled(
    selected.map(async (adapter) => {
      if (
        process.env.NODE_ENV === "development" &&
        adapter.provider === simulateFailure
      )
        throw new Error("Simulated provider failure");
      return {
        provider: adapter.provider,
        activities: await adapter.getActivities(identifier, filters),
      };
    }),
  );
  const activities: NormalizedActivity[] = [];
  const failures: Provider[] = [];
  for (const result of results) {
    if (result.status === "fulfilled")
      activities.push(...result.value.activities);
    else failures.push(selected[results.indexOf(result)].provider);
  }
  return {
    activities: activities.sort(
      (a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt),
    ),
    failures,
  };
}
