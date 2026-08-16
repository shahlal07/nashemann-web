"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Route-segment error boundary. Catches any render/data-fetch throw below
 * the root layout (so Navbar/Footer still render around this) and gives the
 * visitor a real recovery action instead of Next.js's default blank crash
 * screen.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 py-24 text-center">
      <AlertTriangle size={28} className="text-[var(--danger)]" />
      <h1 className="font-display mt-4 text-xl font-semibold text-[var(--text)]">Something went wrong</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        This page hit an unexpected error. You can try again, or head back home.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="primary" size="sm" onClick={() => reset()}>
          <RotateCw size={13} /> Try again
        </Button>
        <Link href="/">
          <Button variant="secondary" size="sm">
            Go home
          </Button>
        </Link>
      </div>
    </div>
  );
}
