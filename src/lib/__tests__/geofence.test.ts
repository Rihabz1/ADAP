import { describe, expect, it } from "vitest";
import { haversineKm, pointInPolygon, simulateGeofence } from "../geofence";
import type { Geofence, LocationEvent } from "../types";
const fence: Geofence = {
  id: "f",
  name: "Zone",
  latitude: 23.7925,
  longitude: 90.4078,
  radiusKm: 2,
};
const event = (
  latitude: number,
  longitude: number,
  time: string,
): LocationEvent => ({
  activityId: time,
  provider: "pathao",
  role: "origin",
  area: "Area",
  latitude,
  longitude,
  occurredAt: time,
  status: "completed",
  title: "Ride",
});
describe("geofence calculations", () => {
  it("calculates Haversine distance", () => {
    expect(haversineKm(23.7925, 90.4078, 23.7925, 90.4078)).toBe(0);
    expect(haversineKm(23.7925, 90.4078, 23.82, 90.4078)).toBeGreaterThan(3);
  });
  it("classifies inside/outside and detects transitions", () => {
    const events = [
      event(23.82, 90.4078, "2026-01-01T10:00:00+06:00"),
      event(23.7925, 90.4078, "2026-01-01T11:00:00+06:00"),
      event(23.82, 90.4078, "2026-01-01T12:00:00+06:00"),
    ];
    const result = simulateGeofence(events, fence);
    expect(result.map((x) => x.state)).toEqual([
      "outside",
      "inside",
      "outside",
    ]);
    expect(result[1].transition).toBe("entered");
    expect(result[2].transition).toBe("exited");
  });
  it("classifies points inside custom polygon zones", () => {
    const polygon: Geofence = {
      id: "custom",
      name: "Custom zone",
      shape: "polygon",
      points: [
        { latitude: 23.78, longitude: 90.38 },
        { latitude: 23.82, longitude: 90.38 },
        { latitude: 23.82, longitude: 90.43 },
        { latitude: 23.78, longitude: 90.43 },
      ],
    };
    expect(
      pointInPolygon(
        { latitude: 23.8, longitude: 90.4 },
        polygon.shape === "polygon" ? polygon.points : [],
      ),
    ).toBe(true);
    expect(
      pointInPolygon(
        { latitude: 23.85, longitude: 90.4 },
        polygon.shape === "polygon" ? polygon.points : [],
      ),
    ).toBe(false);
    const result = simulateGeofence(
      [
        event(23.85, 90.4, "2026-01-01T10:00:00+06:00"),
        event(23.8, 90.4, "2026-01-01T11:00:00+06:00"),
      ],
      polygon,
    );
    expect(result.map((item) => item.state)).toEqual(["outside", "inside"]);
    expect(result[1].transition).toBe("entered");
  });
});
