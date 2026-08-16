import { SearchX } from "lucide-react";

export default function StoreNotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 py-24 text-center">
      <SearchX size={28} className="text-[var(--text-faint)]" />
      <h1 className="font-display mt-4 text-xl font-semibold text-[var(--text)]">Store not found</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        This address doesn&apos;t match a store on Nashemann, or the store isn&apos;t available right now.
      </p>
      <a
        href="https://nashemann.store"
        className="mt-6 inline-flex items-center justify-center rounded-[var(--radius-md)] px-4 py-2 text-sm font-semibold text-black"
        style={{ background: "var(--accent-gradient)" }}
      >
        Go to Nashemann
      </a>
    </div>
  );
}
