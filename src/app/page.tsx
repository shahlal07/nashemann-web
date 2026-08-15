import { Hero } from "@/components/public/sections/Hero";
import { VendorShowcase } from "@/components/public/sections/VendorShowcase";
import { HowItWorks } from "@/components/public/sections/HowItWorks";
import { Features } from "@/components/public/sections/Features";
import { RevenuePreview } from "@/components/public/sections/RevenuePreview";
import { PricingTeaser } from "@/components/public/sections/PricingTeaser";
import { Testimonials } from "@/components/public/sections/Testimonials";
import { RewardsTeaser } from "@/components/public/sections/RewardsTeaser";
import { FAQ } from "@/components/public/sections/FAQ";
import { FinalCta } from "@/components/public/sections/FinalCta";
import { FaqJsonLd } from "@/components/public/FaqJsonLd";

export default function HomePage() {
  return (
    <>
      <Hero />
      <VendorShowcase />
      <HowItWorks />
      <Features />
      <RevenuePreview />
      <PricingTeaser />
      <Testimonials />
      <RewardsTeaser />
      <FAQ />
      <FinalCta />
      <FaqJsonLd />
    </>
  );
}
