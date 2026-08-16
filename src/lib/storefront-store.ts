import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

export type StorefrontVendor = {
  id: string;
  name: string;
  subdomain: string;
  category: string | null;
  city: string;
  description: string;
  themeAccentFrom: string;
  themeAccentTo: string;
  themeLogoEmoji: string;
  themeLogoUrl: string | null;
  themeFont: string;
  contactEmail: string | null;
  contactPhone: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
};

type VendorRow = {
  id: string;
  name: string;
  subdomain: string;
  category: string | null;
  city: string;
  description: string;
  theme_accent_from: string;
  theme_accent_to: string;
  theme_logo_emoji: string;
  theme_logo_url: string | null;
  theme_font: string;
  contact_email: string | null;
  contact_phone: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
};

const VENDOR_COLUMNS =
  "id, name, subdomain, category, city, description, theme_accent_from, theme_accent_to, theme_logo_emoji, theme_logo_url, theme_font, contact_email, contact_phone, instagram_url, youtube_url";

function mapVendor(row: VendorRow): StorefrontVendor {
  return {
    id: row.id,
    name: row.name,
    subdomain: row.subdomain,
    category: row.category,
    city: row.city,
    description: row.description,
    themeAccentFrom: row.theme_accent_from,
    themeAccentTo: row.theme_accent_to,
    themeLogoEmoji: row.theme_logo_emoji,
    themeLogoUrl: row.theme_logo_url,
    themeFont: row.theme_font,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    instagramUrl: row.instagram_url,
    youtubeUrl: row.youtube_url,
  };
}

export type StorefrontProductOption = {
  name: string;
  type: "multi_free_then_paid" | "single_choice";
  choices: string[];
  free_count?: number;
  extra_price_all?: number;
};

export type StorefrontProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  category: string | null;
  displayOrder: number;
  options: StorefrontProductOption[];
};

type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string | null;
  display_order: number;
  options: StorefrontProductOption[];
};

const PRODUCT_COLUMNS = "id, name, description, price, image_url, category, display_order, options";

function mapProduct(row: ProductRow): StorefrontProduct {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    imageUrl: row.image_url,
    category: row.category,
    displayOrder: row.display_order,
    options: row.options ?? [],
  };
}

export type VendorPaymentMethod = {
  id: string;
  method: "easypaisa" | "jazzcash" | "bank";
  accountName: string;
  accountNumber: string;
  qrCodeUrl: string | null;
};

type PaymentMethodRow = {
  id: string;
  method: "easypaisa" | "jazzcash" | "bank";
  account_name: string;
  account_number: string;
  qr_code_url: string | null;
};

const PAYMENT_METHOD_COLUMNS = "id, method, account_name, account_number, qr_code_url";

function mapPaymentMethod(row: PaymentMethodRow): VendorPaymentMethod {
  return {
    id: row.id,
    method: row.method,
    accountName: row.account_name,
    accountNumber: row.account_number,
    qrCodeUrl: row.qr_code_url,
  };
}

export async function getStorefrontBySlug(
  slug: string,
  client?: SupabaseClient
): Promise<{
  vendor: StorefrontVendor;
  products: StorefrontProduct[];
  paymentMethods: VendorPaymentMethod[];
} | null> {
  const supabase = client ?? createClient();

  const { data: vendorRow, error: vendorError } = await supabase
    .from("vendors")
    .select(VENDOR_COLUMNS)
    .eq("subdomain", slug)
    .eq("status", "active")
    .maybeSingle();

  if (vendorError || !vendorRow) return null;
  const vendor = mapVendor(vendorRow as VendorRow);

  const [{ data: productRows }, { data: paymentRows }] = await Promise.all([
    supabase
      .from("storefront_products")
      .select(PRODUCT_COLUMNS)
      .eq("vendor_id", vendor.id)
      .eq("active", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("vendor_payment_methods")
      .select(PAYMENT_METHOD_COLUMNS)
      .eq("vendor_id", vendor.id)
      .eq("active", true),
  ]);

  return {
    vendor,
    products: ((productRows as ProductRow[] | null) ?? []).map(mapProduct),
    paymentMethods: ((paymentRows as PaymentMethodRow[] | null) ?? []).map(mapPaymentMethod),
  };
}

export async function uploadPaymentScreenshot(file: File): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `payment-proofs/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("storefront-uploads").upload(path, file);
  if (error) return null;
  const { data } = supabase.storage.from("storefront-uploads").getPublicUrl(path);
  return data.publicUrl;
}

export type StorefrontOrderItem = {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  selectedOptions: { groupName: string; choices: string[]; extraCharge: number }[];
  lineTotal: number;
};

export async function submitStorefrontOrder(input: {
  vendorId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: StorefrontOrderItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentScreenshotUrl: string | null;
}): Promise<string> {
  const supabase = createClient();
  const id = crypto.randomUUID();

  const { error } = await supabase.from("storefront_orders").insert({
    id,
    vendor_id: input.vendorId,
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    customer_address: input.customerAddress,
    items: input.items,
    total_amount: input.totalAmount,
    payment_method: input.paymentMethod,
    payment_screenshot_url: input.paymentScreenshotUrl,
    status: "pending",
  });

  if (error) throw error;
  return id;
}

export const STOREFRONT_MIN_ORDER_ITEMS = 5;
export const STOREFRONT_MIN_ORDER_AMOUNT = 1000;
