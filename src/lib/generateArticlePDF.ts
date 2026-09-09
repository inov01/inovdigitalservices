// Generates a branded 2-page PDF for a blog article (cover + content) and
// downloads it immediately — no browser print dialog.

import { downloadHtmlPagesAsPdf } from "./htmlToPdf"

type ArticleForPDF = {
  id?: string
  tag: string
  title: string
  body: string[]
}

type UILabels = {
  readMore: string // e.g. "Retrouvez tous nos conseils sur"
}

const UI_LABELS: Record<string, UILabels> = {
  fr: { readMore: "Retrouvez tous nos conseils sur" },
  en: { readMore: "Find all our tips at" },
  es: { readMore: "Encuentra todos nuestros consejos en" },
  ht: { readMore: "Jwenn tout konsèy nou yo sou" },
  pt: { readMore: "Encontre todas as nossas dicas em" },
  it: { readMore: "Trova tutti i nostri consigli su" },
  de: { readMore: "Alle unsere Tipps finden Sie auf" },
  ar: { readMore: "اعثر على كل نصائحنا على" },
}

// Demonstrative icon per article (Lucide-style line icons).
const IC = (paths: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;">${paths}</svg>`
const ARTICLE_ICONS: Record<string, string> = {
  "logo-professionnel": IC(`<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>`),
  "couleurs-de-marque": IC(`<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>`),
  "presence-en-ligne": IC(`<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>`),
  "erreurs-branding": IC(`<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`),
}
const DEFAULT_ICON = IC(`<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>`)

const ARTICLE_CSS = `
:root{--orange:var(--ds-accent);--red:var(--ds-accent-hover);--ink:#16161c;--black:#0b0b0f;--muted:#4a4a58;--soft:#f6f6f9;}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Outfit',sans-serif;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact;}
.page{width:794px;height:1123px;margin:0 auto;background:#fff;position:relative;overflow:hidden;display:flex;flex-direction:column;}
.icon-badge{width:64px;height:64px;border-radius:18px;background:linear-gradient(135deg,var(--orange),var(--red));color:#fff;display:flex;align-items:center;justify-content:center;padding:16px;box-shadow:0 8px 24px rgba(247,96,27,.4);}
.icon-badge.dark{background:rgba(247,96,27,.10);color:var(--orange);box-shadow:none;border:1.5px solid rgba(247,96,27,.28);width:48px;height:48px;border-radius:14px;padding:11px;}

/* Cover page */
.cover{background:radial-gradient(120% 85% at 100% 0%,rgba(247,96,27,.28) 0%,rgba(247,96,27,0) 55%),var(--black);color:#fff;padding:76px 64px 60px;flex:1;display:flex;flex-direction:column;}
.accent-line{width:64px;height:5px;border-radius:5px;background:linear-gradient(135deg,var(--orange),var(--red));}
.pill{font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--orange);background:rgba(247,96,27,.12);border:1px solid rgba(247,96,27,.3);padding:5px 14px;border-radius:100px;display:inline-block;margin-bottom:24px;}
.cover h1{font-size:52px;font-weight:900;line-height:1.06;letter-spacing:-.02em;max-width:16ch;margin-bottom:24px;}
.cover .byline{font-size:14px;font-weight:600;color:rgba(255,255,255,.55);}
.cover-foot{margin-top:auto;padding-top:40px;display:flex;align-items:center;gap:16px;border-top:1px solid rgba(255,255,255,.12);}
.cover-foot img{height:30px;width:89px;object-fit:contain;}
.cover-foot span{font-size:14px;font-weight:700;color:rgba(255,255,255,.85);}

/* Content page */
.content{padding:56px 64px 40px;flex:1;display:flex;flex-direction:column;}
.content-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;padding-bottom:20px;border-bottom:1px solid rgba(0,0,0,.08);}
.content-head img{height:28px;width:83px;object-fit:contain;}
.content-pill{font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:700;color:var(--orange);background:rgba(247,96,27,.08);border:1px solid rgba(247,96,27,.2);padding:5px 12px;border-radius:100px;letter-spacing:.04em;}
.content-icon-row{display:flex;align-items:center;gap:16px;margin-bottom:28px;}
.body-h3{font-size:20px;font-weight:800;color:var(--ink);margin:26px 0 10px;line-height:1.2;}
.body-p{font-size:15px;line-height:1.72;color:var(--muted);margin-bottom:14px;}
.content-foot{margin-top:auto;padding-top:20px;border-top:1px solid rgba(0,0,0,.08);display:flex;align-items:center;justify-content:space-between;font-size:12px;color:#8a8a96;font-weight:500;}
@page{size:A4;margin:0;}`

function buildArticlePages(article: ArticleForPDF, lang: string): string {
  const origin = window.location.origin
  const logoLight = `${origin}/guide-logo-light.webp`
  const logoDark = `${origin}/guide-logo-dark.webp`
  const ui = UI_LABELS[lang] ?? UI_LABELS.fr
  const icon = (article.id && ARTICLE_ICONS[article.id]) || DEFAULT_ICON

  const bodyHTML = article.body.map(p =>
    p.startsWith("## ") ? `<h3 class="body-h3">${p.slice(3)}</h3>` : `<p class="body-p">${p}</p>`
  ).join("\n")

  return `
<section class="page">
  <div class="cover">
    <img src="${logoLight}" alt="INOV Digital Services" style="height:50px;width:148px;object-fit:contain;margin-bottom:56px;"/>
    <div class="icon-badge" style="margin-bottom:28px;">${icon}</div>
    <div class="pill">${article.tag}</div>
    <h1>${article.title}</h1>
    <p class="byline">INOV Digital Services</p>
    <div class="cover-foot">
      <img src="${logoLight}" alt="INOV"/>
      <span>inovdigitalservices.com &nbsp;·&nbsp; +509 3625-5920</span>
    </div>
  </div>
</section>

<section class="page">
  <div class="content">
    <div class="content-head">
      <img src="${logoDark}" alt="INOV Digital Services"/>
      <div class="content-pill">${article.tag}</div>
    </div>
    <div class="content-icon-row">
      <div class="icon-badge dark">${icon}</div>
    </div>
    ${bodyHTML}
    <div class="content-foot">
      <span>INOV Digital Services</span>
      <span>${ui.readMore} inovdigitalservices.com</span>
    </div>
  </div>
</section>`
}

// Immediate PDF download (no print dialog).
export async function downloadArticlePDF(article: ArticleForPDF, lang: string): Promise<void> {
  const slug = (article.id ?? "article").replace(/[^a-z0-9-]/gi, "-")
  await downloadHtmlPagesAsPdf(
    buildArticlePages(article, lang),
    ARTICLE_CSS,
    `INOV-${slug}-${lang}.pdf`,
  )
}
