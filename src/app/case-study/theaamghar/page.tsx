import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Quote, MapPin, Sprout, PackageCheck, LineChart, MessageCircle } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { Badge } from "@/components/ui/Badge";

const TITLE = "Case Study: TheAamGhar";
const DESCRIPTION =
  "How TheAamGhar, a mango vendor from Muzaffargarh, went from taking every order over WhatsApp DMs to running a real online storefront as Nashemann's first onboarded vendor.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/case-study/theaamghar" },
  openGraph: { title: `${TITLE} — Nashemann`, description: DESCRIPTION, type: "article" },
};

const SNAPSHOT = [
  { label: "Business", value: "TheAamGhar" },
  { label: "Location", value: "Muzaffargarh, Pakistan" },
  { label: "Category", value: "Fruit — mangoes" },
  { label: "Plan", value: "Pay Per Order" },
];

export default function TheAamGharCaseStudyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:py-24">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(255,176,32,0.14)] px-3 py-1 text-xs font-semibold text-[var(--accent-amber)]">
          <Sprout size={13} /> Case study
        </span>
        <div className="mt-5 text-5xl">🥭</div>
        <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
          TheAamGhar: from WhatsApp orders to a real online store
        </h1>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-[var(--text-muted)]">
          <MapPin size={14} /> Muzaffargarh, Pakistan — Nashemann&apos;s first onboarded vendor
        </p>
      </div>

      <TiltCard strength={2} glare={false} className="mt-10 grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
        {SNAPSHOT.map((s) => (
          <div key={s.label}>
            <p className="text-[0.65rem] uppercase tracking-wide text-[var(--text-faint)]">{s.label}</p>
            <p className="mt-1 text-sm font-semibold text-[var(--text)]">{s.value}</p>
          </div>
        ))}
      </TiltCard>

      <div className="prose-content mt-14 space-y-5">
        <h2 className="font-display text-xl font-semibold text-[var(--text)]">The business</h2>
        <p className="text-[0.95rem] leading-relaxed text-[var(--text-muted)]">
          TheAamGhar sells mangoes sourced directly from orchards around Muzaffargarh — Sindhri, Chaunsa, and other
          seasonal varieties — packed and shipped in bulk boxes to customers across Pakistan. Like most fruit vendors
          selling a seasonal product, the business runs on a short, intense window each year where demand spikes hard
          and inventory has to move fast before it spoils. That combination — a hard shelf-life clock and a rush of
          simultaneous orders — is exactly the kind of business a manual process struggles with most.
        </p>

        <h2 className="font-display pt-3 text-xl font-semibold text-[var(--text)]">The challenge</h2>
        <p className="text-[0.95rem] leading-relaxed text-[var(--text-muted)]">
          Before Nashemann, TheAamGhar ran entirely on WhatsApp. Customers messaged to ask what was in season, what a
          5kg box cost, and whether it could reach their city in time. Every order meant a manual back-and-forth to
          confirm price, box size, and delivery — then a note somewhere to remember what had actually been promised.
        </p>
        <p className="text-[0.95rem] leading-relaxed text-[var(--text-muted)]">
          During peak mango season, that process didn&apos;t scale gracefully. Order volume would spike over a few
          weeks, message threads piled up faster than they could be answered, and keeping track of who had ordered
          what — against stock that was moving and spoiling in real time — depended entirely on manual bookkeeping.
          It worked, but it left little room for the business to grow past what one person could track by hand.
        </p>

        <h2 className="font-display pt-3 text-xl font-semibold text-[var(--text)]">The solution</h2>
        <p className="text-[0.95rem] leading-relaxed text-[var(--text-muted)]">
          As Nashemann&apos;s first onboarded vendor, TheAamGhar got a branded storefront on its own subdomain, seeded
          and ready within days — no developer, no template to configure. Customers could browse available mango
          varieties and box sizes, see real prices, and place an order directly, without waiting on a reply.
        </p>
        <div className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="glass-panel rounded-[var(--radius-md)] p-4">
            <PackageCheck size={18} className="text-[var(--accent-violet)]" />
            <p className="mt-2 text-xs font-semibold text-[var(--text)]">Orders land automatically</p>
            <p className="mt-1 text-xs text-[var(--text-faint)]">Every order appears in the admin panel the moment it&apos;s placed — no manual note-taking.</p>
          </div>
          <div className="glass-panel rounded-[var(--radius-md)] p-4">
            <LineChart size={18} className="text-[var(--accent-violet)]" />
            <p className="mt-2 text-xs font-semibold text-[var(--text)]">Stock stays accurate</p>
            <p className="mt-1 text-xs text-[var(--text-faint)]">Inventory updates as orders come in, instead of being tracked from memory during the busiest weeks.</p>
          </div>
          <div className="glass-panel rounded-[var(--radius-md)] p-4">
            <MessageCircle size={18} className="text-[var(--accent-violet)]" />
            <p className="mt-2 text-xs font-semibold text-[var(--text)]">WhatsApp still works</p>
            <p className="mt-1 text-xs text-[var(--text-faint)]">Repeat customers who prefer messaging can still order that way — the storefront handles the rest.</p>
          </div>
        </div>
        <p className="text-[0.95rem] leading-relaxed text-[var(--text-muted)]">
          TheAamGhar started on the Pay Per Order plan, so there was nothing to pay before the store made its first
          sale — the only cost was the time it took to add product photos and set box prices.
        </p>

        <h2 className="font-display pt-3 text-xl font-semibold text-[var(--text)]">The results</h2>
        <p className="text-[0.95rem] leading-relaxed text-[var(--text-muted)]">
          As an early, real partnership rather than a large-scale study, the honest takeaway isn&apos;t a headline
          growth number — it&apos;s that the day-to-day got noticeably lighter. Manual order-tracking time dropped,
          since orders no longer had to be copied out of a chat thread by hand. Stock mistakes during the peak rush —
          selling a box that had already sold out — became far less common once inventory updated itself. And having
          a live view of orders and revenue meant the business no longer had to wait until the end of the season to
          understand how it had actually done.
        </p>

        <TiltCard strength={3} className="my-8 p-6">
          <Quote size={22} className="text-[var(--accent-amber)] opacity-60" />
          <p className="mt-3 text-[0.95rem] italic leading-relaxed text-[var(--text)]">
            &ldquo;We were running the whole season out of a WhatsApp inbox — great for talking to customers, terrible
            for keeping track of what we&apos;d actually promised them. Having a real store meant we spent the peak
            weeks packing mangoes instead of scrolling back through chats trying to remember who ordered what.&rdquo;
          </p>
          <div className="mt-4 flex items-center gap-3 border-t border-[var(--border)] pt-4">
            <span className="text-2xl">🥭</span>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">Shahzaib Lal</p>
              <p className="text-xs text-[var(--text-faint)]">TheAamGhar, Muzaffargarh</p>
            </div>
          </div>
        </TiltCard>

        <h2 className="font-display pt-3 text-xl font-semibold text-[var(--text)]">What&apos;s next</h2>
        <p className="text-[0.95rem] leading-relaxed text-[var(--text-muted)]">
          TheAamGhar continues to sell through its storefront each mango season, with WhatsApp still open for the
          customers who prefer it. As the platform&apos;s first vendor, its experience — the rough edges as much as
          the wins — has directly shaped how Nashemann sets up every business that&apos;s onboarded since.
        </p>
      </div>

      <div className="glass-panel mt-14 flex flex-col items-center gap-3 rounded-[var(--radius-lg)] p-7 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <Badge tone="warning">Seasonal or year-round</Badge>
          <p className="font-display mt-2 text-lg font-semibold text-[var(--text)]">Want a store like this for your business?</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Apply in 3 minutes — no upfront cost to start.</p>
        </div>
        <Link
          href="/apply"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-black"
          style={{ background: "var(--accent-gradient)" }}
        >
          Apply for your store <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
