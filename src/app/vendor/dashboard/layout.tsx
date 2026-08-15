"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, Wallet, Ticket, MessageSquare, Users } from "lucide-react";
import { VendorSessionProvider, useVendorSessionContext } from "@/lib/vendor-session-context";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/vendor/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/vendor/dashboard/profile", label: "Store profile", icon: Store },
  { href: "/vendor/dashboard/settlements", label: "Settlements", icon: Wallet },
  { href: "/vendor/dashboard/coupons", label: "Coupons", icon: Ticket },
  { href: "/vendor/dashboard/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/vendor/dashboard/referrals", label: "Referrals & rewards", icon: Users },
];

function TabNav() {
  const pathname = usePathname();
  const { state } = useVendorSessionContext();
  if (state.status !== "ready") return null;

  return (
    <div className="mx-auto max-w-4xl px-5 pt-8">
      <div className="scrollbar-none flex gap-1.5 overflow-x-auto pb-2">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                active
                  ? "border-transparent text-black"
                  : "border-[var(--border-strong)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
              )}
              style={active ? { background: "var(--accent-gradient)" } : undefined}
            >
              <tab.icon size={13} /> {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function VendorDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <VendorSessionProvider>
      <TabNav />
      {children}
    </VendorSessionProvider>
  );
}
