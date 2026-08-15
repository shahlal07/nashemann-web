import type { Metadata } from "next";
import { PricingCalculatorClient } from "./PricingCalculatorClient";

const TITLE = "Pricing Calculator — Pay-Per-Order vs Monthly";
const DESCRIPTION =
  "Estimate your monthly Nashemann platform cost. Enter your expected order volume and instantly compare the Pay-Per-Order plan against the flat Monthly plan to see which is cheaper.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/pricing-calculator" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
};

export default function PricingCalculatorPage() {
  return <PricingCalculatorClient />;
}
