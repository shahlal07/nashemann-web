"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthForm } from "@/components/public/AuthForm";

type Role = "vendor" | "influencer" | "storefront";

function LoginPageContent() {
  const params = useSearchParams();
  const role = params.get("role");
  const initialRole = role === "vendor" || role === "influencer" || role === "storefront" ? role : undefined;
  return <AuthForm initialMode="login" initialRole={initialRole} />;
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
