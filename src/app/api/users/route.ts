import { ok, safeError } from "@/lib/api";
import { getDirectory } from "@/lib/users";
export const runtime = "nodejs";
export async function GET() {
  try {
    return ok(await getDirectory());
  } catch (error) {
    return safeError(error);
  }
}
