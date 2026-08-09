import { ok, safeError } from "@/lib/api";
import { adapters } from "@/lib/providers";
import type { Provider } from "@/lib/types";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    const fail = new URL(request.url).searchParams.get(
      "simulateProviderFailure",
    ) as Provider | null;
    const statuses = await Promise.all(
      adapters.map(async (adapter) =>
        process.env.NODE_ENV === "development" && adapter.provider === fail
          ? { ...(await adapter.getStatus()), status: "unavailable" as const }
          : adapter.getStatus(),
      ),
    );
    return ok(Object.fromEntries(statuses.map((s) => [s.provider, s])), {
      totalRecords: statuses.reduce((sum, s) => sum + s.records, 0),
    });
  } catch (error) {
    return safeError(error);
  }
}
