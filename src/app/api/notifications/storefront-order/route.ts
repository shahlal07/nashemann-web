import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendStorefrontOrderCustomerEmail, sendStorefrontOrderVendorEmail } from "@/lib/email";

type Body = {
  vendorId?: string;
  orderId?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerEmail?: string;
  items?: { name: string; qty: number; unitPrice: number }[];
  totalAmount?: number;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Fired right after /store/[slug] successfully inserts a storefront_orders
 * row. storefront_orders has no public SELECT policy (only staff / the
 * owning vendor_admin), so an anonymous customer can't be handed a session
 * that reads their own just-placed order back -- the order fields are taken
 * from the request body instead, same trust level as the public insert
 * itself. The vendor's notification address is never taken from the client
 * though: it's looked up from the `vendors` row (public-read for active
 * vendors), so this route can't be used to spam an arbitrary "vendor" inbox.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Body;
  const { vendorId, orderId, customerName, customerPhone, customerAddress, customerEmail, items, totalAmount } = body;

  if (!vendorId || !orderId || !customerName || !customerPhone || !customerAddress || !items || totalAmount == null) {
    return NextResponse.json({ error: "Missing order fields" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: vendor } = await supabase
    .from("vendors")
    .select("name, subdomain, contact_email")
    .eq("id", vendorId)
    .eq("status", "active")
    .maybeSingle();

  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

  const sends: Promise<void>[] = [];

  if (vendor.contact_email) {
    sends.push(
      sendStorefrontOrderVendorEmail({
        to: vendor.contact_email,
        vendorName: vendor.name,
        vendorSubdomain: vendor.subdomain,
        orderId,
        customerName,
        customerPhone,
        customerAddress,
        items,
        totalAmount,
      })
    );
  }

  if (customerEmail && EMAIL_PATTERN.test(customerEmail.trim())) {
    sends.push(
      sendStorefrontOrderCustomerEmail({
        to: customerEmail.trim(),
        customerName,
        vendorName: vendor.name,
        orderId,
        items,
        totalAmount,
      })
    );
  }

  await Promise.all(sends);

  return NextResponse.json({ success: true });
}
