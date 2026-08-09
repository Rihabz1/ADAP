import Link from "next/link";
import { EmptyState } from "@/components/ui";
import { UserProfileView } from "@/components/profile/user-profile-view";
import { getUser } from "@/lib/users";
import { providers, type Provider } from "@/lib/types";
export const dynamic = "force-dynamic";
export default async function UserPage({
  params,
  searchParams,
}: {
  params: Promise<{ identifier: string }>;
  searchParams: Promise<{ provider?: string }>;
}) {
  const identifier = decodeURIComponent((await params).identifier);
  const result = await getUser(identifier);
  if (!result)
    return (
      <EmptyState
        title="No user found."
        body="Check the identifier or try one of the demonstration profiles."
        action={
          <Link className="btn-primary" href="/users/01000000001">
            Try 01000000001
          </Link>
        }
      />
    );
  const raw = (await searchParams).provider;
  const provider = providers.includes(raw as Provider)
    ? (raw as Provider)
    : undefined;
  return (
    <UserProfileView
      activities={result.activities}
      initialProvider={provider}
    />
  );
}
