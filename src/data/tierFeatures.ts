import type { Lang } from "../i18n/translations"
import type { TierKey } from "./services"

/* ──────────────────────────────────────────────────────────────────────────
   Avantages par formule (Essentiel / Standard / Premium)
   ──────────────────────────────────────────────────────────────────────────
   But : créer un vrai contraste entre les formules AU-DELÀ des révisions et de
   la fenêtre de révision. Chaque formule livre un périmètre différent —
   l'essentiel pour "Essentiel", un peu plus pour "Standard", le package complet
   (niveau marché international) pour "Premium".

   Les avantages sont composés à partir d'un dictionnaire de "tokens" réutilisés
   d'un service à l'autre, traduits dans les 8 langues du site. Chaque service
   pointe vers une liste de tokens par formule (SERVICE_TIER_FEATURES).
   ────────────────────────────────────────────────────────────────────────── */

export type FeatureToken =
  | "essentials" | "twoConcepts" | "threeConcepts" | "sourceFiles" | "allFormats"
  | "mockups" | "socialDeclinations" | "printPro" | "priorityDelivery"
  | "shortDuration" | "mediumDuration" | "longDuration"
  | "subtitles" | "royaltyMusic" | "soundDesign" | "advancedMotion" | "colorGrade4k"
  | "webBasic" | "webStandard" | "webPremium"
  | "brandFull" | "brandStrategy"

export const FEATURE_LABELS: Record<Lang, Record<FeatureToken, string>> = {
  fr: {
    essentials: "L'essentiel, prêt à l'emploi", twoConcepts: "2 concepts au choix", threeConcepts: "3 concepts au choix",
    sourceFiles: "Fichiers sources modifiables", allFormats: "Tous les formats + PDF HD", mockups: "Mockups de présentation",
    socialDeclinations: "Déclinaisons réseaux sociaux", printPro: "Gabarit imprimeur professionnel", priorityDelivery: "Livraison prioritaire",
    shortDuration: "Durée courte, format unique", mediumDuration: "Durée moyenne, rythme dynamique", longDuration: "Format long, séquences multiples",
    subtitles: "Sous-titres animés", royaltyMusic: "Musique libre de droits", soundDesign: "Sound design & mixage audio",
    advancedMotion: "Motion design avancé", colorGrade4k: "Étalonnage couleur + export 4K",
    webBasic: "Jusqu'à 3 sections, responsive", webStandard: "Jusqu'à 5 sections + formulaire", webPremium: "Sections illimitées + CMS & SEO",
    brandFull: "Charte complète + papeterie pro", brandStrategy: "Accompagnement stratégique premium",
  },
  en: {
    essentials: "The essentials, ready to use", twoConcepts: "2 concepts to choose from", threeConcepts: "3 concepts to choose from",
    sourceFiles: "Editable source files", allFormats: "All formats + HD PDF", mockups: "Presentation mockups",
    socialDeclinations: "Social media variations", printPro: "Professional print-ready file", priorityDelivery: "Priority delivery",
    shortDuration: "Short duration, single format", mediumDuration: "Medium length, dynamic pacing", longDuration: "Long format, multiple sequences",
    subtitles: "Animated subtitles", royaltyMusic: "Royalty-free music", soundDesign: "Sound design & audio mixing",
    advancedMotion: "Advanced motion design", colorGrade4k: "Color grading + 4K export",
    webBasic: "Up to 3 sections, responsive", webStandard: "Up to 5 sections + contact form", webPremium: "Unlimited sections + CMS & SEO",
    brandFull: "Full brand guide + stationery", brandStrategy: "Premium strategic support",
  },
  es: {
    essentials: "Lo esencial, listo para usar", twoConcepts: "2 conceptos a elegir", threeConcepts: "3 conceptos a elegir",
    sourceFiles: "Archivos fuente editables", allFormats: "Todos los formatos + PDF HD", mockups: "Mockups de presentación",
    socialDeclinations: "Versiones para redes sociales", printPro: "Archivo profesional listo para imprenta", priorityDelivery: "Entrega prioritaria",
    shortDuration: "Duración corta, formato único", mediumDuration: "Duración media, ritmo dinámico", longDuration: "Formato largo, múltiples secuencias",
    subtitles: "Subtítulos animados", royaltyMusic: "Música libre de derechos", soundDesign: "Diseño de sonido y mezcla",
    advancedMotion: "Motion design avanzado", colorGrade4k: "Etalonaje de color + exportación 4K",
    webBasic: "Hasta 3 secciones, responsive", webStandard: "Hasta 5 secciones + formulario", webPremium: "Secciones ilimitadas + CMS y SEO",
    brandFull: "Manual de marca completo + papelería", brandStrategy: "Acompañamiento estratégico premium",
  },
  ht: {
    essentials: "Sa ki esansyèl, prè pou itilize", twoConcepts: "2 konsèp pou chwazi", threeConcepts: "3 konsèp pou chwazi",
    sourceFiles: "Fichye sous ou ka modifye", allFormats: "Tout fòma + PDF HD", mockups: "Mockup pou prezantasyon",
    socialDeclinations: "Vèsyon pou rezo sosyal", printPro: "Fichye pwofesyonèl prè pou enprime", priorityDelivery: "Livrezon prioritè",
    shortDuration: "Kout, yon sèl fòma", mediumDuration: "Dire mwayen, ritm dinamik", longDuration: "Fòma long, plizyè sekans",
    subtitles: "Soutit anime", royaltyMusic: "Mizik lib de dwa", soundDesign: "Sound design & miksaj odyo",
    advancedMotion: "Motion design avanse", colorGrade4k: "Etalonaj koulè + ekspò 4K",
    webBasic: "Jiska 3 seksyon, responsive", webStandard: "Jiska 5 seksyon + fòmilè", webPremium: "Seksyon san limit + CMS & SEO",
    brandFull: "Chart konplè + papti pwo", brandStrategy: "Akonpayman estratejik premium",
  },
  pt: {
    essentials: "O essencial, pronto para usar", twoConcepts: "2 conceitos à escolha", threeConcepts: "3 conceitos à escolha",
    sourceFiles: "Arquivos fonte editáveis", allFormats: "Todos os formatos + PDF HD", mockups: "Mockups de apresentação",
    socialDeclinations: "Versões para redes sociais", printPro: "Arquivo profissional pronto para gráfica", priorityDelivery: "Entrega prioritária",
    shortDuration: "Curta duração, formato único", mediumDuration: "Duração média, ritmo dinâmico", longDuration: "Formato longo, múltiplas sequências",
    subtitles: "Legendas animadas", royaltyMusic: "Música livre de direitos", soundDesign: "Sound design e mixagem",
    advancedMotion: "Motion design avançado", colorGrade4k: "Correção de cor + exportação 4K",
    webBasic: "Até 3 seções, responsivo", webStandard: "Até 5 seções + formulário", webPremium: "Seções ilimitadas + CMS e SEO",
    brandFull: "Manual de marca completo + papelaria", brandStrategy: "Acompanhamento estratégico premium",
  },
  it: {
    essentials: "L'essenziale, pronto all'uso", twoConcepts: "2 concept a scelta", threeConcepts: "3 concept a scelta",
    sourceFiles: "File sorgente modificabili", allFormats: "Tutti i formati + PDF HD", mockups: "Mockup di presentazione",
    socialDeclinations: "Declinazioni per i social", printPro: "File pronto per la stampa professionale", priorityDelivery: "Consegna prioritaria",
    shortDuration: "Breve durata, formato unico", mediumDuration: "Durata media, ritmo dinamico", longDuration: "Formato lungo, sequenze multiple",
    subtitles: "Sottotitoli animati", royaltyMusic: "Musica royalty-free", soundDesign: "Sound design e mixaggio",
    advancedMotion: "Motion design avanzato", colorGrade4k: "Color grading + export 4K",
    webBasic: "Fino a 3 sezioni, responsive", webStandard: "Fino a 5 sezioni + modulo", webPremium: "Sezioni illimitate + CMS e SEO",
    brandFull: "Brand guide completa + cancelleria", brandStrategy: "Supporto strategico premium",
  },
  de: {
    essentials: "Das Wesentliche, sofort einsetzbar", twoConcepts: "2 Entwürfe zur Auswahl", threeConcepts: "3 Entwürfe zur Auswahl",
    sourceFiles: "Bearbeitbare Quelldateien", allFormats: "Alle Formate + HD-PDF", mockups: "Präsentations-Mockups",
    socialDeclinations: "Social-Media-Varianten", printPro: "Profi-Druckvorlage", priorityDelivery: "Prioritäre Lieferung",
    shortDuration: "Kurze Dauer, ein Format", mediumDuration: "Mittlere Länge, dynamischer Schnitt", longDuration: "Langformat, mehrere Sequenzen",
    subtitles: "Animierte Untertitel", royaltyMusic: "Lizenzfreie Musik", soundDesign: "Sounddesign & Audio-Mixing",
    advancedMotion: "Fortgeschrittenes Motion Design", colorGrade4k: "Color Grading + 4K-Export",
    webBasic: "Bis zu 3 Bereiche, responsiv", webStandard: "Bis zu 5 Bereiche + Formular", webPremium: "Unbegrenzte Bereiche + CMS & SEO",
    brandFull: "Komplettes Branding + Geschäftsausstattung", brandStrategy: "Premium-Strategieberatung",
  },
  ar: {
    essentials: "الأساسيات، جاهزة للاستخدام", twoConcepts: "مفهومان للاختيار", threeConcepts: "3 مفاهيم للاختيار",
    sourceFiles: "ملفات المصدر قابلة للتعديل", allFormats: "جميع الصيغ + PDF عالي الدقة", mockups: "نماذج عرض تقديمي",
    socialDeclinations: "نسخ لوسائل التواصل الاجتماعي", printPro: "ملف احترافي جاهز للطباعة", priorityDelivery: "تسليم بأولوية",
    shortDuration: "مدة قصيرة، صيغة واحدة", mediumDuration: "مدة متوسطة، إيقاع ديناميكي", longDuration: "صيغة طويلة، مشاهد متعددة",
    subtitles: "ترجمة متحركة", royaltyMusic: "موسيقى خالية من الحقوق", soundDesign: "تصميم صوتي ومكساج",
    advancedMotion: "موشن ديزاين متقدم", colorGrade4k: "تدرج الألوان + تصدير 4K",
    webBasic: "حتى 3 أقسام، متجاوب", webStandard: "حتى 5 أقسام + نموذج", webPremium: "أقسام غير محدودة + CMS و SEO",
    brandFull: "دليل علامة كامل + قرطاسية", brandStrategy: "دعم استراتيجي متميز",
  },
}

/** Which feature tokens each service includes at each tier. Keyed by service id.
 *  Essentiel = les essentiels · Standard = un peu plus · Premium = package complet. */
export const SERVICE_TIER_FEATURES: Record<number, Record<TierKey, FeatureToken[]>> = {
  // 1 · Branding & Identité (package complet)
  1: {
    essentiel: ["essentials", "sourceFiles"],
    standard: ["twoConcepts", "mockups", "socialDeclinations"],
    premium: ["brandFull", "brandStrategy", "priorityDelivery"],
  },
  // 2 · Création de Logo
  2: {
    essentiel: ["essentials", "allFormats"],
    standard: ["twoConcepts", "mockups", "sourceFiles"],
    premium: ["threeConcepts", "mockups", "sourceFiles", "socialDeclinations", "priorityDelivery"],
  },
  // 3 · Animation de Logo (vidéo)
  3: {
    essentiel: ["shortDuration"],
    standard: ["mediumDuration", "royaltyMusic"],
    premium: ["longDuration", "advancedMotion", "soundDesign", "colorGrade4k"],
  },
  // 4 · Montage Vidéo
  4: {
    essentiel: ["shortDuration"],
    standard: ["mediumDuration", "subtitles", "royaltyMusic"],
    premium: ["longDuration", "subtitles", "soundDesign", "colorGrade4k", "priorityDelivery"],
  },
  // 5 · Motion Design / Animation 2D-3D
  5: {
    essentiel: ["shortDuration"],
    standard: ["mediumDuration", "royaltyMusic"],
    premium: ["longDuration", "advancedMotion", "soundDesign", "colorGrade4k"],
  },
  // 6 · Packaging Design
  6: {
    essentiel: ["essentials", "allFormats"],
    standard: ["twoConcepts", "mockups", "sourceFiles"],
    premium: ["threeConcepts", "mockups", "sourceFiles", "printPro", "priorityDelivery"],
  },
  // 7 · Étiquette Simple
  7: {
    essentiel: ["essentials"],
    standard: ["twoConcepts", "allFormats"],
    premium: ["threeConcepts", "sourceFiles", "printPro", "priorityDelivery"],
  },
  // 9 · Flyers & Affiches
  9: {
    essentiel: ["essentials"],
    standard: ["twoConcepts", "allFormats"],
    premium: ["threeConcepts", "sourceFiles", "printPro", "priorityDelivery"],
  },
  // 10 · Affiche Réseaux Sociaux
  10: {
    essentiel: ["essentials"],
    standard: ["twoConcepts", "socialDeclinations"],
    premium: ["threeConcepts", "socialDeclinations", "sourceFiles", "priorityDelivery"],
  },
  // 16 · Pack Lancement Express (web)
  16: {
    essentiel: ["webBasic"],
    standard: ["webStandard"],
    premium: ["webPremium", "priorityDelivery"],
  },
  // 12 · Grand Format (Banner / Roll-up)
  12: {
    essentiel: ["essentials"],
    standard: ["twoConcepts", "allFormats"],
    premium: ["threeConcepts", "sourceFiles", "printPro", "priorityDelivery"],
  },
  // 13 · Infographie
  13: {
    essentiel: ["essentials"],
    standard: ["twoConcepts", "sourceFiles"],
    premium: ["threeConcepts", "sourceFiles", "allFormats", "priorityDelivery"],
  },
  // 14 · Présentation PowerPoint
  14: {
    essentiel: ["essentials"],
    standard: ["twoConcepts", "sourceFiles"],
    premium: ["threeConcepts", "sourceFiles", "advancedMotion", "priorityDelivery"],
  },
  // 15 · Carte de Visite
  15: {
    essentiel: ["essentials"],
    standard: ["twoConcepts", "allFormats"],
    premium: ["threeConcepts", "sourceFiles", "printPro", "priorityDelivery"],
  },
}

/** Localized feature bullet list for a given service + tier. Empty if none defined. */
export function tierFeatureList(serviceId: number, tier: TierKey, lang: Lang): string[] {
  const tokens = SERVICE_TIER_FEATURES[serviceId]?.[tier]
  if (!tokens) return []
  const labels = FEATURE_LABELS[lang] ?? FEATURE_LABELS.fr
  return tokens.map((tk) => labels[tk])
}
