import { Suspense } from "react";
import { AuthForm } from "@/components/public/AuthForm";

export default function InfluencerLoginPage() {
  return (
    <Suspense>
      <AuthForm initialMode="login" initialRole="influencer" />
    </Suspense>
  );
}
