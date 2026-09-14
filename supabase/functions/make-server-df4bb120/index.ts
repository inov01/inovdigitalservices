import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import * as kv from "./kv_store.tsx";

// Primary site server for INOV Digital Services.
// Public routes (site → server) are authenticated only with the anon key at the
// function gateway; the server treats them as anonymous and exposes only the
// public surface. Admin routes require a valid Supabase Auth access token whose
// user email is present in ADMIN_EMAILS.
//
// KV keys (shared table kv_store_df4bb120):
//   lead:<id>        — a captured lead/quote/contact request
//   sub:<email>      — a newsletter subscriber
//   settings         — global SiteSettings ({ announcement })
//   bootstrapped     — boolean flag, true once the first admin account exists

const app = new Hono();
const P = "/make-server-df4bb120";

app.use("*", logger(console.log));

// CORS allowlist (fail-closed). Production origins are known and hardcoded so the
// API never silently reflects "*". Extra origins can be added via ALLOWED_ORIGINS
// (comma-separated). Vercel previews, localhost and the Figma Make preview are
// permitted so dev/preview keep working without opening the API to every site.
const PROD_ORIGINS = [
  "https://inovdigitalservices.com",
  "https://www.inovdigitalservices.com",
];
const ENV_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const ORIGIN_ALLOWLIST = ENV_ORIGINS.length ? ENV_ORIGINS : PROD_ORIGINS;
function corsOrigin(origin: string | undefined | null): string | null {
  if (!origin) return null;
  if (ORIGIN_ALLOWLIST.includes(origin)) return origin;
  try {
    const h = new URL(origin).hostname;
    if (h === "localhost" || h === "127.0.0.1") return origin;
    if (h.endsWith(".vercel.app")) return origin;
    if (h.endsWith(".figma.com") || h.endsWith(".figma.site")) return origin;
  } catch { /* malformed origin → deny */ }
  return null;
}
app.use(
  "/*",
  cors({
    origin: (origin) => corsOrigin(origin),
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Lightweight per-IP rate limiter for public endpoints, backed by the KV table.
// Counts requests per fixed time window; returns false once the cap is exceeded.
async function rateLimit(c: any, bucket: string, max: number, windowSec = 60): Promise<boolean> {
  const ip =
    (c.req.header("x-forwarded-for") ?? "").split(",")[0].trim() ||
    c.req.header("cf-connecting-ip") ||
    "unknown";
  const win = Math.floor(Date.now() / (windowSec * 1000));
  const key = `rl:${bucket}:${ip}:${win}`;
  const cur = await kv.get(key);
  const n = (typeof cur === "number" ? cur : 0) + 1;
  await kv.set(key, n);
  return n <= max;
}

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Private bucket holding client-uploaded brief attachments (logos references,
// documents, sample videos…). Created lazily on first use. Files are never
// public: the site gets a short-lived signed upload URL, the admin gets a
// short-lived signed download URL. 200 MB cap covers short reference clips.
const BRIEF_BUCKET = "brief-uploads";
const BRIEF_MAX_BYTES = 200 * 1024 * 1024;
let briefBucketReady = false;
async function ensureBriefBucket(): Promise<void> {
  if (briefBucketReady) return;
  const { data } = await admin.storage.getBucket(BRIEF_BUCKET);
  if (!data) {
    await admin.storage.createBucket(BRIEF_BUCKET, {
      public: false,
      fileSizeLimit: BRIEF_MAX_BYTES,
    }).catch(() => { /* concurrent create — ignore */ });
  }
  briefBucketReady = true;
}
// Keep only safe path characters so a crafted filename can't escape the folder.
function safeName(name: string): string {
  return (name || "file")
    .slice(-120)
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/^\.+/, "_");
}

// Admin allowlist — emails permitted to read/manage leads, subscribers, settings.
// Falls back to the known owner account so the API is NEVER open to any
// authenticated user (client signups share this Supabase project). Override or
// extend via the ADMIN_EMAILS env (comma-separated).
const DEFAULT_ADMINS = ["inov01contact@gmail.com"];
const ENV_ADMINS = (Deno.env.get("ADMIN_EMAILS") ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
const ADMIN_EMAILS = ENV_ADMINS.length ? ENV_ADMINS : DEFAULT_ADMINS;

// Public site URL + a stable (non-hashed) logo asset served from /public, used
// to brand every outgoing e-mail. Overridable via env for staging domains.
const SITE_URL = (Deno.env.get("SITE_URL") ?? "https://inov-digital-services.vercel.app").replace(/\/+$/, "");
// PNG (not WebP): Outlook desktop, Yahoo, AOL and several mobile clients do not
// render WebP, which left the logo as a broken-image box in many inboxes.
const EMAIL_LOGO = `${SITE_URL}/email-logo.png`;

// Shared secret guarding the scheduled-newsletter dispatch endpoint (called by a
// cron job, not an admin session). No secret set ⇒ dispatch is disabled.
const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";

// ── Meta auto-publishing (Facebook Page + Instagram Business) ──────────────────
// All optional: a network is simply skipped when its ids/token are absent (same
// policy as the WhatsApp integration). META_PAGE_TOKEN is a long-lived Page
// access token; the IG account must be a Business/Creator account linked to the
// same Facebook Page. Required Meta permissions: pages_manage_posts and
// instagram_content_publish (app must be reviewed/approved by Meta to post live).
const META_GRAPH = `https://graph.facebook.com/${Deno.env.get("META_GRAPH_VERSION") ?? "v21.0"}`;
const META_PAGE_ID = Deno.env.get("META_PAGE_ID") ?? "";
const META_PAGE_TOKEN = Deno.env.get("META_PAGE_TOKEN") ?? "";
const META_IG_USER_ID = Deno.env.get("META_IG_USER_ID") ?? "";
// True when at least one network can actually publish.
function metaConfigured(): boolean {
  return !!META_PAGE_TOKEN && (!!META_PAGE_ID || !!META_IG_USER_ID);
}

// ── Meta Conversions API (server-side events) ──────────────────────────────────
// Sends conversion events (Lead, Contact, …) to Meta straight from the server,
// so ad optimisation keeps working even when the browser Pixel is blocked by an
// ad-blocker, iOS ITP or a rejected cookie consent. Personally identifiable
// fields (email, phone) are SHA-256 hashed before they ever leave the server, as
// Meta requires. Send the SAME event_id here and in the browser Pixel call for
// the same action so Meta DEDUPLICATES them into one conversion.
//   META_PIXEL_ID    the Pixel/dataset id (same one used by the site Pixel)
//   META_CAPI_TOKEN  a Conversions API access token (Events Manager → Settings)
const META_PIXEL_ID = Deno.env.get("META_PIXEL_ID") ?? "";
const META_CAPI_TOKEN = Deno.env.get("META_CAPI_TOKEN") ?? "";
const META_TEST_EVENT_CODE = Deno.env.get("META_TEST_EVENT_CODE") ?? "";
// App Secret used to sign webhook deliveries (X-Hub-Signature-256). Required to
// authenticate incoming Meta/WhatsApp POST payloads.
const META_APP_SECRET = Deno.env.get("META_APP_SECRET") ?? "";

// Verify a Meta webhook delivery by recomputing HMAC-SHA256(raw body, app secret)
// and comparing (constant-time) against the X-Hub-Signature-256 header. Returns
// true only when a secret is configured AND the signature matches. Fails closed.
async function verifyMetaSignature(c: any, raw: string): Promise<boolean> {
  if (!META_APP_SECRET) {
    console.error("[webhook] META_APP_SECRET not set — rejecting unsigned delivery");
    return false;
  }
  const header = c.req.header("x-hub-signature-256") ?? "";
  const expected = header.startsWith("sha256=") ? header.slice(7) : "";
  if (!expected) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(META_APP_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw));
  const actual = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  // Constant-time compare.
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

// SHA-256 of a normalised value (trimmed + lowercased), hex-encoded — the exact
// format Meta expects for hashed user_data. Empty input yields an empty string.
async function sha256Hex(value: string): Promise<string> {
  const normalised = String(value ?? "").trim().toLowerCase();
  if (!normalised) return "";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalised));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Fire a server-side conversion event. Silently skips when unconfigured, so the
// caller never has to guard on env presence. Best-effort: failures are logged,
// never thrown, so a Meta hiccup can't break lead capture.
async function sendMetaConversion(opts: {
  eventName: string;
  eventId: string;
  email?: string;
  phone?: string;
  clientIp?: string;
  userAgent?: string;
  eventSourceUrl?: string;
  fbp?: string;
  fbc?: string;
  customData?: Record<string, unknown>;
}): Promise<{ sent: boolean; skipped?: string; error?: string }> {
  if (!META_PIXEL_ID || !META_CAPI_TOKEN) return { sent: false, skipped: "not_configured" };
  try {
    const [em, ph] = await Promise.all([
      opts.email ? sha256Hex(opts.email) : Promise.resolve(""),
      // Phone must be digits-only (with country code) before hashing.
      opts.phone ? sha256Hex(normalizeWa(opts.phone)) : Promise.resolve(""),
    ]);
    const user_data: Record<string, unknown> = {};
    if (em) user_data.em = [em];
    if (ph) user_data.ph = [ph];
    if (opts.clientIp) user_data.client_ip_address = opts.clientIp;
    if (opts.userAgent) user_data.client_user_agent = opts.userAgent;
    if (opts.fbp) user_data.fbp = opts.fbp;
    if (opts.fbc) user_data.fbc = opts.fbc;

    const payload: Record<string, unknown> = {
      data: [{
        event_name: opts.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: opts.eventId,
        action_source: "website",
        event_source_url: opts.eventSourceUrl || SITE_URL,
        user_data,
        custom_data: opts.customData ?? {},
      }],
    };
    if (META_TEST_EVENT_CODE) payload.test_event_code = META_TEST_EVENT_CODE;

    const res = await fetch(
      `${META_GRAPH}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(META_CAPI_TOKEN)}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
    );
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[capi] ${opts.eventName} failed ${res.status}: ${detail.slice(0, 300)}`);
      return { sent: false, error: `capi_${res.status}` };
    }
    return { sent: true };
  } catch (e) {
    console.error("[capi] error:", e);
    return { sent: false, error: String((e as any)?.message ?? e) };
  }
}
// Turn a site-relative path ("/blog/x", "/email-logo.png") into an absolute URL
// Meta can fetch. Absolute URLs are returned untouched.
function absoluteUrl(u: string): string {
  const s = String(u ?? "").trim();
  if (!s || /^https?:\/\//i.test(s)) return s;
  return `${SITE_URL}${s.startsWith("/") ? "" : "/"}${s}`;
}

// Resolves the authenticated Supabase user from the Bearer token, or null. The
// anon key is not a user token, so it resolves to null (correctly rejected on
// admin routes).
async function getUser(c: any) {
  const token = (c.req.header("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

function isAdmin(user: any): boolean {
  const email = (user?.email ?? "").toLowerCase();
  // Fail-closed: only emails on the allowlist are admins. ADMIN_EMAILS always has
  // at least the default owner, so a self-registered client is never an admin.
  return !!email && ADMIN_EMAILS.includes(email);
}

// True once a Supabase auth account exists for any allowlisted admin email.
// Used to permanently close first-admin creation: once the owner account exists,
// admin access is by logging into it — never by creating another admin account.
async function adminAccountExists(): Promise<boolean> {
  try {
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const emails = (data?.users ?? []).map((u: any) => (u.email ?? "").toLowerCase());
    return ADMIN_EMAILS.some((a) => emails.includes(a));
  } catch {
    // Fail-closed: if we can't verify, assume an admin exists so we never expose
    // an open account-creation endpoint.
    return true;
  }
}

// Guard for admin routes: returns the user or sends the error response.
async function requireAdmin(c: any): Promise<any | Response> {
  const user = await getUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  if (!isAdmin(user)) return c.json({ error: "forbidden" }, 403);
  return user;
}

const DEFAULT_SETTINGS = {
  announcement: { enabled: false, text: "", link: "" },
  pricing: {} as Record<string, number>,
  servicesRemoved: [] as number[],
  servicesAdded: [] as any[],
  albumsRemoved: [] as string[],
  albumsAdded: [] as any[],
  worksRemoved: [] as string[],
  worksAdded: {} as Record<string, any[]>,
  blogsRemoved: [] as string[],
  blogsAdded: [] as any[],
  // Social auto-reply templates (Instagram/Facebook/WhatsApp). Editable from the
  // admin "Réponses sociales" panel; also usable as copy-paste snippets to reply
  // by hand (e.g. comments on videos) before the automation is switched on.
  socialReplies: {
    waitMessage: "",       // "" → falls back to META_WAIT_MSG / built-in default
    commentReply: "",      // "" → falls back to META_COMMENT_REPLY / built-in default
    useGemini: false,      // when true, unmatched DMs get a Gemini-drafted reply
    faq: [] as { keywords: string[]; answer: string }[],
    snippets: [] as { title: string; text: string }[], // manual-use reply library
  },
  // Payment / payout coordinates shown on the /payer page. Kept OUT of the source
  // repo: empty by default here, filled at runtime from Supabase secrets (see
  // paymentsWithEnv) or overridden from the admin panel. So the bank account never
  // lives in git.
  payments: {
    moncash: { number: "", holder: "" },
    natcash: { number: "", holder: "" },
    buh: { bank: "", account: "", holder: "", type: "" },
    upwork: { email: "" },
    whatsapp: "",
  },
};

// Sanitize the payment coordinates coming from the admin panel.
function cleanPayments(input: unknown): typeof DEFAULT_SETTINGS.payments {
  const b = (input && typeof input === "object" ? input : {}) as Record<string, any>;
  const s = (v: unknown, max = 120) => String(v ?? "").slice(0, max).trim();
  const m = (b.moncash ?? {}) as any;
  const n = (b.natcash ?? {}) as any;
  const k = (b.buh ?? {}) as any;
  const u = (b.upwork ?? {}) as any;
  return {
    moncash: { number: s(m.number), holder: s(m.holder) },
    natcash: { number: s(n.number), holder: s(n.holder) },
    buh: { bank: s(k.bank), account: s(k.account), holder: s(k.holder), type: s(k.type) },
    upwork: { email: s(u.email, 200) },
    whatsapp: s(b.whatsapp, 40),
  };
}

// Fill any blank payment field from Supabase secrets, so the real coordinates
// live in the project's secrets (env) rather than in the code. Admin-saved values
// (KV) win; otherwise we fall back to the env var; otherwise "".
function paymentsWithEnv(stored: unknown): typeof DEFAULT_SETTINGS.payments {
  const p = cleanPayments(stored);
  const env = (name: string) => (Deno.env.get(name) ?? "").trim();
  const pick = (v: string, name: string) => (v ? v : env(name));
  return {
    moncash: {
      number: pick(p.moncash.number, "PAY_MONCASH_NUMBER"),
      holder: pick(p.moncash.holder, "PAY_MONCASH_HOLDER"),
    },
    natcash: {
      number: pick(p.natcash.number, "PAY_NATCASH_NUMBER"),
      holder: pick(p.natcash.holder, "PAY_NATCASH_HOLDER"),
    },
    buh: {
      bank: pick(p.buh.bank, "PAY_BUH_BANK"),
      account: pick(p.buh.account, "PAY_BUH_ACCOUNT"),
      holder: pick(p.buh.holder, "PAY_BUH_HOLDER"),
      type: pick(p.buh.type, "PAY_BUH_TYPE"),
    },
    upwork: { email: pick(p.upwork.email, "PAY_UPWORK_EMAIL") },
    whatsapp: pick(p.whatsapp, "PAY_WHATSAPP"),
  };
}

// Sanitize the social auto-reply templates coming from the admin panel.
function cleanSocialReplies(input: unknown): typeof DEFAULT_SETTINGS.socialReplies {
  const b = (input && typeof input === "object" ? input : {}) as Record<string, any>;
  const faq = Array.isArray(b.faq)
    ? b.faq.slice(0, 40).map((r: any) => ({
        keywords: Array.isArray(r?.keywords)
          ? r.keywords.slice(0, 20).map((k: any) => String(k ?? "").slice(0, 60).trim()).filter(Boolean)
          : [],
        answer: String(r?.answer ?? "").slice(0, 1000),
      })).filter((r: any) => r.keywords.length && r.answer)
    : [];
  const snippets = Array.isArray(b.snippets)
    ? b.snippets.slice(0, 60).map((s: any) => ({
        title: String(s?.title ?? "").slice(0, 120).trim(),
        text: String(s?.text ?? "").slice(0, 1000),
      })).filter((s: any) => s.title && s.text)
    : [];
  return {
    waitMessage: String(b.waitMessage ?? "").slice(0, 1000),
    commentReply: String(b.commentReply ?? "").slice(0, 1000),
    useGemini: !!b.useGemini,
    faq,
    snippets,
  };
}

// Sanitize admin base-price overrides (USD, keyed by service id).
function cleanPricing(input: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (input && typeof input === "object") {
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      const n = Number(v);
      if (Number.isFinite(n) && n >= 0) out[k] = Math.min(1_000_000, Math.round(n));
    }
  }
  return out;
}

const str = (v: unknown, max = 300) => (typeof v === "string" ? v.slice(0, max) : "");
const num = (v: unknown, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.min(1_000_000, Math.round(n)) : def;
};

// Sanitize the list of hidden built-in ids (numbers for services, strings for albums).
function cleanIdList(input: unknown, kind: "num" | "str"): any[] {
  if (!Array.isArray(input)) return [];
  const out: any[] = [];
  for (const v of input.slice(0, 500)) {
    if (kind === "num") { const n = Number(v); if (Number.isInteger(n)) out.push(n); }
    else if (typeof v === "string" && v) out.push(v.slice(0, 80));
  }
  return out;
}

// Sanitize admin-added service cards.
function cleanServices(input: unknown): any[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 100).map((s: any) => ({
    id: Number.isInteger(Number(s?.id)) ? Number(s.id) : Date.now(),
    name: str(s?.name, 120),
    desc: str(s?.desc, 600),
    price: num(s?.price),
    type: s?.type === "video" ? "video" : "static",
    advantage: str(s?.advantage, 200),
    deliveryDays: num(s?.deliveryDays, 7),
    revisions: num(s?.revisions, 1),
    revisionDays: num(s?.revisionDays, 3),
    exampleImg: str(s?.exampleImg, 600) || undefined,
    projectUrl: str(s?.projectUrl, 600) || undefined,
    featured: !!s?.featured,
    quoteOnly: !!s?.quoteOnly,
  })).filter((s) => s.name);
}

// Sanitize admin-added portfolio albums.
function cleanAlbums(input: unknown): any[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 200).map((a: any) => {
    const works = Array.isArray(a?.works)
      ? a.works.slice(0, 40).map((w: any) => ({
          title: str(w?.title, 160),
          category: str(w?.category, 80),
          desc: str(w?.desc, 400),
          img: str(w?.img, 600) || undefined,
          videoId: str(w?.videoId, 40) || undefined,
        })).filter((w: any) => w.img || w.videoId)
      : [];
    const labels = Array.isArray(a?.serviceLabels)
      ? a.serviceLabels.slice(0, 12).map((l: any) => str(l, 60)).filter(Boolean)
      : [];
    return {
      id: str(a?.id, 80) || `${Date.now()}`,
      group: a?.group === "client" ? "client" : "other",
      client: str(a?.client, 120),
      ceo: str(a?.ceo, 120) || undefined,
      logo: str(a?.logo, 600) || undefined,
      tagline: str(a?.tagline, 200),
      accent: str(a?.accent, 40) || undefined,
      impact: str(a?.impact, 300) || undefined,
      serviceLabels: labels,
      works,
    };
  }).filter((a) => a.client && a.works.length > 0);
}

// Sanitize a single portfolio work item (shared by albums & per-album extras).
function cleanWork(w: any): any {
  return {
    title: str(w?.title, 160),
    category: str(w?.category, 80),
    desc: str(w?.desc, 400),
    img: str(w?.img, 600) || undefined,
    videoId: str(w?.videoId, 40) || undefined,
  };
}

// Sanitize the list of hidden individual works, keyed `${albumId}#${index}`.
function cleanWorksRemoved(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out: string[] = [];
  for (const v of input.slice(0, 2000)) {
    if (typeof v === "string" && v) out.push(v.slice(0, 100));
  }
  return out;
}

// Sanitize the map of extra works appended per album id.
function cleanWorksAdded(input: unknown): Record<string, any[]> {
  const out: Record<string, any[]> = {};
  if (input && typeof input === "object") {
    for (const [k, v] of Object.entries(input as Record<string, unknown>).slice(0, 300)) {
      if (!k || !Array.isArray(v)) continue;
      const works = v.slice(0, 40).map(cleanWork).filter((w: any) => w.img || w.videoId);
      if (works.length) out[k.slice(0, 80)] = works;
    }
  }
  return out;
}

// Sanitize admin-authored blog articles.
function cleanBlogs(input: unknown): any[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 200).map((b: any) => {
    const body = Array.isArray(b?.body)
      ? b.body.slice(0, 60).map((p: any) => str(p, 1200)).filter(Boolean)
      : [];
    return {
      id: str(b?.id, 80) || `${Date.now()}`,
      tag: str(b?.tag, 60),
      read: num(b?.read, 3),
      title: str(b?.title, 200),
      excerpt: str(b?.excerpt, 400),
      body,
      image: str(b?.image, 600) || undefined,
      slug: str(b?.slug, 120) || undefined,
    };
  }).filter((b) => b.title && b.body.length > 0);
}

function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function isEmail(v: unknown): v is string {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// ── Receipt (reçu) email ──────────────────────────────────────────────────────
// Built in the same visual language as the site's proforma (white sheet, black
// hairline borders, Outfit type). Uses table-based layout so Gmail and other
// mail clients render it reliably.
function escH(s: unknown): string {
  return String(s ?? "").replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}
function fmtMoney(n: number | null | undefined, cur?: string): string {
  return typeof n === "number" ? `${n.toLocaleString("fr-FR")}${cur ? ` ${cur}` : ""}` : "—";
}
function receiptNo(l: any): string {
  const y = new Date(l.createdAt).getFullYear();
  return `INOV-${y}-${String(l.id).slice(-6).toUpperCase()}`;
}
// A cart service line, always shown in the lead's own currency (matching the total).
// The multiplier is DERIVED from the lead itself — total ÷ sum of base USD — so
// every line uses the same effective rate that produced the paid total. Lines and
// total stay reconciled and always reflect the applied rate. Stored `rate` is only
// a fallback when there is no priced total to derive from.
function localMultiplier(services: any[], total: number | null, rate: number | null): number | null {
  const sumUsd = services.reduce((a: number, s: any) => a + (typeof s.usd === "number" ? s.usd * s.qty : 0), 0);
  if (typeof total === "number" && sumUsd > 0) return total / sumUsd;
  if (rate != null) return rate;
  return null;
}
function svcLineAmount(s: any, cur: string, mult: number | null): string {
  if (s.usd == null) return "sur devis";
  if (mult != null) return fmtMoney(Math.round(s.usd * s.qty * mult), cur);
  if (typeof s.local === "number") return fmtMoney(s.local, cur);
  return `$${(s.usd * s.qty).toLocaleString("en-US")}`;
}

function buildReceiptHtml(l: any): string {
  const meta = (l.meta ?? {}) as Record<string, unknown>;
  const method = (meta.paymentMethodLabel as string) || (meta.paymentMethod as string) || "—";
  const reference = (meta.reference as string) || "";
  const paid = l.status === "won";
  // Fall back to the email-safe PNG logo when LOGO_URL is unset (an empty env
  // previously produced no image; a stale .webp override produced a broken one).
  const logoUrl = Deno.env.get("LOGO_URL") || EMAIL_LOGO;

  type Row = { label: string; qty: number; amount: string };
  let rows: Row[] = [];
  if (Array.isArray(l.items) && l.items.length > 0) {
    rows = l.items.map((it: any) => ({
      label: (it.name ?? "") + (it.tier ? ` (${it.tier})` : ""),
      qty: it.qty ?? 1,
      amount: fmtMoney(it.price, l.currency),
    }));
  } else if (Array.isArray(meta.services)) {
    const svc = meta.services as any[];
    const rate = typeof meta.rate === "number" ? (meta.rate as number) : null;
    const mult = localMultiplier(svc, l.total, rate);
    rows = svc.map((s) => ({
      label: s.name,
      qty: s.qty,
      amount: svcLineAmount(s, l.currency, mult),
    }));
  }
  const balance =
    typeof l.total === "number" && typeof l.deposit === "number" ? l.total - l.deposit : null;

  const cell = "padding:13px 18px;border:1.5px solid #111;";
  const rowsHtml = rows.length
    ? rows.map((r) => `<tr>
        <td style="${cell}font-weight:700;font-size:13px;">${escH(String(r.label).toUpperCase())}</td>
        <td style="${cell}text-align:center;font-weight:700;font-size:13px;">${escH(r.qty)}</td>
        <td style="${cell}text-align:right;font-weight:800;font-size:13px;white-space:nowrap;">${escH(r.amount)}</td>
      </tr>`).join("")
    : `<tr><td colspan="3" style="${cell}text-align:center;color:#666;">Aucun détail de service enregistré.</td></tr>`;

  const totalsRows = [
    `<tr><td style="padding:9px 22px;border:1.5px solid #111;font-weight:700;font-size:13px;">Total</td>
      <td style="padding:9px 22px;border:1.5px solid #111;font-weight:800;font-size:13px;text-align:right;white-space:nowrap;">${escH(fmtMoney(l.total, l.currency))}</td></tr>`,
    typeof l.deposit === "number"
      ? `<tr><td style="padding:9px 22px;border:1.5px solid #111;font-weight:700;font-size:13px;">Acompte reçu</td>
          <td style="padding:9px 22px;border:1.5px solid #111;font-weight:700;font-size:13px;text-align:right;white-space:nowrap;">${escH(fmtMoney(l.deposit, l.currency))}</td></tr>`
      : "",
    balance !== null
      ? `<tr><td style="padding:9px 22px;border:1.5px solid #111;font-weight:700;font-size:13px;">Solde restant</td>
          <td style="padding:9px 22px;border:1.5px solid #111;font-weight:700;font-size:13px;text-align:right;white-space:nowrap;">${escH(fmtMoney(balance, l.currency))}</td></tr>`
      : "",
    `<tr><td style="padding:13px 22px;border:1.5px solid #111;background:#e2e2e2;font-weight:800;font-size:15px;">Montant ${paid ? "payé" : "dû"}</td>
      <td style="padding:13px 22px;border:1.5px solid #111;background:#e2e2e2;font-weight:900;font-size:15px;text-align:right;white-space:nowrap;">${escH(fmtMoney(typeof l.deposit === "number" && !paid ? l.deposit : l.total, l.currency))}</td></tr>`,
  ].join("");

  const stampColor = paid ? "#16a34a" : "#F7931E";
  const stampText = paid ? "PAYÉ" : "EN ATTENTE";
  const dateStr = new Date(l.createdAt).toLocaleDateString("fr-FR");
  const emittedStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Reçu ${escH(receiptNo(l))}</title></head>
<body style="margin:0;padding:24px;background:#f4f4f4;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
  <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="background:#fff;max-width:640px;width:100%;box-shadow:0 8px 40px rgba(0,0,0,0.10);">
    <tr><td style="padding:40px 36px;">
      <!-- Header -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="vertical-align:top;">${logoUrl ? `<img src="${escH(logoUrl)}" alt="INOV Digital Services" height="56" style="height:56px;width:auto;max-width:220px;border:0;outline:none;text-decoration:none;display:block;">` : `<div style="font-size:22px;font-weight:900;">INOV <span style="color:#F7931E;">Digital Services</span></div>`}</td>
        <td style="text-align:right;vertical-align:top;">
          <div style="font-size:34px;font-weight:900;letter-spacing:-0.01em;">REÇU</div>
          <div style="margin-top:6px;font-size:13px;font-weight:800;">N° ${escH(receiptNo(l))}</div>
          <div style="margin-top:8px;display:inline-block;padding:4px 14px;border:2.5px solid ${stampColor};color:${stampColor};font-weight:900;font-size:14px;letter-spacing:0.08em;border-radius:4px;">${stampText}</div>
        </td>
      </tr></table>

      <!-- Info boxes -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;"><tr>
        <td style="vertical-align:top;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="padding:12px 18px;border:1.5px solid #111;background:#e2e2e2;font-weight:800;font-size:12.5px;">AU NOM DE</td>
            <td style="padding:12px 18px;border:1.5px solid #111;font-weight:700;font-size:12.5px;">${escH(String(l.name || "CLIENT").toUpperCase())}</td>
          </tr></table>
        </td>
        <td style="text-align:right;vertical-align:top;">
          <table role="presentation" cellpadding="0" cellspacing="0" align="right"><tr>
            <td style="padding:12px 18px;border:1.5px solid #111;background:#e2e2e2;font-weight:800;font-size:12.5px;">DATE</td>
            <td style="padding:12px 22px;border:1.5px solid #111;font-weight:700;font-size:12.5px;">${escH(emittedStr)}</td>
          </tr></table>
        </td>
      </tr></table>

      <!-- Services -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;border-collapse:collapse;">
        <tr style="background:#111;color:#fff;">
          <th style="padding:12px 18px;border:1.5px solid #111;text-align:left;font-size:12.5px;font-weight:800;">NOM DU SERVICE OU PRODUIT</th>
          <th style="padding:12px 18px;border:1.5px solid #111;text-align:center;font-size:12.5px;font-weight:800;width:60px;">QTÉ</th>
          <th style="padding:12px 18px;border:1.5px solid #111;text-align:left;font-size:12.5px;font-weight:800;width:120px;">PRIX</th>
        </tr>
        ${rowsHtml}
      </table>

      <!-- Payment -->
      <div style="margin-top:24px;font-size:12.5px;line-height:1.9;">
        <span style="font-weight:800;">Moyen de paiement :</span> ${escH(method)}${reference ? ` &nbsp;·&nbsp; <span style="font-weight:800;">Référence :</span> ${escH(reference)}` : ""}<br>
        <span style="font-weight:800;">Date de la commande :</span> ${escH(dateStr)}
      </div>

      <!-- Totals -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;"><tr><td align="right">
        <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${totalsRows}</table>
      </td></tr></table>

      <div style="margin-top:28px;font-size:12.5px;line-height:1.9;">
        <div style="font-weight:700;">@inov_digital_services</div>
        <div style="font-weight:700;">(+509) 3625-5920</div>
      </div>
      <div style="margin-top:24px;text-align:center;font-size:12px;color:#666;">Merci de votre confiance. Ce reçu confirme la réception du paiement indiqué ci-dessus.</div>
    </td></tr>
  </table>
  </td></tr></table>
</body></html>`;
}

// Server-side proforma sheet. Built from STRUCTURED fields only (never from
// client-supplied HTML) so /proforma cannot be abused as an open HTML mail relay.
// Same visual language as the receipt sheet, but a "PROFORMA" stamp, no payment
// method, and a validity note.
function buildProformaHtml(l: any): string {
  const meta = (l.meta ?? {}) as Record<string, unknown>;
  const no = String((meta.proformaNo as string) ?? "").trim();
  const logoUrl = Deno.env.get("LOGO_URL") || EMAIL_LOGO;

  type Row = { label: string; qty: number; amount: string };
  let rows: Row[] = [];
  if (Array.isArray(l.items) && l.items.length > 0) {
    rows = l.items.map((it: any) => ({
      label: (it.name ?? "") + (it.tier ? ` (${it.tier})` : ""),
      qty: it.qty ?? 1,
      amount: fmtMoney(it.price, l.currency),
    }));
  } else if (Array.isArray(meta.services)) {
    const svc = meta.services as any[];
    const rate = typeof meta.rate === "number" ? (meta.rate as number) : null;
    const mult = localMultiplier(svc, l.total, rate);
    rows = svc.map((s) => ({ label: s.name, qty: s.qty, amount: svcLineAmount(s, l.currency, mult) }));
  }
  const balance = typeof l.total === "number" && typeof l.deposit === "number" ? l.total - l.deposit : null;

  const cell = "padding:13px 18px;border:1.5px solid #111;";
  const rowsHtml = rows.length
    ? rows.map((r) => `<tr>
        <td style="${cell}font-weight:700;font-size:13px;">${escH(String(r.label).toUpperCase())}</td>
        <td style="${cell}text-align:center;font-weight:700;font-size:13px;">${escH(r.qty)}</td>
        <td style="${cell}text-align:right;font-weight:800;font-size:13px;white-space:nowrap;">${escH(r.amount)}</td>
      </tr>`).join("")
    : `<tr><td colspan="3" style="${cell}text-align:center;color:#666;">Aucun détail de service enregistré.</td></tr>`;

  const totalsRows = [
    `<tr><td style="padding:9px 22px;border:1.5px solid #111;font-weight:700;font-size:13px;">Total</td>
      <td style="padding:9px 22px;border:1.5px solid #111;font-weight:800;font-size:13px;text-align:right;white-space:nowrap;">${escH(fmtMoney(l.total, l.currency))}</td></tr>`,
    typeof l.deposit === "number"
      ? `<tr><td style="padding:9px 22px;border:1.5px solid #111;font-weight:700;font-size:13px;">Acompte demandé</td>
          <td style="padding:9px 22px;border:1.5px solid #111;font-weight:700;font-size:13px;text-align:right;white-space:nowrap;">${escH(fmtMoney(l.deposit, l.currency))}</td></tr>`
      : "",
    balance !== null
      ? `<tr><td style="padding:9px 22px;border:1.5px solid #111;font-weight:700;font-size:13px;">Solde restant</td>
          <td style="padding:9px 22px;border:1.5px solid #111;font-weight:700;font-size:13px;text-align:right;white-space:nowrap;">${escH(fmtMoney(balance, l.currency))}</td></tr>`
      : "",
    `<tr><td style="padding:13px 22px;border:1.5px solid #111;background:#e2e2e2;font-weight:800;font-size:15px;">Montant dû</td>
      <td style="padding:13px 22px;border:1.5px solid #111;background:#e2e2e2;font-weight:900;font-size:15px;text-align:right;white-space:nowrap;">${escH(fmtMoney(typeof l.deposit === "number" ? l.deposit : l.total, l.currency))}</td></tr>`,
  ].join("");

  const emittedStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Proforma${no ? ` ${escH(no)}` : ""}</title></head>
<body style="margin:0;padding:24px;background:#f4f4f4;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
  <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="background:#fff;max-width:640px;width:100%;box-shadow:0 8px 40px rgba(0,0,0,0.10);">
    <tr><td style="padding:40px 36px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="vertical-align:top;">${logoUrl ? `<img src="${escH(logoUrl)}" alt="INOV Digital Services" height="56" style="height:56px;width:auto;max-width:220px;border:0;outline:none;text-decoration:none;display:block;">` : `<div style="font-size:22px;font-weight:900;">INOV <span style="color:#F7931E;">Digital Services</span></div>`}</td>
        <td style="text-align:right;vertical-align:top;">
          <div style="font-size:30px;font-weight:900;letter-spacing:-0.01em;">FACTURE PROFORMA</div>
          ${no ? `<div style="margin-top:6px;font-size:13px;font-weight:800;">N° ${escH(no)}</div>` : ""}
          <div style="margin-top:8px;display:inline-block;padding:4px 14px;border:2.5px solid #F7931E;color:#F7931E;font-weight:900;font-size:14px;letter-spacing:0.08em;border-radius:4px;">PROFORMA</div>
        </td>
      </tr></table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;"><tr>
        <td style="vertical-align:top;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="padding:12px 18px;border:1.5px solid #111;background:#e2e2e2;font-weight:800;font-size:12.5px;">AU NOM DE</td>
            <td style="padding:12px 18px;border:1.5px solid #111;font-weight:700;font-size:12.5px;">${escH(String(l.name || "CLIENT").toUpperCase())}</td>
          </tr></table>
        </td>
        <td style="text-align:right;vertical-align:top;">
          <table role="presentation" cellpadding="0" cellspacing="0" align="right"><tr>
            <td style="padding:12px 18px;border:1.5px solid #111;background:#e2e2e2;font-weight:800;font-size:12.5px;">DATE</td>
            <td style="padding:12px 22px;border:1.5px solid #111;font-weight:700;font-size:12.5px;">${escH(emittedStr)}</td>
          </tr></table>
        </td>
      </tr></table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;border-collapse:collapse;">
        <tr style="background:#111;color:#fff;">
          <th style="padding:12px 18px;border:1.5px solid #111;text-align:left;font-size:12.5px;font-weight:800;">NOM DU SERVICE OU PRODUIT</th>
          <th style="padding:12px 18px;border:1.5px solid #111;text-align:center;font-size:12.5px;font-weight:800;width:60px;">QTÉ</th>
          <th style="padding:12px 18px;border:1.5px solid #111;text-align:left;font-size:12.5px;font-weight:800;width:120px;">PRIX</th>
        </tr>
        ${rowsHtml}
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;"><tr><td align="right">
        <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${totalsRows}</table>
      </td></tr></table>
      <div style="margin-top:28px;font-size:12.5px;line-height:1.7;color:#444;">Cette facture proforma est valable 15 jours. Elle ne constitue pas un reçu de paiement.</div>
      <div style="margin-top:20px;font-size:12.5px;line-height:1.9;">
        <div style="font-weight:700;">@inov_digital_services</div>
        <div style="font-weight:700;">(+509) 3625-5920</div>
      </div>
      <div style="margin-top:24px;text-align:center;font-size:12px;color:#666;">Merci de votre confiance.</div>
    </td></tr>
  </table>
  </td></tr></table>
</body></html>`;
}

// ── Unified transactional email sender (Gmail SMTP) ───────────────────────────
// Uses Gmail SMTP with an app password. Configure GMAIL_USER and
// GMAIL_APP_PASSWORD as Supabase function secrets.
async function sendMail(opts: { to: string | string[]; subject: string; html: string; text?: string }): Promise<void> {
  const displayName = Deno.env.get("BUSINESS_NAME") ?? "INOV Digital Services";
  const user = Deno.env.get("GMAIL_USER");
  const pass = Deno.env.get("GMAIL_APP_PASSWORD");
  if (!user || !pass) throw new Error("Email non configuré : définir GMAIL_USER et GMAIL_APP_PASSWORD dans les secrets Supabase");
  const client = new SMTPClient({
    connection: { hostname: "smtp.gmail.com", port: 465, tls: true, auth: { username: user, password: pass } },
  });
  try {
    await client.send({
      from: `${displayName} <${user}>`,
      to: opts.to,
      subject: opts.subject,
      content: opts.text ?? "Cet e-mail contient du contenu HTML. Activez l'affichage HTML pour le voir.",
      html: opts.html,
    });
  } finally {
    await client.close();
  }
}

async function sendReceiptEmail(lead: any, subjectOverride?: string): Promise<void> {
  const displayName = Deno.env.get("BUSINESS_NAME") ?? "INOV Digital Services";
  const first = String(lead.name ?? "").trim().split(/\s+/)[0] || "";
  const hello = first ? `Bonjour ${first},` : "Bonjour,";
  const amountStr =
    typeof lead.total === "number" ? `${lead.total.toLocaleString("fr-FR")} ${lead.currency ?? ""}`.trim() : "";
  const textLines = [
    hello,
    "",
    amountStr
      ? `Nous avons bien reçu votre paiement de ${amountStr} — un grand merci pour votre confiance ! 🙏`
      : "Nous avons bien reçu votre paiement — un grand merci pour votre confiance ! 🙏",
    "",
    `Vous trouverez votre reçu officiel (n° ${receiptNo(lead)}) ci-dessous. Conservez-le précieusement.`,
    "",
    "C'est un plaisir de travailler avec vous. N'hésitez pas à nous écrire pour la moindre question.",
    "",
    `À très vite,`,
    `L'équipe ${displayName}`,
  ];
  const subject = (subjectOverride ?? "").trim() || `Merci ${first ? first + " " : ""}! Voici votre reçu ${receiptNo(lead)}`;
  await sendMail({
    to: lead.email,
    subject,
    text: textLines.join("\n"),
    html: buildReceiptHtml(lead),
  });
}

// Emails the client the proforma they requested (same HTML rendered on the site),
// and notifies the team. French-only copy, matching the receipt email's tone.
async function sendProformaEmail(p: any): Promise<void> {
  const displayName = Deno.env.get("BUSINESS_NAME") ?? "INOV Digital Services";
  const first = String(p.name ?? "").trim().split(/\s+/)[0] || "";
  const hello = first ? `Bonjour ${first},` : "Bonjour,";
  const no = String(p.proformaNo ?? (p.meta?.proformaNo) ?? "").trim();
  const totalStr =
    typeof p.total === "number" ? `${p.total.toLocaleString("fr-FR")} ${p.currency ?? ""}`.trim() : "";
  const textLines = [
    hello,
    "",
    "Merci pour votre intérêt ! Vous trouverez ci-dessous votre facture proforma" +
      (no ? ` (n° ${no})` : "") +
      (totalStr ? `, d'un montant de ${totalStr}` : "") +
      ".",
    "",
    "Cette proforma est valable 15 jours. Pour confirmer votre commande ou pour toute question, répondez simplement à cet e-mail ou écrivez-nous sur WhatsApp au +509 3625 5920.",
    "",
    "À très vite,",
    `L'équipe ${displayName}`,
  ];
  // The proforma HTML is rendered SERVER-SIDE from the structured fields — never
  // from client-supplied markup — so this route can't be used as an open relay.
  const proformaHtml = buildProformaHtml(p);
  const subject = String(p.subject ?? "").trim() || `Votre facture proforma${no ? ` n° ${no}` : ""} — ${displayName}`;
  await sendMail({
    to: p.email,
    subject,
    text: textLines.join("\n"),
    html: proformaHtml,
  });
  // Notify the team (best-effort; never fails the client send).
  const notifyTo = ADMIN_EMAILS[0];
  if (notifyTo) {
    try {
      await sendMail({
        to: notifyTo,
        subject: `Nouvelle demande de proforma — ${p.name || p.email}${totalStr ? ` (${totalStr})` : ""}`,
        text: `Client : ${p.name || "—"}\nE-mail : ${p.email}\nWhatsApp : ${p.phone || "—"}\nProforma : ${no || "—"}\nTotal : ${totalStr || "—"}\nLangue : ${p.lang || "—"}\nRégion : ${p.region || "—"}`,
        html: proformaHtml,
      });
    } catch (_) { /* team copy is best-effort */ }
  }
}

// Emails the client their delivery note (bon de livraison) with the rendered
// HTML sheet, and notifies the team. French-only copy, matching the tone above.
async function sendDeliveryEmail(p: any): Promise<void> {
  const displayName = Deno.env.get("BUSINESS_NAME") ?? "INOV Digital Services";
  const first = String(p.name ?? "").trim().split(/\s+/)[0] || "";
  const hello = first ? `Bonjour ${first},` : "Bonjour,";
  const no = String(p.deliveryNo ?? "").trim();
  const textLines = [
    hello,
    "",
    "Bonne nouvelle : votre commande est livrée ! Vous trouverez ci-dessous votre bon de livraison" +
      (no ? ` (n° ${no})` : "") + ".",
    "",
    "Merci de vérifier les livrables. Les révisions incluses peuvent être demandées dans la fenêtre indiquée sur le bon ; passé ce délai, la livraison est considérée comme acceptée.",
    "",
    "Pour toute question, répondez à cet e-mail ou écrivez-nous sur WhatsApp au +509 3625 5920.",
    "",
    "Merci de votre confiance,",
    `L'équipe ${displayName}`,
  ];
  const subject = String(p.subject ?? "").trim() || `Votre bon de livraison${no ? ` n° ${no}` : ""} — ${displayName}`;
  await sendMail({
    to: p.email,
    subject,
    text: textLines.join("\n"),
    html: p.html,
  });
  const notifyTo = ADMIN_EMAILS[0];
  if (notifyTo) {
    try {
      await sendMail({
        to: notifyTo,
        subject: `Bon de livraison envoyé — ${p.name || p.email}`,
        text: `Bon de livraison${no ? ` n° ${no}` : ""} envoyé à ${p.email}.`,
        html: p.html,
      });
    } catch (_) { /* team copy is best-effort */ }
  }
}

// Sends one newsletter (subject + prebuilt HTML) to a list of recipients over a
// single SMTP connection. Each recipient gets its own message (so addresses are
// never exposed to one another). Returns per-recipient success/failure counts.
async function sendNewsletterEmail(
  subject: string,
  html: string,
  recipients: string[],
): Promise<{ sent: number; failed: number; errors: string[] }> {
  let sent = 0, failed = 0;
  const errors: string[] = [];
  for (const to of recipients) {
    try {
      await sendMail({ to, subject, html });
      sent++;
    } catch (e) {
      failed++;
      if (errors.length < 5) errors.push(`${to}: ${String((e as any)?.message ?? e)}`);
    }
  }
  return { sent, failed, errors };
}

// ── Health ─────────────────────────────────────────────────────────────────────
app.get(`${P}/health`, (c) => c.json({ status: "ok" }));

// ── Public: lead capture ────────────────────────────────────────────────────────
app.post(`${P}/leads`, async (c) => {
  if (!(await rateLimit(c, "leads", 12))) return c.json({ error: "rate_limited" }, 429);
  const b = await c.req.json().catch(() => ({} as any));
  const id = typeof b.id === "string" && b.id ? b.id : newId();
  const lead = {
    id,
    createdAt: new Date().toISOString(),
    status: "new",
    source: typeof b.source === "string" ? b.source : "quote",
    name: typeof b.name === "string" ? b.name.slice(0, 200) : "",
    email: typeof b.email === "string" ? b.email.slice(0, 200) : "",
    phone: typeof b.phone === "string" ? b.phone.slice(0, 60) : "",
    lang: typeof b.lang === "string" ? b.lang.slice(0, 8) : "",
    currency: typeof b.currency === "string" ? b.currency.slice(0, 8) : "",
    region: typeof b.region === "string" ? b.region.slice(0, 80) : "",
    total: typeof b.total === "number" ? b.total : null,
    deposit: typeof b.deposit === "number" ? b.deposit : null,
    items: Array.isArray(b.items) ? b.items.slice(0, 100) : [],
    budget: typeof b.budget === "string" ? b.budget.slice(0, 120) : "",
    message: typeof b.message === "string" ? b.message.slice(0, 5000) : "",
    meta: b.meta && typeof b.meta === "object" ? b.meta : {},
  };
  await kv.set(`lead:${id}`, lead);

  // Server-side conversion event (Meta CAPI). event_id is shared with the browser
  // Pixel — pass lead.meta.eventId from the client's fbq('track','Lead',…) call so
  // Meta deduplicates the two into one conversion. IP/UA improve match quality.
  const clientIp = (c.req.header("x-forwarded-for") ?? "").split(",")[0].trim();
  await sendMetaConversion({
    eventName: "Lead",
    eventId: typeof lead.meta?.eventId === "string" && lead.meta.eventId ? lead.meta.eventId : `lead_${id}`,
    email: lead.email,
    phone: lead.phone,
    clientIp,
    userAgent: c.req.header("user-agent") ?? "",
    eventSourceUrl: typeof lead.meta?.pageUrl === "string" ? lead.meta.pageUrl : SITE_URL,
    fbp: typeof lead.meta?.fbp === "string" ? lead.meta.fbp : undefined,
    fbc: typeof lead.meta?.fbc === "string" ? lead.meta.fbc : undefined,
    customData: {
      lead_source: lead.source,
      currency: lead.currency || undefined,
      value: typeof lead.total === "number" ? lead.total : undefined,
    },
  });

  // Instant admin notification (best-effort) so a new lead is seen right away
  // instead of only surfacing on the next dashboard visit.
  const notifyTo = ADMIN_EMAILS[0];
  if (notifyTo) {
    const waLink = lead.phone ? `https://wa.me/${normalizeWa(lead.phone)}` : "";
    const lines = [
      `Nom : ${lead.name || "—"}`,
      `E-mail : ${lead.email || "—"}`,
      `Téléphone : ${lead.phone || "—"}`,
      `Source : ${lead.source}`,
      lead.total != null ? `Total : ${lead.total} ${lead.currency || ""}`.trim() : "",
      lead.message ? `\nMessage :\n${lead.message}` : "",
    ].filter(Boolean);
    sendMail({
      to: notifyTo,
      subject: `🎯 Nouveau lead — ${lead.name || lead.email || "sans nom"} (${lead.source})`,
      text: `${lines.join("\n")}${waLink ? `\n\nRépondre sur WhatsApp : ${waLink}` : ""}`,
      html:
        `<p><strong>Nouveau lead reçu</strong></p>` +
        `<ul>${lines.filter((l) => !l.startsWith("\n")).map((l) => `<li>${escH(l)}</li>`).join("")}</ul>` +
        (lead.message ? `<p><strong>Message :</strong></p><blockquote>${escH(lead.message)}</blockquote>` : "") +
        (waLink ? `<p><a href="${escH(waLink)}">Répondre sur WhatsApp →</a></p>` : ""),
    }).catch(() => { /* notification is best-effort */ });
  }

  return c.json({ ok: true, id });
});

// ── Testimonials (client reviews with admin moderation) ───────────────────────────
// Public: submit a review. Stored as "pending" — invisible on the site until an
// admin approves it, so nothing a visitor writes appears without moderation.
app.post(`${P}/testimonials`, async (c) => {
  if (!(await rateLimit(c, "testimonials", 5))) return c.json({ error: "rate_limited" }, 429);
  const b = await c.req.json().catch(() => ({} as any));
  const name = str(b.name, 80).trim();
  const text = str(b.text, 600).trim();
  if (name.length < 2 || text.length < 10) return c.json({ error: "invalid" }, 400);
  const id = newId();
  const t = {
    id,
    createdAt: new Date().toISOString(),
    status: "pending",
    name,
    role: str(b.role, 100).trim(),
    company: str(b.company, 100).trim(),
    text,
    stars: Math.min(5, Math.max(1, Math.round(num(b.stars, 5)))),
    lang: str(b.lang, 8),
  };
  await kv.set(`testimonial:${id}`, t);
  return c.json({ ok: true, id });
});

// Public: only APPROVED reviews, newest first, with just the fields the site needs.
app.get(`${P}/testimonials`, async (c) => {
  const all = ((await kv.getByPrefix("testimonial:")) as any[]) ?? [];
  const approved = all
    .filter((t) => t.status === "approved")
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((t) => ({ id: t.id, name: t.name, role: t.role, company: t.company, text: t.text, stars: t.stars, lang: t.lang, createdAt: t.createdAt }));
  return c.json({ testimonials: approved });
});

// Admin: all reviews (pending + approved) for the moderation queue.
app.get(`${P}/testimonials/all`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const all = ((await kv.getByPrefix("testimonial:")) as any[]) ?? [];
  all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return c.json({ testimonials: all });
});

// Admin: approve a pending review (makes it visible on the site).
app.patch(`${P}/testimonials/:id/approve`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const id = c.req.param("id");
  const t: any = await kv.get(`testimonial:${id}`);
  if (!t) return c.json({ error: "not found" }, 404);
  t.status = "approved";
  await kv.set(`testimonial:${id}`, t);
  return c.json({ ok: true, testimonial: t });
});

// Admin: delete a review (pending or approved).
app.delete(`${P}/testimonials/:id`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  await kv.del(`testimonial:${c.req.param("id")}`);
  return c.json({ ok: true });
});

// ── Public: get a signed URL to upload one brief attachment ───────────────────────
// The browser sends file metadata, we return a one-shot signed upload URL + token
// and the storage path. The client then uploads the bytes directly to Storage
// (uploadToSignedUrl) and sends us back the path with the brief.
app.post(`${P}/brief/upload-url`, async (c) => {
  if (!(await rateLimit(c, "brief-upload", 40))) return c.json({ error: "rate_limited" }, 429);
  const b = await c.req.json().catch(() => ({} as any));
  const size = typeof b.size === "number" ? b.size : 0;
  if (size > BRIEF_MAX_BYTES) return c.json({ error: "file_too_large" }, 413);
  const name = safeName(typeof b.filename === "string" ? b.filename : "file");
  const now = new Date();
  const path = `briefs/${now.getFullYear()}/${now.getMonth() + 1}/${newId()}-${name}`;
  await ensureBriefBucket();
  const { data, error } = await admin.storage.from(BRIEF_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return c.json({ error: "upload_url_failed" }, 500);
  return c.json({ ok: true, path: data.path, token: data.token, bucket: BRIEF_BUCKET });
});

// ── Admin: get a short-lived signed URL to view/download one attachment ────────────
app.post(`${P}/brief/file-url`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const b = await c.req.json().catch(() => ({} as any));
  const path = typeof b.path === "string" ? b.path : "";
  if (!path) return c.json({ error: "missing_path" }, 400);
  const { data, error } = await admin.storage.from(BRIEF_BUCKET).createSignedUrl(path, 3600);
  if (error || !data) return c.json({ error: "sign_failed" }, 500);
  return c.json({ ok: true, url: data.signedUrl });
});

// ── Admin: permanently delete one attachment (frees Supabase storage) ──────────────
// Removes the object from the private bucket and, when a lead id is supplied,
// also strips it from that lead's meta.attachments so it stops showing up.
app.post(`${P}/brief/file-delete`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const b = await c.req.json().catch(() => ({} as any));
  const path = typeof b.path === "string" ? b.path : "";
  const id = typeof b.id === "string" ? b.id : "";
  if (!path) return c.json({ error: "missing_path" }, 400);
  const { error } = await admin.storage.from(BRIEF_BUCKET).remove([path]);
  if (error) return c.json({ error: "delete_failed" }, 500);
  if (id) {
    const lead: any = await kv.get(`lead:${id}`);
    if (lead && lead.meta && Array.isArray(lead.meta.attachments)) {
      lead.meta.attachments = lead.meta.attachments.filter((a: any) => a?.path !== path);
      await kv.set(`lead:${id}`, lead);
    }
  }
  return c.json({ ok: true });
});

// ── Public: newsletter subscribe ─────────────────────────────────────────────────
app.post(`${P}/newsletter`, async (c) => {
  if (!(await rateLimit(c, "newsletter", 8))) return c.json({ error: "rate_limited" }, 429);
  const b = await c.req.json().catch(() => ({} as any));
  const email = String(b.email ?? "").trim().toLowerCase();
  if (!isEmail(email)) return c.json({ error: "invalid email" }, 400);
  const existing = await kv.get(`sub:${email}`);
  const sub = {
    email,
    lang: typeof b.lang === "string" ? b.lang.slice(0, 8) : "",
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  await kv.set(`sub:${email}`, sub);
  return c.json({ ok: true });
});

// ── Public: request the free guide (records intent as a subscriber) ───────────────
app.post(`${P}/guide`, async (c) => {
  if (!(await rateLimit(c, "guide", 8))) return c.json({ error: "rate_limited" }, 429);
  const b = await c.req.json().catch(() => ({} as any));
  const email = String(b.email ?? "").trim().toLowerCase();
  if (!isEmail(email)) return c.json({ error: "invalid email" }, 400);
  const existing = await kv.get(`sub:${email}`);
  const sub = {
    email,
    lang: typeof b.lang === "string" ? b.lang.slice(0, 8) : "",
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    guide: true,
  };
  await kv.set(`sub:${email}`, sub);
  return c.json({ ok: true });
});

// ── Public: request the configured proforma by e-mail ─────────────────────────────
app.post(`${P}/proforma`, async (c) => {
  if (!(await rateLimit(c, "proforma", 6))) return c.json({ error: "rate_limited" }, 429);
  const b = await c.req.json().catch(() => ({} as any));
  const email = String(b.email ?? "").trim().toLowerCase();
  if (!isEmail(email)) return c.json({ error: "invalid email" }, 400);
  // The proforma must carry at least a total or a line of services — the HTML is
  // rendered server-side (client-supplied `html` is ignored for security).
  const hasContent = typeof b.total === "number" ||
    (Array.isArray(b.items) && b.items.length > 0) ||
    (b.meta && Array.isArray((b.meta as any).services) && (b.meta as any).services.length > 0);
  if (!hasContent) return c.json({ error: "missing proforma" }, 400);
  // Record it as a lead so the request shows up in /admin.
  const id = newId();
  const lead = {
    id,
    createdAt: new Date().toISOString(),
    status: "new",
    source: "proforma",
    name: typeof b.name === "string" ? b.name.slice(0, 200) : "",
    email,
    phone: typeof b.phone === "string" ? b.phone.slice(0, 60) : "",
    lang: typeof b.lang === "string" ? b.lang.slice(0, 8) : "",
    currency: typeof b.currency === "string" ? b.currency.slice(0, 8) : "",
    region: typeof b.region === "string" ? b.region.slice(0, 80) : "",
    total: typeof b.total === "number" ? b.total : null,
    deposit: typeof b.deposit === "number" ? b.deposit : null,
    items: Array.isArray(b.items) ? b.items.slice(0, 100) : [],
    budget: "",
    message: "",
    meta: {
      proformaNo: typeof b.proformaNo === "string" ? b.proformaNo.slice(0, 40) : "",
      ...(b.meta && typeof b.meta === "object" ? b.meta : {}),
    },
  };
  await kv.set(`lead:${id}`, lead);
  try {
    // Pass the sanitized lead (structured fields) — HTML is built server-side.
    await sendProformaEmail({ ...lead, subject: typeof b.subject === "string" ? b.subject.slice(0, 200) : "" });
  } catch (e) {
    console.error("[proforma] email failed:", e);
    return c.json({ error: "email_failed", id }, 502);
  }
  return c.json({ ok: true, id });
});

// ── Admin: email a delivery note (bon de livraison) to the client ─────────────────
app.post(`${P}/delivery`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const b = await c.req.json().catch(() => ({} as any));
  const email = String(b.email ?? "").trim().toLowerCase();
  if (!isEmail(email)) return c.json({ error: "invalid email" }, 400);
  const html = typeof b.html === "string" ? b.html.slice(0, 400000) : "";
  if (!html) return c.json({ error: "missing delivery note" }, 400);
  // Record it as a lead so the delivery shows up in /admin.
  const id = newId();
  const lead = {
    id,
    createdAt: new Date().toISOString(),
    status: "won",
    source: "delivery",
    name: typeof b.name === "string" ? b.name.slice(0, 200) : "",
    email,
    phone: "",
    lang: "fr",
    currency: typeof b.currency === "string" ? b.currency.slice(0, 8) : "",
    region: "",
    total: typeof b.total === "number" ? b.total : null,
    deposit: null,
    items: Array.isArray(b.items) ? b.items.slice(0, 100) : [],
    budget: "",
    message: "",
    meta: {
      deliveryNo: typeof b.deliveryNo === "string" ? b.deliveryNo.slice(0, 40) : "",
      deliverySentAt: new Date().toISOString(),
      ...(b.meta && typeof b.meta === "object" ? b.meta : {}),
    },
  };
  await kv.set(`lead:${id}`, lead);
  try {
    await sendDeliveryEmail({ ...b, email, html });
  } catch (e) {
    console.error("[delivery] email failed:", e);
    return c.json({ error: "email_failed", id }, 502);
  }
  return c.json({ ok: true, id });
});

// ── Public: read site settings ────────────────────────────────────────────────────
app.get(`${P}/settings`, async (c) => {
  const stored = (await kv.get("settings")) ?? DEFAULT_SETTINGS;
  // Inject the payment coordinates from Supabase secrets at read time so they are
  // served to the /payer page without ever living in the source repo.
  const settings = { ...stored, payments: paymentsWithEnv((stored as any).payments) };
  return c.json({ settings });
});

// ── Public: bootstrap status + first-admin creation ───────────────────────────────
app.get(`${P}/bootstrap-status`, async (c) => {
  // Initialized once the owner account exists (verified against real auth users,
  // not just the KV flag) so the UI never offers admin-account creation again.
  const initialized = !!(await kv.get("bootstrapped")) || (await adminAccountExists());
  return c.json({ initialized });
});

app.post(`${P}/bootstrap`, async (c) => {
  if (!(await rateLimit(c, "bootstrap", 5))) return c.json({ error: "rate_limited" }, 429);
  // Closed for good once an admin account exists: access is via that account's login,
  // not by creating another admin account.
  if (!!(await kv.get("bootstrapped")) || (await adminAccountExists())) {
    return c.json({ error: "already initialized" }, 409);
  }
  const b = await c.req.json().catch(() => ({} as any));
  const email = String(b.email ?? "").trim().toLowerCase();
  const password = String(b.password ?? "");
  if (!isEmail(email)) return c.json({ error: "invalid email" }, 400);
  // Only an allowlisted admin email may ever be bootstrapped as the owner account.
  if (!ADMIN_EMAILS.includes(email)) return c.json({ error: "email not authorized" }, 403);
  if (password.length < 8) return c.json({ error: "weak password" }, 400);
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) return c.json({ error: error.message }, 400);
  await kv.set("bootstrapped", true);
  return c.json({ ok: true });
});

// ── Admin: leads ─────────────────────────────────────────────────────────────────
app.get(`${P}/leads`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const leads = ((await kv.getByPrefix("lead:")) as any[]).sort((a, b) =>
    (a.createdAt < b.createdAt ? 1 : -1),
  );
  return c.json({ leads });
});

app.patch(`${P}/leads/:id`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const id = c.req.param("id");
  const existing = await kv.get(`lead:${id}`);
  if (!existing) return c.json({ error: "not found" }, 404);
  const patch = await c.req.json().catch(() => ({} as any));
  // Only mutable fields; id/createdAt are immutable.
  const allowed = ["status", "name", "email", "phone", "message", "budget", "total", "deposit", "meta"];
  const next = { ...existing };
  for (const k of allowed) if (k in patch) (next as any)[k] = patch[k];

  // Auto-send the receipt to the client when a lead is validated (status → won),
  // once, if Gmail is configured and the client has an email. Never blocks the
  // status update: failures are recorded but the PATCH still succeeds.
  let receipt: { sent?: boolean; error?: string } = {};
  const becameWon = existing.status !== "won" && next.status === "won";
  if (becameWon && isEmail(next.email) && !(next.meta?.receiptSentAt)) {
    try {
      await sendReceiptEmail(next);
      next.meta = { ...(next.meta ?? {}), receiptSentAt: new Date().toISOString() };
      receipt.sent = true;
    } catch (e) {
      receipt.error = String((e as any)?.message ?? e);
    }
  }

  await kv.set(`lead:${id}`, next);
  return c.json({ ok: true, lead: next, receipt });
});

// ── Admin: send / resend a receipt to the client (Gmail SMTP) ─────────────────────
app.post(`${P}/receipt/:id/send`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({} as any));
  const subject = typeof body?.subject === "string" ? body.subject.slice(0, 200) : "";
  const lead = await kv.get(`lead:${id}`);
  if (!lead) return c.json({ error: "not found" }, 404);
  if (!isEmail(lead.email)) return c.json({ error: "client has no valid email" }, 400);
  try {
    await sendReceiptEmail(lead, subject);
  } catch (e) {
    return c.json({ error: `email failed: ${String((e as any)?.message ?? e)}` }, 502);
  }
  lead.meta = { ...(lead.meta ?? {}), receiptSentAt: new Date().toISOString() };
  await kv.set(`lead:${id}`, lead);
  return c.json({ ok: true, sentTo: lead.email });
});

app.delete(`${P}/leads/:id`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  await kv.del(`lead:${c.req.param("id")}`);
  return c.json({ ok: true });
});

// ── Admin: newsletter subscribers ─────────────────────────────────────────────────
app.get(`${P}/newsletter`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const subscribers = ((await kv.getByPrefix("sub:")) as any[]).sort((a, b) =>
    (a.createdAt < b.createdAt ? 1 : -1),
  );
  return c.json({ subscribers });
});

app.delete(`${P}/newsletter/:email`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const email = decodeURIComponent(c.req.param("email")).trim().toLowerCase();
  await kv.del(`sub:${email}`);
  return c.json({ ok: true });
});

// Resolve campaign recipients from subscribers, optionally filtered by language.
async function newsletterRecipients(lang?: string): Promise<string[]> {
  const subs = ((await kv.getByPrefix("sub:")) as any[]) ?? [];
  return subs
    .filter((s) => s && isEmail(s.email) && (!lang || lang === "all" || s.lang === lang))
    .map((s) => s.email);
}

// ── Admin: send a newsletter campaign now (or a test to one address) ───────────────
app.post(`${P}/newsletter/send`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const b = await c.req.json().catch(() => ({} as any));
  const subject = typeof b.subject === "string" ? b.subject.slice(0, 200).trim() : "";
  const html = typeof b.html === "string" ? b.html.slice(0, 400000) : "";
  if (!subject || !html) return c.json({ error: "missing subject or html" }, 400);

  let recipients: string[];
  if (b.test) {
    const testEmail = String(b.testEmail ?? (u as any)?.email ?? "").trim().toLowerCase();
    if (!isEmail(testEmail)) return c.json({ error: "invalid test email" }, 400);
    recipients = [testEmail];
  } else {
    recipients = await newsletterRecipients(typeof b.lang === "string" ? b.lang : undefined);
    if (recipients.length === 0) return c.json({ error: "no recipients" }, 400);
  }

  try {
    const result = await sendNewsletterEmail(subject, html, recipients);
    return c.json({ ok: true, ...result });
  } catch (e) {
    return c.json({ error: "send_failed", detail: String((e as any)?.message ?? e) }, 502);
  }
});

// ── Admin: schedule a newsletter campaign for later dispatch ───────────────────────
app.post(`${P}/newsletter/schedule`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const b = await c.req.json().catch(() => ({} as any));
  const subject = typeof b.subject === "string" ? b.subject.slice(0, 200).trim() : "";
  const html = typeof b.html === "string" ? b.html.slice(0, 400000) : "";
  const when = new Date(String(b.scheduledAt ?? ""));
  if (!subject || !html) return c.json({ error: "missing subject or html" }, 400);
  if (isNaN(when.getTime())) return c.json({ error: "invalid scheduledAt" }, 400);
  const id = newId();
  const campaign = {
    id, subject, html,
    lang: typeof b.lang === "string" ? b.lang.slice(0, 8) : "all",
    scheduledAt: when.toISOString(),
    status: "scheduled",
    createdAt: new Date().toISOString(),
    result: null as any,
  };
  await kv.set(`campaign:${id}`, campaign);
  return c.json({ ok: true, id });
});

// ── Admin: list campaigns (without the heavy HTML body) ────────────────────────────
app.get(`${P}/newsletter/campaigns`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const rows = ((await kv.getByPrefix("campaign:")) as any[]) ?? [];
  const campaigns = rows
    .map(({ html, ...rest }) => ({ ...rest, htmlLength: typeof html === "string" ? html.length : 0 }))
    .sort((a, b) => (a.scheduledAt < b.scheduledAt ? 1 : -1));
  return c.json({ campaigns });
});

// ── Admin: cancel a scheduled campaign ─────────────────────────────────────────────
app.delete(`${P}/newsletter/campaigns/:id`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  await kv.del(`campaign:${c.req.param("id")}`);
  return c.json({ ok: true });
});

// ── Cron: dispatch due scheduled campaigns (secret-guarded, no admin session) ──────
app.post(`${P}/newsletter/dispatch`, async (c) => {
  if (!CRON_SECRET) return c.json({ error: "dispatch disabled" }, 503);
  if (c.req.header("x-cron-secret") !== CRON_SECRET) return c.json({ error: "forbidden" }, 403);
  const now = Date.now();
  const rows = ((await kv.getByPrefix("campaign:")) as any[]) ?? [];
  const due = rows.filter((r) => r?.status === "scheduled" && new Date(r.scheduledAt).getTime() <= now);
  const processed: any[] = [];
  for (const camp of due) {
    try {
      const recipients = await newsletterRecipients(camp.lang);
      const result = recipients.length
        ? await sendNewsletterEmail(camp.subject, camp.html, recipients)
        : { sent: 0, failed: 0, errors: ["no recipients"] };
      camp.status = "sent";
      camp.result = { ...result, dispatchedAt: new Date().toISOString() };
    } catch (e) {
      camp.status = "failed";
      camp.result = { error: String((e as any)?.message ?? e), dispatchedAt: new Date().toISOString() };
    }
    await kv.set(`campaign:${camp.id}`, camp);
    processed.push({ id: camp.id, status: camp.status });
  }
  return c.json({ ok: true, processed });
});

// ── Auto follow-up (relance automatique) for quotes with no reply ──────────────
// Nudges leads that asked for a quote/proforma, received it, but never reached a
// concrete outcome (still "new"). A friendly reminder is emailed after a delay,
// spaced out, up to a small cap — so a client is reminded, never spammed.
//
// Tunable via env (all optional, sensible defaults):
//   FOLLOWUP_DELAY_DAYS     min age before the FIRST reminder   (default 3)
//   FOLLOWUP_INTERVAL_DAYS  min gap between reminders           (default 4)
//   FOLLOWUP_MAX            max reminders per lead              (default 2)
// A lead is skipped once won/lost, if it opted out (meta.followUpOptOut), or
// once it hit the cap.
const WHATSAPP_HUMAN = Deno.env.get("WHATSAPP_NUMBER") ?? "+509 3625 5920";

function followUpConfig() {
  const n = (k: string, d: number) => {
    const v = Number(Deno.env.get(k));
    return Number.isFinite(v) && v >= 0 ? v : d;
  };
  return {
    delayDays: n("FOLLOWUP_DELAY_DAYS", 3),
    intervalDays: n("FOLLOWUP_INTERVAL_DAYS", 4),
    max: Math.max(1, n("FOLLOWUP_MAX", 2)),
  };
}

// A quote/proforma lead that never reached a concrete outcome.
function isOpenQuote(l: any): boolean {
  if (!l || l.status !== "new") return false;
  if (l.meta?.followUpOptOut) return false;
  const src = String(l.source ?? "");
  return (
    src === "quote" ||
    src === "proforma" ||
    (Array.isArray(l.items) && l.items.length > 0) ||
    typeof l.total === "number"
  );
}

// Is a reminder due for this lead right now?
function followUpDue(l: any, now: number, cfg: { delayDays: number; intervalDays: number; max: number }): boolean {
  if (!isOpenQuote(l) || !isEmail(l.email)) return false;
  const count = Number(l.meta?.followUpCount ?? 0);
  if (count >= cfg.max) return false;
  const day = 86_400_000;
  const created = new Date(l.createdAt).getTime();
  if (!Number.isFinite(created)) return false;
  if (count === 0) return now - created >= cfg.delayDays * day;
  const last = l.meta?.followUpSentAt ? new Date(l.meta.followUpSentAt).getTime() : 0;
  return now - last >= cfg.intervalDays * day;
}

function followUpText(l: any, attempt: number): string {
  const first = String(l.name ?? "").trim().split(/\s+/)[0] || "";
  const hello = first ? `Bonjour ${first},` : "Bonjour,";
  const displayName = Deno.env.get("BUSINESS_NAME") ?? "INOV Digital Services";
  const totalStr =
    typeof l.total === "number" ? `${l.total.toLocaleString("fr-FR")} ${l.currency ?? ""}`.trim() : "";
  const intro =
    attempt <= 1
      ? "Nous revenons vers vous au sujet du devis que vous nous avez demandé. Avez-vous eu le temps d'y jeter un œil ?"
      : "Nous nous permettons une dernière relance au sujet de votre devis. Si le moment n'est pas idéal, dites-le-nous simplement.";
  return [
    hello,
    "",
    intro,
    totalStr ? `Pour rappel, votre devis s'élève à ${totalStr}.` : "",
    "",
    `Pour avancer ou poser une question, répondez simplement à cet e-mail ou écrivez-nous sur WhatsApp au ${WHATSAPP_HUMAN}.`,
    "",
    "À très vite,",
    `L'équipe ${displayName}`,
  ]
    .filter((x) => x !== "")
    .join("\n");
}

function buildFollowUpHtml(l: any, attempt: number): string {
  const first = escH(String(l.name ?? "").trim().split(/\s+/)[0] || "");
  const hello = first ? `Bonjour ${first},` : "Bonjour,";
  const displayName = escH(Deno.env.get("BUSINESS_NAME") ?? "INOV Digital Services");
  const totalStr =
    typeof l.total === "number" ? escH(`${l.total.toLocaleString("fr-FR")} ${l.currency ?? ""}`.trim()) : "";
  const waDigits = WHATSAPP_HUMAN.replace(/[^\d]/g, "");
  const waMsg = encodeURIComponent(
    `Bonjour, je reviens vers vous au sujet de mon devis${l.meta?.proformaNo ? ` (${l.meta.proformaNo})` : ""}.`,
  );
  const intro =
    attempt <= 1
      ? "Nous revenons vers vous au sujet du devis que vous nous avez demandé. Avez-vous eu le temps d'y jeter un œil ?"
      : "Nous nous permettons une dernière relance au sujet de votre devis. Si le moment n'est pas idéal, dites-le-nous simplement.";
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escH(displayName)} — suivi de votre devis</title></head>
<body style="margin:0;background:#f4f4f5;padding:24px;font-family:'Segoe UI',Arial,sans-serif;color:#111;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1.5px solid #111;">
    <tr><td style="padding:28px 32px 8px;">
      <img src="${EMAIL_LOGO}" alt="${escH(displayName)}" height="34" style="height:34px;width:auto;max-width:200px;border:0;outline:none;text-decoration:none;display:block;margin-bottom:20px;" />
      <p style="font-size:15px;font-weight:700;margin:0 0 12px;">${hello}</p>
      <p style="font-size:14px;line-height:1.6;margin:0 0 12px;">${intro}</p>
      ${totalStr ? `<p style="font-size:14px;line-height:1.6;margin:0 0 12px;">Pour rappel, votre devis s'élève à <strong>${totalStr}</strong>.</p>` : ""}
      <p style="font-size:14px;line-height:1.6;margin:0 0 20px;">Pour avancer ou poser une question, répondez simplement à cet e-mail — ou écrivez-nous directement sur WhatsApp, c'est souvent le plus rapide.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr>
        <td style="background:#25D366;border-radius:6px;">
          <a href="https://wa.me/${waDigits}?text=${waMsg}" style="display:inline-block;padding:12px 22px;color:#fff;font-weight:800;font-size:14px;text-decoration:none;">Répondre sur WhatsApp</a>
        </td>
      </tr></table>
      <p style="font-size:13px;color:#555;line-height:1.6;margin:0 0 4px;">À très vite,</p>
      <p style="font-size:13px;color:#111;font-weight:700;margin:0 0 24px;">L'équipe ${displayName}</p>
    </td></tr>
    <tr><td style="padding:14px 32px;border-top:1.5px solid #111;font-size:11px;color:#888;">
      Vous recevez cet e-mail car vous avez demandé un devis à ${displayName}. Si vous ne souhaitez plus être relancé, répondez simplement « STOP ».
    </td></tr>
  </table>
  </td></tr></table>
  </body></html>`;
}

async function sendFollowUpEmail(l: any, attempt: number): Promise<void> {
  const displayName = Deno.env.get("BUSINESS_NAME") ?? "INOV Digital Services";
  const first = String(l.name ?? "").trim().split(/\s+/)[0] || "";
  const subject =
    attempt <= 1
      ? `${first ? first + ", v" : "V"}otre devis vous attend — ${displayName}`
      : `Dernière relance concernant votre devis — ${displayName}`;
  await sendMail({
    to: l.email,
    subject,
    text: followUpText(l, attempt),
    html: buildFollowUpHtml(l, attempt),
  });
}

// Optional: also send the reminder over WhatsApp via the Meta WhatsApp Cloud API.
// Business-initiated messages OUTSIDE the 24h service window require a PRE-APPROVED
// template, so we send a template (not free text). Skipped unless configured.
//   WHATSAPP_TOKEN          permanent access token of the WhatsApp system user
//   WHATSAPP_PHONE_ID       phone-number id of your WABA sender
//   WHATSAPP_TEMPLATE       approved template name (e.g. "relance_devis")
//   WHATSAPP_TEMPLATE_LANG  template language code (default "fr")
function normalizeWa(phone: string): string {
  return String(phone ?? "").replace(/[^\d]/g, "");
}
async function sendFollowUpWhatsApp(l: any): Promise<{ sent: boolean; skipped?: string; error?: string }> {
  const token = Deno.env.get("WHATSAPP_TOKEN");
  const phoneId = Deno.env.get("WHATSAPP_PHONE_ID");
  const template = Deno.env.get("WHATSAPP_TEMPLATE");
  if (!token || !phoneId || !template) return { sent: false, skipped: "not_configured" };
  const to = normalizeWa(l.phone);
  if (!to) return { sent: false, skipped: "no_phone" };
  const lang = Deno.env.get("WHATSAPP_TEMPLATE_LANG") ?? "fr";
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: { name: template, language: { code: lang } },
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { sent: false, error: `wa_${res.status}: ${detail.slice(0, 200)}` };
    }
    return { sent: true };
  } catch (e) {
    return { sent: false, error: String((e as any)?.message ?? e) };
  }
}

// Free-text WhatsApp reply — only valid INSIDE the 24h customer-service window
// (i.e. in response to a user-initiated message, as in the webhook), where Meta
// allows non-template text. Uses the same WHATSAPP_TOKEN/WHATSAPP_PHONE_ID as the
// template sender. Best-effort: returns a status, never throws.
async function sendWhatsAppText(to: string, body: string): Promise<{ sent: boolean; skipped?: string; error?: string }> {
  const token = Deno.env.get("WHATSAPP_TOKEN");
  const phoneId = Deno.env.get("WHATSAPP_PHONE_ID");
  if (!token || !phoneId) return { sent: false, skipped: "not_configured" };
  const dest = normalizeWa(to);
  if (!dest) return { sent: false, skipped: "no_phone" };
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: dest,
        type: "text",
        text: { body: body.slice(0, 1024), preview_url: false },
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { sent: false, error: `wa_${res.status}: ${detail.slice(0, 200)}` };
    }
    return { sent: true };
  } catch (e) {
    return { sent: false, error: String((e as any)?.message ?? e) };
  }
}

// Cron: send all due follow-ups (secret-guarded, no admin session).
app.post(`${P}/leads/follow-up`, async (c) => {
  if (!CRON_SECRET) return c.json({ error: "dispatch disabled" }, 503);
  if (c.req.header("x-cron-secret") !== CRON_SECRET) return c.json({ error: "forbidden" }, 403);
  const cfg = followUpConfig();
  const now = Date.now();
  const leads = ((await kv.getByPrefix("lead:")) as any[]) ?? [];
  const due = leads.filter((l) => followUpDue(l, now, cfg));
  const processed: any[] = [];
  for (const l of due) {
    const attempt = Number(l.meta?.followUpCount ?? 0) + 1;
    const entry: any = { id: l.id, attempt };
    try {
      await sendFollowUpEmail(l, attempt);
      entry.email = "sent";
    } catch (e) {
      entry.email = `error: ${String((e as any)?.message ?? e)}`;
    }
    const wa = await sendFollowUpWhatsApp(l);
    entry.whatsapp = wa.sent ? "sent" : wa.error ? `error: ${wa.error}` : `skipped: ${wa.skipped}`;
    // Record the attempt only if something actually went out, so a transient
    // failure is retried next run rather than silently consumed.
    if (entry.email === "sent" || wa.sent) {
      l.meta = { ...(l.meta ?? {}), followUpCount: attempt, followUpSentAt: new Date().toISOString() };
      await kv.set(`lead:${l.id}`, l);
    }
    processed.push(entry);
  }
  return c.json({ ok: true, count: processed.length, processed });
});

// Admin: preview which leads are currently eligible for a follow-up.
app.get(`${P}/leads/follow-up/preview`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const cfg = followUpConfig();
  const now = Date.now();
  const leads = ((await kv.getByPrefix("lead:")) as any[]) ?? [];
  const eligible = leads
    .filter((l) => followUpDue(l, now, cfg))
    .map((l) => ({
      id: l.id,
      name: l.name,
      email: l.email,
      source: l.source,
      total: l.total,
      currency: l.currency,
      createdAt: l.createdAt,
      followUpCount: Number(l.meta?.followUpCount ?? 0),
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return c.json({ config: cfg, eligible });
});

// Admin: send a follow-up now for one lead (manual trigger).
app.post(`${P}/leads/:id/follow-up`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const id = c.req.param("id");
  const l = await kv.get(`lead:${id}`);
  if (!l) return c.json({ error: "not found" }, 404);
  if (!isEmail(l.email)) return c.json({ error: "client has no valid email" }, 400);
  const attempt = Number(l.meta?.followUpCount ?? 0) + 1;
  try {
    await sendFollowUpEmail(l, attempt);
  } catch (e) {
    return c.json({ error: `email failed: ${String((e as any)?.message ?? e)}` }, 502);
  }
  const wa = await sendFollowUpWhatsApp(l);
  l.meta = { ...(l.meta ?? {}), followUpCount: attempt, followUpSentAt: new Date().toISOString() };
  await kv.set(`lead:${id}`, l);
  return c.json({ ok: true, sentTo: l.email, attempt, whatsapp: wa });
});

// ── Admin: settings ───────────────────────────────────────────────────────────────
// Admin GET /settings is served by the public route above (returns the same
// object); only writes need the admin guard.
app.put(`${P}/settings`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const b = await c.req.json().catch(() => ({} as any));
  // Merge onto the currently-stored settings so a partial save (e.g. only the
  // payment coordinates) never wipes pricing, services, blogs, etc. Only keys
  // present in the request body are overwritten; everything else is preserved.
  const stored = { ...DEFAULT_SETTINGS, ...((await kv.get("settings")) as any ?? {}) };
  // Snapshot the previously published blog ids so we can auto-post only the new ones.
  const prevBlogIds = new Set(((stored?.blogsAdded ?? []) as any[]).map((x) => String(x?.id)));
  const has = (k: string) => Object.prototype.hasOwnProperty.call(b ?? {}, k);
  const settings = { ...stored };
  if (has("announcement")) {
    const a = b?.announcement ?? {};
    settings.announcement = {
      enabled: !!a.enabled,
      text: typeof a.text === "string" ? a.text.slice(0, 500) : "",
      link: typeof a.link === "string" ? a.link.slice(0, 500) : "",
    };
  }
  if (has("pricing")) settings.pricing = cleanPricing(b?.pricing);
  if (has("servicesRemoved")) settings.servicesRemoved = cleanIdList(b?.servicesRemoved, "num");
  if (has("servicesAdded")) settings.servicesAdded = cleanServices(b?.servicesAdded);
  if (has("albumsRemoved")) settings.albumsRemoved = cleanIdList(b?.albumsRemoved, "str");
  if (has("albumsAdded")) settings.albumsAdded = cleanAlbums(b?.albumsAdded);
  if (has("worksRemoved")) settings.worksRemoved = cleanWorksRemoved(b?.worksRemoved);
  if (has("worksAdded")) settings.worksAdded = cleanWorksAdded(b?.worksAdded);
  if (has("blogsRemoved")) settings.blogsRemoved = cleanIdList(b?.blogsRemoved, "str");
  if (has("blogsAdded")) settings.blogsAdded = cleanBlogs(b?.blogsAdded);
  if (has("socialReplies")) settings.socialReplies = cleanSocialReplies(b?.socialReplies);
  if (has("payments")) settings.payments = cleanPayments(b?.payments);
  await kv.set("settings", settings);

  // Auto-post newly added blog articles to Facebook & Instagram. Each new article
  // is enqueued as a scheduled social post (published by the /social/dispatch
  // cron), so a slow Meta call never delays or fails the settings save. Skipped
  // entirely when Meta is not configured.
  let autoPosted = 0;
  if (metaConfigured()) {
    const fresh = settings.blogsAdded.filter((bl: any) => bl?.id && !prevBlogIds.has(String(bl.id)));
    for (const bl of fresh) {
      const slug = String(bl.slug || bl.id);
      const articleUrl = absoluteUrl(`/blog/${slug}`);
      const caption = [bl.title, bl.excerpt, articleUrl].filter(Boolean).join("\n\n").slice(0, 2200);
      const id = newId();
      await kv.set(`social:${id}`, {
        id, caption,
        imageUrl: bl.image ? absoluteUrl(String(bl.image)) : "",
        link: articleUrl,
        networks: [...SOCIAL_NETWORKS],
        source: "blog", status: "scheduled",
        scheduledAt: new Date().toISOString(),
        createdAt: new Date().toISOString(), result: null as any,
      });
      autoPosted++;
    }
  }
  return c.json({ ok: true, settings, autoPosted });
});

// ── Admin: AI assistant (Google Gemini, free tier) ─────────────────────────────
// A private helper for the owner: drafts client replies, quotes, follow-ups,
// summaries and translations. Uses the free Gemini API. The key is read from the
// GEMINI_API_KEY secret and never leaves the server. Optionally grounds answers
// in a compact snapshot of recent leads when the admin asks for it.
const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";

const ASSISTANT_SYSTEM = `Tu es l'assistant privé de l'espace administrateur d'INOV Digital Services,
un studio de branding et design 100% en ligne basé en Haïti (logos, identité, packaging,
affiches, motion design, montage vidéo, retouche photo, sites vitrines).
Tu aides UNIQUEMENT le propriétaire (jamais les clients directement).
Tu sais : rédiger des réponses clients chaleureuses et professionnelles, générer des devis,
rédiger des relances, résumer des demandes (leads), proposer des plannings de rendez-vous,
et traduire dans les 8 langues du site (fr, en, es, ht, pt, it, de, ar).
Réponds par défaut en français, de façon concise et actionnable. Le numéro WhatsApp est +509 3625 5920.`;

// Builds a small, privacy-conscious snapshot of the most recent leads so the
// assistant can answer questions like "résume mes dernières demandes". Only
// coarse fields are included; never raw attachments or full message bodies.
async function recentLeadsSnapshot(limit = 15): Promise<string> {
  const leads = ((await kv.getByPrefix("lead:")) as any[])
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);
  if (!leads.length) return "Aucune demande enregistrée.";
  return leads
    .map((l) => {
      const total = typeof l.total === "number" ? `${l.total} ${l.currency ?? ""}`.trim() : "—";
      const msg = typeof l.message === "string" ? l.message.slice(0, 160) : "";
      return `- [${l.status}] ${l.name || "?"} (${l.source}) · ${new Date(l.createdAt).toLocaleDateString("fr-FR")} · total ${total}${msg ? ` · « ${msg} »` : ""}`;
    })
    .join("\n");
}

app.post(`${P}/assistant`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  if (!(await rateLimit(c, "assistant", 30))) return c.json({ error: "rate_limited" }, 429);
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return c.json({ error: "gemini_not_configured" }, 503);

  const b = await c.req.json().catch(() => ({} as any));
  const msgs = Array.isArray(b?.messages) ? b.messages.slice(-20) : [];
  const contents = msgs
    .filter((m: any) => m && typeof m.content === "string" && m.content.trim())
    .map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content).slice(0, 8000) }],
    }));
  if (!contents.length) return c.json({ error: "empty" }, 400);

  // Optional grounding in recent leads (only when the admin opts in).
  let sys = ASSISTANT_SYSTEM;
  if (b?.withLeads) {
    sys += `\n\nContexte — dernières demandes reçues :\n${await recentLeadsSnapshot()}`;
  }

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: sys }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      }),
    });
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 500);
      console.error("[assistant] gemini error:", res.status, detail);
      return c.json({ error: "gemini_failed", status: res.status }, 502);
    }
    const data = await res.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? "").join("").trim() ?? "";
    if (!reply) return c.json({ error: "empty_reply" }, 502);
    return c.json({ ok: true, reply });
  } catch (e) {
    console.error("[assistant] request failed:", e);
    return c.json({ error: "assistant_failed" }, 502);
  }
});

// ── WhatsApp Cloud API webhook ────────────────────────────────────────────────
// GET  — Meta verification challenge (hub.verify_token must match CRON_SECRET)
// POST — Incoming messages from users (stored + admin notification email)
app.get(`${P}/webhook/whatsapp`, (c) => {
  const mode      = c.req.query("hub.mode");
  const token     = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");
  const secret    = Deno.env.get("CRON_SECRET");
  if (mode === "subscribe" && token === secret && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return c.json({ error: "forbidden" }, 403);
});

app.post(`${P}/webhook/whatsapp`, async (c) => {
  try {
    const raw = await c.req.text();
    if (!(await verifyMetaSignature(c, raw))) return c.json({ error: "invalid signature" }, 403);
    const body = (() => { try { return JSON.parse(raw); } catch { return {}; } })();
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const msg = change?.value?.messages?.[0];
    if (msg) {
      const from    = msg.from ?? "";
      const text    = msg?.text?.body ?? msg?.type ?? "(non-text)";
      const contact = change?.value?.contacts?.[0]?.profile?.name ?? from;
      console.log(`[whatsapp] message from ${from} (${contact}): ${text}`);

      // Auto-reply once per contact per 24h (avoids replying to every message in a
      // burst). Free text is allowed here because the user just wrote to us, so we
      // are inside the 24h service window. Skipped silently if WhatsApp isn't set up.
      try {
        const guardKey = `wa:autoreply:${from}`;
        const prev = (await kv.get(guardKey)) as { at?: string } | null;
        const lastAt = prev?.at ? Date.parse(prev.at) : 0;
        const withinDay = lastAt && (Date.now() - lastAt) < 24 * 60 * 60 * 1000;
        if (!withinDay) {
          const reply =
            `Bonjour ${change?.value?.contacts?.[0]?.profile?.name ?? ""}! 👋 ` +
            `Merci d'avoir contacté INOV Digital Services. Nous avons bien reçu votre message ` +
            `et un membre de l'équipe vous répond très vite. Pour accélérer, précisez votre besoin ` +
            `(logo, packaging, affiche, site web…) et votre délai. 🎨`;
          const r = await sendWhatsAppText(from, reply);
          if (r.sent) {
            // Record when we acknowledged; the age check above re-arms after 24h.
            await kv.set(guardKey, { at: new Date().toISOString() });
          }
        }
      } catch (_) { /* auto-reply is best-effort */ }

      // Notify admin by email (best-effort).
      const notifyTo = ADMIN_EMAILS[0];
      if (notifyTo) {
        try {
          await sendMail({
            to: notifyTo,
            subject: `💬 Réponse WhatsApp de ${contact}`,
            text: `Message reçu de ${contact} (+${from}):\n\n${text}\n\nRépondez directement sur WhatsApp : https://wa.me/${from}`,
            html: `<p><strong>Message WhatsApp reçu</strong></p><p><strong>De :</strong> ${escH(contact)} (+${escH(from)})</p><p><strong>Message :</strong></p><blockquote>${escH(text)}</blockquote><p><a href="https://wa.me/${encodeURIComponent(from)}">Répondre sur WhatsApp →</a></p>`,
          });
        } catch (_) { /* notification is best-effort */ }
      }
    }
  } catch (e) {
    console.error("[whatsapp-webhook] error:", e);
  }
  return c.json({ ok: true });
});

// ══════════════════════════════════════════════════════════════════════════════
// INSTAGRAM + FACEBOOK (Messenger) — comment auto-reply, DM waiting message & FAQ
// ══════════════════════════════════════════════════════════════════════════════
// One webhook handles both networks. Messenger DMs arrive as `entry[].messaging`;
// Instagram DMs also arrive as `messaging` when object === "instagram". Comments
// arrive as `entry[].changes` with field "feed" (Facebook Page) or "comments"
// (Instagram). Everything is BEST-EFFORT and silently skipped when unconfigured,
// so the code can ship now and light up once you complete Meta App Review and set
// META_PAGE_ID / META_PAGE_TOKEN (+ META_IG_USER_ID for Instagram).
//
// Required Meta permissions (App Review): pages_messaging, pages_manage_engagement
// (Facebook comments), instagram_manage_messages, instagram_manage_comments.
// Verify token = CRON_SECRET (same convention as the WhatsApp webhook).

// FAQ rules: first keyword that appears (accent/case-insensitive) wins. Override
// with the META_FAQ env var (JSON array of { keywords: string[], answer: string }).
type FaqRule = { keywords: string[]; answer: string };
const DEFAULT_FAQ: FaqRule[] = [
  { keywords: ["prix", "tarif", "combien", "coute", "cout", "price", "cost"],
    answer: "Merci de votre intérêt ! 💰 Nos tarifs dépendent du projet (logo, packaging, affiche, site web…). Dites-nous ce que vous voulez créer et on vous envoie un devis gratuit et personnalisé. 🙌" },
  { keywords: ["delai", "delais", "temps", "quand", "livraison", "rapide", "vite"],
    answer: "⏱️ Livraison dès 48h selon le projet ! Précisez votre besoin et votre échéance, on s'adapte à votre rythme." },
  { keywords: ["logo", "branding", "identite", "identité", "marque"],
    answer: "🎨 La création de logo & identité visuelle, c'est notre spécialité ! Envoyez-nous quelques mots sur votre marque (nom, activité, style aimé) pour démarrer." },
  { keywords: ["site", "web", "website", "internet", "vitrine"],
    answer: "🌐 Oui, on conçoit des sites vitrines modernes, rapides et adaptés au mobile. Parlez-nous de votre projet et de vos objectifs !" },
  { keywords: ["paiement", "payer", "moncash", "natcash", "acompte", "virement"],
    answer: "💳 Paiement simple via MonCash / NatCash / virement. Un acompte lance le projet, le solde à la livraison. Facile et sécurisé !" },
  { keywords: ["commande", "commander", "commencer", "demarrer", "démarrer", "process", "etapes", "étapes"],
    answer: "🚀 C'est simple : 1) vous décrivez votre besoin, 2) on vous envoie un devis gratuit, 3) acompte, 4) on crée et on révise ensemble, 5) livraison. On commence quand vous voulez !" },
  { keywords: ["exemple", "exemples", "portfolio", "realisation", "réalisation", "travaux", "reference", "référence"],
    answer: "✨ Avec plaisir ! Découvrez nos réalisations sur inovdigitalservices.com — 20+ marques accompagnées et 80+ visuels livrés." },
  { keywords: ["dispo", "disponible", "ouvert", "libre", "accepte"],
    answer: "✅ Oui, on est disponibles ! Envoyez-nous votre projet en message et on revient vers vous très vite avec une proposition." },
];
function faqRules(): FaqRule[] {
  const raw = Deno.env.get("META_FAQ");
  if (!raw) return DEFAULT_FAQ;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((r) => Array.isArray(r?.keywords) && typeof r?.answer === "string")) {
      return parsed as FaqRule[];
    }
  } catch (_) { /* fall back to defaults on bad JSON */ }
  return DEFAULT_FAQ;
}
function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}
function matchFaq(text: string, rules?: FaqRule[]): string | null {
  const hay = stripAccents(String(text ?? "").toLowerCase());
  for (const rule of (rules ?? faqRules())) {
    if (rule.keywords.some((k) => hay.includes(stripAccents(k.toLowerCase())))) return rule.answer;
  }
  return null;
}

// Effective social-reply config: admin settings win over env vars over built-in
// defaults, so the owner can edit everything from the dashboard without redeploy.
async function getSocialCfg(): Promise<{ waitMessage: string; commentReply: string; useGemini: boolean; rules: FaqRule[] }> {
  const sr = ((await kv.get("settings")) as any)?.socialReplies ?? {};
  const rules = Array.isArray(sr.faq) && sr.faq.length ? (sr.faq as FaqRule[]) : faqRules();
  return {
    waitMessage: (typeof sr.waitMessage === "string" && sr.waitMessage.trim()) ? sr.waitMessage : META_WAIT_MSG,
    commentReply: (typeof sr.commentReply === "string" && sr.commentReply.trim()) ? sr.commentReply : META_COMMENT_REPLY,
    // Env override (SOCIAL_USE_GEMINI=true) lets the owner switch AI replies on
    // globally without an admin session; otherwise the per-account setting wins.
    useGemini: !!sr.useGemini || (Deno.env.get("SOCIAL_USE_GEMINI") ?? "").toLowerCase() === "true",
    rules,
  };
}

// Draft a short, on-brand DM reply with Gemini. Best-effort: returns null when
// unconfigured or on any error, so the caller falls back to the waiting message.
async function geminiSocialReply(incoming: string): Promise<string | null> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return null;
  const sys = `Tu réponds au nom d'INOV Digital Services (studio de branding & design en Haïti :
logos, packaging, affiches, motion design, montage vidéo, sites vitrines) à un message reçu
en DM Instagram/Facebook. Réponds en 1 à 3 phrases, chaleureux et professionnel, en français
(ou dans la langue du message). Ne promets jamais de prix ferme : invite à préciser le besoin
pour un devis gratuit. Termine en proposant de continuer la discussion. N'invente aucune info.`;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: sys }] },
          contents: [{ role: "user", parts: [{ text: String(incoming).slice(0, 2000) }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
        }),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const out = data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? "").join("").trim();
    return out || null;
  } catch (_) {
    return null;
  }
}

// The "waiting message" — sent when nothing else matched, so the person always
// gets an instant acknowledgement and you can reply yourself afterwards.
const META_WAIT_MSG = Deno.env.get("META_WAIT_MSG") ??
  "Bonjour et merci d'avoir contacté INOV Digital Services ! 👋 Votre message est bien arrivé. On revient vers vous très vite avec une réponse personnalisée. 🎨\n— L'équipe INOV Digital Services";
const META_COMMENT_REPLY = Deno.env.get("META_COMMENT_REPLY") ??
  "Merci beaucoup pour votre message ! 🙏 On vous répond en privé tout de suite. 💬\n— INOV Digital Services";

// Send a DM (Messenger or Instagram — both go through the Page messages endpoint
// with the Page token). Best-effort.
async function metaSendDM(recipientId: string, text: string): Promise<{ sent: boolean; skipped?: string; error?: string }> {
  if (!META_PAGE_ID || !META_PAGE_TOKEN) return { sent: false, skipped: "not_configured" };
  if (!recipientId) return { sent: false, skipped: "no_recipient" };
  try {
    const res = await fetch(`${META_GRAPH}/${META_PAGE_ID}/messages?access_token=${encodeURIComponent(META_PAGE_TOKEN)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient: { id: recipientId }, messaging_type: "RESPONSE", message: { text: text.slice(0, 1000) } }),
    });
    if (!res.ok) return { sent: false, error: `dm_${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}` };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: String((e as any)?.message ?? e) };
  }
}

// Public reply under a comment. Facebook: POST /{comment-id}/comments.
// Instagram: POST /{ig-comment-id}/replies. Best-effort.
async function metaReplyToComment(commentId: string, text: string, isInstagram: boolean): Promise<{ sent: boolean; skipped?: string; error?: string }> {
  if (!META_PAGE_TOKEN) return { sent: false, skipped: "not_configured" };
  if (!commentId) return { sent: false, skipped: "no_comment" };
  const edge = isInstagram ? "replies" : "comments";
  try {
    const res = await fetch(`${META_GRAPH}/${commentId}/${edge}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text.slice(0, 1000), access_token: META_PAGE_TOKEN }),
    });
    if (!res.ok) return { sent: false, error: `comment_${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}` };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: String((e as any)?.message ?? e) };
  }
}

// Private reply to a comment (opens a DM thread from a public comment). Facebook &
// Instagram both accept recipient: { comment_id }. Best-effort.
async function metaPrivateReplyToComment(commentId: string, text: string): Promise<{ sent: boolean; skipped?: string; error?: string }> {
  if (!META_PAGE_ID || !META_PAGE_TOKEN) return { sent: false, skipped: "not_configured" };
  if (!commentId) return { sent: false, skipped: "no_comment" };
  try {
    const res = await fetch(`${META_GRAPH}/${META_PAGE_ID}/messages?access_token=${encodeURIComponent(META_PAGE_TOKEN)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient: { comment_id: commentId }, message: { text: text.slice(0, 1000) } }),
    });
    if (!res.ok) return { sent: false, error: `preply_${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}` };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: String((e as any)?.message ?? e) };
  }
}

// Once-per-key-per-24h guard, reused for DMs (per sender) and comments (per id).
async function autoReplyOnce(key: string): Promise<boolean> {
  const guardKey = `meta:autoreply:${key}`;
  const prev = (await kv.get(guardKey)) as { at?: string } | null;
  const lastAt = prev?.at ? Date.parse(prev.at) : 0;
  if (lastAt && (Date.now() - lastAt) < 24 * 60 * 60 * 1000) return false;
  await kv.set(guardKey, { at: new Date().toISOString() });
  return true;
}

async function notifyAdminSocial(subject: string, body: string): Promise<void> {
  const to = ADMIN_EMAILS[0];
  if (!to) return;
  try {
    await sendMail({ to, subject, text: body, html: `<p>${body.replace(/\n/g, "<br>")}</p>` });
  } catch (_) { /* best-effort */ }
}

// GET — Meta verification challenge (hub.verify_token must match CRON_SECRET).
app.get(`${P}/webhook/meta`, (c) => {
  const mode = c.req.query("hub.mode");
  const token = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");
  if (mode === "subscribe" && token === Deno.env.get("CRON_SECRET") && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return c.json({ error: "forbidden" }, 403);
});

// POST — Instagram + Facebook events (DMs and comments).
app.post(`${P}/webhook/meta`, async (c) => {
  try {
    const raw = await c.req.text();
    if (!(await verifyMetaSignature(c, raw))) return c.json({ error: "invalid signature" }, 403);
    const body = (() => { try { return JSON.parse(raw); } catch { return {} as any; } })();
    const isInstagram = body?.object === "instagram";
    const cfg = await getSocialCfg();
    for (const entry of (body?.entry ?? [])) {
      // ── Direct messages (Messenger + Instagram DM) ──────────────────────────
      for (const m of (entry?.messaging ?? [])) {
        const senderId = m?.sender?.id ?? "";
        const incoming = m?.message?.text ?? "";
        // Ignore echoes of our own outgoing messages and empty/non-text events.
        if (!senderId || m?.message?.is_echo || !incoming) continue;
        if (!(await autoReplyOnce(`dm:${senderId}`))) continue;
        // Priority: FAQ keyword → Gemini draft (if enabled) → waiting message.
        const faqHit = matchFaq(incoming, cfg.rules);
        const answer = faqHit ?? (cfg.useGemini ? await geminiSocialReply(incoming) : null) ?? cfg.waitMessage;
        await metaSendDM(senderId, answer);
        const kind = faqHit ? "FAQ" : (cfg.useGemini ? "Gemini" : "message d'attente");
        await notifyAdminSocial(
          `📩 ${isInstagram ? "Instagram" : "Messenger"} — message de ${senderId}`,
          `Message reçu :\n\n${incoming}\n\nRéponse auto envoyée (${kind}) :\n${answer}\n\nRépondez vous-même dans la boîte de réception ${isInstagram ? "Instagram" : "Messenger"}.`,
        );
      }
      // ── Comments (Facebook feed + Instagram comments) ───────────────────────
      for (const ch of (entry?.changes ?? [])) {
        const field = ch?.field;
        const v = ch?.value ?? {};
        const isComment = field === "comments" || (field === "feed" && v?.item === "comment");
        if (!isComment || v?.verb === "remove") continue;
        // Skip our own comments (avoid replying to ourselves / loops).
        const fromId = v?.from?.id ?? "";
        if (fromId && (fromId === META_PAGE_ID || fromId === META_IG_USER_ID)) continue;
        const commentId = v?.comment_id ?? v?.id ?? "";
        const commentText = v?.message ?? v?.text ?? "";
        if (!commentId) continue;
        if (!(await autoReplyOnce(`comment:${commentId}`))) continue;
        // Public reply + a private DM so the conversation moves to the inbox.
        await metaReplyToComment(commentId, cfg.commentReply, isInstagram);
        const dm = matchFaq(commentText, cfg.rules) ?? cfg.waitMessage;
        await metaPrivateReplyToComment(commentId, dm);
        await notifyAdminSocial(
          `💬 ${isInstagram ? "Instagram" : "Facebook"} — nouveau commentaire`,
          `Commentaire :\n\n${commentText}\n\nRéponse publique + DM auto envoyés. Répondez vous-même si besoin.`,
        );
      }
    }
  } catch (e) {
    console.error("[meta-webhook] error:", e);
  }
  // Always 200 quickly so Meta doesn't retry/disable the webhook.
  return c.json({ ok: true });
});

// ══════════════════════════════════════════════════════════════════════════════
// FORMATIONS (espace Formation — catalogue public + gestion admin + inscriptions)
// ══════════════════════════════════════════════════════════════════════════════
// KV: formation:<id> — a training course (published flag gates public visibility).
// Enrollments are stored as regular leads (source "formation") so they flow into
// the existing dashboard with full payment tracking (status → won auto-sends the
// receipt). The admin Formation tab manages the catalogue; enrollments are read
// back via /formations/enrollments (leads filtered by source).

function cleanFormation(b: any) {
  const syllabus = Array.isArray(b?.syllabus)
    ? b.syllabus.slice(0, 40).map((s: any) => str(s, 200)).filter(Boolean)
    : [];
  const tags = Array.isArray(b?.tags)
    ? b.tags.slice(0, 20).map((t: any) => str(t, 80)).filter(Boolean)
    : [];
  const free = !!b?.free;
  const type = ["cours", "live", "conference", "replay"].includes(b?.type) ? b.type : "cours";
  return {
    published: !!b?.published,
    title: str(b?.title, 160).trim(),
    summary: str(b?.summary, 400).trim(),
    description: str(b?.description, 4000),
    level: ["debutant", "intermediaire", "avance"].includes(b?.level) ? b.level : "debutant",
    format: ["en-ligne", "presentiel", "hybride"].includes(b?.format) ? b.format : "en-ligne",
    durationHours: num(b?.durationHours, 0),
    free,
    price: free ? 0 : num(b?.price, 0),
    image: str(b?.image, 600) || undefined,
    instructor: str(b?.instructor, 120) || undefined,
    startDate: str(b?.startDate, 40) || undefined,
    seats: num(b?.seats, 0),
    syllabus,
    order: num(b?.order, 0),
    // Session type fields (live, replay, conference)
    type,
    liveUrl: str(b?.liveUrl, 600) || undefined,
    replayUrl: str(b?.replayUrl, 600) || undefined,
    resourcesUrl: str(b?.resourcesUrl, 600) || undefined,
    startDateTime: str(b?.startDateTime, 40) || undefined,
    endDateTime: str(b?.endDateTime, 40) || undefined,
    isLive: !!b?.isLive,
    recordingDate: str(b?.recordingDate, 40) || undefined,
    tags,
  };
}

// Public shape (a published formation, no admin-only noise).
const publicFormation = (f: any) => ({
  id: f.id, title: f.title, summary: f.summary, description: f.description,
  level: f.level, format: f.format, durationHours: f.durationHours,
  free: f.free, price: f.price, image: f.image, instructor: f.instructor,
  startDate: f.startDate, seats: f.seats, syllabus: f.syllabus, order: f.order,
  type: f.type, liveUrl: f.liveUrl, replayUrl: f.replayUrl,
  resourcesUrl: f.resourcesUrl, startDateTime: f.startDateTime,
  endDateTime: f.endDateTime, isLive: f.isLive, recordingDate: f.recordingDate,
  tags: f.tags,
});

// Public: list published formations (soonest / lowest order first).
app.get(`${P}/formations`, async (c) => {
  const all = ((await kv.getByPrefix("formation:")) as any[]) ?? [];
  const published = all
    .filter((f) => f.published)
    .sort((a, b) => (a.order - b.order) || (a.createdAt < b.createdAt ? 1 : -1))
    .map(publicFormation);
  return c.json({ formations: published });
});

// Public: enroll in a formation. Stored as a lead (payment tracking reuse).
app.post(`${P}/formations/enroll`, async (c) => {
  if (!(await rateLimit(c, "formation-enroll", 10))) return c.json({ error: "rate_limited" }, 429);
  const b = await c.req.json().catch(() => ({} as any));
  const name = str(b.name, 200).trim();
  const email = String(b.email ?? "").trim().toLowerCase();
  const formationId = str(b.formationId, 80);
  if (name.length < 2 || !isEmail(email) || !formationId) return c.json({ error: "invalid" }, 400);
  const f: any = await kv.get(`formation:${formationId}`);
  if (!f || !f.published) return c.json({ error: "not found" }, 404);
  const id = newId();
  const lead = {
    id,
    createdAt: new Date().toISOString(),
    status: "new",
    source: "formation",
    name,
    email,
    phone: str(b.phone, 60),
    lang: str(b.lang, 8),
    currency: str(b.currency, 8),
    region: str(b.region, 80),
    total: f.free ? 0 : (typeof f.price === "number" ? f.price : null),
    deposit: null,
    items: [{ name: f.title, tier: f.free ? "Gratuite" : "Payante", qty: 1, price: f.price ?? 0 }],
    budget: "",
    message: str(b.message, 2000),
    meta: {
      formationId,
      formationTitle: f.title,
      formationFree: f.free,
      ...(b.meta && typeof b.meta === "object" ? b.meta : {}),
    },
  };
  await kv.set(`lead:${id}`, lead);
  // Notify the team (best-effort).
  const notifyTo = ADMIN_EMAILS[0];
  if (notifyTo) {
    try {
      await sendMail({
        to: notifyTo,
        subject: `Nouvelle inscription formation — ${f.title}`,
        text: `Formation : ${f.title} (${f.free ? "gratuite" : "payante"})\nNom : ${name}\nE-mail : ${email}\nWhatsApp : ${b.phone || "—"}\nMessage : ${b.message || "—"}`,
        html: `<p><strong>Nouvelle inscription — ${escH(f.title)}</strong></p><p>Nom : ${escH(name)}<br>E-mail : ${escH(email)}<br>WhatsApp : ${escH(b.phone || "—")}</p>`,
      });
    } catch (_) { /* best-effort */ }
  }
  return c.json({ ok: true, id, free: f.free });
});

// Admin: all formations (published + drafts).
app.get(`${P}/formations/all`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const all = ((await kv.getByPrefix("formation:")) as any[]) ?? [];
  all.sort((a, b) => (a.order - b.order) || (a.createdAt < b.createdAt ? 1 : -1));
  return c.json({ formations: all });
});

// Admin: create or update a formation. An id in the body updates in place.
app.post(`${P}/formations`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const b = await c.req.json().catch(() => ({} as any));
  const clean = cleanFormation(b);
  if (!clean.title) return c.json({ error: "missing title" }, 400);
  const id = str(b?.id, 80) || newId();
  const existing: any = await kv.get(`formation:${id}`);
  const formation = {
    id,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    ...clean,
  };
  await kv.set(`formation:${id}`, formation);
  return c.json({ ok: true, formation });
});

app.delete(`${P}/formations/:id`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  await kv.del(`formation:${c.req.param("id")}`);
  return c.json({ ok: true });
});

// Admin: enrollments (leads with source "formation"), newest first.
app.get(`${P}/formations/enrollments`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const leads = ((await kv.getByPrefix("lead:")) as any[]) ?? [];
  const enrollments = leads
    .filter((l) => l.source === "formation")
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return c.json({ enrollments });
});

// ══════════════════════════════════════════════════════════════════════════════
// COLLABORATEURS (espace Collaborateur — candidature publique + validation admin)
// ══════════════════════════════════════════════════════════════════════════════
// KV: collaborateur:<id> — a professional's promotional listing. Submitted as
// "pending"; only admin-approved listings appear in the public gallery. The promo
// card is rendered on the client from these fields, in INOV's brand colours.
// Photos go to a PUBLIC bucket so approved cards can display them on the site.

const COLLAB_BUCKET = "collab-photos";
const COLLAB_MAX_BYTES = 8 * 1024 * 1024; // 8 MB — a profile photo / logo.
let collabBucketReady = false;
async function ensureCollabBucket(): Promise<void> {
  if (collabBucketReady) return;
  const { data } = await admin.storage.getBucket(COLLAB_BUCKET);
  if (!data) {
    await admin.storage.createBucket(COLLAB_BUCKET, {
      public: true,
      fileSizeLimit: COLLAB_MAX_BYTES,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
    }).catch(() => { /* concurrent create — ignore */ });
  }
  collabBucketReady = true;
}

function cleanCollab(b: any) {
  const portfolioImages = Array.isArray(b?.portfolioImages)
    ? b.portfolioImages.slice(0, 6).map((u: any) => str(u, 600)).filter(Boolean)
    : [];
  const skills = Array.isArray(b?.skills)
    ? b.skills.slice(0, 20).map((s: any) => str(s, 80)).filter(Boolean)
    : [];
  return {
    name: str(b?.name, 120).trim(),
    profession: str(b?.profession, 120).trim(),
    service: str(b?.service, 200).trim(),
    description: str(b?.description, 800).trim(),
    price: str(b?.price, 80).trim(),
    city: str(b?.city, 80).trim(),
    photoUrl: str(b?.photoUrl, 600) || undefined,
    phone: str(b?.phone, 60).trim(),
    email: String(b?.email ?? "").trim().toLowerCase().slice(0, 200),
    whatsapp: str(b?.whatsapp, 60).trim(),
    instagram: str(b?.instagram, 120).trim(),
    website: str(b?.website, 200).trim(),
    accent: str(b?.accent, 20) || undefined,
    testimonial: str(b?.testimonial, 600) || undefined,
    portfolioImages,
    skills,
  };
}

// Public shape — contact channels for reaching the pro, but never the raw email.
const publicCollab = (x: any) => ({
  id: x.id, name: x.name, profession: x.profession, service: x.service,
  description: x.description, price: x.price, city: x.city, photoUrl: x.photoUrl,
  whatsapp: x.whatsapp, instagram: x.instagram, website: x.website,
  accent: x.accent, createdAt: x.createdAt,
  testimonial: x.testimonial, portfolioImages: x.portfolioImages, skills: x.skills,
});

// Public: one-shot signed upload URL for a collaborator photo (public bucket).
app.post(`${P}/collaborateurs/upload-url`, async (c) => {
  if (!(await rateLimit(c, "collab-upload", 20))) return c.json({ error: "rate_limited" }, 429);
  const b = await c.req.json().catch(() => ({} as any));
  const size = typeof b.size === "number" ? b.size : 0;
  if (size > COLLAB_MAX_BYTES) return c.json({ error: "file_too_large" }, 413);
  const name = safeName(typeof b.filename === "string" ? b.filename : "photo");
  const path = `collab/${new Date().getFullYear()}/${newId()}-${name}`;
  await ensureCollabBucket();
  const { data, error } = await admin.storage.from(COLLAB_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return c.json({ error: "upload_url_failed" }, 500);
  const { data: pub } = admin.storage.from(COLLAB_BUCKET).getPublicUrl(data.path);
  return c.json({ ok: true, path: data.path, token: data.token, bucket: COLLAB_BUCKET, publicUrl: pub.publicUrl });
});

// Public: submit a collaborator application (stored pending until approved).
app.post(`${P}/collaborateurs`, async (c) => {
  if (!(await rateLimit(c, "collaborateurs", 5))) return c.json({ error: "rate_limited" }, 429);
  const b = await c.req.json().catch(() => ({} as any));
  const clean = cleanCollab(b);
  if (clean.name.length < 2 || clean.profession.length < 2 || clean.service.length < 3) {
    return c.json({ error: "invalid" }, 400);
  }
  if (!clean.whatsapp && !clean.phone && !isEmail(clean.email)) {
    return c.json({ error: "contact_required" }, 400);
  }
  const id = newId();
  const rec = { id, createdAt: new Date().toISOString(), status: "pending", ...clean };
  await kv.set(`collaborateur:${id}`, rec);
  const notifyTo = ADMIN_EMAILS[0];
  if (notifyTo) {
    try {
      await sendMail({
        to: notifyTo,
        subject: `Nouvelle candidature collaborateur — ${clean.name} (${clean.profession})`,
        text: `Nom : ${clean.name}\nMétier : ${clean.profession}\nService : ${clean.service}\nTarif : ${clean.price || "—"}\nVille : ${clean.city || "—"}\nWhatsApp : ${clean.whatsapp || clean.phone || "—"}\nE-mail : ${clean.email || "—"}\n\nÀ valider dans l'espace admin → Collaborateurs.`,
        html: `<p><strong>Nouvelle candidature collaborateur</strong></p><p>${escH(clean.name)} — ${escH(clean.profession)}<br>Service : ${escH(clean.service)}<br>Tarif : ${escH(clean.price || "—")}</p><p>À valider dans l'espace admin → Collaborateurs.</p>`,
      });
    } catch (_) { /* best-effort */ }
  }
  return c.json({ ok: true, id });
});

// Public: approved collaborators for the public gallery, newest first.
app.get(`${P}/collaborateurs`, async (c) => {
  const all = ((await kv.getByPrefix("collaborateur:")) as any[]) ?? [];
  const approved = all
    .filter((x) => x.status === "approved")
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map(publicCollab);
  return c.json({ collaborateurs: approved });
});

// Admin: all collaborators (pending + approved) for the moderation queue.
app.get(`${P}/collaborateurs/all`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const all = ((await kv.getByPrefix("collaborateur:")) as any[]) ?? [];
  all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return c.json({ collaborateurs: all });
});

// Admin: approve a collaborator (makes the card visible in the public gallery).
app.patch(`${P}/collaborateurs/:id/approve`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const id = c.req.param("id");
  const rec: any = await kv.get(`collaborateur:${id}`);
  if (!rec) return c.json({ error: "not found" }, 404);
  rec.status = "approved";
  await kv.set(`collaborateur:${id}`, rec);
  return c.json({ ok: true, collaborateur: rec });
});

// Admin: delete a collaborator (pending or approved).
app.delete(`${P}/collaborateurs/:id`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  await kv.del(`collaborateur:${c.req.param("id")}`);
  return c.json({ ok: true });
});

// ══════════════════════════════════════════════════════════════════════════════
// ÉVENTUALITÉS (journal d'incidents admin — interne, aucune route publique)
// ══════════════════════════════════════════════════════════════════════════════
// KV: eventualite:<id> — an incident/alert/note entry in the admin journal.
// All routes require admin auth. Public site never touches these.

const EVT_TYPES = ["incident", "alerte", "note", "suivi_client", "paiement"] as const;
const EVT_SEVERITIES = ["critique", "haute", "normale", "info"] as const;
const EVT_STATUSES = ["ouverte", "en_cours", "resolue", "archivee"] as const;

function cleanEventualite(b: any) {
  const tags = Array.isArray(b?.tags)
    ? b.tags.slice(0, 20).map((t: any) => str(t, 80)).filter(Boolean)
    : [];
  return {
    title: str(b?.title, 200).trim(),
    description: str(b?.description, 2000) || undefined,
    type: EVT_TYPES.includes(b?.type) ? b.type : "note",
    severity: EVT_SEVERITIES.includes(b?.severity) ? b.severity : "normale",
    status: EVT_STATUSES.includes(b?.status) ? b.status : "ouverte",
    linkedLeadId: str(b?.linkedLeadId, 80) || undefined,
    resolvedNote: str(b?.resolvedNote, 800) || undefined,
    resolvedAt: b?.resolvedAt ? str(b.resolvedAt, 40) : undefined,
    tags,
  };
}

// Admin: list all eventualites, newest first.
app.get(`${P}/eventualites`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const all = ((await kv.getByPrefix("eventualite:")) as any[]) ?? [];
  all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return c.json({ eventualites: all });
});

// Admin: create a new eventualite.
app.post(`${P}/eventualites`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const b = await c.req.json().catch(() => ({} as any));
  const clean = cleanEventualite(b);
  if (!clean.title) return c.json({ error: "missing title" }, 400);
  const id = newId();
  const eventualite = { id, createdAt: new Date().toISOString(), ...clean };
  await kv.set(`eventualite:${id}`, eventualite);
  return c.json({ ok: true, eventualite });
});

// Admin: patch (update status, resolvedNote, description, severity) on an eventualite.
app.patch(`${P}/eventualites/:id`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const id = c.req.param("id");
  const rec: any = await kv.get(`eventualite:${id}`);
  if (!rec) return c.json({ error: "not found" }, 404);
  const b = await c.req.json().catch(() => ({} as any));
  if (b.status !== undefined && EVT_STATUSES.includes(b.status)) {
    rec.status = b.status;
    if (b.status === "resolue" && !rec.resolvedAt) {
      rec.resolvedAt = new Date().toISOString();
    }
  }
  if (b.severity !== undefined && EVT_SEVERITIES.includes(b.severity)) rec.severity = b.severity;
  if (typeof b.resolvedNote === "string") rec.resolvedNote = str(b.resolvedNote, 800);
  if (typeof b.description === "string") rec.description = str(b.description, 2000);
  await kv.set(`eventualite:${id}`, rec);
  return c.json({ ok: true, eventualite: rec });
});

// Admin: delete an eventualite.
app.delete(`${P}/eventualites/:id`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  await kv.del(`eventualite:${c.req.param("id")}`);
  return c.json({ ok: true });
});

// ── Social auto-publishing (Facebook Page + Instagram) ─────────────────────────
// Mirrors the newsletter model: compose/schedule posts (stored as social:<id>),
// then a cron endpoint (secret-guarded) publishes the ones whose time has come.
// New blog articles are auto-enqueued from PUT /settings. Each network is skipped
// gracefully when unconfigured, exactly like the WhatsApp follow-up integration.

const SOCIAL_NETWORKS = ["facebook", "instagram", "tiktok"] as const;
type SocialNetwork = (typeof SOCIAL_NETWORKS)[number];

function cleanNetworks(input: unknown): SocialNetwork[] {
  const arr = Array.isArray(input) ? input : [];
  const picked = SOCIAL_NETWORKS.filter((n) => arr.includes(n));
  return picked.length ? picked : [...SOCIAL_NETWORKS];
}

// Publish a single post to the Facebook Page feed. With an image we use /photos
// (image + caption); text/link-only posts go to /feed.
async function publishToFacebook(p: { message: string; link?: string; imageUrl?: string }) {
  if (!META_PAGE_ID || !META_PAGE_TOKEN) return { sent: false, skipped: "not_configured" as const };
  try {
    let url: string;
    const body: Record<string, string> = { access_token: META_PAGE_TOKEN };
    if (p.imageUrl) {
      url = `${META_GRAPH}/${META_PAGE_ID}/photos`;
      body.url = p.imageUrl;
      body.caption = p.message;
    } else {
      url = `${META_GRAPH}/${META_PAGE_ID}/feed`;
      body.message = p.message;
      if (p.link) body.link = p.link;
    }
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body),
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) return { sent: false, error: `fb_${res.status}: ${JSON.stringify(data).slice(0, 200)}` };
    return { sent: true, id: data.post_id ?? data.id };
  } catch (e) {
    return { sent: false, error: String((e as any)?.message ?? e) };
  }
}

// Publish to Instagram: create a media container, then publish it. IG feed posts
// require a publicly reachable image URL (a caption alone is not enough).
async function publishToInstagram(p: { caption: string; imageUrl?: string }) {
  if (!META_IG_USER_ID || !META_PAGE_TOKEN) return { sent: false, skipped: "not_configured" as const };
  if (!p.imageUrl) return { sent: false, skipped: "no_image" as const };
  try {
    const createRes = await fetch(`${META_GRAPH}/${META_IG_USER_ID}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ image_url: p.imageUrl, caption: p.caption, access_token: META_PAGE_TOKEN }),
    });
    const created = await createRes.json().catch(() => ({} as any));
    if (!createRes.ok || !created.id) {
      return { sent: false, error: `ig_create_${createRes.status}: ${JSON.stringify(created).slice(0, 200)}` };
    }
    const pubRes = await fetch(`${META_GRAPH}/${META_IG_USER_ID}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ creation_id: created.id, access_token: META_PAGE_TOKEN }),
    });
    const published = await pubRes.json().catch(() => ({} as any));
    if (!pubRes.ok || !published.id) {
      return { sent: false, error: `ig_publish_${pubRes.status}: ${JSON.stringify(published).slice(0, 200)}` };
    }
    return { sent: true, id: published.id };
  } catch (e) {
    return { sent: false, error: String((e as any)?.message ?? e) };
  }
}

// ── TikTok (Content Posting API) ────────────────────────────────────────────
// Unlike Meta, TikTok requires a per-user OAuth token (video.publish scope) that
// expires every 24h and is refreshed with a long-lived refresh token. We store
// the token set in KV under `tiktok:tokens` and refresh transparently. Publishing
// uses the PULL_FROM_URL flow: TikTok downloads the video from a public URL.
const TIKTOK_CLIENT_KEY = Deno.env.get("TIKTOK_CLIENT_KEY") ?? "";
const TIKTOK_CLIENT_SECRET = Deno.env.get("TIKTOK_CLIENT_SECRET") ?? "";
const TIKTOK_SCOPE = "video.publish";
// Default privacy: SELF_ONLY is always allowed, including for apps not yet audited
// by TikTok. Once your app is approved you can pass "PUBLIC_TO_EVERYONE".
const TIKTOK_DEFAULT_PRIVACY = Deno.env.get("TIKTOK_PRIVACY") ?? "SELF_ONLY";

function tiktokConfigured(): boolean {
  return Boolean(TIKTOK_CLIENT_KEY && TIKTOK_CLIENT_SECRET);
}

// The public callback URL TikTok redirects to after authorization. Must match the
// Redirect URI registered in the TikTok developer app exactly.
function tiktokRedirectUri(): string {
  const base = (Deno.env.get("SUPABASE_URL") ?? "").replace(/\/+$/, "");
  return `${base}/functions/v1/make-server-df4bb120/tiktok/callback`;
}

type TikTokTokens = {
  access_token: string;
  refresh_token: string;
  open_id?: string;
  expires_at: number;         // epoch ms
  refresh_expires_at: number; // epoch ms
};

// Exchange an authorization code (or refresh token) for a token set.
async function tiktokTokenRequest(params: Record<string, string>): Promise<TikTokTokens | null> {
  try {
    const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        ...params,
      }),
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok || !data.access_token) {
      console.error("[tiktok] token error:", res.status, JSON.stringify(data).slice(0, 200));
      return null;
    }
    const now = Date.now();
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      open_id: data.open_id,
      expires_at: now + Number(data.expires_in ?? 86400) * 1000,
      refresh_expires_at: now + Number(data.refresh_expires_in ?? 31536000) * 1000,
    };
  } catch (e) {
    console.error("[tiktok] token request failed:", String((e as any)?.message ?? e));
    return null;
  }
}

// Return a valid access token, refreshing it if it expires within 2 minutes.
async function getTikTokAccessToken(): Promise<string | null> {
  const stored = (await kv.get("tiktok:tokens")) as TikTokTokens | null;
  if (!stored?.access_token) return null;
  if (stored.expires_at - Date.now() > 120_000) return stored.access_token;
  const refreshed = await tiktokTokenRequest({
    grant_type: "refresh_token",
    refresh_token: stored.refresh_token,
  });
  if (!refreshed) return stored.access_token; // best-effort: try the old one
  await kv.set("tiktok:tokens", refreshed);
  return refreshed.access_token;
}

// Publish one video to TikTok via PULL_FROM_URL. `videoUrl` must be public and its
// domain must be verified in the TikTok developer portal.
async function publishToTikTok(p: { videoUrl?: string; caption: string; privacy?: string }) {
  if (!tiktokConfigured()) return { sent: false, skipped: "not_configured" as const };
  if (!p.videoUrl) return { sent: false, skipped: "no_video" as const };
  const token = await getTikTokAccessToken();
  if (!token) return { sent: false, skipped: "not_connected" as const };
  try {
    const res = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({
        post_info: {
          title: p.caption.slice(0, 2200),
          privacy_level: p.privacy || TIKTOK_DEFAULT_PRIVACY,
          disable_comment: false,
          disable_duet: false,
          disable_stitch: false,
        },
        source_info: { source: "PULL_FROM_URL", video_url: p.videoUrl },
      }),
    });
    const data = await res.json().catch(() => ({} as any));
    const publishId = data?.data?.publish_id;
    if (!res.ok || !publishId) {
      return { sent: false, error: `tiktok_${res.status}: ${JSON.stringify(data).slice(0, 200)}` };
    }
    return { sent: true, id: publishId };
  } catch (e) {
    return { sent: false, error: String((e as any)?.message ?? e) };
  }
}

// Publish one post to each of its target networks; returns a per-network report.
async function publishSocialPost(post: any): Promise<Record<string, any>> {
  const nets = cleanNetworks(post?.networks);
  const caption = String(post?.caption ?? "");
  const imageUrl = post?.imageUrl ? absoluteUrl(String(post.imageUrl)) : undefined;
  const videoUrl = post?.videoUrl ? absoluteUrl(String(post.videoUrl)) : undefined;
  const link = post?.link ? absoluteUrl(String(post.link)) : undefined;
  const report: Record<string, any> = {};
  const summarize = (r: any) =>
    r.sent ? { status: "sent", id: r.id } : { status: r.error ? "error" : "skipped", detail: r.error ?? r.skipped };
  if (nets.includes("facebook")) report.facebook = summarize(await publishToFacebook({ message: caption, link, imageUrl }));
  if (nets.includes("instagram")) report.instagram = summarize(await publishToInstagram({ caption, imageUrl }));
  if (nets.includes("tiktok")) report.tiktok = summarize(await publishToTikTok({ videoUrl, caption }));
  return report;
}

function socialStatusFromReport(report: Record<string, any>): "sent" | "failed" | "partial" {
  const states = Object.values(report).map((r: any) => r?.status);
  if (states.length && states.every((s) => s === "sent")) return "sent";
  if (states.some((s) => s === "sent")) return "partial";
  return "failed";
}

// Admin: publish immediately (a manual, one-off post). Returns the live result.
app.post(`${P}/social/publish`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  if (!metaConfigured()) return c.json({ error: "meta_not_configured" }, 503);
  const b = await c.req.json().catch(() => ({} as any));
  const caption = typeof b.caption === "string" ? b.caption.slice(0, 2200).trim() : "";
  const imageUrl = typeof b.imageUrl === "string" ? b.imageUrl.slice(0, 600).trim() : "";
  const videoUrl = typeof b.videoUrl === "string" ? b.videoUrl.slice(0, 600).trim() : "";
  const link = typeof b.link === "string" ? b.link.slice(0, 600).trim() : "";
  const networks = cleanNetworks(b.networks);
  if (!caption && !imageUrl && !videoUrl) return c.json({ error: "missing caption, image or video" }, 400);
  const report = await publishSocialPost({ caption, imageUrl, videoUrl, link, networks });
  const status = socialStatusFromReport(report);
  // Keep a record so the admin history shows manual posts too.
  const id = newId();
  await kv.set(`social:${id}`, {
    id, caption, imageUrl, videoUrl, link, networks,
    source: "manual", status, scheduledAt: new Date().toISOString(),
    createdAt: new Date().toISOString(), result: { ...report, dispatchedAt: new Date().toISOString() },
  });
  return c.json({ ok: status !== "failed", id, status, result: report });
});

// Admin: schedule a post for later automatic publication by the cron dispatch.
app.post(`${P}/social/schedule`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const b = await c.req.json().catch(() => ({} as any));
  const caption = typeof b.caption === "string" ? b.caption.slice(0, 2200).trim() : "";
  const imageUrl = typeof b.imageUrl === "string" ? b.imageUrl.slice(0, 600).trim() : "";
  const videoUrl = typeof b.videoUrl === "string" ? b.videoUrl.slice(0, 600).trim() : "";
  const link = typeof b.link === "string" ? b.link.slice(0, 600).trim() : "";
  const when = new Date(String(b.scheduledAt ?? ""));
  if (!caption && !imageUrl && !videoUrl) return c.json({ error: "missing caption, image or video" }, 400);
  if (isNaN(when.getTime())) return c.json({ error: "invalid scheduledAt" }, 400);
  const id = newId();
  const post = {
    id, caption, imageUrl, videoUrl, link,
    networks: cleanNetworks(b.networks),
    source: "manual", status: "scheduled",
    scheduledAt: when.toISOString(), createdAt: new Date().toISOString(), result: null as any,
  };
  await kv.set(`social:${id}`, post);
  return c.json({ ok: true, id });
});

// Admin: list posts (history + scheduled), most recent first.
app.get(`${P}/social/posts`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const rows = ((await kv.getByPrefix("social:")) as any[]) ?? [];
  const posts = rows.sort((a, b) => (a.scheduledAt < b.scheduledAt ? 1 : -1));
  return c.json({ posts, metaConfigured: metaConfigured() });
});

// Admin: cancel/delete a scheduled or historical post.
app.delete(`${P}/social/posts/:id`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  await kv.del(`social:${c.req.param("id")}`);
  return c.json({ ok: true });
});

// Cron: publish due posts (secret-guarded, no admin session). Same contract as
// the newsletter dispatch — safe to call every few minutes.
app.post(`${P}/social/dispatch`, async (c) => {
  if (!CRON_SECRET) return c.json({ error: "dispatch disabled" }, 503);
  if (c.req.header("x-cron-secret") !== CRON_SECRET) return c.json({ error: "forbidden" }, 403);
  const now = Date.now();
  const rows = ((await kv.getByPrefix("social:")) as any[]) ?? [];
  const due = rows.filter((r) => r?.status === "scheduled" && new Date(r.scheduledAt).getTime() <= now);
  const processed: any[] = [];
  for (const post of due) {
    try {
      const report = await publishSocialPost(post);
      post.status = socialStatusFromReport(report);
      post.result = { ...report, dispatchedAt: new Date().toISOString() };
    } catch (e) {
      post.status = "failed";
      post.result = { error: String((e as any)?.message ?? e), dispatchedAt: new Date().toISOString() };
    }
    await kv.set(`social:${post.id}`, post);
    processed.push({ id: post.id, status: post.status });
  }
  return c.json({ ok: true, processed });
});

// ── TikTok connection routes ────────────────────────────────────────────────

// Admin: is TikTok configured (client key/secret) and connected (a valid token)?
app.get(`${P}/tiktok/status`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const tokens = (await kv.get("tiktok:tokens")) as TikTokTokens | null;
  return c.json({
    configured: tiktokConfigured(),
    connected: Boolean(tokens?.access_token && tokens.refresh_expires_at > Date.now()),
    openId: tokens?.open_id ?? null,
    expiresAt: tokens?.expires_at ?? null,
    redirectUri: tiktokRedirectUri(),
  });
});

// Admin: start the OAuth flow. Returns the TikTok authorize URL to open. A random
// state is stored briefly and checked on callback to prevent CSRF.
app.get(`${P}/tiktok/auth`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  if (!tiktokConfigured()) return c.json({ error: "tiktok_not_configured" }, 503);
  const state = crypto.randomUUID();
  await kv.set(`tiktok:oauth:${state}`, { at: Date.now() });
  const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
  url.searchParams.set("client_key", TIKTOK_CLIENT_KEY);
  url.searchParams.set("scope", TIKTOK_SCOPE);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", tiktokRedirectUri());
  url.searchParams.set("state", state);
  return c.json({ url: url.toString() });
});

// Public: OAuth callback hit by TikTok. Exchanges the code for tokens, stores them,
// then shows a small confirmation page that points back to the admin.
app.get(`${P}/tiktok/callback`, async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state") ?? "";
  const backTo = `${(Deno.env.get("SITE_URL") ?? "").replace(/\/+$/, "")}/admin`;
  const page = (title: string, msg: string) =>
    c.html(
      `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
      `<div style="font-family:system-ui;max-width:34rem;margin:16vh auto;padding:0 20px;text-align:center">` +
      `<h1 style="font-size:20px">${title}</h1><p style="color:#555;line-height:1.6">${msg}</p>` +
      `<p><a href="${backTo}" style="color:#2563eb">Retour à l'administration</a></p></div>`,
    );
  if (!code) return page("TikTok — connexion annulée", "Aucun code d'autorisation reçu. Vous pouvez réessayer depuis l'administration.");
  const saved = await kv.get(`tiktok:oauth:${state}`);
  if (!saved) return page("TikTok — lien expiré", "Ce lien de connexion a expiré ou est invalide. Relancez la connexion depuis l'administration.");
  await kv.del(`tiktok:oauth:${state}`);
  const tokens = await tiktokTokenRequest({
    grant_type: "authorization_code",
    code,
    redirect_uri: tiktokRedirectUri(),
  });
  if (!tokens) return page("TikTok — échec", "Impossible de finaliser la connexion. Vérifiez les identifiants de l'app TikTok, puis réessayez.");
  await kv.set("tiktok:tokens", tokens);
  return page("TikTok connecté ✅", "Votre compte TikTok est relié. Vous pouvez maintenant publier vos vidéos depuis l'administration.");
});

// Admin: disconnect (forget stored tokens).
app.post(`${P}/tiktok/disconnect`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  await kv.del("tiktok:tokens");
  return c.json({ ok: true });
});

// Admin: check the processing status of a TikTok publish (by publish_id).
app.get(`${P}/tiktok/publish-status/:id`, async (c) => {
  const u = await requireAdmin(c);
  if (u instanceof Response) return u;
  const token = await getTikTokAccessToken();
  if (!token) return c.json({ error: "not_connected" }, 503);
  try {
    const res = await fetch("https://open.tiktokapis.com/v2/post/publish/status/fetch/", {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ publish_id: c.req.param("id") }),
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) return c.json({ error: `tiktok_${res.status}`, detail: data }, 502);
    return c.json({ ok: true, status: data?.data?.status ?? "UNKNOWN", detail: data?.data ?? {} });
  } catch (e) {
    return c.json({ error: String((e as any)?.message ?? e) }, 502);
  }
});

Deno.serve(app.fetch);
