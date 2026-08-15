import { Suspense } from "react";
import { AuthForm } from "@/components/public/AuthForm";

export default function VendorLoginPage() {
  return (
    <Suspense>
      <AuthForm initialMode="login" initialRole="storefront" />
    </Suspense>
  );
}
