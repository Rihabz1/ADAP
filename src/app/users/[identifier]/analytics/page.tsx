import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { EmptyState } from "@/components/ui";
import { getUser } from "@/lib/users";
export const dynamic = "force-dynamic";
export default async function AnalyticsPage({
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
  return <AnalyticsDashboard activities={result.activities} />;
}
