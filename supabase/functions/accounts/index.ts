import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

// Dedicated function for client accounts + the ambassador (referral) program.
// It NEVER touches the existing `make-server-df4bb120` function — it only reads
// the shared KV table (lead:* / sub:*) and manages its own keys:
//   profile:<userId>   — client profile { userId, email, refCode, isAmbassador, createdAt }
//   refcode:<CODE>     — reverse lookup CODE -> userId (uniqueness guard)
//   refconfig          — reward rule (admin-editable)

const app = new Hono();
const P = "/accounts";

app.use("*", logger(console.log));

// S3 — CORS allowlist. Set ALLOWED_ORIGINS to a comma-separated list of your
// site origins (e.g. "https://inovdigitalservices.com,https://www.inovdigitalservices.com").
// If unset, falls back to "*" so local/dev still works, but SET IT IN PRODUCTION.
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

// S1 — admin allowlist. Set ADMIN_EMAILS to a comma-separated list of the email
// addresses permitted to edit global config. An authenticated but non-admin user
// is rejected with 403.
const ADMIN_EMAILS = (Deno.env.get("ADMIN_EMAILS") ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
function isAdmin(user: any): boolean {
  const email = (user?.email ?? "").toLowerCase();
  return !!email && ADMIN_EMAILS.includes(email);
}

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Reward rule — parrain (referrer) only, editable from the admin.
const DEFAULT_CONFIG = {
  enabled: true,
  // "percent" → value% of each confirmed referred order becomes referrer credit.
  type: "percent" as "percent" | "fixed",
  value: 5,
  currency: "",
};

// Resolves the authenticated Supabase user from the Bearer token, or null.
async function getUser(c: any) {
  const token = (c.req.header("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function randomCode(len = 6) {
  let s = "";
  for (let i = 0; i < len; i++) s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return s;
}

// Returns the caller's profile, creating it (with a unique refCode) on first use.
async function ensureProfile(user: any) {
  const key = `profile:${user.id}`;
  let profile = await kv.get(key);
  if (profile) return profile;
  // Generate a unique referral code.
  let code = randomCode();
  for (let i = 0; i < 5 && (await kv.get(`refcode:${code}`)); i++) code = randomCode();
  profile = {
    userId: user.id,
    email: (user.email ?? "").toLowerCase(),
    refCode: code,
    isAmbassador: false,
    createdAt: new Date().toISOString(),
  };
  await kv.set(key, profile);
  await kv.set(`refcode:${code}`, user.id);
  return profile;
}

// ── Health ───────────────────────────────────────────────────────────────────
app.get(`${P}/health`, (c) => c.json({ status: "ok" }));

// ── Reward config ────────────────────────────────────────────────────────────
app.get(`${P}/config`, async (c) => {
  const cfg = (await kv.get("refconfig")) ?? DEFAULT_CONFIG;
  return c.json({ config: cfg });
});

app.put(`${P}/config`, async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  if (!isAdmin(user)) return c.json({ error: "forbidden" }, 403);
  const b = await c.req.json().catch(() => ({}));
  const cfg = {
    enabled: !!b.enabled,
    type: b.type === "fixed" ? "fixed" : "percent",
    value: typeof b.value === "number" && b.value >= 0 ? b.value : DEFAULT_CONFIG.value,
    currency: typeof b.currency === "string" ? b.currency.slice(0, 8) : "",
  };
  await kv.set("refconfig", cfg);
  return c.json({ ok: true, config: cfg });
});

// ── Current user profile ─────────────────────────────────────────────────────
app.get(`${P}/me`, async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const profile = await ensureProfile(user);
  return c.json({ profile });
});

// Opt in as ambassador.
app.post(`${P}/me/ambassador`, async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const profile = await ensureProfile(user);
  if (!profile.isAmbassador) {
    profile.isAmbassador = true;
    await kv.set(`profile:${user.id}`, profile);
  }
  return c.json({ ok: true, profile });
});

// The caller's own orders/requests (matched on their account email).
app.get(`${P}/me/orders`, async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  // S2 — orders are matched by email, so require a VERIFIED email. Otherwise a
  // user could register an unverified account under someone else's address and
  // read their orders (IDOR). Returns empty until the address is confirmed.
  if (!user.email_confirmed_at) return c.json({ orders: [], emailUnverified: true });
  const email = (user.email ?? "").toLowerCase();
  const leads = (await kv.getByPrefix("lead:")) as any[];
  const mine = leads
    .filter((l) => (l.email ?? "").toLowerCase() === email)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return c.json({ orders: mine });
});

// The caller's referrals (leads carrying their code in meta.ref) + earned reward.
app.get(`${P}/me/referrals`, async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  const profile = await ensureProfile(user);
  const cfg = (await kv.get("refconfig")) ?? DEFAULT_CONFIG;
  const leads = (await kv.getByPrefix("lead:")) as any[];
  const referred = leads
    .filter((l) => l?.meta && String(l.meta.ref ?? "") === profile.refCode)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  let confirmed = 0;
  let credit = 0;
  for (const l of referred) {
    if (l.status === "won") {
      confirmed += 1;
      if (cfg.enabled) {
        if (cfg.type === "percent" && typeof l.total === "number") credit += (l.total * cfg.value) / 100;
        else if (cfg.type === "fixed") credit += cfg.value;
      }
    }
  }
  // Expose only non-sensitive fields to the ambassador.
  const list = referred.map((l) => ({
    id: l.id,
    createdAt: l.createdAt,
    status: l.status,
    source: l.source,
    total: l.total ?? null,
    currency: l.currency ?? "",
  }));
  return c.json({
    referrals: list,
    stats: { total: referred.length, confirmed, credit: Math.round(credit * 100) / 100, currency: cfg.currency },
    config: cfg,
  });
});

Deno.serve(app.fetch);
