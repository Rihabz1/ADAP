import { describe, expect, it } from "vitest";
import {
  buildParcelTrend,
  getSteadfastParcels,
  groupLocations,
  groupRoutes,
  summarizeStatuses,
} from "../patterns";
import type { NormalizedActivity } from "../types";

const parcel = (
  id: string,
  pickup: string,
  delivery: string,
  occurredAt: string,
  status = "delivered",
): NormalizedActivity => ({
  id,
  provider: "steadfast",
  userId: "USR001",
  phone: "01000000001",
  customerName: "Test User",
  activityType: "courier_delivery",
  occurredAt,
  sourceUpdatedAt: occurredAt,
  status,
  origin: { area: pickup, latitude: 23.8, longitude: 90.4 },
  destination: { area: delivery, latitude: 22.3, longitude: 91.8 },
  title: "parcel",
  description: `${pickup} to ${delivery}`,
  metadata: {},
});

const activities = [
  parcel("P1", "Dhaka", "Chattogram", "2026-08-01T10:00:00+06:00"),
  parcel("P2", "dhaka", "Chattogram", "2026-08-05T10:00:00+06:00", "cancelled"),
  parcel("P3", "Sylhet", "Dhaka", "2026-08-10T10:00:00+06:00", "in_transit"),
];

describe("parcel patterns", () => {
  it("groups routes and locations case-insensitively", () => {
    const parcels = getSteadfastParcels(activities);
    expect(groupRoutes(parcels)[0]).toMatchObject({
      pickupArea: "Dhaka",
      deliveryArea: "Chattogram",
    });
    expect(groupRoutes(parcels)[0].percentage).toBeCloseTo(200 / 3);
    expect(groupRoutes(parcels)[0].parcels).toHaveLength(2);
    expect(groupLocations(parcels, "pickup")[0]).toMatchObject({
      area: "Dhaka",
      count: 2,
    });
  });

  it("summarizes required parcel statuses", () => {
    expect(summarizeStatuses(getSteadfastParcels(activities))).toEqual({
      delivered: 1,
      cancelled: 1,
      inTransit: 1,
    });
  });

  it("anchors time filters to the latest parcel", () => {
    const parcels = getSteadfastParcels(activities);
    expect(buildParcelTrend(parcels, "7d").map((point) => point.date)).toEqual([
      "2026-08-05",
      "2026-08-10",
    ]);
    expect(buildParcelTrend(parcels, "all")).toHaveLength(3);
  });
});
