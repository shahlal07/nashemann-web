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
// A stale JS chunk reference (the page was open, or served from a slow/flaky
// connection's cache, across a production deploy that replaced the build)
// fails with one of these -- React's own reset() can't fix it since the
// chunk URL itself is gone, only a real reload re-fetches the current
// build's HTML/JS. Slow mobile networks hit this far more than desktop:
// more time for a deploy to land mid-session, more chance of a flaky
// chunk fetch to begin with. This was very likely the actual cause behind
// reports of "something went wrong" on client phones during today's
// unusually high number of production deploys.
function isChunkLoadError(error: Error): boolean {
  return (
    error.name === "ChunkLoadError" ||
    /Loading chunk [\d]+ failed|Failed to fetch dynamically imported module|Importing a module script failed/i.test(
      error.message
    )
  );
}

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    if (isChunkLoadError(error)) {
      // Guard against a reload loop if the deploy itself is somehow broken --
      // one automatic retry, then fall through to the manual "Try again" UI.
      const key = "nashemann_chunk_reload_attempted";
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 py-24 text-center">
      <AlertTriangle size={28} className="text-[var(--danger)]" />
      <h1 className="font-display mt-4 text-xl font-semibold text-[var(--text)]">Something went wrong</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        This page hit an unexpected error. You can try again, or head back home.
      </p>
      <div className="mt-6 flex gap-3">
        <Button
          variant="primary"
          size="sm"
          onClick={() => (isChunkLoadError(error) ? window.location.reload() : reset())}
        >
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
