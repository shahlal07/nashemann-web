import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 py-24 text-center">
      <Compass size={28} className="text-[var(--text-faint)]" />
      <h1 className="font-display mt-4 text-xl font-semibold text-[var(--text)]">Page not found</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className="mt-6">
        <Button variant="primary" size="sm">
          Go home
        </Button>
      </Link>
    </div>
  );
}
