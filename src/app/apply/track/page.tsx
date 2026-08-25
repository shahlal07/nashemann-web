"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { findApplication, type StoredApplication } from "@/lib/application-store";
import { formatDateTime } from "@/lib/utils";

const STEPS = [
  { key: "pending", label: "Submitted" },
  { key: "review", label: "Under review" },
  { key: "approved", label: "Approved & store live" },
] as const;

function statusStep(status: StoredApplication["status"]): number {
  if (status === "approved") return 2;
  if (status === "rejected") return 1;
  return 0;
}

type TrackMethod = "reference" | "contact";

function TrackContent() {
  const params = useSearchParams();
  const [method, setMethod] = useState<TrackMethod>("reference");
  const [query, setQuery] = useState(params.get("ref") ?? "");
  const [result, setResult] = useState<StoredApplication | null | "not-found">(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const ref = params.get("ref");
    if (!ref) return;
    findApplication(ref).then((found) => setResult(found ?? "not-found"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    const found = await findApplication(query);
    setResult(found ?? "not-found");
    setSearching(false);
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-16 lg:py-24">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
          Track your application
        </h1>
        <p className="mt-3 text-[var(--text-muted)]">
          {method === "reference" ? "Enter the reference ID you were given." : "Enter the email or phone you applied with."}
        </p>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {(
          [
            { id: "reference", label: "Reference ID" },
            { id: "contact", label: "Email or Phone" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => {
              setMethod(opt.id);
              setQuery("");
              setResult(null);
            }}
            className="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
            style={
              method === opt.id
                ? { background: "var(--accent-gradient)", color: "black" }
                : { border: "1px solid var(--border)", color: "var(--text-muted)" }
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch} className="mt-4 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 focus-within:border-[var(--accent-violet)]">
          <Search size={16} className="shrink-0 text-[var(--text-faint)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={method === "reference" ? "NSH-XXXXXX" : "you@business.pk or 0300-1234567"}
            className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="shrink-0 rounded-full px-5 py-3 text-sm font-semibold text-black disabled:opacity-60"
          style={{ background: "var(--accent-gradient)" }}
        >
          {searching ? <Loader2 size={16} className="animate-spin" /> : "Track"}
        </button>
      </form>

      {result === "not-found" && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center text-sm text-[var(--danger)]">
          No application found for that reference or email.
        </motion.p>
      )}

      {result && result !== "not-found" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <TiltCard strength={3} className="mt-8 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[var(--text-faint)]">{result.referenceId}</p>
                <h2 className="font-display mt-1 text-lg font-semibold text-[var(--text)]">{result.businessName}</h2>
              </div>
              {result.status === "approved" && <CheckCircle2 size={22} className="text-[var(--success)]" />}
              {result.status === "rejected" && <XCircle size={22} className="text-[var(--danger)]" />}
              {result.status === "pending" && <Clock size={22} className="text-[var(--warning)]" />}
            </div>

            <p className="mt-1 text-xs text-[var(--text-faint)]">Submitted {formatDateTime(result.submittedAt)}</p>

            {result.status === "rejected" ? (
              <div className="mt-6 rounded-[var(--radius-md)] bg-[var(--danger-bg)] p-4 text-sm text-[var(--danger)]">
                This application wasn&apos;t approved this time. Reach out via Contact if you&apos;d like feedback.
              </div>
            ) : (
              <div className="mt-6">
                <div className="relative flex justify-between">
                  <div className="absolute left-0 right-0 top-3 h-0.5 bg-[var(--border)]" />
                  <motion.div
                    className="absolute left-0 top-3 h-0.5"
                    style={{ background: "var(--accent-gradient)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(statusStep(result.status) / (STEPS.length - 1)) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                  {STEPS.map((step, i) => {
                    const reached = i <= statusStep(result.status);
                    return (
                      <div key={step.key} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`h-6 w-6 rounded-full border-2 ${reached ? "border-transparent" : "border-[var(--border-strong)] bg-[var(--surface-solid)]"}`}
                          style={reached ? { background: "var(--accent-gradient)" } : undefined}
                        />
                        <p className={`mt-2 max-w-[5rem] text-center text-[0.65rem] ${reached ? "text-[var(--text)]" : "text-[var(--text-faint)]"}`}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TiltCard>
        </motion.div>
      )}
    </div>
  );
}

export default function TrackApplicationPage() {
  return (
    <Suspense fallback={null}>
      <TrackContent />
    </Suspense>
  );
}
