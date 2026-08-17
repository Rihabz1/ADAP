import { PageTitle } from "@/components/ui";
import { UsersDirectory } from "@/components/users-directory";
import { getDirectory } from "@/lib/users";
export const dynamic = "force-dynamic";
export default async function UsersPage() {
  const users = await getDirectory();
  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle
        eyebrow="User directory"
        title="Users"
      />
      <UsersDirectory users={users} />
    </div>
  );
}
