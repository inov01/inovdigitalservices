import { useEffect, Fragment } from "react"
import { useParams, Link, useNavigate, useLocation } from "react-router"
import { ArrowLeft, ArrowRight, Clock, Globe, MessageSquare, Play, FileText, Tag } from "lucide-react"
import { UI, ARTICLE_ICON, ARTICLE_WORK_CATEGORIES, ARTICLE_VIDEO, MEDIA_CAPTION, Paragraph, useBlogArticles } from "../components/Blog"
import { worksByCategories, workPoster, onThumbError } from "../data/portfolio"
import ShareBar from "../components/ShareBar"
import ArticleAudio from "../components/ArticleAudio"
import { useSettings } from "../context/AppSettings"
import { track } from "../lib/analytics"
import { applyPageMeta } from "../lib/seo"
import logo from "../imports/logo.webp"

// Heading + copy for the "work from our portfolio" showcase, per language.
const SHOWCASE: Record<string, { title: string; sub: string; cta: string; forClient: string }> = {
  fr: { title: "Ce que ça donne concrètement", sub: "Des réalisations tirées de notre portfolio pour ce service.", cta: "Voir tout le portfolio", forClient: "Pour" },
  en: { title: "What it looks like in practice", sub: "Real work from our portfolio for this service.", cta: "See the full portfolio", forClient: "For" },
  es: { title: "Cómo se ve en la práctica", sub: "Trabajos reales de nuestro portafolio para este servicio.", cta: "Ver todo el portafolio", forClient: "Para" },
  ht: { title: "Ki sa sa bay konkrètman", sub: "Reyalizasyon nan pòtfolyo nou pou sèvis sa a.", cta: "Wè tout pòtfolyo a", forClient: "Pou" },
  pt: { title: "Como fica na prática", sub: "Trabalhos reais do nosso portfólio para este serviço.", cta: "Ver todo o portfólio", forClient: "Para" },
  it: { title: "Come appare nella pratica", sub: "Lavori reali dal nostro portfolio per questo servizio.", cta: "Vedi tutto il portfolio", forClient: "Per" },
  de: { title: "So sieht das konkret aus", sub: "Echte Arbeiten aus unserem Portfolio für diesen Service.", cta: "Gesamtes Portfolio ansehen", forClient: "Für" },
  ar: { title: "كيف يبدو ذلك عملياً", sub: "أعمال حقيقية من معرض أعمالنا لهذه الخدمة.", cta: "شاهد كل معرض الأعمال", forClient: "لصالح" },
}

const BACK_TO_BLOG: Record<string, string> = {
  fr: "Tous les articles", en: "All articles", es: "Todos los artículos",
  ht: "Tout atik yo", pt: "Todos os artigos", it: "Tutti gli articoli",
  de: "Alle Artikel", ar: "كل المقالات",
}
const CTA: Record<string, { title: string; btn: string; pricing: string; quote: string }> = {
  fr: { title: "Envie de passer à l'action pour votre marque ?", btn: "Discuter de mon projet", pricing: "Voir les tarifs", quote: "Devis gratuit" },
  en: { title: "Ready to take action for your brand?", btn: "Discuss my project", pricing: "See pricing", quote: "Free quote" },
  es: { title: "¿Listo para dar el paso con tu marca?", btn: "Hablar de mi proyecto", pricing: "Ver precios", quote: "Presupuesto gratis" },
  ht: { title: "Ou pare pou aji pou mak ou?", btn: "Pale de pwojè mwen", pricing: "Wè pri yo", quote: "Devi gratis" },
  pt: { title: "Pronto para agir pela sua marca?", btn: "Falar do meu projeto", pricing: "Ver preços", quote: "Orçamento grátis" },
  it: { title: "Pronto ad agire per il tuo brand?", btn: "Parliamo del mio progetto", pricing: "Vedi i prezzi", quote: "Preventivo gratuito" },
  de: { title: "Bereit, für Ihre Marke aktiv zu werden?", btn: "Mein Projekt besprechen", pricing: "Preise ansehen", quote: "Kostenloses Angebot" },
  ar: { title: "هل أنت مستعد للتحرك من أجل علامتك؟", btn: "لنتحدث عن مشروعي", pricing: "شاهد الأسعار", quote: "عرض سعر مجاني" },
}

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>()
  const { lang } = useSettings()
  const navigate = useNavigate()
  const location = useLocation()
  const ui = UI[lang] ?? UI.fr
  const { articles, imageFor, slugFor, idFromSlug } = useBlogArticles()
  // Resolve the SEO slug (e.g. "logo-professionnel") to the article id, while
  // still accepting a bare id ("logo") for backwards-compatible links.
  const resolvedId = slug ? idFromSlug(slug) : undefined
  const article = articles.find((a) => a.id === resolvedId)
  const cta = CTA[lang] ?? CTA.fr

  useEffect(() => {
    window.scrollTo(0, 0)
    if (article) {
      const base = `${window.location.origin}/blog/${slugFor(article.id)}`
      const canonical = lang && lang !== "fr" ? `${base}?lang=${lang}` : base
      applyPageMeta({
        title: `${article.title} — INOV Digital Services`,
        description: article.excerpt,
        url: canonical,
        image: imageFor(article.id)?.url,
        type: "article",
        alternatesBase: base,
      })
    }
  }, [article, lang])

  const related = article ? articles.filter((a) => a.id !== article.id).slice(0, 3) : []
  const showcase = article ? worksByCategories(ARTICLE_WORK_CATEGORIES[article.id] ?? [], 6) : []
  const sc = SHOWCASE[lang] ?? SHOWCASE.fr
  const mc = MEDIA_CAPTION[lang] ?? MEDIA_CAPTION.fr
  // Inline media: an autoplay clip for motion/video articles, otherwise a real
  // portfolio piece featured mid-read. The featured piece is removed from the
  // grid below so it isn't shown twice.
  const vid = article ? ARTICLE_VIDEO[article.id] : undefined
  const inlineWork = !vid && showcase.length > 0 ? showcase[0] : null
  const gridWorks = inlineWork ? showcase.slice(1) : showcase

  // Unknown slug — send back to the blog list.
  useEffect(() => {
    if (slug && !article) navigate("/blog", { replace: true })
  }, [slug, article, navigate])

  if (!article) return null

  const Icon = ARTICLE_ICON[article.id] ?? Globe

  const img = imageFor(article.id)
  const canGoBack = location.key !== "default"

  return (
    <article style={{ background: "#fff", paddingBottom: 88, minHeight: "70vh" }}>
      {/* Hero image full-width */}
      <div style={{ width: "100%", height: "clamp(220px, 38vw, 420px)", background: "var(--ds-bg-sec)", overflow: "hidden", position: "relative" }}>
        {vid ? (
          <video
            src={vid.url}
            poster={img?.url}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={vid.alt}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : img && (
          <img
            src={img.url}
            alt={img.alt}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
        {/* Gradient scrim at bottom so back button is always readable */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 40%, rgba(0,0,0,0.52) 100%)" }} />
        {/* Back button overlaid on hero */}
        <button
          onClick={() => canGoBack ? navigate(-1) : navigate("/blog")}
          style={{
            position: "absolute", top: 20, left: "var(--section-px, 20px)",
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "9px 16px", borderRadius: "var(--r-full)",
            background: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)",
            border: "none", cursor: "pointer",
            fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--ds-ink)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
          }}
          aria-label={BACK_TO_BLOG[lang] ?? BACK_TO_BLOG.fr}
        >
          <ArrowLeft size={16} /> {BACK_TO_BLOG[lang] ?? BACK_TO_BLOG.fr}
        </button>
        {/* Icon badge at bottom-left of hero */}
        <div style={{
          position: "absolute", bottom: 20, left: "var(--section-px, 20px)",
          width: 52, height: 52, borderRadius: "var(--r-lg)",
          background: "var(--ds-accent-grad)", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 22px var(--ds-accent-a45)",
        }}>
          <Icon size={24} aria-hidden="true" />
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "36px var(--section-px) 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
            textTransform: "uppercase", color: "var(--ds-accent-text)", background: "var(--ds-accent-a10)", padding: "5px 11px", borderRadius: "var(--r-full)",
          }}>{article.tag}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: "var(--ds-text-faint)" }}>
            <Clock size={13} /> {article.read} {ui.read}
          </span>
        </div>

        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(1.9rem, 5vw, 2.6rem)", fontWeight: 800, color: "#000", lineHeight: 1.2, marginBottom: 22 }}>{article.title}</h1>

        {/* Share — top of article */}
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "16px 0", marginBottom: 32 }}>
          <ShareBar title={article.title} text={article.excerpt} />
        </div>

        {/* Listen to the article (text-to-speech) */}
        <ArticleAudio text={[article.title, ...article.body].join(". ")} lang={lang} />

        {article.body.map((p, i) => (
          <Fragment key={i}>
            <Paragraph text={p} />
            {i === 1 && inlineWork && (
              <figure style={{ margin: "10px 0 34px" }}>
                <div style={{ borderRadius: "var(--r-lg)", overflow: "hidden", background: "var(--ds-bg-sec)" }}>
                  <img
                    src={workPoster(inlineWork)}
                    alt={inlineWork.title}
                    loading="lazy"
                    onError={(e) => onThumbError(e, inlineWork.videoId)}
                    style={{ width: "100%", maxHeight: 460, objectFit: "cover", display: "block" }}
                  />
                </div>
                <figcaption style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "var(--ds-text-faint)", marginTop: 8, textAlign: "center" }}>
                  {mc.work} — {inlineWork.title}
                </figcaption>
              </figure>
            )}
          </Fragment>
        ))}

        {/* Share — bottom of article */}
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", marginTop: 32, paddingTop: 24 }}>
          <ShareBar title={article.title} text={article.excerpt} />
        </div>

        {/* Brand signature */}
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", marginTop: 32, paddingTop: 24, display: "flex", alignItems: "center", gap: 12 }}>
          <img src={logo} alt="INOV Digital Services" style={{ height: 28, width: "auto", objectFit: "contain" }} />
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "var(--ds-text-faint)" }}>INOV Digital Services</span>
        </div>

        {/* Portfolio showcase — real work matching this article's service */}
        {gridWorks.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: "#000", marginBottom: 6 }}>{sc.title}</h2>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "var(--ds-text-sec)", marginBottom: 20, lineHeight: 1.6 }}>{sc.sub}</p>
            <div className="showcase-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {gridWorks.map((w, i) => (
                <Link
                  key={`${w.albumId}-${i}`}
                  to="/#portfolio"
                  onClick={() => track("blog_portfolio_click", { article: article.id, album: w.albumId })}
                  className="card"
                  style={{ display: "flex", flexDirection: "column", textDecoration: "none", boxSizing: "border-box", overflow: "hidden", padding: 0 }}
                >
                  <div style={{ position: "relative", aspectRatio: "1 / 1", background: "var(--ds-bg-sec)", overflow: "hidden", flexShrink: 0 }}>
                    <img
                      src={workPoster(w)}
                      alt={w.title}
                      loading="lazy"
                      onError={(e) => onThumbError(e, w.videoId)}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    {w.videoId && (
                      <div style={{
                        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                        background: "rgba(0,0,0,0.18)",
                      }}>
                        <div style={{
                          width: 46, height: 46, borderRadius: "50%",
                          background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                        }}>
                          <Play size={20} fill="var(--ds-ink)" color="var(--ds-ink)" style={{ marginLeft: 2 }} />
                        </div>
                      </div>
                    )}
                    {/* Category chip */}
                    <span style={{
                      position: "absolute", top: 8, left: 8,
                      fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
                      textTransform: "uppercase", color: "#fff",
                      background: w.accent ?? "var(--ds-ink)", padding: "3px 8px", borderRadius: "var(--r-full)",
                    }}>{w.category}</span>
                  </div>
                  <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 700, color: "#000", lineHeight: 1.35 }}>{w.title}</h3>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "var(--ds-text-faint)" }}>{sc.forClient} {w.client}</span>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
              <Link to="/#portfolio" className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                {sc.cta} <ArrowRight size={16} />
              </Link>
            </div>
            <style>{`
              @media (max-width: 640px) { .showcase-grid { grid-template-columns: repeat(2, 1fr) !important; } }
            `}</style>
          </div>
        )}

        {/* Related articles */}
        {related.length > 0 && (
          <div style={{ marginTop: 44 }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: "#000", marginBottom: 18 }}>{ui.title}</h2>
            <div className="related-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {related.map((r) => {
                const RIcon = ARTICLE_ICON[r.id] ?? Globe
                return (
                  <Link
                    key={r.id}
                    to={`/blog/${slugFor(r.id)}`}
                    className="card"
                    onClick={() => track("blog_read", { article: r.id, source: "related" })}
                    style={{ display: "flex", flexDirection: "column", textDecoration: "none", boxSizing: "border-box", overflow: "hidden", padding: 0 }}
                  >
                    <div style={{ position: "relative", height: 110, background: "var(--ds-bg-sec)", overflow: "hidden", flexShrink: 0 }}>
                      {imageFor(r.id) && (
                        <img src={imageFor(r.id)!.url} alt={imageFor(r.id)!.alt} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}
                      <div style={{
                        position: "absolute", bottom: 8, left: 10,
                        width: 32, height: 32, borderRadius: "var(--r-sm)",
                        background: "var(--ds-accent-grad)", color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <RIcon size={15} aria-hidden="true" />
                      </div>
                    </div>
                    <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1, gap: 8 }}>
                      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "#000", lineHeight: 1.35 }}>{r.title}</h3>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: "auto", fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: "var(--ds-accent-text)" }}>
                        {ui.cta} <ArrowRight size={13} />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
            <style>{`
              @media (max-width: 640px) { .related-grid { grid-template-columns: 1fr !important; } }
            `}</style>
          </div>
        )}

        {/* Conversion CTA */}
        <div style={{ marginTop: 40, background: "var(--ds-ink)", borderRadius: "var(--r-xl)", padding: "36px 32px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 20, lineHeight: 1.3 }}>{cta.title}</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", alignItems: "center" }}>
            <Link to="/#contact" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <MessageSquare size={16} /> {cta.btn}
            </Link>
            <Link to="/devis" className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <FileText size={16} /> {cta.quote}
            </Link>
            <Link
              to="/#pricing"
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600,
                color: "rgba(255,255,255,0.85)", textDecoration: "none",
                padding: "10px 14px", borderRadius: "var(--r-full)",
                border: "1px solid rgba(255,255,255,0.22)",
              }}
            >
              <Tag size={15} /> {cta.pricing}
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
