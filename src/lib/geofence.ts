import type {
  Geofence,
  GeofenceEvent,
  GeofencePoint,
  LocationEvent,
} from "./types";

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

function pointOnSegment(
  point: GeofencePoint,
  start: GeofencePoint,
  end: GeofencePoint,
) {
  const cross =
    (point.longitude - start.longitude) * (end.latitude - start.latitude) -
    (point.latitude - start.latitude) * (end.longitude - start.longitude);
  if (Math.abs(cross) > 1e-10) return false;
  const dot =
    (point.longitude - start.longitude) * (end.longitude - start.longitude) +
    (point.latitude - start.latitude) * (end.latitude - start.latitude);
  if (dot < 0) return false;
  const lengthSquared =
    (end.longitude - start.longitude) ** 2 +
    (end.latitude - start.latitude) ** 2;
  return dot <= lengthSquared;
}

export function pointInPolygon(
  point: GeofencePoint,
  polygon: GeofencePoint[],
) {
  if (polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const current = polygon[i];
    const previous = polygon[j];
    if (pointOnSegment(point, previous, current)) return true;
    const crosses =
      current.latitude > point.latitude !== previous.latitude > point.latitude &&
      point.longitude <
        ((previous.longitude - current.longitude) *
          (point.latitude - current.latitude)) /
          (previous.latitude - current.latitude) +
          current.longitude;
    if (crosses) inside = !inside;
  }
  return inside;
}

export function polygonCenter(points: GeofencePoint[]): GeofencePoint {
  if (!points.length) return { latitude: 0, longitude: 0 };
  return {
    latitude:
      points.reduce((sum, point) => sum + point.latitude, 0) / points.length,
    longitude:
      points.reduce((sum, point) => sum + point.longitude, 0) / points.length,
  };
}

export function simulateGeofence(
  locations: LocationEvent[],
  fence: Geofence,
): GeofenceEvent[] {
  let prior: "inside" | "outside" | undefined;
  return [...locations]
    .sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt))
    .map((event) => {
      const isPolygon = fence.shape === "polygon";
      const reference = isPolygon
        ? polygonCenter(fence.points)
        : { latitude: fence.latitude, longitude: fence.longitude };
      const distanceKm = haversineKm(
        reference.latitude,
        reference.longitude,
        event.latitude,
        event.longitude,
      );
      const state = isPolygon
        ? pointInPolygon(event, fence.points)
          ? "inside"
          : "outside"
        : distanceKm <= fence.radiusKm
          ? "inside"
          : "outside";
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
