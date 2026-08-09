import { MapShell } from "@/components/map/map-shell";
import { EmptyState } from "@/components/ui";
import { toLocations } from "@/lib/activity";
import { getUser } from "@/lib/users";
export const dynamic = "force-dynamic";
export default async function MapPage({
  params,
}: {
  params: Promise<{ identifier: string }>;
}) {
  const result = await getUser(decodeURIComponent((await params).identifier));
  if (!result)
    return (
      <EmptyState
        title="User not found"
        body="No activity matches this identifier."
      />
    );
  return (
    <MapShell
      locations={toLocations(result.activities)}
      identifier={result.user.userId}
      name={result.user.customerName}
    />
  );
}
