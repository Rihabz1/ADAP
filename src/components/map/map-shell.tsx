"use client";
import dynamic from "next/dynamic";
import type { LocationEvent } from "@/lib/types";
const ActivityMap = dynamic(
  () => import("./activity-map").then((m) => m.ActivityMap),
  { ssr: false, loading: () => <div className="skeleton h-[620px] w-full" /> },
);
export function MapShell({
  locations,
  identifier,
  name,
}: {
  locations: LocationEvent[];
  identifier: string;
  name: string;
}) {
  return (
    <ActivityMap locations={locations} identifier={identifier} name={name} />
  );
}
