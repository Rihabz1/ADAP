export type UserNavigationSection = "users" | "profile" | "map" | "analytics";

export function isSupportedUserIdentifier(identifier: string) {
  return /^(USR\d{3}|\d{11}|\+880\d{10})$/i.test(identifier);
}

export function getUserNavigationSection(
  pathname: string,
): UserNavigationSection | null {
  if (pathname === "/users" || /^\/users\/[^/]+\/?$/.test(pathname)) {
    return "users";
  }
  const section = pathname.match(
    /^\/users\/[^/]+\/(profile|map|analytics)\/?$/,
  )?.[1];
  return (section as UserNavigationSection | undefined) ?? null;
}

export function getSearchDestination(pathname: string, identifier: string) {
  const normalized = identifier.trim().toUpperCase();
  const section = pathname.endsWith("/map")
    ? "/map"
    : pathname.endsWith("/analytics")
      ? "/analytics"
      : "/profile";
  return `/users/${encodeURIComponent(normalized)}${section}`;
}
