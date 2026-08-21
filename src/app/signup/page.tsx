import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthForm } from "@/components/public/AuthForm";

type Role = "vendor" | "influencer";

function SignupPageContent() {
  const params = useSearchParams();
  const role = params.get("role");
  const initialRole = role === "vendor" || role === "influencer" ? role : undefined;
  return <AuthForm initialMode="signup" initialRole={initialRole} />;
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupPageContent />
    </Suspense>
  );
}
