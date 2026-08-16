"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bug, CheckCircle2, Gift } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { ImageUpload } from "@/components/public/ImageUpload";
import { submitBugReport } from "@/lib/bug-report-store";

const inputClass =
  "w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-faint)] focus:border-[var(--accent-violet)] accent-ring";
const labelClass = "mb-1.5 block text-xs font-medium text-[var(--text-muted)]";

const SEVERITIES = [
  { id: "low", label: "Minor", desc: "Cosmetic, doesn't block anything" },
  { id: "medium", label: "Annoying", desc: "Works around it, but frustrating" },
  { id: "high", label: "Blocking", desc: "Can't complete something important" },
];

export default function ReportBugPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [severity, setSeverity] = useState("medium");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      const title = String(formData.get("title") ?? "").slice(0, 80) || "Bug report";
      const reporterName = String(formData.get("name") ?? "");
      const reporterEmail = String(formData.get("email") ?? "");
      await submitBugReport({
        title,
        description: String(formData.get("description") ?? ""),
        reporterName,
        reporterEmail,
        screenshotFile,
      });
      setSent(true);
      fetch("/api/notifications/bug-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, reporterName, reporterEmail }),
      }).catch(() => {});
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 lg:py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(251,113,133,0.14)] px-3 py-1 text-xs font-semibold text-[var(--danger)]">
          <Bug size={13} /> Bug report
        </span>
        <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
          Something broken? Tell us.
        </h1>
        <p className="mt-3 text-[var(--text-muted)]">Every report goes straight to the team building Nashemann — no ticket queue.</p>
        <p className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full bg-[rgba(52,211,153,0.12)] px-3.5 py-2 text-xs font-semibold text-[var(--success)]">
          <Gift size={13} /> Confirmed bugs earn you Rs 500 in platform credit
        </p>
      </motion.div>

      <TiltCard strength={2} glare={false} className="mt-10 p-7 sm:p-8">
        {sent ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-8 text-center">
            <CheckCircle2 size={36} className="text-[var(--success)]" />
            <p className="mt-3 font-semibold text-[var(--text)]">Report submitted — thank you</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              We&apos;ll review it and follow up if we need more details. If it&apos;s confirmed, Rs 500 credit lands on your account automatically.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className={labelClass}>What happened?</span>
              <input name="title" required placeholder="Short summary" className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Details</span>
              <textarea name="description" required rows={4} placeholder="The more detail, the faster we can fix it." className={inputClass} />
            </label>

            <ImageUpload
              label="Screenshot (optional)"
              hint="Helps a lot — the admin team can see exactly what you saw."
              aspect="wide"
              onFileSelected={(file) => setScreenshotFile(file)}
            />

            <div>
              <span className={labelClass}>How bad is it?</span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {SEVERITIES.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setSeverity(s.id)}
                    className={`rounded-[var(--radius-md)] border p-3 text-left transition-colors ${
                      severity === s.id ? "border-[var(--accent-violet)]" : "border-[var(--border)] hover:border-[var(--border-strong)]"
                    }`}
                    style={severity === s.id ? { background: "var(--accent-gradient-soft)" } : undefined}
                  >
                    <p className="text-xs font-semibold text-[var(--text)]">{s.label}</p>
                    <p className="mt-0.5 text-[0.65rem] text-[var(--text-faint)]">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>Your name</span>
                <input name="name" className={inputClass} />
              </label>
              <label className="block">
                <span className={labelClass}>Your email (so we can credit your account)</span>
                <input name="email" type="email" className={inputClass} />
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full py-3.5 text-sm font-semibold text-black shadow-[var(--shadow-glow-violet)] disabled:opacity-60"
              style={{ background: "var(--accent-gradient)" }}
            >
              {submitting ? "Submitting…" : "Submit report"}
            </button>
          </form>
        )}
      </TiltCard>
    </div>
  );
}
