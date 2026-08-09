import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  // Demonstration gate only. Replace it with a production identity provider before real deployment.
  if (request.cookies.get("adap_session")?.value !== "analyst")
    return NextResponse.redirect(
      new URL(
        `/login?next=${encodeURIComponent(request.nextUrl.pathname)}`,
        request.url,
      ),
    );
  return NextResponse.next();
}
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/users/:path*",
    "/cases/:path*",
    "/geofences/:path*",
    "/audit/:path*",
    "/data-sources/:path*",
  ],
};
