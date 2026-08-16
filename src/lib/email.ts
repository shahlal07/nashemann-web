import "server-only";

// Resend, called directly over fetch rather than through the `resend` SDK --
// avoids adding a dependency for what is a single POST endpoint. Deliberately
// best-effort throughout: a failed send here must never fail the real action
// (application submitted, order placed, account deleted, ...) it's reporting
// on, since that side effect already succeeded. Errors are logged, not thrown.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_ENDPOINT = "https://api.resend.com/emails";

const FROM_NOTIFICATIONS = "Nashemann <notifications@nashemann.store>";
const FROM_SUPPORT = "Nashemann <support@nashemann.store>";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nashemann.store";

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li)>/gi, "\n\n")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "$2 ($1)")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&(lt|gt|quot|#39);/g, (m) => ({ "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" }[m] ?? m))
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function sendMail(params: { to: string; subject: string; html: string; from?: string }): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn(`[email] Skipped "${params.subject}" to ${params.to} -- RESEND_API_KEY not set.`);
    return;
  }
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: params.from ?? FROM_NOTIFICATIONS,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: htmlToText(params.html),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[email] Resend rejected "${params.subject}" to ${params.to}: ${res.status} ${body}`);
    }
  } catch (err) {
    console.error(`[email] Failed to send "${params.subject}" to ${params.to}:`, err);
  }
}

function wrapEmail(bodyHtml: string): string {
  return `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;">
      <div style="background:#111827;padding:22px 24px;border-radius:14px 14px 0 0;">
        <span style="color:#fff;font-size:19px;font-weight:700;letter-spacing:-0.01em;">Nashemann</span>
      </div>
      <div style="background:#fff;border:1px solid #eee;border-top:none;border-radius:0 0 14px 14px;padding:26px;color:#1f2937;">
        ${bodyHtml}
      </div>
      <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px;">
        Nashemann · multi-vendor storefronts, one platform · <a href="${SITE_URL}" style="color:#9ca3af;">nashemann.store</a>
      </p>
    </div>
  `;
}

function button(href: string, label: string, color = "#111827"): string {
  return `<a href="${href}" style="display:inline-block;margin-top:18px;background:${color};color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:600;font-size:14px;">${label}</a>`;
}

export async function sendApplicationSubmittedEmail(params: {
  to: string;
  ownerName: string;
  businessName: string;
  referenceId: string;
}): Promise<void> {
  const trackUrl = `${SITE_URL}/apply/track?ref=${encodeURIComponent(params.referenceId)}`;
  const html = wrapEmail(`
    <h2 style="margin-top:0;">Thanks, ${params.ownerName.split(" ")[0]} — we've got your application</h2>
    <p><strong>${params.businessName}</strong>'s application to join Nashemann has been submitted and is now in our review queue.</p>
    <p style="margin:18px 0;">Your reference ID:</p>
    <p style="font-family:monospace;font-size:18px;font-weight:700;letter-spacing:0.05em;background:#f3f4f6;padding:10px 14px;border-radius:8px;display:inline-block;">${params.referenceId}</p>
    <p style="margin-top:18px;">Keep this ID handy — you can check your application's status any time.</p>
    ${button(trackUrl, "Track your application")}
  `);
  await sendMail({ to: params.to, subject: `Application received — ${params.referenceId}`, html });
}

export async function sendApplicationStatusEmail(params: {
  to: string;
  ownerName: string;
  businessName: string;
  referenceId: string;
  status: "approved" | "rejected";
  subdomain?: string;
}): Promise<void> {
  const isApproved = params.status === "approved";
  const storeUrl = params.subdomain ? `https://${params.subdomain}.nashemann.store` : undefined;
  const html = wrapEmail(
    isApproved
      ? `
        <h2 style="margin-top:0;">You're in, ${params.ownerName.split(" ")[0]} 🎉</h2>
        <p><strong>${params.businessName}</strong> has been approved and your storefront is live on Nashemann.</p>
        ${storeUrl ? `<p style="margin:18px 0;">Your store:</p><p style="font-weight:700;">${storeUrl}</p>` : ""}
        <p style="margin-top:18px;">Sign in to your vendor dashboard to add products, connect a payment method, and start taking orders.</p>
        ${button(`${SITE_URL}/signup?returnTo=/vendor/dashboard`, "Go to your dashboard")}
      `
      : `
        <h2 style="margin-top:0;">About your application, ${params.ownerName.split(" ")[0]}</h2>
        <p>We've reviewed <strong>${params.businessName}</strong>'s application (ref. ${params.referenceId}) and aren't able to move forward with it at this time.</p>
        <p style="margin-top:14px;">If you think this was a mistake or want more detail, reply to this email and we'll get back to you.</p>
      `
  );
  await sendMail({
    to: params.to,
    subject: isApproved ? `You're approved — welcome to Nashemann, ${params.businessName}` : `Update on your Nashemann application — ${params.referenceId}`,
    html,
  });
}

export async function sendWelcomeEmail(params: { to: string; name: string }): Promise<void> {
  const html = wrapEmail(`
    <h2 style="margin-top:0;">Welcome to Nashemann, ${params.name.split(" ")[0]}</h2>
    <p>Your platform account is ready. From here you can apply to open a vendor storefront, track applications, and reach support any time.</p>
    ${button(`${SITE_URL}/account`, "Go to your account")}
  `);
  await sendMail({ to: params.to, subject: "Welcome to Nashemann", html });
}

export async function sendAccountDeletionConfirmationEmail(params: { to: string; name: string }): Promise<void> {
  const html = wrapEmail(`
    <h2 style="margin-top:0;">Your Nashemann account has been deleted</h2>
    <p>Hi ${params.name.split(" ")[0]}, this confirms your Nashemann platform account and its associated data (bug reports, support conversations) have been permanently deleted, as requested.</p>
    <p style="margin-top:14px;">Any vendor application you submitted has been anonymized rather than deleted, since it may be tied to a live, operating store.</p>
    <p style="margin-top:14px;">If you didn't request this, contact us immediately by replying to this email.</p>
  `);
  await sendMail({ to: params.to, subject: "Your Nashemann account has been deleted", html, from: FROM_SUPPORT });
}

export async function sendBugReportAckEmail(params: { to: string; name: string; title: string }): Promise<void> {
  const html = wrapEmail(`
    <h2 style="margin-top:0;">Got it, ${params.name.split(" ")[0]} — thanks for the report</h2>
    <p>We've logged your bug report:</p>
    <p style="font-weight:600;background:#f3f4f6;padding:10px 14px;border-radius:8px;">${params.title}</p>
    <p style="margin-top:14px;">Someone on the team will take a look. If it's confirmed, you'll get Rs 500 in platform credit.</p>
  `);
  await sendMail({ to: params.to, subject: `We've got your bug report — ${params.title}`, html, from: FROM_SUPPORT });
}

type StorefrontOrderItemForEmail = { name: string; qty: number; unitPrice: number };

function itemsTable(items: StorefrontOrderItemForEmail[]): string {
  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:7px 0;border-bottom:1px solid #f0f0f0;">${i.name} × ${i.qty}</td>
        <td style="padding:7px 0;border-bottom:1px solid #f0f0f0;text-align:right;">Rs ${Math.round(i.unitPrice * i.qty).toLocaleString("en-PK")}</td>
      </tr>`
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;margin:14px 0;font-size:14px;">${rows}</table>`;
}

export async function sendStorefrontOrderCustomerEmail(params: {
  to: string;
  customerName: string;
  vendorName: string;
  orderId: string;
  items: StorefrontOrderItemForEmail[];
  totalAmount: number;
}): Promise<void> {
  const html = wrapEmail(`
    <h2 style="margin-top:0;">Order received, ${params.customerName.split(" ")[0]}!</h2>
    <p><strong>${params.vendorName}</strong> has your preorder and will confirm delivery details with you shortly.</p>
    ${itemsTable(params.items)}
    <p style="text-align:right;font-weight:700;font-size:17px;margin:8px 0;">Total: Rs ${Math.round(params.totalAmount).toLocaleString("en-PK")}</p>
    <p style="margin-top:14px;color:#6b7280;font-size:13px;">Order #${params.orderId.slice(0, 8)}</p>
  `);
  await sendMail({ to: params.to, subject: `Order received — ${params.vendorName}`, html });
}

export async function sendStorefrontOrderVendorEmail(params: {
  to: string;
  vendorName: string;
  vendorSubdomain: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: StorefrontOrderItemForEmail[];
  totalAmount: number;
}): Promise<void> {
  const dashboardUrl = `https://admin.${params.vendorSubdomain}.nashemann.store`;
  const html = wrapEmail(`
    <h2 style="margin-top:0;">New preorder — ${params.vendorName}</h2>
    <p><strong>${params.customerName}</strong> (${params.customerPhone}) just placed a preorder for Rs ${Math.round(params.totalAmount).toLocaleString("en-PK")}.</p>
    ${itemsTable(params.items)}
    <p style="margin-top:14px;"><strong>Deliver to:</strong><br/>${params.customerAddress}</p>
    <p style="margin-top:10px;color:#6b7280;font-size:13px;">Order #${params.orderId.slice(0, 8)} · payment screenshot attached in your dashboard</p>
    ${button(dashboardUrl, "Open vendor dashboard")}
  `);
  await sendMail({ to: params.to, subject: `New order — Rs ${Math.round(params.totalAmount).toLocaleString("en-PK")} (${params.customerName})`, html });
}
