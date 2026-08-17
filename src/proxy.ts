import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_ROOT_DOMAIN || "nashemann.store";

function resolveHostname(request: NextRequest): string {
  return (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
}

/**
 * Nashemann-web is the platform/public website only. Vendor storefronts are
 * served by the shared vendor storefront deployment (theaamghar-web), using
 * their assigned host such as theaamghar.nashemann.store. This app must never
 * become a marketplace router or render a vendor storefront under /store/*.
 */
export async function proxy(request: NextRequest) {
  const hostname = resolveHostname(request);
  const isPlatformHost =
    hostname === ROOT_DOMAIN ||
    hostname === `www.${ROOT_DOMAIN}` ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".vercel.app");

  if (isPlatformHost) {
    return await updateSession(request);
  }

  // A vendor hostname should be attached to the vendor storefront Vercel
  // project, not this project. If a request lands here anyway, do not rewrite
  // it into a platform-owned storefront. A hard 404 keeps the boundary clear.
  return new NextResponse("Not Found", { status: 404 });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
