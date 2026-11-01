// Vercel serverless function: Open Graph tags for shared portfolio links
// (/portfolio/:id). Social crawlers do not run JavaScript, so we serve the real
// index.html with og:/twitter: tags rewritten to the project's title and preview
// image. Browsers then boot the SPA, which opens the project (see PortfolioShare).
import OG from "./_portfolio-og.js";

const PROJECT_ID = process.env.SUPABASE_PROJECT_ID || "enwbfsbcxoqqnbkrngyb";
const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_hlRvsVjBfiow-U4xA7FTrQ_JuamG6qV";
const FN_BASE = `https://${PROJECT_ID}.supabase.co/functions/v1/make-server-df4bb120`;

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function setMeta(html, keyAttr, keyVal, content) {
  const safe = esc(content);
  const re = new RegExp(
    `(<meta[^>]*\\b${keyAttr}=["']${keyVal}["'][^>]*\\bcontent=["'])[^"']*(["'][^>]*>)`,
    "i",
  );
  if (re.test(html)) return html.replace(re, `$1${safe}$2`);
  return html.replace(/<\/head>/i, `  <meta ${keyAttr}="${keyVal}" content="${safe}" />\n</head>`);
}

// Projects added from the admin are not in the generated file: look them up in settings.
async function adminProject(id) {
  try {
    const r = await fetch(`${FN_BASE}/settings`, { headers: { Authorization: `Bearer ${ANON_KEY}` } });
    if (!r.ok) return null;
    const list = (await r.json())?.settings?.albumsAdded;
    const a = Array.isArray(list) ? list.find((x) => x && x.id === id) : null;
    if (!a) return null;
    const img = (a.works || []).map((w) => w.img).find((u) => typeof u === "string" && /^https?:\/\//.test(u));
    return { client: a.client, tagline: a.tagline, impact: a.impact, remoteImage: img || "" };
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const id = String((req.query && req.query.id) || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  const origin = `${proto}://${host}`;

  let html = "";
  try {
    const r = await fetch(`${origin}/index.html`, { headers: { "User-Agent": "og-render" } });
    html = await r.text();
  } catch {
    res.setHeader("Location", "/");
    res.statusCode = 302;
    return res.end();
  }

  let p = OG[id] || null;
  let img = p && p.image ? `${origin}/portfolio-og/${id}.jpg` : "";
  if (!p && id) {
    p = await adminProject(id);
    img = (p && p.remoteImage) || "";
  }

  if (p) {
    const url = `${origin}/portfolio/${id}`;
    const title = `${p.client}, réalisation INOV Digital Services`;
    const desc = [p.tagline, p.impact].filter(Boolean).join(". ").slice(0, 200);
    img = img || `${origin}/og-image.png`;

    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${esc(title)}</title>`);
    html = setMeta(html, "name", "description", desc);
    html = setMeta(html, "property", "og:type", "article");
    html = setMeta(html, "property", "og:title", title);
    html = setMeta(html, "property", "og:description", desc);
    html = setMeta(html, "property", "og:url", url);
    html = setMeta(html, "property", "og:image", img);
    html = setMeta(html, "property", "og:image:width", "1200");
    html = setMeta(html, "property", "og:image:height", "630");
    html = setMeta(html, "property", "og:image:alt", `${p.client}, ${p.tagline || "portfolio INOV Digital Services"}`);
    html = setMeta(html, "name", "twitter:card", "summary_large_image");
    html = setMeta(html, "name", "twitter:title", title);
    html = setMeta(html, "name", "twitter:description", desc);
    html = setMeta(html, "name", "twitter:image", img);
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=600");
  res.statusCode = 200;
  return res.end(html);
}
