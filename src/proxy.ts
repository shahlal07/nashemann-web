import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { updateSession } from "@/lib/supabase/middleware";

const ROOT_DOMAIN = "nashemann.store";

function resolveHostname(request: NextRequest): string {
  const host = request.headers.get("host") ?? "";
  return host.split(":")[0].toLowerCase();
}

async function lookupActiveVendorSlug(slug: string): Promise<boolean> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const { data } = await supabase.from("vendors").select("id").eq("subdomain", slug).maybeSingle();
  return !!data;
}

function storeNotFoundResponse(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/store-not-found";
  return NextResponse.rewrite(url);
}

export async function proxy(request: NextRequest) {
  const hostname = resolveHostname(request);

  const isPlatformHost = hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}` || !hostname.endsWith(`.${ROOT_DOMAIN}`);
  if (isPlatformHost) {
    return await updateSession(request);
  }

  const subdomain = hostname.slice(0, -(ROOT_DOMAIN.length + 1));
  const labels = subdomain.split(".");

  if (labels.length === 2 && labels[0] === "admin") {
    const slug = labels[1];
    const exists = await lookupActiveVendorSlug(slug);
    if (!exists) return storeNotFoundResponse(request);

    if (request.nextUrl.pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/vendor/dashboard";
      return await updateSession(request, url);
    }
    return await updateSession(request);
  }

  if (labels.length === 1) {
    const slug = labels[0];
    const exists = await lookupActiveVendorSlug(slug);
    if (!exists) return storeNotFoundResponse(request);

    if (request.nextUrl.pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = `/store/${slug}`;
      return NextResponse.rewrite(url);
    }
    return await updateSession(request);
  }

  return storeNotFoundResponse(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
