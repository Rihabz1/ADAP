import { describe, expect, it } from "vitest";
import {
  filterActivities,
  latestActivity,
  normalizeIdentifier,
  sortLocationEventsAscending,
} from "../activity";
import type { LocationEvent, NormalizedActivity } from "../types";
const base: NormalizedActivity = {
  id: "A",
  provider: "pathao",
  userId: "USR001",
  phone: "01000000001",
  customerName: "User 001",
  activityType: "ride",
  occurredAt: "2026-08-01T12:00:00+06:00",
  sourceUpdatedAt: "2026-08-01T13:00:00+06:00",
  status: "completed",
  title: "Ride",
  description: "A to B",
  metadata: {},
};
describe("activity utilities", () => {
  it("normalizes user IDs but preserves exact phones", () => {
    expect(normalizeIdentifier(" usr001 ")).toBe("USR001");
    expect(normalizeIdentifier(" 01000000001 ")).toBe("01000000001");
  });
  it("finds latest by occurredAt rather than update time", () => {
    const old = {
      ...base,
      id: "old",
      occurredAt: "2026-01-01T10:00:00+06:00",
      sourceUpdatedAt: "2026-09-01T10:00:00+06:00",
    };
    expect(latestActivity([old, base])?.id).toBe("A");
  });
  it("filters by provider and inclusive date range", () => {
    const food = {
      ...base,
      id: "F",
      provider: "foodi" as const,
      activityType: "food_order" as const,
    };
    expect(
      filterActivities([base, food], {
        providers: ["pathao"],
        from: "2026-08-01",
        to: "2026-08-01",
      }),
    ).toEqual([base]);
  });
  it("merges provider locations into one ascending sequence", () => {
    const point = (
      activityId: string,
      provider: LocationEvent["provider"],
      occurredAt: string,
    ): LocationEvent => ({
      activityId,
      provider,
      role: "destination",
      area: "Area",
      latitude: 23.8,
      longitude: 90.4,
      occurredAt,
      status: "completed",
      title: activityId,
    });
    const merged = sortLocationEventsAscending([
      point("pathao-late", "pathao", "2026-08-03T10:00:00+06:00"),
      point("food-early", "foodi", "2026-08-01T10:00:00+06:00"),
      point("courier-middle", "steadfast", "2026-08-02T10:00:00+06:00"),
    ]);
    expect(merged.map((item) => item.activityId)).toEqual([
      "food-early",
      "courier-middle",
      "pathao-late",
    ]);
    expect(
      sortLocationEventsAscending(
        merged.filter((item) => item.provider === "pathao"),
      ).map((item) => item.activityId),
    ).toEqual(["pathao-late"]);
  });
});
