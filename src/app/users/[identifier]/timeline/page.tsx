import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TimelineLegacyPage({
  params,
}: {
  params: Promise<{ identifier: string }>;
}) {
  redirect(`/users/${encodeURIComponent((await params).identifier)}/profile`);
}
