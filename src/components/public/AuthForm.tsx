"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, UserPlus, Globe, Store, Megaphone, Wallet } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { signUp as mockSignUp } from "@/lib/account-store";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-faint)] focus:border-[var(--accent-violet)] accent-ring";
const labelClass = "mb-1.5 block text-xs font-medium text-[var(--text-muted)]";

type SignupRole = "vendor" | "influencer";
type LoginRole = "vendor" | "influencer" | "storefront";

const SIGNUP_ROLES: { id: SignupRole; label: string; icon: typeof Store }[] = [
  { id: "vendor", label: "Vendor", icon: Store },
  { id: "influencer", label: "Influencer", icon: Megaphone },
];

const LOGIN_ROLES: { id: LoginRole; label: string; icon: typeof Store }[] = [
  { id: "vendor", label: "Vendor", icon: Store },
  { id: "influencer", label: "Influencer", icon: Megaphone },
  { id: "storefront", label: "Storefront revenue only", icon: Wallet },
];

export function AuthForm({
  initialMode,
  initialRole,
}: {
  initialMode: "signup" | "login";
  initialRole?: SignupRole | LoginRole;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"signup" | "login">(initialMode);
  const [signupRole, setSignupRole] = useState<SignupRole>(initialRole === "influencer" ? "influencer" : "vendor");
  const [loginRole, setLoginRole] = useState<LoginRole>(
    initialRole === "influencer" ? "influencer" : initialRole === "storefront" ? "storefront" : "vendor"
  );
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmNotice, setConfirmNotice] = useState(false);

  const returnTo = searchParams.get("returnTo") || "/account";
  const role = mode === "signup" ? signupRole : loginRole;

  function destinationFor(r: SignupRole | LoginRole) {
    if (r === "influencer") return "/influencer/dashboard";
    if (r === "storefront") return "/vendor/dashboard";
    return returnTo;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError("");

    if (mode === "signup") {
      const password = String(formData.get("password") ?? "");
      const confirmPassword = String(formData.get("confirmPassword") ?? "");
      if (password !== confirmPassword) {
        setError("Passwords don't match.");
        return;
      }
      const name = String(formData.get("name") ?? "");
      const email = String(formData.get("email") ?? "");
      const phone = String(formData.get("phone") ?? "");

      if (signupRole !== "vendor") {
        // Influencer accounts aren't real Supabase Auth users yet -- demo-only.
        setLoading(true);
        setTimeout(() => {
          mockSignUp(name, email, "email", phone);
          router.push(destinationFor(signupRole));
        }, 700);
        return;
      }

      setLoading(true);
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone } },
      });
      if (signUpError) {
        setLoading(false);
        setError(signUpError.message);
        return;
      }
      if (data.session && data.user) {
        // Email confirmation is off (or already confirmed) -- a session exists
        // immediately, so the platform_accounts row can be created right away.
        const { error: upsertError } = await supabase
          .from("platform_accounts")
          .upsert({ id: data.user.id, name, email, phone, provider: "email" });
        if (upsertError) {
          setLoading(false);
          setError(upsertError.message);
          return;
        }
        setLoading(false);
        router.push(destinationFor("vendor"));
        return;
      }
      // No session yet -- Supabase Auth requires confirming the email first.
      // The platform_accounts row is created on first login instead (see below).
      setLoading(false);
      setConfirmNotice(true);
      setMode("login");
      return;
    }

    if (loginRole === "vendor") {
      const email = String(formData.get("email") ?? "");
      const password = String(formData.get("password") ?? "");
      setLoading(true);
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError || !data.user) {
        setLoading(false);
        setError("No account found with that email — sign up first.");
        return;
      }
      const meta = data.user.user_metadata as { name?: string; phone?: string };
      const { error: upsertError } = await supabase.from("platform_accounts").upsert({
        id: data.user.id,
        name: meta.name ?? data.user.email ?? "",
        email: data.user.email ?? email,
        phone: meta.phone ?? null,
        provider: "email",
      });
      setLoading(false);
      if (upsertError) {
        setError(upsertError.message);
        return;
      }
      router.push(destinationFor("vendor"));
    } else {
      // Influencer / storefront-revenue logins are demo-only lookups with
      // no real per-user account behind them, matching the previous
      // standalone /influencer and /vendor pages this form replaces.
      setLoading(true);
      setTimeout(() => router.push(destinationFor(loginRole)), 600);
    }
  }

  function handleGoogle() {
    setGoogleLoading(true);
    const supabase = createClient();
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${destinationFor(mode === "signup" ? signupRole : loginRole)}` },
    });
  }

  const showGoogle = role === "vendor";

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-5 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "var(--accent-gradient)" }}>
            {mode === "signup" ? <UserPlus size={20} className="text-black" /> : <LogIn size={20} className="text-black" />}
          </div>
          <h1 className="font-display mt-4 text-2xl font-semibold text-[var(--text)]">
            {mode === "signup" ? "Create your Nashemann account" : "Log in to Nashemann"}
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">
            {mode === "signup"
              ? "Track applications, chat with support, and report bugs — separate from your store's own admin login."
              : "Your platform account — separate from your store's admin login."}
          </p>
        </div>

        <TiltCard strength={2} glare={false} className="mt-8 p-7">
          <div className="mb-6 flex rounded-full border border-[var(--border)] p-1">
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
                setConfirmNotice(false);
              }}
              className={`flex-1 rounded-full py-2 text-xs font-semibold transition-colors ${
                mode === "signup" ? "text-black" : "text-[var(--text-muted)]"
              }`}
              style={mode === "signup" ? { background: "var(--accent-gradient)" } : undefined}
            >
              Sign up
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setConfirmNotice(false);
              }}
              className={`flex-1 rounded-full py-2 text-xs font-semibold transition-colors ${
                mode === "login" ? "text-black" : "text-[var(--text-muted)]"
              }`}
              style={mode === "login" ? { background: "var(--accent-gradient)" } : undefined}
            >
              Log in
            </button>
          </div>

          {mode === "login" && (
            <div className="mb-5">
              <span className={labelClass}>Log in as</span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {LOGIN_ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setLoginRole(r.id);
                      setError("");
                    }}
                    className={`flex flex-col items-center gap-1.5 rounded-[var(--radius-sm)] border p-3 text-center transition-colors ${
                      loginRole === r.id ? "border-[var(--accent-violet)]" : "border-[var(--border)] hover:border-[var(--border-strong)]"
                    }`}
                    style={loginRole === r.id ? { background: "var(--accent-gradient-soft)" } : undefined}
                  >
                    <r.icon size={16} className="text-[var(--text)]" />
                    <span className="text-[0.7rem] font-medium text-[var(--text)]">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showGoogle && (
            <>
              <button
                onClick={handleGoogle}
                disabled={googleLoading}
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] py-3 text-sm font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-60"
              >
                <Globe size={16} /> {googleLoading ? "Redirecting to Google…" : "Continue with Google"}
              </button>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-[var(--border)]" />
                <span className="text-xs text-[var(--text-faint)]">or</span>
                <div className="h-px flex-1 bg-[var(--border)]" />
              </div>
            </>
          )}

          {confirmNotice && (
            <p className="mb-4 rounded-[var(--radius-sm)] border border-[var(--accent-violet)] bg-[var(--accent-gradient-soft)] p-3 text-xs text-[var(--text)]">
              Account created — check your email to confirm it, then log in below.
            </p>
          )}

          <form key={`${mode}-${role}`} onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <span className={labelClass}>Sign up as</span>
                  <div className="grid grid-cols-2 gap-2">
                    {SIGNUP_ROLES.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSignupRole(r.id)}
                        className={`flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border py-2.5 text-xs font-semibold transition-colors ${
                          signupRole === r.id ? "border-[var(--accent-violet)]" : "border-[var(--border)] hover:border-[var(--border-strong)]"
                        }`}
                        style={signupRole === r.id ? { background: "var(--accent-gradient-soft)" } : undefined}
                      >
                        <r.icon size={14} /> {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="block">
                  <span className={labelClass}>Full name</span>
                  <input name="name" required className={inputClass} />
                </label>
                <label className="block">
                  <span className={labelClass}>Email</span>
                  <input name="email" required type="email" className={inputClass} />
                </label>
                <label className="block">
                  <span className={labelClass}>Phone number</span>
                  <input name="phone" required placeholder="03XX-XXXXXXX" className={inputClass} />
                </label>
                <label className="block">
                  <span className={labelClass}>Password</span>
                  <input name="password" required type="password" minLength={8} className={inputClass} />
                </label>
                <label className="block">
                  <span className={labelClass}>Confirm password</span>
                  <input name="confirmPassword" required type="password" minLength={8} className={inputClass} />
                </label>
              </>
            )}

            {mode === "login" && loginRole === "vendor" && (
              <>
                <label className="block">
                  <span className={labelClass}>Email</span>
                  <input name="email" required type="email" defaultValue="zainab@northernnuts.pk" className={inputClass} />
                </label>
                <label className="block">
                  <span className={labelClass}>Password</span>
                  <input name="password" required type="password" defaultValue="demo" className={inputClass} />
                </label>
              </>
            )}

            {mode === "login" && loginRole === "influencer" && (
              <>
                <label className="block">
                  <span className={labelClass}>Email</span>
                  <input name="email" required type="email" defaultValue="hania@creatorhub.pk" className={inputClass} />
                </label>
                <label className="block">
                  <span className={labelClass}>Password</span>
                  <input name="password" required type="password" defaultValue="demo" className={inputClass} />
                </label>
              </>
            )}

            {mode === "login" && loginRole === "storefront" && (
              <>
                <label className="block">
                  <span className={labelClass}>Store email</span>
                  <input name="email" required type="email" defaultValue="fatima@sabzbasket.pk" className={inputClass} />
                </label>
                <label className="block">
                  <span className={labelClass}>Password</span>
                  <input name="password" required type="password" defaultValue="demo" className={inputClass} />
                </label>
                <p className="text-xs text-[var(--text-faint)]">For full order/product management, use your store&apos;s own admin panel.</p>
              </>
            )}

            {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full py-3.5 text-sm font-semibold text-black shadow-[var(--shadow-glow-violet)] disabled:opacity-60"
              style={{ background: "var(--accent-gradient)" }}
            >
              {loading
                ? mode === "signup"
                  ? "Creating account…"
                  : "Signing in…"
                : mode === "signup"
                  ? "Create account"
                  : loginRole === "influencer"
                    ? "View my earnings"
                    : loginRole === "storefront"
                      ? "View my revenue"
                      : "Log in"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-[var(--text-faint)]">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-[var(--accent-violet)] hover:underline">
                  Log in
                </Link>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-semibold text-[var(--accent-violet)] hover:underline">
                  Sign up
                </Link>
              </>
            )}
          </p>
        </TiltCard>
      </motion.div>
    </div>
  );
}
