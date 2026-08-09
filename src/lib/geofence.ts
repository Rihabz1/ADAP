import type { Geofence, GeofenceEvent, LocationEvent } from "./types";

export function haversineKm(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number,
) {
  const rad = (n: number) => (n * Math.PI) / 180;
  const dLat = rad(bLat - aLat);
  const dLon = rad(bLon - aLon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
export function simulateGeofence(
  locations: LocationEvent[],
  fence: Geofence,
): GeofenceEvent[] {
  let prior: "inside" | "outside" | undefined;
  return [...locations]
    .sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt))
    .map((event) => {
      const distanceKm = haversineKm(
        fence.latitude,
        fence.longitude,
        event.latitude,
        event.longitude,
      );
      const state = distanceKm <= fence.radiusKm ? "inside" : "outside";
      const transition =
        prior && prior !== state
          ? state === "inside"
            ? "entered"
            : "exited"
          : undefined;
      prior = state;
      return { ...event, distanceKm, state, transition };
    });
}
