import { Suspense } from "react";
import { AuthForm } from "@/components/public/AuthForm";

export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm initialMode="login" />
    </Suspense>
  );
}
