import { fail, identifierSchema, ok, safeError } from "@/lib/api";
import { latestActivity } from "@/lib/activity";
import { getAllActivities } from "@/lib/providers";
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
    const result = await getAllActivities(parsed.data);
    const latest = latestActivity(result.activities);
    if (!latest) return fail("No user found.", 404);
    return ok(latest, { providerFailures: result.failures });
  } catch (error) {
    return safeError(error);
  }
}
