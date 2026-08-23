"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, UserPlus, Store, Megaphone, Wallet } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { createClient } from "@/lib/supabase/client";

const inputClass = "w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-faint)] focus:border-[var(--accent-violet)] accent-ring";
const labelClass = "mb-1.5 block text-xs font-medium text-[var(--text-muted)]";

type SignupRole = "vendor" | "influencer";
type LoginRole = "vendor" | "influencer" | "storefront";
type ActualRole = "vendor" | "influencer" | "storefront";

const SIGNUP_ROLES = [
  { id: "vendor" as const, label: "Nashemann Vendor", icon: Store },
  { id: "influencer" as const, label: "Nashemann Influencer", icon: Megaphone },
];
const LOGIN_ROLES = [
  { id: "vendor" as const, label: "Nashemann Vendor", icon: Store },
  { id: "influencer" as const, label: "Nashemann Influencer", icon: Megaphone },
  { id: "storefront" as const, label: "Revenue View", icon: Wallet },
];
const ROLE_LABELS: Record<LoginRole, string> = { vendor: "Nashemann Vendor", influencer: "Nashemann Influencer", storefront: "Storefront Revenue View" };

export function AuthForm({ initialMode, initialRole }: { initialMode: "signup" | "login"; initialRole?: SignupRole | LoginRole }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"signup" | "login">(initialMode);
  const [signupRoles, setSignupRoles] = useState<SignupRole[]>(initialRole === "influencer" ? ["influencer"] : ["vendor"]);
  const [loginRole, setLoginRole] = useState<LoginRole>(initialRole === "influencer" ? "influencer" : initialRole === "storefront" ? "storefront" : "vendor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const returnTo = searchParams.get("returnTo") || "/account";

  function toggleSignupRole(role: SignupRole) {
    setSignupRoles((prev) => {
      if (prev.includes(role)) {
        if (prev.length === 1) return prev; // at least one role must stay selected
        return prev.filter((r) => r !== role);
      }
      return [...prev, role];
    });
  }

  function destinationFor(role: LoginRole | SignupRole) {
    if (role === "influencer") return "/influencer/dashboard";
    if (role === "storefront") return "/revenue";
    return returnTo;
  }

  async function resolveActualRoles() {
    const response = await fetch("/api/platform/role", { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error ?? "Couldn't verify account role.");
    return data as { roles: ActualRole[] };
  }

  async function signInAfterCreation(email: string, password: string, expectedRoles: SignupRole[]) {
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) throw new Error(signInError.message);
    const actual = await resolveActualRoles();
    const missing = expectedRoles.filter((r) => !actual.roles.includes(r));
    if (missing.length > 0) {
      await supabase.auth.signOut();
      throw new Error("Couldn't verify the new role(s) on this account. Please try again.");
    }
    // Vendor takes you to your account hub (where you'd go apply for a store); influencer-only goes straight to its dashboard.
    router.push(destinationFor(expectedRoles.includes("vendor") ? "vendor" : "influencer"));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData(event.currentTarget);
      if (mode === "signup") {
        const password = String(formData.get("password") ?? "");
        const confirmPassword = String(formData.get("confirmPassword") ?? "");
        if (password !== confirmPassword) throw new Error("Passwords don't match.");
        const email = String(formData.get("email") ?? "").trim().toLowerCase();
        const response = await fetch("/api/platform/signup", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ roles: signupRoles, name: String(formData.get("name") ?? ""), email, phone: String(formData.get("phone") ?? ""), password }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error ?? "Couldn't create your account.");
        await signInAfterCreation(email, password, signupRoles);
        return;
      }

      const email = String(formData.get("email") ?? "").trim().toLowerCase();
      const password = String(formData.get("password") ?? "");
      if (!email || !password) throw new Error("Email and password are required.");
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw new Error("Incorrect email or password.");
      let actual;
      try { actual = await resolveActualRoles(); } catch (roleError) { await supabase.auth.signOut(); throw roleError; }
      if (!actual.roles.includes(loginRole)) {
        await supabase.auth.signOut();
        const actualLabel = actual.roles.length > 0 ? actual.roles.map((r) => ROLE_LABELS[r]).join(" & ") : "an unsupported account type";
        throw new Error(`This account belongs to ${actualLabel}. Select the matching login option.`);
      }
      router.push(destinationFor(loginRole));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const selectedRoleLabel =
    mode === "signup"
      ? signupRoles.map((r) => SIGNUP_ROLES.find((item) => item.id === r)?.label).filter(Boolean).join(" + ")
      : ROLE_LABELS[loginRole];

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-5 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "var(--accent-gradient)" }}>
            {mode === "signup" ? <UserPlus size={20} className="text-black" /> : <LogIn size={20} className="text-black" />}
          </div>
          <h1 className="font-display mt-4 text-2xl font-semibold text-[var(--text)]">{mode === "signup" ? "Create your Nashemann account" : "Log in to Nashemann"}</h1>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">{mode === "signup" ? "Pick one or both programs — one login either way." : "Choose the exact role this account belongs to."}</p>
        </div>

        <TiltCard strength={2} glare={false} className="mt-8 p-7">
          <div className="mb-6 flex rounded-full border border-[var(--border)] p-1">
            <button type="button" onClick={() => { setMode("signup"); setError(""); }} className={`flex-1 rounded-full py-2 text-xs font-semibold ${mode === "signup" ? "text-black" : "text-[var(--text-muted)]"}`} style={mode === "signup" ? { background: "var(--accent-gradient)" } : undefined}>Sign up</button>
            <button type="button" onClick={() => { setMode("login"); setError(""); }} className={`flex-1 rounded-full py-2 text-xs font-semibold ${mode === "login" ? "text-black" : "text-[var(--text-muted)]"}`} style={mode === "login" ? { background: "var(--accent-gradient)" } : undefined}>Log in</button>
          </div>

          <div className="mb-5">
            <span className={labelClass}>{mode === "signup" ? "Sign up for (choose one or both)" : "Log in as"}</span>
            <div className={`grid gap-2 ${mode === "signup" ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
              {mode === "signup"
                ? SIGNUP_ROLES.map((item) => {
                    const active = signupRoles.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => { toggleSignupRole(item.id); setError(""); }}
                        aria-pressed={active}
                        className={`flex flex-col items-center gap-1.5 rounded-[var(--radius-sm)] border p-3 text-center transition-colors ${active ? "border-[var(--accent-violet)]" : "border-[var(--border)] hover:border-[var(--border-strong)]"}`}
                        style={active ? { background: "var(--accent-gradient-soft)" } : undefined}
                      >
                        <item.icon size={16} className="text-[var(--text)]" />
                        <span className="text-[0.7rem] font-medium text-[var(--text)]">{item.label}</span>
                      </button>
                    );
                  })
                : LOGIN_ROLES.map((item) => {
                    const active = loginRole === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => { setLoginRole(item.id); setError(""); }}
                        className={`flex flex-col items-center gap-1.5 rounded-[var(--radius-sm)] border p-3 text-center transition-colors ${active ? "border-[var(--accent-violet)]" : "border-[var(--border)] hover:border-[var(--border-strong)]"}`}
                        style={active ? { background: "var(--accent-gradient-soft)" } : undefined}
                      >
                        <item.icon size={16} className="text-[var(--text)]" />
                        <span className="text-[0.7rem] font-medium text-[var(--text)]">{item.label}</span>
                      </button>
                    );
                  })}
            </div>
          </div>

          <div className="mb-5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-hover)] px-3 py-2 text-xs text-[var(--text-muted)]">Selected: <span className="font-semibold text-[var(--text)]">{selectedRoleLabel}</span></div>

          <form key={`${mode}-${mode === "signup" ? signupRoles.join("+") : loginRole}`} onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && <>
              <label className="block"><span className={labelClass}>Full name</span><input name="name" required className={inputClass} autoComplete="name" /></label>
              <label className="block"><span className={labelClass}>Email</span><input name="email" required type="email" className={inputClass} autoComplete="email" /></label>
              <label className="block"><span className={labelClass}>Phone number</span><input name="phone" required placeholder="03XX-XXXXXXX" className={inputClass} autoComplete="tel" /></label>
              <label className="block"><span className={labelClass}>Password</span><input name="password" required type="password" minLength={8} className={inputClass} autoComplete="new-password" /></label>
              <label className="block"><span className={labelClass}>Confirm password</span><input name="confirmPassword" required type="password" minLength={8} className={inputClass} autoComplete="new-password" /></label>
            </>}
            {mode === "login" && <>
              <label className="block"><span className={labelClass}>Email</span><input name="email" required type="email" className={inputClass} autoComplete="username" placeholder="you@example.com" /></label>
              <label className="block"><span className={labelClass}>Password</span><input name="password" required type="password" className={inputClass} autoComplete="current-password" placeholder="Your password" /></label>
            </>}
            {error && <p role="alert" className="rounded-[var(--radius-sm)] border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500">{error}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-full py-3 text-sm font-semibold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-60" style={{ background: "var(--accent-gradient)" }}>{loading ? (mode === "signup" ? "Creating account…" : "Checking account…") : (mode === "signup" ? `Create ${selectedRoleLabel} account` : `Continue as ${selectedRoleLabel}`)}</button>
          </form>
        </TiltCard>
      </motion.div>
    </div>
  );
}
