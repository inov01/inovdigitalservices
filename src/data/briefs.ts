import {
  PenTool, Palette, Monitor, Clapperboard, Sparkles, Presentation, FileText, Wand2,
  type LucideIcon,
} from "lucide-react"
import type { Lang } from "../i18n/translations"

// ─────────────────────────────────────────────────────────────────────────────
// Tailored project brief forms, one per service. The STRUCTURE (which service
// has which fields, field types, option ids) is language-independent and defined
// once below. Every human-readable string lives in a flat per-language
// dictionary (STR), so adding a language never touches the structure and a
// missing language safely falls back to French.
// ─────────────────────────────────────────────────────────────────────────────

export type FieldType = "text" | "textarea" | "select" | "radio" | "checkbox"

export interface BriefField {
  id: string
  type: FieldType
  required?: boolean
  /** Option value ids (labels resolved via `opt.<fieldId>.<value>` in STR). */
  options?: string[]
}

export interface BriefService {
  slug: string
  icon: LucideIcon
  fields: BriefField[]
}

// Common fields appended to every service.
const COMMON: BriefField[] = [
  { id: "deadline", type: "text" },
  { id: "budget", type: "select", options: ["lt100", "r100", "r300", "r800", "talk"] },
  { id: "extra", type: "textarea" },
]

const SERVICES: BriefService[] = [
  {
    slug: "logo", icon: PenTool, fields: [
      { id: "brandName", type: "text", required: true },
      { id: "slogan", type: "text" },
      { id: "sector", type: "text", required: true },
      { id: "personality", type: "text", required: true },
      { id: "colors", type: "textarea" },
      { id: "logoSymbol", type: "radio", options: ["sym", "text", "any"] },
      { id: "logoUsages", type: "checkbox", options: ["sign", "web", "social", "print", "textile", "vehicle"] },
    ],
  },
  {
    slug: "branding", icon: Palette, fields: [
      { id: "brandName", type: "text", required: true },
      { id: "mission", type: "textarea", required: true },
      { id: "audience", type: "textarea", required: true },
      { id: "competitors", type: "textarea" },
      { id: "tone", type: "checkbox", options: ["modern", "luxe", "warm", "serious", "playful", "minimal"] },
      { id: "deliverables", type: "checkbox", options: ["logo", "charter", "stationery", "social", "packaging", "slides"] },
      { id: "hasExisting", type: "radio", options: ["yes", "no"] },
    ],
  },
  {
    slug: "site", icon: Monitor, fields: [
      { id: "companyName", type: "text", required: true },
      { id: "siteGoal", type: "radio", required: true, options: ["showcase", "sell", "booking", "portfolio"] },
      { id: "sitePages", type: "checkbox", options: ["home", "about", "services", "shop", "blog", "contact", "gallery"] },
      { id: "siteContent", type: "radio", options: ["ready", "partial", "no"] },
      { id: "siteExamples", type: "textarea" },
      { id: "siteFeatures", type: "checkbox", options: ["pay", "booking", "forms", "multi", "members", "chat"] },
      { id: "domain", type: "text" },
    ],
  },
  {
    slug: "video", icon: Clapperboard, fields: [
      { id: "videoPurpose", type: "text", required: true },
      { id: "duration", type: "select", options: ["s30", "s60", "m3", "long"] },
      { id: "ratio", type: "checkbox", options: ["vertical", "square", "wide"] },
      { id: "platform", type: "checkbox", options: ["instagram", "tiktok", "facebook", "youtube", "whatsapp", "site"] },
      { id: "videoFootage", type: "radio", required: true, options: ["yes", "partial"] },
      { id: "style", type: "textarea" },
      { id: "captions", type: "radio", options: ["yes", "no"] },
    ],
  },
  {
    slug: "retouche", icon: Wand2, fields: [
      { id: "retouchePhotos", type: "text", required: true },
      { id: "retoucheType", type: "checkbox", options: ["cleanup", "skin", "color", "background", "object", "restore"] },
      { id: "retoucheSource", type: "radio", required: true, options: ["yes", "soon"] },
      { id: "retoucheUse", type: "checkbox", options: ["social", "web", "shop", "cv", "print"] },
      { id: "retoucheRefs", type: "textarea" },
    ],
  },
  {
    slug: "motion", icon: Sparkles, fields: [
      { id: "motionObject", type: "radio", required: true, options: ["logo", "text", "explainer", "ad", "intro"] },
      { id: "duration", type: "select", options: ["s30", "s60", "m3", "long"] },
      { id: "ratio", type: "checkbox", options: ["vertical", "square", "wide"] },
      { id: "motionAssets", type: "radio", options: ["vector", "image", "no"] },
      { id: "style", type: "textarea" },
      { id: "motionMessage", type: "textarea" },
      { id: "motionSound", type: "radio", options: ["provide", "propose", "none"] },
    ],
  },
  {
    slug: "powerpoint", icon: Presentation, fields: [
      { id: "pptOccasion", type: "text", required: true },
      { id: "pptSlides", type: "select", options: ["s10", "s20", "s40", "s40p"] },
      { id: "pptContent", type: "radio", options: ["ready", "partial", "no"] },
      { id: "pptBrand", type: "radio", options: ["yes", "no"] },
      { id: "pptAnimation", type: "radio", options: ["sober", "moderate", "dynamic"] },
      { id: "pptFormat", type: "checkbox", options: ["ppt", "gslides", "pdf", "canva"] },
      { id: "pptNotes", type: "textarea" },
    ],
  },
  {
    slug: "other", icon: FileText, fields: [
      { id: "otherService", type: "text", required: true },
      { id: "otherDescribe", type: "textarea", required: true },
      { id: "otherGoal", type: "textarea" },
    ],
  },
]

export function serviceBySlug(slug: string): BriefService | undefined {
  return SERVICES.find((s) => s.slug === slug)
}
export function allBriefServices(): BriefService[] {
  return SERVICES
}
/** Specific fields + the shared common fields, in display order. */
export function fieldsFor(svc: BriefService): BriefField[] {
  return [...svc.fields, ...COMMON]
}

type Dict = Record<string, string>

// French is the canonical source and the fallback for any missing key/language.
const FR: Dict = {
  "ui.badge": "Brief projet",
  "ui.title": "Brief",
  "ui.back": "Retour au site",
  "ui.stepContact": "Vos coordonnées",
  "ui.name": "Nom complet",
  "ui.email": "E-mail",
  "ui.whatsapp": "WhatsApp",
  "ui.optional": "facultatif",
  "ui.attachments": "Images, documents ou vidéos de référence",
  "ui.attachmentsHelp": "Ajoutez vos fichiers — logos, photos, exemples, documents (jusqu'à 200 Mo par fichier).",
  "ui.addFiles": "Ajouter des fichiers",
  "ui.driveLinks": "Liens Google Drive",
  "ui.driveLinksHelp": "Partagez vos fichiers via Google Drive (logo existant, photos, documents, vidéos…). Assurez-vous que le lien est partagé en mode « Tout le monde avec le lien ».",
  "ui.driveLinksPlaceholder": "https://drive.google.com/…",
  "ui.driveLinksAdd": "Ajouter",
  "ui.driveLinksInvalid": "Le lien doit commencer par https://",
  "ui.uploading": "Envoi en cours…",
  "ui.submit": "Envoyer mon brief",
  "ui.submitting": "Envoi…",
  "ui.successTitle": "Brief reçu, merci !",
  "ui.successBody": "Nous avons bien reçu votre brief. Notre équipe vous recontacte très vite pour lancer votre projet.",
  "ui.successCta": "Retour à l'accueil",
  "ui.required": "Ce champ est requis.",
  "ui.errorSubmit": "L'envoi a échoué. Veuillez réessayer.",
  "ui.errorFile": "Un fichier n'a pas pu être envoyé. Réessayez.",
  "ui.selectPlaceholder": "Choisir…",
  "ui.remove": "Retirer",
  "ui.notFound": "Ce formulaire n'existe pas.",

  "svc.logo.name": "Création de logo",
  "svc.logo.intro": "Quelques questions pour concevoir un logo qui vous ressemble.",
  "svc.branding.name": "Branding & identité",
  "svc.branding.intro": "Aidez-nous à cerner votre marque de A à Z.",
  "svc.site.name": "Site web",
  "svc.site.intro": "Décrivez le site dont vous avez besoin.",
  "svc.video.name": "Montage vidéo",
  "svc.video.intro": "Parlez-nous de la vidéo à monter. Le montage se fait à partir de vos propres images ou rushes.",
  "svc.retouche.name": "Retouche photo",
  "svc.retouche.intro": "Envoyez vos photos, nous les sublimons. La retouche part de vos propres images.",
  "svc.motion.name": "Motion design",
  "svc.motion.intro": "Définissons ensemble votre animation.",
  "svc.powerpoint.name": "Présentation PowerPoint",
  "svc.powerpoint.intro": "Préparons une présentation qui marque les esprits.",
  "svc.other.name": "Autre projet",
  "svc.other.intro": "Décrivez votre besoin, nous revenons vers vous.",

  "f.deadline.label": "Pour quand souhaitez-vous la livraison ?",
  "f.deadline.ph": "Ex. dans 2 semaines, avant le 30…",
  "f.budget.label": "Budget approximatif",
  "opt.budget.lt100": "Moins de 100 $",
  "opt.budget.r100": "100 – 300 $",
  "opt.budget.r300": "300 – 800 $",
  "opt.budget.r800": "Plus de 800 $",
  "opt.budget.talk": "À discuter",
  "f.extra.label": "Autre chose à préciser ?",
  "f.extra.ph": "Tout détail utile à votre projet…",

  "f.brandName.label": "Nom exact à faire figurer",
  "f.brandName.ph": "Le texte tel qu'il doit apparaître",
  "f.slogan.label": "Slogan / accroche",
  "f.sector.label": "Secteur d'activité",
  "f.sector.ph": "Ex. restauration, mode, santé…",
  "f.personality.label": "3 mots qui décrivent votre marque",
  "f.personality.ph": "Ex. moderne, chaleureux, premium",
  "f.colors.label": "Couleurs aimées ou à éviter",
  "f.logoSymbol.label": "Type de logo souhaité",
  "opt.logoSymbol.sym": "Avec un symbole / icône",
  "opt.logoSymbol.text": "Texte seul (typographique)",
  "opt.logoSymbol.any": "Peu importe, à vous de proposer",
  "f.logoUsages.label": "Où utiliserez-vous ce logo ?",
  "opt.logoUsages.sign": "Enseigne",
  "opt.logoUsages.web": "Site web",
  "opt.logoUsages.social": "Réseaux sociaux",
  "opt.logoUsages.print": "Impression",
  "opt.logoUsages.textile": "Textile / broderie",
  "opt.logoUsages.vehicle": "Véhicule",

  "f.mission.label": "Que faites-vous, et pour qui ?",
  "f.audience.label": "Votre clientèle cible",
  "f.competitors.label": "Concurrents ou marques que vous admirez",
  "f.tone.label": "Tonalité recherchée",
  "opt.tone.modern": "Moderne",
  "opt.tone.luxe": "Luxe / premium",
  "opt.tone.warm": "Chaleureux",
  "opt.tone.serious": "Sérieux / corporate",
  "opt.tone.playful": "Ludique",
  "opt.tone.minimal": "Minimaliste",
  "f.deliverables.label": "Livrables souhaités",
  "opt.deliverables.logo": "Logo",
  "opt.deliverables.charter": "Charte graphique",
  "opt.deliverables.stationery": "Papeterie (cartes, factures…)",
  "opt.deliverables.social": "Kit réseaux sociaux",
  "opt.deliverables.packaging": "Packaging",
  "opt.deliverables.slides": "Présentation",
  "f.hasExisting.label": "Avez-vous déjà un logo ou des éléments de marque ?",
  "opt.hasExisting.yes": "Oui, à conserver / faire évoluer",
  "opt.hasExisting.no": "Non, tout est à créer",

  "f.companyName.label": "Nom de l'entreprise / du projet",
  "f.siteGoal.label": "Objectif principal du site",
  "opt.siteGoal.showcase": "Vitrine / présenter l'activité",
  "opt.siteGoal.sell": "Vendre en ligne",
  "opt.siteGoal.booking": "Prise de rendez-vous",
  "opt.siteGoal.portfolio": "Portfolio / galerie",
  "f.sitePages.label": "Pages souhaitées",
  "opt.sitePages.home": "Accueil",
  "opt.sitePages.about": "À propos",
  "opt.sitePages.services": "Services",
  "opt.sitePages.shop": "Boutique",
  "opt.sitePages.blog": "Blog",
  "opt.sitePages.contact": "Contact",
  "opt.sitePages.gallery": "Galerie",
  "f.siteContent.label": "Vos contenus (textes, photos) sont-ils prêts ?",
  "opt.siteContent.ready": "Oui, prêts",
  "opt.siteContent.partial": "En partie",
  "opt.siteContent.no": "Non, à créer avec vous",
  "f.siteExamples.label": "Sites que vous aimez (liens)",
  "f.siteFeatures.label": "Fonctionnalités souhaitées",
  "opt.siteFeatures.pay": "Paiement en ligne",
  "opt.siteFeatures.booking": "Réservation",
  "opt.siteFeatures.forms": "Formulaires",
  "opt.siteFeatures.multi": "Multilingue",
  "opt.siteFeatures.members": "Espace membre",
  "opt.siteFeatures.chat": "Chat / WhatsApp",
  "f.domain.label": "Nom de domaine (si vous en avez déjà un)",

  "f.videoPurpose.label": "But de la vidéo",
  "f.duration.label": "Durée souhaitée",
  "opt.duration.s30": "Moins de 30 s",
  "opt.duration.s60": "30 – 60 s",
  "opt.duration.m3": "1 – 3 min",
  "opt.duration.long": "Plus de 3 min",
  "f.ratio.label": "Format",
  "opt.ratio.vertical": "Vertical 9:16",
  "opt.ratio.square": "Carré 1:1",
  "opt.ratio.wide": "Paysage 16:9",
  "f.platform.label": "Où sera-t-elle publiée ?",
  "opt.platform.instagram": "Instagram",
  "opt.platform.tiktok": "TikTok",
  "opt.platform.facebook": "Facebook",
  "opt.platform.youtube": "YouTube",
  "opt.platform.whatsapp": "WhatsApp",
  "opt.platform.site": "Site web",
  "f.videoFootage.label": "Vos images / rushes à monter (vous les fournissez)",
  "opt.videoFootage.yes": "Oui, tout est prêt",
  "opt.videoFootage.partial": "En partie, le reste arrive",
  "f.style.label": "Style souhaité / vidéos de référence",
  "f.captions.label": "Sous-titres ?",
  "opt.captions.yes": "Oui",
  "opt.captions.no": "Non",

  "f.motionObject.label": "Que faut-il animer ?",
  "opt.motionObject.logo": "Un logo",
  "opt.motionObject.text": "Texte / titres",
  "opt.motionObject.explainer": "Vidéo explicative",
  "opt.motionObject.ad": "Publicité animée",
  "opt.motionObject.intro": "Intro / outro",
  "f.motionAssets.label": "Vos éléments graphiques (logo…) sont-ils disponibles ?",
  "opt.motionAssets.vector": "Oui, en vectoriel",
  "opt.motionAssets.image": "Oui, en image",
  "opt.motionAssets.no": "Non",
  "f.motionMessage.label": "Message clé à transmettre",
  "f.motionSound.label": "Musique / voix off ?",
  "opt.motionSound.provide": "Je la fournis",
  "opt.motionSound.propose": "À proposer",
  "opt.motionSound.none": "Aucune",

  "f.pptOccasion.label": "Occasion de la présentation",
  "f.pptOccasion.ph": "Pitch, cours, réunion, conférence…",
  "f.pptSlides.label": "Nombre de slides approximatif",
  "opt.pptSlides.s10": "Jusqu'à 10",
  "opt.pptSlides.s20": "10 – 20",
  "opt.pptSlides.s40": "20 – 40",
  "opt.pptSlides.s40p": "Plus de 40",
  "f.pptContent.label": "Le contenu est-il prêt ?",
  "opt.pptContent.ready": "Oui, prêt",
  "opt.pptContent.partial": "En partie",
  "opt.pptContent.no": "Non, à structurer ensemble",
  "f.pptBrand.label": "Une charte / des couleurs à respecter ?",
  "opt.pptBrand.yes": "Oui",
  "opt.pptBrand.no": "Non",
  "f.pptAnimation.label": "Niveau d'animation",
  "opt.pptAnimation.sober": "Sobre",
  "opt.pptAnimation.moderate": "Modéré",
  "opt.pptAnimation.dynamic": "Dynamique",
  "f.pptFormat.label": "Format de sortie",
  "opt.pptFormat.ppt": "PowerPoint",
  "opt.pptFormat.gslides": "Google Slides",
  "opt.pptFormat.pdf": "PDF",
  "opt.pptFormat.canva": "Canva",
  "f.pptNotes.label": "Points essentiels à mettre en avant",

  "f.retouchePhotos.label": "Combien de photos à retoucher ?",
  "f.retouchePhotos.ph": "Ex. 5 portraits, 10 photos produit…",
  "f.retoucheType.label": "Type de retouche souhaité",
  "opt.retoucheType.cleanup": "Nettoyage / imperfections",
  "opt.retoucheType.skin": "Peau / portrait",
  "opt.retoucheType.color": "Colorimétrie / lumière",
  "opt.retoucheType.background": "Détourage / fond",
  "opt.retoucheType.object": "Ajout / suppression d'élément",
  "opt.retoucheType.restore": "Restauration (photo ancienne)",
  "f.retoucheSource.label": "Avez-vous les photos d'origine en bonne qualité ?",
  "opt.retoucheSource.yes": "Oui, je les fournis",
  "opt.retoucheSource.soon": "Bientôt, je les envoie sous peu",
  "f.retoucheUse.label": "Où utiliserez-vous ces photos ?",
  "opt.retoucheUse.social": "Réseaux sociaux",
  "opt.retoucheUse.web": "Site web",
  "opt.retoucheUse.shop": "Boutique / e-commerce",
  "opt.retoucheUse.cv": "CV / profil professionnel",
  "opt.retoucheUse.print": "Impression (chez vous)",
  "f.retoucheRefs.label": "Rendu souhaité / exemples de référence",

  "f.otherService.label": "Quel service vous intéresse ?",
  "f.otherDescribe.label": "Décrivez votre projet",
  "f.otherGoal.label": "Objectif / résultat attendu",
}

// Other languages are merged in from ./briefsLocales (generated) so this file
// stays readable. Any missing key falls back to French.
import { LOCALES } from "./briefsLocales"

const STR: Partial<Record<Lang, Dict>> = { fr: FR, ...LOCALES }

export function briefStr(lang: Lang) {
  const d = STR[lang] ?? FR
  return (key: string): string => d[key] ?? FR[key] ?? key
}
