import { RidersDirectory } from "@/components/riders-directory";
import { PageTitle } from "@/components/ui";
import { getRiderDirectory } from "@/lib/riders";

export const dynamic = "force-dynamic";

export default async function RidersPage() {
  const riders = await getRiderDirectory();
  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle
        eyebrow="Provider workforce"
        title="Riders"
        description="Rider profiles, vehicle details, status, ratings, primary areas, delivery and ride history across Foodi, Pathao, Rokomari, and Steadfast."
      />
      <RidersDirectory riders={riders} />
    </div>
  );
}
