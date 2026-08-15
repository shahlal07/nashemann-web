import type { Metadata } from "next";
import { StatusPageClient } from "./StatusPageClient";

const TITLE = "System Status — Nashemann";
const DESCRIPTION =
  "Current operational status of Nashemann's platform components — public website, vendor applications, dashboards, AI support chat, and payment processing.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/status" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
};

export default function StatusPage() {
  return <StatusPageClient />;
}
