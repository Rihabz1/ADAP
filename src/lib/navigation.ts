export function getSearchDestination(pathname: string, identifier: string) {
  const normalized = identifier.trim().toUpperCase();
  const section = pathname.endsWith("/map")
    ? "/map"
    : pathname.endsWith("/analytics")
      ? "/analytics"
      : pathname.endsWith("/timeline")
        ? "/timeline"
        : "";
  return `/users/${encodeURIComponent(normalized)}${section}`;
}
