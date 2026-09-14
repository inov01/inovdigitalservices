import { useState, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import { Link } from "react-router"
import { ArrowRight, Clock, PenTool, Palette, Globe, AlertTriangle, Monitor, Clapperboard, Package, Printer, CreditCard, Sparkles, Presentation, Share2, AtSign, FileText, Image as ImageIcon, Type, Tag, BookOpen, Camera, MessageCircle, Megaphone, Feather, Quote, Mail, Search, ShoppingBag, Heart, TrendingUp, Wallet, RefreshCw, X, ExternalLink, Layers, Wand2, Film, type LucideIcon } from "lucide-react"
import AutoCarousel from "./AutoCarousel"
import useModal from "../hooks/useModal"
import { useSettings } from "../context/AppSettings"
import { track } from "../lib/analytics"
import type { Lang } from "../i18n/translations"
import { api, type AdminBlog } from "../lib/api"
import logo from "../imports/logo.webp"

// SEO-friendly, human-readable slug per article id. These are the canonical
// public URLs (/blog/<slug>) — they match the prerendered pages in public/blog
// and the sitemap. Kept language-independent so each article has one stable URL.
export const ARTICLE_SLUG: Record<string, string> = {
  "logo":      "logo-professionnel",
  "couleurs":  "couleurs-de-marque",
  "presence":  "presence-en-ligne",
  "erreurs":   "erreurs-branding",
  "site":      "site-web-professionnel",
  "video":     "video-marketing",
  "packaging": "packaging-design",
  "print":     "supports-print",
  "carte":       "carte-de-visite",
  "motion":      "motion-design",
  "presentation": "presentation-professionnelle",
  "reseaux":      "community-management",
  "instagram":    "optimiser-profil-instagram",
  "flyer":        "flyer-efficace",
  "affiche":      "affiche-publicitaire",
  "typographie":  "choisir-typographie",
  "nom":          "nom-de-marque",
  "charte":       "charte-graphique",
  "services":     "retouche-montage-conception",
  "whatsapp":     "whatsapp-business",
  "ads":          "publicite-payante",
  "storytelling": "storytelling-de-marque",
  "slogan":       "slogan-efficace",
  "newsletter":   "newsletter-email-marketing",
  "seo":          "referencement-local-google",
  "ecommerce":    "vendre-en-ligne-boutique",
  "fidelisation": "fideliser-ses-clients",
  "tendances":    "tendances-design-2026",
  "budget":       "budget-branding",
  "refonte":      "refonte-image-de-marque",
  "vectorisation":   "vectorisation-de-logo",
  "pixelisation":    "pixelisation-et-resolution",
  "ia-design":       "intelligence-artificielle-design",
  "animation-flyer": "animation-de-flyer-evenementiel",
}

// Reverse lookup: slug → article id.
export const SLUG_TO_ID: Record<string, string> = Object.fromEntries(
  Object.entries(ARTICLE_SLUG).map(([id, slug]) => [slug, id]),
)

// Portfolio work categories that illustrate each article's service topic.
// Empty array = no matching client work yet (the showcase section stays hidden).
export const ARTICLE_WORK_CATEGORIES: Record<string, string[]> = {
  "logo":      ["Création de Logo", "Logo Existant"],
  "couleurs":  ["Branding Complet", "Conception Graphique"],
  "presence":  ["Affiche Réseaux Sociaux", "Promotion en Ligne"],
  "erreurs":   ["Branding Complet", "Création de Logo"],
  "site":      [],
  "video":     ["Montage Vidéo", "Animation de Logo", "Motion Design"],
  "packaging": ["Packaging Design"],
  "print":     ["Flyers & Affiches"],
  "carte":        ["Carte de Visite"],
  "motion":       ["Motion Design", "Animation de Logo", "Montage Vidéo"],
  "presentation": [],
  "reseaux":      ["Affiche Réseaux Sociaux", "Promotion en Ligne"],
  "instagram":    ["Affiche Réseaux Sociaux"],
  "flyer":        ["Flyers & Affiches"],
  "affiche":      ["Flyers & Affiches"],
  "typographie":  ["Conception Graphique", "Création de Logo"],
  "nom":          ["Création de Logo"],
  "charte":       ["Branding Complet"],
  "services":     ["Conception Graphique", "Montage Vidéo"],
  "whatsapp":     ["Promotion en Ligne"],
  "ads":          ["Promotion en Ligne", "Affiche Réseaux Sociaux"],
  "storytelling": ["Branding Complet"],
  "slogan":       ["Branding Complet", "Création de Logo"],
  "newsletter":   [],
  "seo":          [],
  "ecommerce":    ["Promotion en Ligne"],
  "fidelisation": [],
  "tendances":    ["Conception Graphique"],
  "budget":       ["Branding Complet"],
  "refonte":      ["Logo Existant", "Création de Logo"],
}

// Demonstrative icon per article topic.
export const ARTICLE_ICON: Record<string, LucideIcon> = {
  "logo":     PenTool,
  "couleurs": Palette,
  "presence": Globe,
  "erreurs":  AlertTriangle,
  "site":      Monitor,
  "video":     Clapperboard,
  "packaging": Package,
  "print":     Printer,
  "carte":        CreditCard,
  "motion":       Sparkles,
  "presentation": Presentation,
  "reseaux":      Share2,
  "instagram":    AtSign,
  "flyer":        FileText,
  "affiche":      ImageIcon,
  "typographie":  Type,
  "nom":          Tag,
  "charte":       BookOpen,
  "services":     Sparkles,
  "whatsapp":     MessageCircle,
  "ads":          Megaphone,
  "storytelling": Feather,
  "slogan":       Quote,
  "newsletter":   Mail,
  "seo":          Search,
  "ecommerce":    ShoppingBag,
  "fidelisation": Heart,
  "tendances":    TrendingUp,
  "budget":       Wallet,
  "refonte":      RefreshCw,
  "communication-visuelle": Megaphone,
  "moodboard":    Palette,
  "reel":         Clapperboard,
  "carrousel":    ImageIcon,
  "banniere":     Monitor,
  "coherence":    BookOpen,
  "retouche":     Camera,
  "infographie":  TrendingUp,
  "miniature":    ImageIcon,
  "montage":      Clapperboard,
  "vectorisation":   Layers,
  "pixelisation":    ImageIcon,
  "ia-design":       Wand2,
  "animation-flyer": Film,
}

// Hero image per article (Unsplash, 1200×630 crop for OG + card use).
export const ARTICLE_IMAGE: Record<string, { url: string; alt: string }> = {
  "logo": {
    url: "https://images.unsplash.com/photo-1764737740462-2a310c7b2c39?w=1200&h=630&fit=crop&auto=format",
    alt: "Designer esquissant un logo avec des outils créatifs",
  },
  "couleurs": {
    url: "https://images.unsplash.com/photo-1716471330463-f475b00f0506?w=1200&h=630&fit=crop&auto=format",
    alt: "Bureau avec échantillons de couleurs, crayons et guide de palette de marque",
  },
  "presence": {
    url: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=1200&h=630&fit=crop&auto=format",
    alt: "Icônes des réseaux sociaux sur écran de smartphone — présence en ligne",
  },
  "erreurs": {
    url: "https://images.unsplash.com/photo-1645658043538-fc2bb1702cfe?w=1200&h=630&fit=crop&auto=format",
    alt: "Livre Designing Brand Identity — erreurs de branding à éviter",
  },
  "site": {
    url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=630&fit=crop&auto=format",
    alt: "Écran d'ordinateur portable affichant du code — création de site web professionnel",
  },
  "video": {
    url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&h=630&fit=crop&auto=format",
    alt: "Timeline de montage vidéo avec des clips colorés sur écran sombre",
  },
  "packaging": {
    url: "https://images.unsplash.com/photo-1595246007497-15e0ed4b8d96?w=1200&h=630&fit=crop&auto=format",
    alt: "Emballage produit soigné sur une table — packaging design",
  },
  "print": {
    url: "https://images.unsplash.com/photo-1695634621375-0b66a9d5d1bc?w=1200&h=630&fit=crop&auto=format",
    alt: "Brochure imprimée pliée — supports print professionnels",
  },
  "carte": {
    url: "https://images.unsplash.com/photo-1777652918753-d66882b15391?w=1200&h=630&fit=crop&auto=format",
    alt: "Deux cartes de visite posées sur une surface en bois",
  },
  "motion": {
    url: "https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=1200&h=630&fit=crop&auto=format",
    alt: "Formes abstraites colorées en spirale — motion design et animation",
  },
  "presentation": {
    url: "https://images.unsplash.com/photo-1597931957399-211f0291bb35?w=1200&h=630&fit=crop&auto=format",
    alt: "Ordinateur portable affichant une présentation professionnelle sur une table",
  },
  "reseaux": {
    url: "https://images.unsplash.com/photo-1724862936518-ae7fcfc052c1?w=1200&h=630&fit=crop&auto=format",
    alt: "Main tenant un smartphone affichant des réseaux sociaux",
  },
  "instagram": {
    url: "https://images.unsplash.com/photo-1596526131090-bcbe09e432d3?w=1200&h=630&fit=crop&auto=format",
    alt: "Icône de l'application Instagram sur un écran de smartphone",
  },
  "flyer": {
    url: "https://images.unsplash.com/photo-1695634621375-0b66a9d5d1bc?w=1200&h=630&fit=crop&auto=format",
    alt: "Support imprimé posé sur une surface — flyer",
  },
  "affiche": {
    url: "https://images.unsplash.com/photo-1635873432087-50eba4c4392d?w=1200&h=630&fit=crop&auto=format",
    alt: "Panneau d'affichage publicitaire éclairé en ville",
  },
  "typographie": {
    url: "https://images.unsplash.com/photo-1533226458520-6f71cffeaa6a?w=1200&h=630&fit=crop&auto=format",
    alt: "Mur de lettres typographiques noires — typographie",
  },
  "nom": {
    url: "https://images.unsplash.com/photo-1613759612065-d5971d32ca49?w=1200&h=630&fit=crop&auto=format",
    alt: "Mur couvert de logos et d'images de marques",
  },
  "charte": {
    url: "https://images.unsplash.com/photo-1645658043538-fc2bb1702cfe?w=1200&h=630&fit=crop&auto=format",
    alt: "Guide d'identité de marque ouvert — charte graphique",
  },
  "services": {
    url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=630&fit=crop&auto=format",
    alt: "Écran d'ordinateur avec un logiciel d'édition — retouche, montage et conception",
  },
  "whatsapp": {
    url: "https://images.unsplash.com/photo-1603145733146-ae562a55031e?w=1200&h=630&fit=crop&auto=format",
    alt: "Smartphone affichant des applications de messagerie et réseaux",
  },
  "ads": {
    url: "https://images.unsplash.com/photo-1513757378314-e46255f6ed16?w=1200&h=630&fit=crop&auto=format",
    alt: "Panneau publicitaire vierge — publicité payante",
  },
  "storytelling": {
    url: "https://images.unsplash.com/photo-1563279699-4c5dfcab048c?w=1200&h=630&fit=crop&auto=format",
    alt: "Équipe en réunion autour d'une table — stratégie de marque",
  },
  "slogan": {
    url: "https://images.unsplash.com/photo-1610454059909-f9a5a6eb4e58?w=1200&h=630&fit=crop&auto=format",
    alt: "Lettres et mots découpés en rouge et noir — slogan",
  },
  "newsletter": {
    url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=630&fit=crop&auto=format",
    alt: "Personne utilisant un ordinateur portable pour rédiger un e-mail",
  },
  "seo": {
    url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=630&fit=crop&auto=format",
    alt: "Écran affichant du code — référencement et site web",
  },
  "ecommerce": {
    url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=630&fit=crop&auto=format",
    alt: "Personne payant en ligne avec une carte devant un ordinateur portable",
  },
  "fidelisation": {
    url: "https://images.unsplash.com/photo-1582005450386-52b25f82d9bb?w=1200&h=630&fit=crop&auto=format",
    alt: "Trois personnes collaborant devant des ordinateurs portables",
  },
  "tendances": {
    url: "https://images.unsplash.com/photo-1461958508236-9a742665a0d5?w=1200&h=630&fit=crop&auto=format",
    alt: "Découpes colorées en gros plan — tendances design",
  },
  "budget": {
    url: "https://images.unsplash.com/photo-1716471330463-f475b00f0506?w=1200&h=630&fit=crop&auto=format",
    alt: "Bureau avec échantillons de couleurs et outils de design — budget",
  },
  "refonte": {
    url: "https://images.unsplash.com/photo-1764737740462-2a310c7b2c39?w=1200&h=630&fit=crop&auto=format",
    alt: "Designer esquissant un nouveau logo — refonte de marque",
  },
  "communication-visuelle": {
    url: "https://images.unsplash.com/photo-1461958508236-9a742665a0d5?w=1200&h=630&fit=crop&auto=format",
    alt: "Formes et découpes colorées — la communication visuelle",
  },
  "moodboard": {
    url: "https://images.unsplash.com/photo-1716471330463-f475b00f0506?w=1200&h=630&fit=crop&auto=format",
    alt: "Échantillons de couleurs et références visuelles sur un bureau — moodboard",
  },
  "reel": {
    url: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=1200&h=630&fit=crop&auto=format",
    alt: "Smartphone affichant des vidéos courtes sur les réseaux sociaux — Reels",
  },
  "carrousel": {
    url: "https://images.unsplash.com/photo-1596526131090-bcbe09e432d3?w=1200&h=630&fit=crop&auto=format",
    alt: "Application de réseau social sur un écran de smartphone — carrousel",
  },
  "banniere": {
    url: "https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=1200&h=630&fit=crop&auto=format",
    alt: "Formes abstraites colorées — bannière et couverture",
  },
  "coherence": {
    url: "https://images.unsplash.com/photo-1645658043538-fc2bb1702cfe?w=1200&h=630&fit=crop&auto=format",
    alt: "Guide d'identité de marque ouvert — cohérence visuelle",
  },
  "retouche": {
    url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=630&fit=crop&auto=format",
    alt: "Écran d'ordinateur portable avec un logiciel d'édition — retouche photo",
  },
  "infographie": {
    url: "https://images.unsplash.com/photo-1461958508236-9a742665a0d5?w=1200&h=630&fit=crop&auto=format",
    alt: "Découpes colorées organisées — infographie",
  },
  "miniature": {
    url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&h=630&fit=crop&auto=format",
    alt: "Timeline de montage vidéo sur un écran — miniature vidéo",
  },
  "montage": {
    url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&h=630&fit=crop&auto=format",
    alt: "Logiciel de montage vidéo avec des clips sur une timeline — montage",
  },
  "vectorisation": {
    url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200&h=630&fit=crop&auto=format",
    alt: "Logo redessiné en courbes vectorielles sur un écran de design",
  },
  "pixelisation": {
    url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=630&fit=crop&auto=format",
    alt: "Gros plan sur des pixels d'une image agrandie — résolution",
  },
  "ia-design": {
    url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop&auto=format",
    alt: "Interface d'intelligence artificielle générant des visuels de design",
  },
  "animation-flyer": {
    url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&h=630&fit=crop&auto=format",
    alt: "Timeline de montage vidéo pour l'animation d'un flyer événementiel",
  },
}

// Royalty-free autoplay clips (Pexels, free license, hotlink-friendly) shown
// inline in motion/video articles so the client sees the medium in action.
export const ARTICLE_VIDEO: Record<string, { url: string; alt: string }> = {
  "video": {
    url: "https://videos.pexels.com/video-files/7699548/7699548-sd_960_540_30fps.mp4",
    alt: "Montage vidéo en cours sur un logiciel professionnel",
  },
  "motion": {
    url: "https://videos.pexels.com/video-files/11387730/11387730-sd_960_540_30fps.mp4",
    alt: "Formes et couleurs abstraites en mouvement — motion design",
  },
}

// Localized captions for the inline media (one animated clip + one real project).
export const MEDIA_CAPTION: Record<string, { video: string; work: string }> = {
  fr: { video: "Aperçu animé — un exemple du rendu final.", work: "Une réalisation INOV pour ce type de service" },
  en: { video: "Animated preview — an example of the final result.", work: "An INOV project for this type of service" },
  es: { video: "Vista previa animada — un ejemplo del resultado final.", work: "Un proyecto de INOV para este tipo de servicio" },
  ht: { video: "Apèsi anime — yon egzanp rannman final la.", work: "Yon reyalizasyon INOV pou tip sèvis sa a" },
  pt: { video: "Pré-visualização animada — um exemplo do resultado final.", work: "Um projeto INOV para este tipo de serviço" },
  it: { video: "Anteprima animata — un esempio del risultato finale.", work: "Un progetto INOV per questo tipo di servizio" },
  de: { video: "Animierte Vorschau — ein Beispiel für das Endergebnis.", work: "Ein INOV-Projekt für diese Art von Service" },
  ar: { video: "معاينة متحركة — مثال على النتيجة النهائية.", work: "مشروع من INOV لهذا النوع من الخدمات" },
}

import { ARTICLES, type Article } from "../data/blogArticles"
export { ARTICLES }
export type { Article }

export const UI: Record<Lang, { tag: string; title: string; sub: string; read: string; cta: string; back: string; download: string }> = {
  fr: { tag: "Conseils", title: "Nos conseils branding", sub: "Des idées concrètes pour renforcer votre image de marque et attirer plus de clients.", read: "min de lecture", cta: "Lire l'article", back: "Fermer", download: "Télécharger en PDF" },
  en: { tag: "Insights", title: "Our branding tips", sub: "Practical ideas to strengthen your brand image and attract more clients.", read: "min read", cta: "Read article", back: "Close", download: "Download as PDF" },
  es: { tag: "Consejos", title: "Nuestros consejos de branding", sub: "Ideas concretas para reforzar tu imagen de marca y atraer más clientes.", read: "min de lectura", cta: "Leer artículo", back: "Cerrar", download: "Descargar en PDF" },
  ht: { tag: "Konsèy", title: "Konsèy branding nou yo", sub: "Lide konkrè pou ranfòse imaj mak ou epi atire plis kliyan.", read: "min lekti", cta: "Li atik la", back: "Fèmen", download: "Telechaje an PDF" },
  pt: { tag: "Dicas", title: "Nossas dicas de branding", sub: "Ideias concretas para reforçar sua imagem de marca e atrair mais clientes.", read: "min de leitura", cta: "Ler artigo", back: "Fechar", download: "Baixar em PDF" },
  it: { tag: "Consigli", title: "I nostri consigli di branding", sub: "Idee concrete per rafforzare la tua immagine di marca e attirare più clienti.", read: "min di lettura", cta: "Leggi l'articolo", back: "Chiudi", download: "Scarica in PDF" },
  de: { tag: "Tipps", title: "Unsere Branding-Tipps", sub: "Konkrete Ideen, um Ihr Markenimage zu stärken und mehr Kunden zu gewinnen.", read: "Min. Lesezeit", cta: "Artikel lesen", back: "Schließen", download: "Als PDF herunterladen" },
  ar: { tag: "نصائح", title: "نصائحنا في العلامة التجارية", sub: "أفكار عملية لتعزيز صورة علامتك التجارية وجذب المزيد من العملاء.", read: "دقيقة قراءة", cta: "اقرأ المقال", back: "إغلاق", download: "تحميل بصيغة PDF" },
}

// Map an admin-authored blog onto the render-time Article shape.
export function adminBlogToArticle(b: AdminBlog): Article {
  return { id: b.id, tag: b.tag || "Blog", read: b.read || 3, title: b.title, excerpt: b.excerpt, body: b.body }
}

// Shared hook: fetch admin blog overrides once and expose the merged article
// list for the active language plus resolvers for image/slug that fall back to
// admin-supplied values. Used by the blog section, the list page and the
// article page so all three stay in sync.
export function useBlogArticles() {
  const { lang } = useSettings()
  const [added, setAdded] = useState<AdminBlog[]>([])
  const [removed, setRemoved] = useState<string[]>([])

  useEffect(() => {
    api.getSettings()
      .then((r) => {
        const s = r.settings
        if (!s) return
        if (Array.isArray(s.blogsAdded)) setAdded(s.blogsAdded)
        if (Array.isArray(s.blogsRemoved)) setRemoved(s.blogsRemoved)
      })
      .catch(() => {})
  }, [])

  const base = ARTICLES[lang] ?? ARTICLES.fr
  const articles = useMemo(() => {
    const rm = new Set(removed)
    return [...base.filter((a) => !rm.has(a.id)), ...added.map(adminBlogToArticle)]
  }, [base, added, removed])

  const imageFor = (id: string): { url: string; alt: string } | undefined => {
    if (ARTICLE_IMAGE[id]) return ARTICLE_IMAGE[id]
    const b = added.find((x) => x.id === id)
    return b?.image ? { url: b.image, alt: b.title } : undefined
  }
  const slugFor = (id: string): string => {
    if (ARTICLE_SLUG[id]) return ARTICLE_SLUG[id]
    const b = added.find((x) => x.id === id)
    return b?.slug || id
  }
  const idFromSlug = (slug: string): string => {
    if (SLUG_TO_ID[slug]) return SLUG_TO_ID[slug]
    const b = added.find((x) => (x.slug || x.id) === slug || x.id === slug)
    return b?.id ?? slug
  }

  return { articles, added, imageFor, slugFor, idFromSlug }
}

export function Paragraph({ text }: { text: string }) {
  if (text.startsWith("## ")) {
    return <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 21, fontWeight: 800, color: "#000", margin: "28px 0 8px" }}>{text.slice(3)}</h3>
  }
  return <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, color: "var(--ds-text-sec)", lineHeight: 1.75, marginBottom: 14 }}>{text}</p>
}

const ALL_LABEL: Record<Lang, string> = {
  fr: "Voir tous les articles", en: "See all articles", es: "Ver todos los artículos",
  ht: "Wè tout atik yo", pt: "Ver todos os artigos", it: "Vedi tutti gli articoli",
  de: "Alle Artikel ansehen", ar: "عرض كل المقالات",
}

const CLOSE_LABEL: Record<Lang, string> = {
  fr: "Fermer", en: "Close", es: "Cerrar", ht: "Fèmen", pt: "Fechar", it: "Chiudi", de: "Schließen", ar: "إغلاق",
}

const FULL_PAGE_LABEL: Record<Lang, string> = {
  fr: "Ouvrir en page complète", en: "Open full page", es: "Abrir en página completa",
  ht: "Louvri nan paj konplè", pt: "Abrir em página completa", it: "Apri a pagina intera",
  de: "Ganze Seite öffnen", ar: "فتح الصفحة كاملة",
}

// In-place article reader: opens the full article over the blog section so the
// visitor stays in context instead of navigating away. A link still offers the
// standalone page for sharing / SEO.
// Multilingual engagement outro shown at the bottom of every article that has a video.
const VIDEO_OUTRO: Record<string, {
  question: string; shareCta: string; contactCta: string; whatsappLabel: string; devisLabel: string
}> = {
  fr: {
    question: "Et toi, quelle est ta plus grande difficulté en design ou communication ? Dis-nous en commentaire 👇",
    shareCta: "Si cet article t'a été utile, partage-le à quelqu'un qui en a besoin — ça nous aide beaucoup à grandir !",
    contactCta: "Tu as un projet design, web ou branding ? On est là pour t'aider.",
    whatsappLabel: "Écrire sur WhatsApp", devisLabel: "Demander un devis",
  },
  en: {
    question: "What's your biggest challenge in design or communication? Tell us in the comments 👇",
    shareCta: "If this article helped you, share it with someone who needs it — it helps us grow a lot!",
    contactCta: "Got a design, web or branding project? We're here to help.",
    whatsappLabel: "Message us on WhatsApp", devisLabel: "Request a quote",
  },
  es: {
    question: "¿Cuál es tu mayor dificultad en diseño o comunicación? Cuéntanos en los comentarios 👇",
    shareCta: "Si este artículo te fue útil, compártelo con alguien que lo necesite — ¡nos ayuda mucho a crecer!",
    contactCta: "¿Tienes un proyecto de diseño, web o branding? Estamos aquí para ayudarte.",
    whatsappLabel: "Escríbenos por WhatsApp", devisLabel: "Pedir un presupuesto",
  },
  ht: {
    question: "Ki pi gwo difikilte ou genyen nan design oswa kominikasyon? Di nou nan kòmantè yo 👇",
    shareCta: "Si atik sa a te ede w, pataje l ak yon moun ki bezwen l — sa ede nou grandi anpil!",
    contactCta: "Ou gen yon pwojè design, entènèt oswa branding? Nou la pou ede w.",
    whatsappLabel: "Ekri nou sou WhatsApp", devisLabel: "Mande yon devis",
  },
  pt: {
    question: "Qual é o seu maior desafio em design ou comunicação? Conte-nos nos comentários 👇",
    shareCta: "Se este artigo te ajudou, compartilhe com alguém que precisa — isso nos ajuda muito a crescer!",
    contactCta: "Tem um projeto de design, web ou branding? Estamos aqui para ajudar.",
    whatsappLabel: "Fale conosco no WhatsApp", devisLabel: "Pedir um orçamento",
  },
  it: {
    question: "Qual è la tua più grande difficoltà nel design o nella comunicazione? Dimmelo nei commenti 👇",
    shareCta: "Se questo articolo ti è stato utile, condividilo con chi ne ha bisogno — ci aiuta molto a crescere!",
    contactCta: "Hai un progetto di design, web o branding? Siamo qui per aiutarti.",
    whatsappLabel: "Scrivici su WhatsApp", devisLabel: "Richiedere un preventivo",
  },
  de: {
    question: "Was ist deine größte Herausforderung im Design oder in der Kommunikation? Schreib es uns in die Kommentare 👇",
    shareCta: "Wenn dir dieser Artikel geholfen hat, teile ihn mit jemandem, der ihn braucht — das hilft uns sehr zu wachsen!",
    contactCta: "Hast du ein Design-, Web- oder Branding-Projekt? Wir helfen gerne.",
    whatsappLabel: "Schreib uns auf WhatsApp", devisLabel: "Angebot anfordern",
  },
  ar: {
    question: "ما هو أكبر تحدٍّ تواجهه في التصميم أو التواصل؟ أخبرنا في التعليقات 👇",
    shareCta: "إذا أفادك هذا المقال، شاركه مع من يحتاجه — هذا يساعدنا كثيراً على النمو!",
    contactCta: "هل لديك مشروع تصميم، ويب، أو هوية بصرية؟ نحن هنا لمساعدتك.",
    whatsappLabel: "راسلنا على واتساب", devisLabel: "طلب عرض سعر",
  },
}

function VideoOutro({ lang, articleId }: { lang: Lang; articleId: string }) {
  const copy = VIDEO_OUTRO[lang] ?? VIDEO_OUTRO.fr
  const vid = ARTICLE_VIDEO[articleId]
  if (!vid) return null
  return (
    <div style={{
      marginTop: 32, borderRadius: "var(--r-xl)", overflow: "hidden",
      background: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
      padding: "28px 28px 24px", color: "#fff",
    }}>
      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, lineHeight: 1.5, margin: "0 0 12px" }}>
        {copy.question}
      </p>
      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 20px", opacity: 0.92 }}>
        {copy.shareCta}
      </p>
      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 16px", fontWeight: 700 }}>
        {copy.contactCta}
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a
          href="https://wa.me/50936255920"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: "var(--r-md)", background: "rgba(255,255,255,0.22)", border: "1.5px solid rgba(255,255,255,0.6)", color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, textDecoration: "none", backdropFilter: "blur(4px)" }}>
          💬 {copy.whatsappLabel}
        </a>
        <a
          href="/devis"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: "var(--r-md)", background: "#fff", color: "#FF6B35", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, textDecoration: "none" }}>
          ✦ {copy.devisLabel}
        </a>
      </div>
    </div>
  )
}

function ArticleModal({ article, slug, lang, ui, onClose }: {
  article: Article
  slug: string
  lang: Lang
  ui: { read: string }
  onClose: () => void
}) {
  const ref = useModal<HTMLDivElement>(true, onClose)
  const Icon = ARTICLE_ICON[article.id] ?? Globe
  const img = ARTICLE_IMAGE[article.id]
  const vid = ARTICLE_VIDEO[article.id]
  const isRTL = lang === "ar"

  return createPortal(
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "clamp(12px, 4vh, 56px) 16px", overflowY: "auto",
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={article.title}
        dir={isRTL ? "rtl" : "ltr"}
        style={{
          position: "relative", width: "100%", maxWidth: 780, background: "#fff", borderRadius: "var(--r-xl)",
          overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.4)", outline: "none",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label={CLOSE_LABEL[lang] ?? CLOSE_LABEL.fr}
          style={{
            position: "absolute", top: 14, insetInlineEnd: 14, zIndex: 3, width: 40, height: 40, borderRadius: "50%",
            background: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ds-ink, #111)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          }}
        >
          <X size={20} />
        </button>

        {/* Hero — animated clip when available, else the cover image */}
        <div style={{ width: "100%", height: "clamp(180px, 34vw, 320px)", background: "var(--ds-bg-sec)", overflow: "hidden", position: "relative" }}>
          {vid ? (
            <video src={vid.url} poster={img?.url} autoPlay muted loop playsInline preload="metadata" aria-label={vid.alt}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : img && (
            <img src={img.url} alt={img.alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, transparent 45%, rgba(0,0,0,0.45) 100%)" }} />
          <div style={{
            position: "absolute", bottom: 16, insetInlineStart: 20, width: 48, height: 48, borderRadius: "var(--r-lg)",
            background: "var(--ds-accent-grad)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 22px var(--ds-accent-a45)",
          }}>
            <Icon size={22} aria-hidden="true" />
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "28px clamp(20px, 5vw, 44px) 36px", maxHeight: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
              textTransform: "uppercase", color: "var(--ds-accent-text)", background: "var(--ds-accent-a10)", padding: "5px 11px", borderRadius: "var(--r-full)",
            }}>{article.tag}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: "var(--ds-text-faint)" }}>
              <Clock size={13} /> {article.read} {ui.read}
            </span>
          </div>

          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 800, color: "#000", lineHeight: 1.22, marginBottom: 22 }}>{article.title}</h2>

          {article.body.map((p, i) => (
            <Paragraph key={i} text={p} />
          ))}

          <VideoOutro lang={lang} articleId={article.id} />

          <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
            <Link
              to={`/blog/${slug}`}
              onClick={() => track("blog_read", { article: article.id, from: "modal_fullpage" })}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--ds-accent-text)", textDecoration: "none" }}
            >
              {FULL_PAGE_LABEL[lang] ?? FULL_PAGE_LABEL.fr} <ExternalLink size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default function Blog() {
  const { lang } = useSettings()
  const ui = UI[lang] ?? UI.fr
  const { articles, imageFor, slugFor } = useBlogArticles()
  // Article opened in-place, without leaving the blog section.
  const [openId, setOpenId] = useState<string | null>(null)
  const openArticle = articles.find((a) => a.id === openId) ?? null

  return (
    <section id="blog" style={{ background: "var(--ds-bg-sec)", padding: "96px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 var(--section-px)" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ marginBottom: 20 }}>
            <span className="section-tag"><span className="dot-pulse" />{ui.tag}</span>
          </div>
          <h2 className="section-title" style={{ marginBottom: 16 }}>{ui.title}</h2>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17.6, color: "var(--ds-text-sec)", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>{ui.sub}</p>
        </div>

        <AutoCarousel visibleCount={3} mobileVisibleCount={1} interval={5000}>
          {articles.map((a) => {
            const Icon = ARTICLE_ICON[a.id] ?? Globe
            const img = imageFor(a.id)
            return (
            <article
              key={a.id}
              className="card blog-card-hover"
              role="button"
              tabIndex={0}
              aria-label={`${ui.cta}: ${a.title}`}
              onClick={() => { track("blog_read", { article: a.id, from: "section_modal" }); setOpenId(a.id) }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  track("blog_read", { article: a.id, from: "section_modal" })
                  setOpenId(a.id)
                }
              }}
              style={{ cursor: "pointer", display: "flex", flexDirection: "column", boxSizing: "border-box", height: "100%", overflow: "hidden", padding: 0 }}
            >
              {/* Cover image */}
              <div style={{ position: "relative", width: "100%", height: 180, background: "var(--ds-bg-card-hover)", flexShrink: 0, overflow: "hidden" }}>
                {img && (
                  <img
                    src={img.url}
                    alt={img.alt}
                    loading="lazy"
                    className="blog-card-img"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
                  />
                )}
                {/* Gradient scrim */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.28) 100%)" }} />
                {/* Topic icon badge */}
                <div style={{
                  position: "absolute", bottom: 14, left: 14,
                  width: 40, height: 40, borderRadius: "var(--r-md)",
                  background: "var(--ds-accent-grad)", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(var(--ds-accent-rgb),0.5)",
                }}>
                  <Icon size={20} aria-hidden="true" />
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: "22px 24px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
                    textTransform: "uppercase", color: "var(--ds-accent-text)", background: "var(--ds-accent-a10)", padding: "5px 11px", borderRadius: "var(--r-full)",
                  }}>{a.tag}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: "var(--ds-text-faint)" }}>
                    <Clock size={13} /> {a.read} {ui.read}
                  </span>
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 800, color: "var(--ds-text)", marginBottom: 10, lineHeight: 1.3 }}>{a.title}</h3>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "var(--ds-text-sec)", lineHeight: 1.65, marginBottom: 18, flex: 1 }}>{a.excerpt}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--ds-accent-text)" }}>
                    {ui.cta} <ArrowRight size={16} />
                  </span>
                  <img src={logo} alt="INOV" style={{ height: 20, width: "auto", objectFit: "contain", opacity: 0.5 }} />
                </div>
              </div>
            </article>
            )
          })}
        </AutoCarousel>

        <style>{`
          .blog-card-hover:hover .blog-card-img { transform: scale(1.05); }
        `}</style>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 48 }}>
          <Link
            to="/blog"
            className="btn-secondary"
            onClick={() => track("blog_see_all", {})}
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            {ALL_LABEL[lang] ?? ALL_LABEL.fr} <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {openArticle && (
        <ArticleModal
          article={openArticle}
          slug={slugFor(openArticle.id)}
          lang={lang}
          ui={ui}
          onClose={() => setOpenId(null)}
        />
      )}
    </section>
  )
}
