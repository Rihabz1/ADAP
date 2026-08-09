import { toLocations } from "@/lib/activity";
import { fail, identifierSchema, ok, parseFilters, safeError } from "@/lib/api";
import { getAllActivities } from "@/lib/providers";
export const runtime = "nodejs";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ identifier: string }> },
) {
  try {
    const parsed = identifierSchema.safeParse(
      decodeURIComponent((await params).identifier),
    );
    if (!parsed.success) return fail(parsed.error.issues[0].message);
    const query = parseFilters(request);
    if ("error" in query)
      return fail(query.error ?? "Invalid query parameters");
    const result = await getAllActivities(
      parsed.data,
      query.filters,
      query.simulateProviderFailure,
    );
    if (!result.activities.length) {
      const all = await getAllActivities(parsed.data);
      if (!all.activities.length) return fail("No user found.", 404);
    }
    const locations = toLocations(result.activities);
    return ok(locations.slice(0, 400), {
      total: locations.length,
      providerFailures: result.failures,
    });
  } catch (error) {
    return safeError(error);
  }
}
