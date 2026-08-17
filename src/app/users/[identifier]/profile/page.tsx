import { EmptyState } from "@/components/ui";
import { UserProfileView } from "@/components/profile/user-profile-view";
import { getUser } from "@/lib/users";
import { providers, type Provider } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ identifier: string }>;
  searchParams: Promise<{ from?: string; to?: string; provider?: string }>;
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
  const initialProvider = providers.includes(query.provider as Provider)
    ? (query.provider as Provider)
    : undefined;

  return (
    <UserProfileView
      key={`${result.user.userId}:${initialProvider ?? "overview"}`}
      activities={result.activities}
      mode="profile"
      initialProvider={initialProvider}
      initialFrom={query.from ?? ""}
      initialTo={query.to ?? ""}
    />
  );
}
