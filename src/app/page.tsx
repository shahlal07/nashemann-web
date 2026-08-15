import { Hero } from "@/components/public/sections/Hero";
import { HowItWorks } from "@/components/public/sections/HowItWorks";
import { Features } from "@/components/public/sections/Features";
import { RevenuePreview } from "@/components/public/sections/RevenuePreview";
import { PricingTeaser } from "@/components/public/sections/PricingTeaser";
import { Testimonials } from "@/components/public/sections/Testimonials";
import { RewardsTeaser } from "@/components/public/sections/RewardsTeaser";
import { FinalCta } from "@/components/public/sections/FinalCta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <RevenuePreview />
      <PricingTeaser />
      <Testimonials />
      <RewardsTeaser />
      <FinalCta />
    </>
  );
}
