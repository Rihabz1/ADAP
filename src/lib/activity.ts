import type {
  ActivityFilters,
  LocationEvent,
  NormalizedActivity,
  Provider,
} from "./types";

export function normalizeIdentifier(value: string) {
  const trimmed = value.trim();
  if (trimmed.toUpperCase().startsWith("USR")) return trimmed.toUpperCase();
  const digits = trimmed.replace(/\D/g, "");
  return digits.startsWith("880") && digits.length === 13
    ? `0${digits.slice(3)}`
    : digits;
}
export function validIdentifier(value: string) {
  return /^(USR\d{3}|\+?\d{10,15})$/i.test(value.trim());
}
export function sortActivities(
  items: NormalizedActivity[],
  sort: "asc" | "desc" = "desc",
) {
  return [...items].sort(
    (a, b) =>
      (Date.parse(a.occurredAt) - Date.parse(b.occurredAt)) *
      (sort === "asc" ? 1 : -1),
  );
}
export function latestActivity(items: NormalizedActivity[]) {
  return sortActivities(items)[0] ?? null;
}
export function filterActivities(
  items: NormalizedActivity[],
  filters: ActivityFilters = {},
) {
  return sortActivities(
    items.filter((item) => {
      if (
        filters.providers?.length &&
        !filters.providers.includes(item.provider)
      )
        return false;
      if (
        filters.from &&
        Date.parse(item.occurredAt) <
          Date.parse(`${filters.from}T00:00:00+06:00`)
      )
        return false;
      if (
        filters.to &&
        Date.parse(item.occurredAt) > Date.parse(`${filters.to}T23:59:59+06:00`)
      )
        return false;
      if (
        filters.status &&
        item.status.toLowerCase() !== filters.status.toLowerCase()
      )
        return false;
      return true;
    }),
    filters.sort,
  );
}
export function toLocations(items: NormalizedActivity[]): LocationEvent[] {
  return sortActivities(items, "asc").flatMap(
    (item) =>
      [
        item.origin && {
          activityId: item.id,
          provider: item.provider,
          role: "origin" as const,
          ...item.origin,
          occurredAt: item.occurredAt,
          status: item.status,
          title: item.title,
        },
        item.destination && {
          activityId: item.id,
          provider: item.provider,
          role: "destination" as const,
          ...item.destination,
          occurredAt: item.occurredAt,
          status: item.status,
          title: item.title,
        },
      ].filter(Boolean) as LocationEvent[],
  );
}
export function sortLocationEventsAscending(items: LocationEvent[]) {
  const roleOrder = { origin: 0, destination: 1 } as const;
  return [...items].sort(
    (a, b) =>
      Date.parse(a.occurredAt) - Date.parse(b.occurredAt) ||
      a.activityId.localeCompare(b.activityId) ||
      roleOrder[a.role] - roleOrder[b.role],
  );
}
export function countBy<T extends string>(items: T[]) {
  return items.reduce<Record<string, number>>(
    (acc, value) => ({ ...acc, [value]: (acc[value] ?? 0) + 1 }),
    {},
  );
}
export const providerLabel: Record<Provider, string> = {
  foodi: "Foodi",
  pathao: "Pathao",
  rokomari: "Rokomari",
  steadfast: "Steadfast Courier",
};
