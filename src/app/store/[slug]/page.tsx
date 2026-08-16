import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStorefrontBySlug } from "@/lib/storefront-store";
import { StorefrontClient } from "./StorefrontClient";

export async function generateMetadata(props: PageProps<"/store/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const supabase = await createClient();
  const data = await getStorefrontBySlug(slug, supabase);
  if (!data) return {};
  const { vendor } = data;
  return {
    title: vendor.name,
    description: vendor.description,
    alternates: { canonical: `/store/${vendor.subdomain}` },
    openGraph: {
      title: vendor.name,
      description: vendor.description,
      type: "website",
      images: vendor.themeLogoUrl ? [vendor.themeLogoUrl] : undefined,
    },
  };
}

export default async function StorePage(props: PageProps<"/store/[slug]">) {
  const { slug } = await props.params;
  const supabase = await createClient();
  const data = await getStorefrontBySlug(slug, supabase);
  if (!data) notFound();

  return <StorefrontClient vendor={data.vendor} products={data.products} paymentMethods={data.paymentMethods} />;
}
