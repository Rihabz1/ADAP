import { EmptyState } from "@/components/ui";
import { UserProfileView } from "@/components/profile/user-profile-view";
import { getUser } from "@/lib/users";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ identifier: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const result = await getUser(decodeURIComponent((await params).identifier));

  if (!result)
    return (
      <EmptyState
        title="User not found"
        body="No activity matches this identifier."
      />
    );

  const query = await searchParams;

  return (
    <UserProfileView
      activities={result.activities}
      mode="profile"
      initialFrom={query.from ?? ""}
      initialTo={query.to ?? ""}
    />
  );
}
