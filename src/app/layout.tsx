import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ChatWidget } from "@/components/public/ChatWidget";
import { PromoPopup } from "@/components/public/PromoPopup";
import { OrganizationJsonLd } from "@/components/public/OrganizationJsonLd";
import { MotionProvider } from "@/components/public/MotionProvider";
import "./globals.css";

const SITE_URL = "https://nashemann-web.vercel.app";
const SITE_TITLE = "Nashemann — Give your shop a home online";
const SITE_DESCRIPTION =
  "Nashemann is the infrastructure behind independent online stores in Pakistan — your own branded storefront, real orders, and revenue you can see, live in days. Pay only when you sell.";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: "%s — Nashemann" },
  description: SITE_DESCRIPTION,
  applicationName: "Nashemann",
  keywords: ["Nashemann", "online store Pakistan", "ecommerce platform Pakistan", "branded storefront", "sell online Pakistan"],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Nashemann",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <MotionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ChatWidget />
          <PromoPopup />
        </MotionProvider>
        <OrganizationJsonLd />
      </body>
    </html>
  );
}
