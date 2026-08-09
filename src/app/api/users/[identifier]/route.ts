import { fail, identifierSchema, ok, safeError } from "@/lib/api";
import { calculateAnalytics } from "@/lib/analytics";
import { getUser } from "@/lib/users";
export const runtime = "nodejs";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ identifier: string }> },
) {
  try {
    const parsed = identifierSchema.safeParse(
      decodeURIComponent((await params).identifier),
    );
    if (!parsed.success) return fail(parsed.error.issues[0].message);
    const result = await getUser(parsed.data);
    if (!result) return fail("No user found.", 404);
    return ok(
      {
        ...result.user,
        analytics: calculateAnalytics(result.activities),
        providerCounts: calculateAnalytics(result.activities).byProvider,
      },
      { providerFailures: result.failures },
    );
  } catch (error) {
    return safeError(error);
  }
}
