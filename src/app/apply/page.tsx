"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Copy, ArrowRight, Layers, UserCheck, Loader2, Check, X } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { ImageUpload } from "@/components/public/ImageUpload";
import {
  saveApplication,
  savePendingApplication,
  getPendingApplication,
  clearPendingApplication,
  isValidSubdomainFormat,
  isValidEmailFormat,
  isValidPakPhoneFormat,
  isSubdomainTaken,
  type StoredApplication,
  type PendingApplication,
} from "@/lib/application-store";
import { createClient } from "@/lib/supabase/client";
import { getCategorySchemas, type CategoryProductSchema } from "@/lib/mock-data";

const inputClass =
  "w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-faint)] focus:border-[var(--accent-violet)] accent-ring";
const labelClass = "mb-1.5 block text-xs font-medium text-[var(--text-muted)]";

export default function ApplyPage() {
  return (
    <Suspense>
      <ApplyPageInner />
    </Suspense>
  );
}

function ApplyPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref") ?? undefined;
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<StoredApplication | null>(null);
  const [plan, setPlan] = useState<"per_order" | "monthly">("per_order");
  const [copied, setCopied] = useState(false);
  const [category, setCategory] = useState<string>("");
  const [draft, setDraft] = useState<PendingApplication | null>(null);
  const [resumed, setResumed] = useState(false);
  const [schemas, setSchemas] = useState<CategoryProductSchema[]>([]);
  const schema = schemas.find((s) => s.category === category) ?? null;

  const [emailValue, setEmailValue] = useState(draft?.ownerEmail ?? "");
  const [phoneValue, setPhoneValue] = useState(draft?.ownerPhone ?? "");
  const [subdomainValue, setSubdomainValue] = useState(draft?.subdomain ?? "");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [checkedSubdomain, setCheckedSubdomain] = useState<{ value: string; result: "checking" | "available" | "taken" } | null>(null);
  const subdomainCheckId = useRef(0);

  const subdomainTrimmed = subdomainValue.trim().toLowerCase();
  const subdomainFormatError =
    subdomainTrimmed && !isValidSubdomainFormat(subdomainTrimmed)
      ? "Only lowercase letters, numbers, and hyphens (no leading/trailing hyphen), 3-40 characters."
      : null;
  const subdomainStatus: "idle" | "checking" | "available" | "taken" =
    !subdomainTrimmed || subdomainFormatError || checkedSubdomain?.value !== subdomainTrimmed ? "idle" : checkedSubdomain.result;

  useEffect(() => {
    getCategorySchemas().then(setSchemas);
  }, []);

  useEffect(() => {
    if (!subdomainTrimmed || !isValidSubdomainFormat(subdomainTrimmed)) return;
    const myCheck = ++subdomainCheckId.current;
    const timer = setTimeout(() => {
      setCheckedSubdomain({ value: subdomainTrimmed, result: "checking" });
      isSubdomainTaken(subdomainTrimmed).then((taken) => {
        if (subdomainCheckId.current !== myCheck) return;
        setCheckedSubdomain({ value: subdomainTrimmed, result: taken ? "taken" : "available" });
      });
    }, 450);
    return () => clearTimeout(timer);
  }, [subdomainTrimmed]);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!active) return;
      const pending = getPendingApplication();
      if (pending && user) {
        setDraft(pending);
        setCategory(pending.category);
        setPlan(pending.plan);
        setEmailValue(pending.ownerEmail);
        setPhoneValue(pending.ownerPhone);
        setSubdomainValue(pending.subdomain);
        setResumed(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const subdomain = subdomainValue.trim().toLowerCase();

    const emailOk = isValidEmailFormat(emailValue);
    const phoneOk = isValidPakPhoneFormat(phoneValue);
    const subdomainFormatOk = isValidSubdomainFormat(subdomain);
    setEmailError(emailOk ? null : "Enter a valid email address.");
    setPhoneError(phoneOk ? null : "Enter a valid Pakistani mobile number (e.g. 0300-1234567).");

    if (!emailOk || !phoneOk || !subdomainFormatOk) return;

    if (subdomainStatus === "checking") return;
    if (subdomainStatus !== "available") {
      const taken = await isSubdomainTaken(subdomain);
      setCheckedSubdomain({ value: subdomain, result: taken ? "taken" : "available" });
      if (taken) return;
    }

    const fields: PendingApplication = {
      businessName: String(formData.get("businessName") ?? ""),
      category: String(formData.get("category") ?? ""),
      city: String(formData.get("city") ?? ""),
      ownerName: String(formData.get("ownerName") ?? ""),
      ownerEmail: emailValue,
      ownerPhone: phoneValue,
      subdomain,
      plan,
      message: String(formData.get("message") ?? ""),
      referralCode: draft?.referralCode ?? referralCode,
    };

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      savePendingApplication(fields);
      router.push("/signup?returnTo=/apply");
      return;
    }

    setSubmitting(true);
    try {
      const record = await saveApplication({
        businessName: fields.businessName,
        category: fields.category,
        city: fields.city,
        ownerName: fields.ownerName,
        ownerEmail: fields.ownerEmail,
        ownerPhone: fields.ownerPhone,
        subdomain: fields.subdomain,
        plan,
        message: fields.message,
        referralCode: fields.referralCode,
      });
      clearPendingApplication();
      setResult(record);
    } finally {
      setSubmitting(false);
    }
  }

  function copyRef() {
    if (!result) return;
    navigator.clipboard?.writeText(result.referenceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 lg:py-24">
      {result ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "var(--accent-gradient)" }}
            >
              <CheckCircle2 size={30} className="text-black" />
            </motion.div>
            <h1 className="font-display mt-5 text-2xl font-semibold text-[var(--text)]">Application submitted!</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              We&apos;ll review {result.businessName} within 24 hours. Save your reference ID to track it anytime.
            </p>

            <button
              onClick={copyRef}
              className="glass-panel mx-auto mt-6 flex items-center gap-3 rounded-[var(--radius-md)] px-5 py-3.5"
            >
              <span className="font-display text-lg font-bold tracking-wider text-[var(--text)]">{result.referenceId}</span>
              <Copy size={15} className="text-[var(--text-faint)]" />
              {copied && <span className="text-xs text-[var(--success)]">Copied!</span>}
            </button>

            <div className="mt-8 flex justify-center gap-3">
              <Link
                href={`/apply/track?ref=${result.referenceId}`}
                className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-black"
                style={{ background: "var(--accent-gradient)" }}
              >
                Track my application <ArrowRight size={14} />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center rounded-full border border-[var(--border-strong)] px-5 py-2.5 text-sm font-semibold text-[var(--text)]"
              >
                Back home
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-center">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
                Apply for your <span className="accent-text">store</span>
              </h1>
              <p className="mt-3 text-[var(--text-muted)]">Takes about 3 minutes. We&apos;ll get back to you within 24 hours.</p>
            </div>

            <TiltCard strength={2} glare={false} className="mt-10 p-7 sm:p-8">
              {resumed && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 flex items-center gap-2 rounded-full bg-[var(--surface-hover)] px-4 py-2.5 text-xs font-medium text-[var(--text-muted)]"
                >
                  <UserCheck size={14} className="text-[var(--accent-violet)]" /> Welcome back — your application was saved. Just hit submit to finish.
                </motion.p>
              )}
              <form key={draft ? "resumed" : "fresh"} onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className={labelClass}>Business name</span>
                    <input name="businessName" required defaultValue={draft?.businessName} placeholder="e.g. Sabz Basket" className={inputClass} />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className={labelClass}>Category</span>
                    <select
                      name="category"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={inputClass}
                    >
                      <option value="" disabled>
                        Choose one
                      </option>
                      {schemas.map((s) => (
                        <option key={s.category} value={s.category}>
                          {s.category}
                        </option>
                      ))}
                    </select>
                    {schema && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-3"
                      >
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-violet)]">
                          <Layers size={12} /> Your product settings will include:
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-faint)]">{schema.note}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {schema.fields.map((f) => (
                            <span
                              key={f}
                              className="rounded-full bg-[var(--surface-hover)] px-2 py-0.5 text-[0.65rem] text-[var(--text-muted)]"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </label>
                  <label className="block">
                    <span className={labelClass}>City</span>
                    <input name="city" required defaultValue={draft?.city} placeholder="e.g. Lahore" className={inputClass} />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Your name</span>
                    <input name="ownerName" required defaultValue={draft?.ownerName} className={inputClass} />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Email</span>
                    <input
                      name="ownerEmail"
                      required
                      type="email"
                      value={emailValue}
                      onChange={(e) => setEmailValue(e.target.value)}
                      onBlur={() => setEmailError(emailValue && !isValidEmailFormat(emailValue) ? "Enter a valid email address." : null)}
                      className={inputClass}
                    />
                    {emailError && <p className="mt-1.5 text-xs text-[var(--danger)]">{emailError}</p>}
                  </label>
                  <label className="block">
                    <span className={labelClass}>Phone</span>
                    <input
                      name="ownerPhone"
                      required
                      value={phoneValue}
                      onChange={(e) => setPhoneValue(e.target.value)}
                      onBlur={() => setPhoneError(phoneValue && !isValidPakPhoneFormat(phoneValue) ? "Enter a valid Pakistani mobile number (e.g. 0300-1234567)." : null)}
                      placeholder="03XX-XXXXXXX"
                      className={inputClass}
                    />
                    {phoneError && <p className="mt-1.5 text-xs text-[var(--danger)]">{phoneError}</p>}
                  </label>
                  <label className="block">
                    <span className={labelClass}>Preferred subdomain</span>
                    <div
                      className={`flex items-center overflow-hidden rounded-[var(--radius-sm)] border bg-[var(--surface)] focus-within:border-[var(--accent-violet)] ${
                        subdomainStatus === "taken" || subdomainFormatError ? "border-[var(--danger)]" : "border-[var(--border)]"
                      }`}
                    >
                      <input
                        name="subdomain"
                        required
                        value={subdomainValue}
                        onChange={(e) => setSubdomainValue(e.target.value.toLowerCase())}
                        placeholder="sabz-basket"
                        className="w-full bg-transparent px-4 py-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
                      />
                      <span className="flex shrink-0 items-center gap-1.5 pr-3 text-xs text-[var(--text-faint)]">
                        {subdomainStatus === "checking" && <Loader2 size={13} className="animate-spin" />}
                        {subdomainStatus === "available" && <Check size={13} className="text-[var(--success)]" />}
                        {subdomainStatus === "taken" && <X size={13} className="text-[var(--danger)]" />}
                        .nashemann.com
                      </span>
                    </div>
                    {subdomainFormatError && <p className="mt-1.5 text-xs text-[var(--danger)]">{subdomainFormatError}</p>}
                    {!subdomainFormatError && subdomainStatus === "taken" && (
                      <p className="mt-1.5 text-xs text-[var(--danger)]">That subdomain is already taken — try another.</p>
                    )}
                    {!subdomainFormatError && subdomainStatus === "available" && (
                      <p className="mt-1.5 text-xs text-[var(--success)]">Available.</p>
                    )}
                  </label>
                </div>

                <div>
                  <span className={labelClass}>Which plan sounds right?</span>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(
                      [
                        { id: "per_order" as const, title: "Pay Per Order", desc: "Rs 15/order, no upfront cost" },
                        { id: "monthly" as const, title: "Monthly", desc: "Rs 7,000/month, unlimited orders" },
                      ]
                    ).map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setPlan(p.id)}
                        className={`rounded-[var(--radius-md)] border p-4 text-left transition-colors ${
                          plan === p.id ? "border-[var(--accent-violet)]" : "border-[var(--border)] hover:border-[var(--border-strong)]"
                        }`}
                        style={plan === p.id ? { background: "var(--accent-gradient-soft)" } : undefined}
                      >
                        <p className="text-sm font-semibold text-[var(--text)]">{p.title}</p>
                        <p className="mt-0.5 text-xs text-[var(--text-faint)]">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className={labelClass}>Tell us about your business (optional)</span>
                  <textarea
                    name="message"
                    rows={3}
                    defaultValue={draft?.message}
                    placeholder="What do you sell? How are customers ordering today?"
                    className={inputClass}
                  />
                </label>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <ImageUpload label="Your logo (optional)" hint="Used to seed your storefront branding." />
                  <ImageUpload
                    label="Photo of your current setup (optional)"
                    hint="A shop front, stall, or even a WhatsApp catalog screenshot — helps us match your existing look."
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting || subdomainStatus === "checking" || subdomainStatus === "taken"}
                  className="w-full rounded-full py-3.5 text-sm font-semibold text-black shadow-[var(--shadow-glow-violet)] disabled:opacity-60"
                  style={{ background: "var(--accent-gradient)" }}
                >
                  {submitting ? "Submitting…" : "Submit application"}
                </motion.button>
              </form>
            </TiltCard>
          </motion.div>
        )}
    </div>
  );
}
