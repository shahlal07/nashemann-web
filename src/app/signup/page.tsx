import { Suspense } from "react";
import { AuthForm } from "@/components/public/AuthForm";

export default function SignupPage() {
  return (
    <Suspense>
      <AuthForm initialMode="signup" />
    </Suspense>
  );
}
