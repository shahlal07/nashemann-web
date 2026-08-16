"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, MessageCircle, Bug, LogOut, ArrowRight, Globe, Mail, Download, Trash2, X, ShieldAlert, Sparkles } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { getApplications, type StoredApplication } from "@/lib/application-store";
import { getAllBugReports, type BugReport } from "@/lib/bug-report-store";
import { formatDate } from "@/lib/utils";

const STATUS_TONE = { pending: "warning", approved: "success", rejected: "danger" } as const;
const BUG_STATUS_TONE = { pending: "warning", confirmed: "success", rejected: "danger" } as const;

type PlatformAccount = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  provider: string;
  created_at: string;
  onboarding_completed_at: string | null;
};

export default function AccountPage() {
  const router = useRouter();
  const [account, setAccount] = useState<PlatformAccount | null | "loading">("loading");
  const [applications, setApplications] = useState<StoredApplication[]>([]);
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [deleteStep, setDeleteStep] = useState<"idle" | "confirm" | "deleting">("idle");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setAccount(null);
        return;
      }
      const { data: acc } = await supabase
        .from("platform_accounts")
        .select("id, name, email, phone, provider, created_at, onboarding_completed_at")
        .eq("id", user.id)
        .single();
      setAccount(acc ?? null);
      if (acc) {
        setShowWelcome(!acc.onboarding_completed_at);
        const [apps, reports] = await Promise.all([getApplications(), getAllBugReports()]);
        setApplications(apps.filter((a) => a.ownerEmail.toLowerCase() === acc.email.toLowerCase()));
        setBugs(reports.filter((b) => b.reporterEmail.toLowerCase() === acc.email.toLowerCase()));
      }
    });
  }, []);

  async function dismissWelcome() {
    setShowWelcome(false);
    if (!account || account === "loading") return;
    const supabase = createClient();
    await supabase
      .from("platform_accounts")
      .update({ onboarding_completed_at: new Date().toISOString() })
      .eq("id", account.id);
  }

  async function exportData() {
    setExporting(true);
    setExportError(null);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Export failed" }));
        throw new Error(body?.error ?? "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nashemann-account-export-${account !== "loading" && account ? account.id : "me"}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  async function deleteAccount() {
    setDeleteStep("deleting");
    setDeleteError(null);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const body = await res.json().catch(() => ({ error: "Delete failed" }));
      if (!res.ok) throw new Error(body?.error ?? "Delete failed");
      router.push("/");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete account");
      setDeleteStep("confirm");
    }
  }

  if (account === "loading") return null;

  if (!account) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <p className="text-sm text-[var(--text-muted)]">You need an account to see this page.</p>
        <div className="mt-4 flex justify-center gap-3">
          <Link href="/login" className="rounded-full px-5 py-2.5 text-sm font-semibold text-black" style={{ background: "var(--accent-gradient)" }}>
            Log in
          </Link>
          <Link href="/signup" className="rounded-full border border-[var(--border-strong)] px-5 py-2.5 text-sm font-semibold text-[var(--text)]">
            Sign up
          </Link>
        </div>
      </div>
    );
  }

  function signOut() {
    const supabase = createClient();
    supabase.auth.signOut().then(() => router.push("/"));
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-14 lg:py-20">
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-6 overflow-hidden"
          >
            <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface)] p-4">
              <Sparkles size={18} className="mt-0.5 shrink-0 text-[var(--accent-violet)]" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--text)]">Welcome to Nashemann.</p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  Ready to sell?{" "}
                  <Link href="/apply" className="font-semibold text-[var(--accent-violet)] hover:underline">
                    Apply for your store
                  </Link>{" "}
                  or, if you already applied,{" "}
                  <Link href="/apply/track" className="font-semibold text-[var(--accent-violet)] hover:underline">
                    track your application
                  </Link>
                  .
                </p>
              </div>
              <button
                onClick={dismissWelcome}
                aria-label="Dismiss welcome message"
                className="shrink-0 text-[var(--text-faint)] hover:text-[var(--text)]"
              >
                <X size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--text-faint)]">Signed in as</p>
          <h1 className="font-display flex items-center gap-2 text-2xl font-semibold text-[var(--text)]">
            {account.name}
            {account.provider === "google" && <Globe size={16} className="text-[var(--text-faint)]" />}
          </h1>
          <p className="flex items-center gap-1 text-sm text-[var(--text-muted)]">
            <Mail size={13} /> {account.email}
          </p>
        </div>
        <button onClick={signOut} className="flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] px-3.5 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-hover)]">
          <LogOut size={13} /> Sign out
        </button>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TiltCard strength={4} className="p-5">
          <FileText size={18} className="text-[var(--accent-violet)]" />
          <p className="mt-2 text-sm font-semibold text-[var(--text)]">Your applications</p>
          <p className="mt-0.5 text-xs text-[var(--text-faint)]">{applications.length} submitted</p>
        </TiltCard>
        <Link href="/chat">
          <TiltCard strength={4} className="p-5">
            <MessageCircle size={18} className="text-[var(--accent-amber)]" />
            <p className="mt-2 text-sm font-semibold text-[var(--text)]">Talk to support</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--accent-violet)]">
              Open chat <ArrowRight size={11} />
            </p>
          </TiltCard>
        </Link>
        <Link href="/report-bug">
          <TiltCard strength={4} className="p-5">
            <Bug size={18} className="text-[var(--danger)]" />
            <p className="mt-2 text-sm font-semibold text-[var(--text)]">Report a bug</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--accent-violet)]">
              New report <ArrowRight size={11} />
            </p>
          </TiltCard>
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-[var(--text)]">Your applications</h2>
        <div className="mt-3 space-y-2">
          {applications.map((a) => (
            <TiltCard key={a.referenceId} strength={2} glare={false} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">{a.businessName}</p>
                <p className="text-xs text-[var(--text-faint)]">
                  {a.referenceId} · {formatDate(a.submittedAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge>
                <Link href={`/apply/track?ref=${a.referenceId}`} className="text-xs font-semibold text-[var(--accent-violet)] hover:underline">
                  Track
                </Link>
              </div>
            </TiltCard>
          ))}
          {applications.length === 0 && (
            <TiltCard strength={0} glare={false} className="p-6 text-center">
              <p className="text-sm text-[var(--text-faint)]">No applications yet.</p>
              <Link href="/apply" className="mt-2 inline-block text-sm font-semibold text-[var(--accent-violet)] hover:underline">
                Apply for your store
              </Link>
            </TiltCard>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-[var(--text)]">Your bug reports</h2>
        <div className="mt-3 space-y-2">
          {bugs.map((b) => (
            <TiltCard key={b.id} strength={2} glare={false} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">{b.title}</p>
                <p className="text-xs text-[var(--text-faint)]">{formatDate(b.createdAt)}</p>
              </div>
              <Badge tone={BUG_STATUS_TONE[b.status]}>{b.status}</Badge>
            </TiltCard>
          ))}
          {bugs.length === 0 && (
            <TiltCard strength={0} glare={false} className="p-6 text-center">
              <p className="text-sm text-[var(--text-faint)]">No bug reports yet.</p>
            </TiltCard>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display flex items-center gap-1.5 text-lg font-semibold text-[var(--text)]">
          <ShieldAlert size={17} className="text-[var(--text-faint)]" /> Privacy & data
        </h2>
        <p className="mt-1 text-xs text-[var(--text-faint)]">
          Download a copy of everything tied to your account, or permanently delete it.
        </p>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TiltCard strength={2} glare={false} className="p-5">
            <Download size={17} className="text-[var(--accent-violet)]" />
            <p className="mt-2 text-sm font-semibold text-[var(--text)]">Export my data</p>
            <p className="mt-0.5 text-xs text-[var(--text-faint)]">
              Your account, applications, bug reports, and support conversations as a JSON file.
            </p>
            {exportError && <p className="mt-2 text-xs text-[var(--danger)]">{exportError}</p>}
            <Button variant="secondary" size="sm" className="mt-3" onClick={exportData} disabled={exporting}>
              <Download size={13} /> {exporting ? "Preparing…" : "Download JSON"}
            </Button>
          </TiltCard>

          <TiltCard strength={2} glare={false} className="p-5 border-[rgba(251,113,133,0.25)]">
            <Trash2 size={17} className="text-[var(--danger)]" />
            <p className="mt-2 text-sm font-semibold text-[var(--text)]">Delete my account</p>
            <p className="mt-0.5 text-xs text-[var(--text-faint)]">
              Permanently deletes your sign-in and account record. Cannot be undone.
            </p>
            <Button variant="danger" size="sm" className="mt-3" onClick={() => setDeleteStep("confirm")}>
              <Trash2 size={13} /> Delete account
            </Button>
          </TiltCard>
        </div>
      </div>

      <AnimatePresence>
        {deleteStep !== "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5"
            onClick={() => deleteStep !== "deleting" && setDeleteStep("idle")}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-solid)] p-6"
            >
              <div className="flex items-center gap-2 text-[var(--danger)]">
                <ShieldAlert size={18} />
                <p className="font-display text-base font-semibold">Delete your account?</p>
              </div>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                This permanently deletes your Nashemann sign-in and account record. Applications you submitted are kept as
                anonymized business records; this cannot be undone.
              </p>
              {deleteError && <p className="mt-2 text-xs text-[var(--danger)]">{deleteError}</p>}
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setDeleteStep("idle")} disabled={deleteStep === "deleting"}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" onClick={deleteAccount} disabled={deleteStep === "deleting"}>
                  {deleteStep === "deleting" ? "Deleting…" : "Yes, delete permanently"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
