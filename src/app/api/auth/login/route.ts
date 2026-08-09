import { NextResponse } from "next/server";
import { z } from "zod";
const credentials = z.object({ username: z.string(), password: z.string() });
export async function POST(request: Request) {
  const result = credentials.safeParse(await request.json().catch(() => null));
  if (
    !result.success ||
    result.data.username !== "analyst" ||
    result.data.password !== "adap123"
  )
    return NextResponse.json(
      { success: false, error: { message: "Invalid credentials" } },
      { status: 401 },
    );
  const response = NextResponse.json({
    success: true,
    data: { username: "analyst" },
  });
  response.cookies.set("adap_session", "analyst", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  return response;
}
