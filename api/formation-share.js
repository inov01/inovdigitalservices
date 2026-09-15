// Vercel serverless function — dynamic Open Graph tags for shared formation links.
//
// The site is a client-rendered SPA, so social crawlers (WhatsApp, Facebook,
// Messenger, LinkedIn, Twitter) — which do NOT run JavaScript — would otherwise
// see the generic index.html preview for every formation. This function fetches
// the formation from the Supabase edge function, then serves index.html with the
// og:/twitter: tags rewritten to that formation's title, summary and preview
// image. Real browsers still boot the SPA normally afterwards.

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

// Replace the content="..." of a meta tag identified by property/name, or append
// the tag just before </head> if it is not already present.
function setMeta(html, keyAttr, keyVal, content) {
  const safe = esc(content);
  const re = new RegExp(
    `(<meta[^>]*\\b${keyAttr}=["']${keyVal}["'][^>]*\\bcontent=["'])[^"']*(["'][^>]*>)`,
    "i",
  );
  if (re.test(html)) return html.replace(re, `$1${safe}$2`);
  return html.replace(/<\/head>/i, `  <meta ${keyAttr}="${keyVal}" content="${safe}" />\n</head>`);
}

export default async function handler(req, res) {
  const slug = String((req.query && req.query.slug) || "").trim();
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  const origin = `${proto}://${host}`;

  // Always start from the real, built index.html so asset hashes stay correct.
  let html = "";
  try {
    const r = await fetch(`${origin}/index.html`, { headers: { "User-Agent": "og-render" } });
    html = await r.text();
  } catch {
    res.setHeader("Location", `/formation`);
    res.statusCode = 302;
    return res.end();
  }

  let formation = null;
  if (slug) {
    try {
      const r = await fetch(`${FN_BASE}/formations/one/${encodeURIComponent(slug)}`, {
        headers: { Authorization: `Bearer ${ANON_KEY}` },
      });
      if (r.ok) formation = (await r.json()).formation;
    } catch {
      /* fall back to generic preview */
    }
  }

  if (formation) {
    const url = `${origin}/formation/${formation.slug || slug}`;
    const title = `${formation.title} — INOV Digital Services`;
    const desc = (formation.summary || "").slice(0, 200);
    const img = formation.ogImage || formation.image || `${origin}/og-image.png`;

    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${esc(title)}</title>`);
    html = setMeta(html, "name", "description", desc);
    html = setMeta(html, "property", "og:type", "article");
    html = setMeta(html, "property", "og:title", title);
    html = setMeta(html, "property", "og:description", desc);
    html = setMeta(html, "property", "og:url", url);
    html = setMeta(html, "property", "og:image", img);
    html = setMeta(html, "name", "twitter:card", "summary_large_image");
    html = setMeta(html, "name", "twitter:title", title);
    html = setMeta(html, "name", "twitter:description", desc);
    html = setMeta(html, "name", "twitter:image", img);
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  // Short CDN cache so a freshly edited preview image propagates quickly.
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=600");
  res.statusCode = 200;
  return res.end(html);
}
