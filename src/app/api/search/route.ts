import { phoneSearchSchema, fail, ok, safeError } from "@/lib/api";
import { getUser } from "@/lib/users";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    const parsed = phoneSearchSchema.safeParse(
      new URL(request.url).searchParams.get("query") ?? "",
    );
    if (!parsed.success) return fail(parsed.error.issues[0].message);
    const result = await getUser(parsed.data);
    if (!result) return fail("No user found.", 404);
    return ok(result.user, { activeProviders: 4 });
  } catch (error) {
    return safeError(error);
  }
}
