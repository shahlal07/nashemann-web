"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileText, MessageCircle, Bug, LogOut, ArrowRight, Globe, Mail } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { Badge } from "@/components/ui/Badge";
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
};

export default function AccountPage() {
  const router = useRouter();
  const [account, setAccount] = useState<PlatformAccount | null | "loading">("loading");
  const [applications, setApplications] = useState<StoredApplication[]>([]);
  const [bugs, setBugs] = useState<BugReport[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setAccount(null);
        return;
      }
      const { data: acc } = await supabase
        .from("platform_accounts")
        .select("id, name, email, phone, provider, created_at")
        .eq("id", user.id)
        .single();
      setAccount(acc ?? null);
      if (acc) {
        const [apps, reports] = await Promise.all([getApplications(), getAllBugReports()]);
        setApplications(apps.filter((a) => a.ownerEmail.toLowerCase() === acc.email.toLowerCase()));
        setBugs(reports.filter((b) => b.reporterEmail.toLowerCase() === acc.email.toLowerCase()));
      }
    });
  }, []);

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
    </div>
  );
}
