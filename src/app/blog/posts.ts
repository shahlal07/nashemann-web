export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  tag: string;
  publishedAt: string;
  readTimeMinutes: number;
  excerpt: string;
  content: ContentBlock[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "small-businesses-pakistan-moving-online",
    title: "How Small Businesses in Pakistan Are Moving Online",
    description:
      "Why more Pakistani vendors are leaving WhatsApp DMs behind for a real online store — and what actually changed to make that realistic for a one-person business.",
    tag: "Industry",
    publishedAt: "2026-08-01",
    readTimeMinutes: 6,
    excerpt:
      "For years the storefront was somebody's phone. That's starting to change — not because owners suddenly want websites, but because the cost of getting one has finally dropped to zero.",
    content: [
      { type: "h2", text: "The DM inbox used to be the store" },
      {
        type: "p",
        text: "For years, if you wanted to buy from a small business in Pakistan — a home bakery in Lahore, a fruit vendor in South Punjab, a boutique in Karachi — the storefront was somebody's phone. You messaged a number, waited for a reply, asked if it was in stock, sent a screenshot of your address, and paid on delivery. It worked, because trust here is built person to person, and WhatsApp let that personal relationship scale further than a physical counter ever could.",
      },
      {
        type: "p",
        text: "It also had a ceiling. Every order needed a human on the other end, in real time, typing prices and confirming availability by hand. A shop that could comfortably handle ten DMs a day started to buckle at thirty. Orders got missed in the scroll. Stock counts lived in someone's head, or a notebook, and were wrong more often than anyone wanted to admit.",
      },
      { type: "h2", text: "What actually changed" },
      {
        type: "p",
        text: "A few things converged. Mobile internet got cheap enough that customers in smaller cities, not just Lahore and Karachi, are comfortable browsing and ordering from a phone. Courier networks — the ones that already run cash-on-delivery at scale for platforms like Daraz — made it realistic for a solo vendor to ship outside their own city without owning a fleet of riders. And customers, having gotten used to browsing a real catalog on bigger platforms, started expecting the same basic convenience from smaller sellers: see the product, see the price, order without waiting for a reply.",
      },
      {
        type: "p",
        text: "None of that required small businesses to change how they operate. It just raised the bar for what 'available online' means.",
      },
      { type: "h2", text: "Why most vendors still hadn't moved" },
      {
        type: "p",
        text: "The blocker was rarely desire. Most vendors we talk to know a proper storefront would help — they just couldn't justify the cost of finding out. Building even a basic site means a template, hosting, a domain, someone to keep it patched, and a checkout that actually works with how people pay here (mostly cash, mostly on delivery). For someone running a business solo out of a kitchen or a small warehouse, that's effectively a second job they'd have to take on before the first online order even arrives.",
      },
      { type: "h2", text: "What's changing that math" },
      {
        type: "p",
        text: "The shift is that 'getting online' no longer has to be a project. Infrastructure that used to require a developer — a branded storefront, order management, inventory, a checkout that understands cash-on-delivery — can now be provisioned in days instead of built from scratch. And the honest version of that model doesn't ask a vendor to pay before they've sold anything; it charges a small fee per order, so testing the channel costs nothing but the time it takes to add your first products.",
      },
      {
        type: "p",
        text: "That's the actual unlock. Not that Pakistani vendors suddenly discovered e-commerce — most have been running commerce over chat for years — but that the cost of a real storefront finally dropped low enough to try without betting the business on it.",
      },
      {
        type: "p",
        text: "If you're still taking every order through DMs, it's worth asking honestly whether a storefront would save you time, not just make things look nicer. For a lot of businesses, the answer turns out to be both.",
      },
    ],
  },
  {
    slug: "whatsapp-commerce-vs-online-store",
    title: "WhatsApp Commerce vs a Real Online Store: What Changes",
    description:
      "WhatsApp got you your first customers and it should stay. Here's what actually changes — and what doesn't — once you add a real storefront alongside it.",
    tag: "Guide",
    publishedAt: "2026-08-08",
    readTimeMinutes: 7,
    excerpt:
      "WhatsApp isn't the problem. The problem is asking one chat thread to also be your catalog, your checkout, your inventory system, and your accounting — all at once.",
    content: [
      { type: "h2", text: "WhatsApp isn't going anywhere — and it shouldn't" },
      {
        type: "p",
        text: "Let's start with what WhatsApp gets right, because it's a lot. It's fast, it feels personal, and for a returning customer who already trusts you, typing 'same as last time' is genuinely faster than navigating any website. For custom orders, quick questions, or the kind of relationship-first selling that built your customer base in the first place, nothing replaces a real conversation. A store isn't meant to remove that — it's meant to stop asking a chat thread to do jobs it was never built for.",
      },
      { type: "h2", text: "Where it starts to break down" },
      {
        type: "p",
        text: "The strain shows up in a handful of specific places, usually right around the point a business starts to grow past what one person can comfortably answer:",
      },
      {
        type: "ul",
        items: [
          "Discovery — a new customer has to already have your number, or find your page and hope you reply, before they can even see what you sell.",
          "Catalog limits — WhatsApp's built-in catalog wasn't designed for size/weight variants, live stock counts, or organizing dozens of products by category.",
          "Order tracking — a notebook or a memory of 'who ordered what' doesn't scale, and double-booking stock you've already sold out of is a matter of when, not if.",
          "Payment and pricing back-and-forth — every order needs the same manual dance: confirm price, confirm delivery charge, confirm availability, before anyone's even agreed to buy.",
          "The owner becomes the bottleneck — as order volume grows, someone has to be online answering messages in real time, which competes directly with actually running the business.",
          "Trust for strangers — a phone number and a few product photos work fine for people who already know you. A first-time customer with no prior relationship is often more comfortable paying into something that looks like a real store, with listed prices and no need to ask.",
        ],
      },
      { type: "h2", text: "What a real store adds — without replacing WhatsApp" },
      {
        type: "p",
        text: "The useful way to think about it isn't 'store instead of WhatsApp' — it's splitting the two jobs WhatsApp was doing at once. The storefront becomes the catalog, checkout, and inventory layer: customers browse, see real prices, and place an order without waiting on a reply. WhatsApp — ideally backed by a bit of AI so it doesn't sleep — stays the relationship and support layer, for the questions and custom requests that actually need a human.",
      },
      {
        type: "p",
        text: "The practical difference shows up in what you have to do manually. Orders land directly in an admin panel instead of a chat thread you have to scroll back through. Stock updates itself instead of living in your head. Revenue is something you can see any time, instead of something you add up from receipts at the end of the month.",
      },
      { type: "h2", text: "The transition doesn't have to be all-or-nothing" },
      {
        type: "p",
        text: "You don't have to announce a switch or ask existing customers to change how they buy from you. Most vendors keep taking WhatsApp orders exactly as before, and let the store quietly pick up new customers who'd never have messaged first — people who found you through a shared link, a social post, or a search, and wanted to see a real catalog before committing to anything. Over a few months, the split between the two channels tends to settle on its own, based on how your customers actually prefer to buy.",
      },
    ],
  },
  {
    slug: "pay-per-order-pricing-explained",
    title: "Understanding Pay-Per-Order Pricing for New Sellers",
    description:
      "What 'no upfront cost, Rs 15 per order' actually means in practice for a small business trying an online storefront for the first time.",
    tag: "Pricing",
    publishedAt: "2026-08-14",
    readTimeMinutes: 5,
    excerpt:
      "Most 'get your business online' offers ask you to pay before you know if it'll work. Pay-per-order flips that — you only owe anything once a customer actually buys.",
    content: [
      { type: "h2", text: "The problem with most 'get online' offers" },
      {
        type: "p",
        text: "Most agencies, templates, and subscription tools that promise to get your business online ask for money up front — a setup fee, a monthly plan, sometimes both — before you have any evidence the online channel will actually work for your business. For a vendor who's never sold outside WhatsApp or a physical counter, that's real risk on an untested bet. If it doesn't work, you've still paid.",
      },
      { type: "h2", text: "How pay-per-order actually works" },
      {
        type: "p",
        text: "The Pay Per Order plan flips that around: there's no signup fee and no monthly bill. You get a full branded storefront, an admin panel to manage orders and inventory, and support included from day one — and the only charge is Rs 15, applied to the customer at checkout, on an order that actually happens. No sale, no charge. It's the closest thing to a free trial that doesn't quietly expire or lock features behind a paywall.",
      },
      { type: "h2", text: "When the Monthly plan makes more sense" },
      {
        type: "p",
        text: "Pay-per-order is deliberately the cheaper option at low volume and the more expensive one once you're selling a lot — that's the honest trade-off of a per-transaction fee. Once your order volume climbs high enough that the accumulated Rs 15 fees would cost more than a flat monthly rate, switching plans saves money and also removes the platform fee line customers see at checkout. There's no penalty for switching, and it takes effect on your next billing cycle from your admin panel's billing tab — most vendors start on Pay Per Order and only move to Monthly once the math clearly favors it.",
      },
      { type: "h2", text: "What the fee does and doesn't cover" },
      {
        type: "p",
        text: "It's worth being precise here, because 'platform fee' can sound like a cut of your sales — it isn't. The fee covers the infrastructure: hosting your storefront, running the admin panel, order and inventory management, and support. It has nothing to do with how you price your products. You set your own prices and keep 100% of that revenue; the platform fee is a separate, visible line the customer pays, not something deducted from what you earn.",
      },
      {
        type: "p",
        text: "That's really the point of pricing it this way — there's nothing to lose by trying it, and nothing hidden to discover later. You can see exactly what you're paying, exactly when you're paying it, and change plans the moment the numbers say you should.",
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
