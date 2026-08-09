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
    if (!result.activities.length && !result.failures.length) {
      const all = await getAllActivities(parsed.data);
      if (!all.activities.length) return fail("No user found.", 404);
    }
    const start = (query.page - 1) * query.limit;
    return ok(result.activities.slice(start, start + query.limit), {
      total: result.activities.length,
      page: query.page,
      limit: query.limit,
      pages: Math.ceil(result.activities.length / query.limit),
      providerFailures: result.failures,
    });
  } catch (error) {
    return safeError(error);
  }
}
