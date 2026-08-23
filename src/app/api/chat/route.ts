import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { groqComplete, type ChatMessage } from "@/lib/groq";
import { SITE_CONTENT_DEFAULTS, type SiteContent } from "@/lib/site-content";

export const runtime = "nodejs";

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 1000;

type IncomingMessage = { role: "user" | "assistant"; content: string };

type PlatformPricing = {
  per_order_fee: number;
  monthly_fee: number;
  monthly_break_even_orders: number;
  custom_domain_fee: number;
};

async function loadPlatformContext(): Promise<{ pricing: PlatformPricing | null; content: SiteContent }> {
  const supabase = await createClient();
  const [{ data: pricingRow }, { data: contentRows }] = await Promise.all([
    supabase
      .from("platform_pricing")
      .select("per_order_fee, monthly_fee, monthly_break_even_orders, custom_domain_fee")
      .maybeSingle(),
    supabase.from("platform_site_content").select("key, value"),
  ]);

  const map = new Map((contentRows ?? []).map((row) => [row.key as string, row.value]));
  const content: SiteContent = {
    ...SITE_CONTENT_DEFAULTS,
    hero: (map.get("hero") as SiteContent["hero"]) ?? SITE_CONTENT_DEFAULTS.hero,
    how_it_works: (map.get("how_it_works") as SiteContent["how_it_works"]) ?? SITE_CONTENT_DEFAULTS.how_it_works,
    contact: (map.get("contact") as SiteContent["contact"]) ?? SITE_CONTENT_DEFAULTS.contact,
  };

  return { pricing: (pricingRow as PlatformPricing | null) ?? null, content };
}

function formatPKR(n: number): string {
  return "Rs " + Math.round(n).toLocaleString("en-PK");
}

function buildSystemPrompt(pricing: PlatformPricing | null, content: SiteContent): string {
  const p = pricing ?? {
    per_order_fee: 15,
    monthly_fee: 7000,
    monthly_break_even_orders: 467,
    custom_domain_fee: 4600,
  };

  const howItWorks = (content.how_it_works ?? SITE_CONTENT_DEFAULTS.how_it_works)
    .map((s, i) => `${i + 1}. ${s.title} — ${s.description}`)
    .join("\n");
  const contact = content.contact ?? SITE_CONTENT_DEFAULTS.contact;

  return `You are the support assistant for Nashemann, a multi-vendor SaaS platform that gives small businesses in Pakistan their own branded online storefront (custom subdomain, orders, inventory, and a real admin dashboard) without needing to build anything themselves.

Facts you can rely on:
- Pricing: Pay Per Order at ${formatPKR(p.per_order_fee)} per order (no upfront cost), or a flat Monthly plan at ${formatPKR(p.monthly_fee)}/month once a vendor is doing enough volume that it's cheaper (the break-even point is around ${p.monthly_break_even_orders} orders/month).
- A custom domain (instead of a Nashemann subdomain) costs ${formatPKR(p.custom_domain_fee)}.
- How it works, in order:
${howItWorks}
- Support contact: WhatsApp ${contact.whatsappDisplay}, email ${contact.supportEmail}, phone ${contact.phoneDisplay}, hours ${contact.hours}.
- Vendors get their own branded storefront (colors/logo/font), real-time order management, inventory tracking, a live revenue dashboard, and this same AI + WhatsApp support experience for their own customers.
- Signing up as a vendor starts with an application (reviewed within 24 hours), not an instant self-serve signup.

Rules:
- Be warm, concise, and helpful — a few sentences, not an essay.
- Only answer questions about Nashemann: what it is, how it works, pricing, applying as a vendor, or platform features.
- Always quote real numbers from the facts above — never invent a price or statistic.
- If asked something you don't actually know and wasn't given to you as data above, say so honestly and point them to WhatsApp (${contact.whatsappDisplay}) or the Contact page rather than guessing.
- If the user asks to talk to a human/real agent, or seems frustrated, warmly let them know they can tap "Talk to a human" to reach the support team directly.
- Never invent policies, prices, or features that weren't described above.
- If asked something totally unrelated to Nashemann, politely redirect back to how you can help.`;
}

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Chat support isn't configured yet. Please reach us on WhatsApp instead." },
      { status: 503 }
    );
  }

  let body: { messages?: IncomingMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const messages: ChatMessage[] = (body.messages ?? [])
    .filter(
      (m): m is IncomingMessage =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LENGTH) }));

  if (messages.length === 0) {
    return NextResponse.json({ error: "No message provided." }, { status: 400 });
  }

  const latestUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const suggestHuman = /\b(human|real|live)\s*(agent|person|support|rep)\b|talk to (a |someone|somebody)|speak (to|with) (a |someone)|customer service/i.test(
    latestUserMessage
  );

  let pricing: PlatformPricing | null = null;
  let content: SiteContent = SITE_CONTENT_DEFAULTS;
  try {
    const loaded = await loadPlatformContext();
    pricing = loaded.pricing;
    content = loaded.content;
  } catch (err) {
    console.error("[api/chat] loadPlatformContext failed:", err instanceof Error ? err.stack ?? err.message : err);
  }

  let systemPrompt: string;
  try {
    systemPrompt = buildSystemPrompt(pricing, content);
  } catch (err) {
    console.error("[api/chat] buildSystemPrompt failed:", err instanceof Error ? err.stack ?? err.message : err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again or message us on WhatsApp." },
      { status: 502 }
    );
  }

  try {
    const reply = await groqComplete([{ role: "system", content: systemPrompt }, ...messages], { temperature: 0.6, maxTokens: 400 });
    return NextResponse.json({ reply, suggestHuman });
  } catch (err) {
    console.error("[api/chat] groqComplete failed:", err instanceof Error ? err.stack ?? err.message : err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again or message us on WhatsApp." },
      { status: 502 }
    );
  }
}
