import logo1 from "@/imports/logo-1.webp"
import socialFlyer from "@/imports/social_flyer.webp"
import packagingAnana from "@/imports/packaging_anana.webp"
import etiquetteSimple from "@/imports/INOV_Digital_Services__64_.webp"

export interface PricingService {
  id: number
  name: string
  desc: string
  price: number
  qty: number
  type: "static" | "video"
  advantage: string
  projectUrl?: string
  /** Sample image so clients can preview what they're buying (static services). */
  exampleImg?: string
  /** Maximum delivery time, in days, counted from the deposit + complete brief. */
  deliveryDays: number
  /** Included revision rounds. A value of 1 renders as the single-revision label. */
  revisions: number
  /** Window, in days from delivery, during which the included revisions can be requested. */
  revisionDays: number
  /** Highlighted all-in-one package. */
  featured?: boolean
  /** Price on request — hides stepper and shows a quote CTA instead. */
  quoteOnly?: boolean
  /** Short caveat shown as a badge — e.g. "design only, print not included". */
  priceNote?: string
  /** True when a tailored option configurator exists (see data/serviceOptions.ts). */
  configurable?: boolean
}

// ── Service tiers (formules) ────────────────────────────────────────────────
// The SAME service, offered at three levels the CLIENT chooses — never imposed
// by region. This is how price/revisions/window may legitimately differ: it's a
// transparent, voluntary choice, identical for everyone everywhere. Regional
// purchasing-power (priceFor) still scales each tier's price on top.
//   • Standard = the base values defined per service below.
//   • Essentiel = lighter/cheaper (fewer revisions, shorter window).
//   • Premium  = richer/pricier (more revisions, longer window).
export type TierKey = "essentiel" | "standard" | "premium"
export const TIER_KEYS: TierKey[] = ["essentiel", "standard", "premium"]

export interface TierValues {
  price: number
  revisions: number
  revisionDays: number
}

/** Resolve a service's price/revisions/window for a chosen tier.
 *  Derived from the base (Standard) values so a single source of truth stays. */
export function tierValues(s: PricingService, tier: TierKey): TierValues {
  if (tier === "essentiel") {
    return {
      price: Math.round(s.price * 0.7),
      revisions: Math.max(1, Math.round(s.revisions * 0.5)),
      revisionDays: Math.max(1, Math.round(s.revisionDays * 0.6)),
    }
  }
  if (tier === "premium") {
    return {
      // Premium = tarif niveau marché international (≈ ×3 le tarif de base),
      // justifié par un périmètre nettement plus large (voir tierFeatures.ts).
      price: Math.round(s.price * 3),
      revisions: s.revisions * 2,
      revisionDays: Math.round(s.revisionDays * 1.8),
    }
  }
  return { price: s.price, revisions: s.revisions, revisionDays: s.revisionDays }
}

export const pricingServices: PricingService[] = [
  { id: 1, name: "Branding & Identité", desc: "Package clé en main : logo + 4 mockups, animation de logo, vidéo de présentation, mini charte graphique, landing page (site vitrine services + contact), 6 flyers réseaux sociaux pour votre entreprise, une carte de visite recto verso et une présentation PowerPoint — 30 révisions sous 1 mois.", price: 890, qty: 0, type: "static", advantage: "Tout pour démarrer ou relancer votre entreprise et vous démarquer en un seul investissement.", deliveryDays: 14, revisions: 30, revisionDays: 30, featured: true },
  { id: 2, name: "Création de Logo", desc: "Logo sur-mesure + 2 mockups, variante couleur principale et noir & blanc, carte de visite recto verso, formats PNG, JPEG & PDF.", price: 111, qty: 0, type: "static", advantage: "Une signature visuelle forte qui vous démarque durablement de la concurrence.", deliveryDays: 5, revisions: 6, revisionDays: 7, exampleImg: logo1 },
  { id: 3, name: "Animation de Logo", desc: "Animation fluide et percutante de votre logo pour vos vidéos et réseaux sociaux.", price: 77, qty: 0, type: "video", advantage: "Un rendu dynamique qui capte l'attention et renforce votre professionnalisme.", projectUrl: "https://youtube.com/shorts/8Q-_Aa8AFJ0", deliveryDays: 5, revisions: 6, revisionDays: 7 },
  { id: 4, name: "Montage Vidéo", desc: "Montage professionnel de vos vidéos promotionnelles et contenus pour les réseaux sociaux.", price: 77, qty: 0, type: "video", advantage: "Des vidéos prêtes à publier qui maximisent l'engagement sur les réseaux.", projectUrl: "https://youtube.com/shorts/SFtvh7o5F_g", deliveryDays: 5, revisions: 6, revisionDays: 7 },
  { id: 5, name: "Motion Design / Animation 2D-3D", desc: "Animations graphiques sur-mesure — motion design, animation 2D & 3D pour tous vos contenus.", price: 120, qty: 0, type: "video", advantage: "Un contenu qui se démarque dans le flux des réseaux et communique plus efficacement.", projectUrl: "https://youtu.be/3X-xLzdu2to", deliveryDays: 5, revisions: 6, revisionDays: 7 },
  { id: 6, name: "Packaging Design", desc: "Étiquette + code-barres + mockup + flyer — pack complet pour valoriser votre produit.", price: 83, qty: 0, type: "static", advantage: "Un packaging qui attire l'œil et augmente concrètement vos ventes en rayon.", deliveryDays: 5, revisions: 6, revisionDays: 7, exampleImg: packagingAnana },
  { id: 7, name: "Étiquette Simple", desc: "Conception d'une étiquette produit professionnelle, prête à l'impression.", price: 28, qty: 0, type: "static", advantage: "Une étiquette soignée qui reflète la qualité de votre produit dès le premier coup d'œil.", deliveryDays: 2, revisions: 4, revisionDays: 3, exampleImg: etiquetteSimple },
  { id: 9, name: "Flyers & Affiches", desc: "Conception pour impression petit format — flyer, affiche, badge, certificat, brochure, book cover.", price: 39, qty: 0, type: "static", advantage: "Des supports imprimés percutants qui attirent l'attention en un regard.", deliveryDays: 2, revisions: 4, revisionDays: 3, exampleImg: socialFlyer, priceNote: "Prix du design uniquement — impression non incluse." },
  { id: 10, name: "Affiche Réseaux Sociaux", desc: "Visuels optimisés pour vos publications — flyers, affiches et miniatures YouTube.", price: 39, qty: 0, type: "static", advantage: "Une présence visuelle cohérente et professionnelle sur tous vos réseaux.", deliveryDays: 2, revisions: 4, revisionDays: 3, exampleImg: socialFlyer },
  { id: 16, name: "Pack Lancement Express", desc: "Landing page / site vitrine jusqu'à 5 sections — design responsive sur-mesure, formulaire de contact, mise en ligne & hébergement cloud sécurisé inclus.", price: 385, qty: 0, type: "static", advantage: "Un site professionnel en une semaine pour valider une idée, lancer une offre ou présenter votre activité avec impact immédiat.", deliveryDays: 10, revisions: 5, revisionDays: 10 },
  { id: 17, name: "Pack Sur-Mesure & Stratégie", desc: "Site multi-pages ou landing complexe — copywriting approfondi, animations avancées, intégrations CRM/réservation, gestion de contenu dynamique (CMS headless).", price: 0, qty: 0, type: "static", advantage: "Une expérience digitale entièrement personnalisée avec intégrations avancées et accompagnement stratégique.", deliveryDays: 15, revisions: 10, revisionDays: 15, quoteOnly: true },
  { id: 12, name: "Grand Format (Banner / Roll-up)", desc: "Conception pour impression grand format — bannières, roll-up, kakemonos et supports événementiels.", price: 69, qty: 0, type: "static", advantage: "Des supports grand format qui imposent votre présence lors de vos événements.", deliveryDays: 2, revisions: 4, revisionDays: 3 },
  { id: 13, name: "Infographie", desc: "Visualisations claires et attrayantes de vos données et processus.", price: 85, qty: 0, type: "static", advantage: "Un contenu facile à comprendre et partager qui démontre votre expertise.", deliveryDays: 5, revisions: 6, revisionDays: 7 },
  { id: 14, name: "Présentation PowerPoint", desc: "Présentations professionnelles percutantes pour vos réunions et pitchs clients.", price: 92, qty: 0, type: "static", advantage: "Une présentation qui marque les esprits et convainc vos interlocuteurs.", deliveryDays: 5, revisions: 6, revisionDays: 7 },
  { id: 15, name: "Carte de Visite", desc: "Cartes de visite mémorables qui reflètent fidèlement votre identité de marque.", price: 28, qty: 0, type: "static", advantage: "Un premier contact physique inoubliable qui crée une impression durable.", deliveryDays: 2, revisions: 4, revisionDays: 3 },

  // ── Conceptions événementielles & à la carte (ajouts marché HT / international) ──
  { id: 18, name: "Flyer Événementiel (Festival, Concert…)", desc: "Pack promo d'événement : affiche/flyer principal + design du ticket + déclinaisons aux bons formats réseaux (story, post, couverture). Vous indiquez les supports à imprimer ou à publier. Besoin d'une version vidéo ? Voir le service « Animation de Flyer Événementiel ».", price: 75, qty: 0, type: "static", advantage: "Une campagne visuelle complète et cohérente pour remplir votre événement — du ticket aux réseaux.", deliveryDays: 5, revisions: 6, revisionDays: 7, exampleImg: socialFlyer, configurable: true, priceNote: "Prix du design uniquement — impression des supports non incluse." },
  { id: 19, name: "Design de T-shirt", desc: "Visuel de t-shirt prêt à imprimer (sérigraphie, DTF, flocage) — fichiers haute résolution aux bonnes dimensions.", price: 35, qty: 0, type: "static", advantage: "Un design textile qui se remarque et se porte fièrement.", deliveryDays: 2, revisions: 4, revisionDays: 3, configurable: true, priceNote: "Prix du design uniquement — impression du t-shirt non incluse." },
  { id: 20, name: "Design de Cover Téléphone", desc: "Coque de téléphone personnalisée — visuel sur-mesure prêt pour l'impression sur coque.", price: 30, qty: 0, type: "static", advantage: "Un accessoire unique à votre image ou à celle de votre marque.", deliveryDays: 2, revisions: 4, revisionDays: 3, configurable: true, priceNote: "Prix du design uniquement — impression de la coque non incluse." },
  { id: 21, name: "Carte d'Invitation & Faire-part", desc: "Faire-part de mariage, carte d'anniversaire, invitation d'événement — recto/verso élégant, prêt à imprimer.", price: 45, qty: 0, type: "static", advantage: "Une invitation soignée qui donne le ton de votre événement dès l'ouverture.", deliveryDays: 3, revisions: 4, revisionDays: 3, configurable: true, priceNote: "Prix du design uniquement — impression non incluse." },
  { id: 22, name: "Vectorisation de Logo", desc: "Reproduction fidèle de votre logo existant (flou, pixelisé ou en photo) en fichier vectoriel net — SVG, AI, EPS, PDF.", price: 35, qty: 0, type: "static", advantage: "Un logo redimensionnable à l'infini, prêt pour l'enseigne, le textile et le grand format.", deliveryDays: 2, revisions: 4, revisionDays: 3, configurable: true },
  { id: 23, name: "Retouche & Manipulation Photo", desc: "Retouche, détourage, colorimétrie, restauration et montages créatifs à partir de vos images.", price: 40, qty: 0, type: "static", advantage: "Des photos professionnelles, prêtes pour vos réseaux, votre boutique ou l'impression.", deliveryDays: 3, revisions: 4, revisionDays: 3, configurable: true, priceNote: "Vous fournissez les images sources — le shooting photo n'est pas inclus." },
  { id: 24, name: "Profil Réseaux Sociaux Pro", desc: "Kit d'identité réseaux : photo de profil, bannière/couverture et modèles de publication cohérents (Facebook, Instagram, LinkedIn…).", price: 45, qty: 0, type: "static", advantage: "Une première impression professionnelle et cohérente sur toutes vos plateformes.", deliveryDays: 3, revisions: 6, revisionDays: 7, configurable: true },
  { id: 25, name: "Mockups Produit", desc: "Mise en situation réaliste de votre produit ou visuel (packaging, textile, affichage) sur mockups premium.", price: 40, qty: 0, type: "static", advantage: "Présentez votre produit comme une grande marque, avant même la production.", deliveryDays: 3, revisions: 4, revisionDays: 3, configurable: true },
  { id: 26, name: "Menu (Restaurant / Bar)", desc: "Carte de menu claire et appétissante — mise en page soignée, prête à imprimer ou à partager en PDF.", price: 45, qty: 0, type: "static", advantage: "Un menu qui met vos plats en valeur et facilite le choix de vos clients.", deliveryDays: 3, revisions: 4, revisionDays: 3, configurable: true, priceNote: "Prix du design uniquement — impression non incluse." },
  { id: 27, name: "CV / Résumé Professionnel", desc: "CV moderne et lisible, mis en page pour valoriser votre parcours — versions imprimable et PDF.", price: 25, qty: 0, type: "static", advantage: "Un CV qui se démarque de la pile et décroche l'entretien.", deliveryDays: 2, revisions: 4, revisionDays: 3, configurable: true },
  { id: 28, name: "Stickers & Autocollants", desc: "Planches de stickers et autocollants (marque, produit, événement) — découpe et formats variés, prêts à imprimer.", price: 25, qty: 0, type: "static", advantage: "Des petits supports qui font parler de votre marque partout.", deliveryDays: 2, revisions: 4, revisionDays: 3, configurable: true, priceNote: "Prix du design uniquement — impression non incluse." },
  { id: 29, name: "Animation de Flyer Événementiel", desc: "Votre flyer statique transformé en vidéo animée pour concert, DJ set, festival ou soirée — personnages et éléments qui bougent à partir d'une photo, effets lumière, texte animé et format optimisé réseaux (story, reel, post). Idéal pour la promo d'événement en ligne.", price: 90, qty: 0, type: "video", advantage: "Un visuel d'événement qui capte l'attention dans le flux et donne envie de venir — parfait pour concerts, DJ et festivals.", deliveryDays: 5, revisions: 6, revisionDays: 7, configurable: true, priceNote: "Vous fournissez le visuel/flyer ou nous le concevons via le service Flyer Événementiel." },
]

export interface Testimonial {
  id: number
  name: string
  role: string
  text: string
  stars: number
  /** Matching portfolio album ID — used to scroll/open the album */
  portfolioId: string
  /** Path to client logo (imported asset URL) */
  logo: string
  /** Light background to display behind the logo */
  logoBg: string
  logoFit: "contain" | "cover"
}

// Logo asset URLs are injected at runtime by the component that imports them.
// The array is typed; concrete values are set in TestimonialsData.ts to keep
// image imports colocated with the component layer.
export const testimonials: Omit<Testimonial, "logo" | "logoBg" | "logoFit">[] = [
  {
    id: 1,
    name: "Roseline Jean-Baptiste",
    role: "Fondatrice, Rosie Cocktail",
    portfolioId: "rosie",
    text: "INOV a sublimé notre image de marque cocktail de A à Z — logo, étiquettes, flyers. Tout est cohérent et élégant. Nos clients nous complimentent à chaque événement !",
    stars: 5,
  },
  {
    id: 2,
    name: "Dr. Kerby Faustin",
    role: "Directeur, PhysioHaiti",
    portfolioId: "physio",
    text: "Nos visuels pour séminaires et réseaux sociaux ont changé la perception de notre clinique. INOV livre dans les délais et le résultat dépasse toujours les attentes.",
    stars: 4,
  },
  {
    id: 3,
    name: "Prof. Marc-André Célestin",
    role: "Directeur, Parrots Schools",
    portfolioId: "parrots",
    text: "Notre logo bilingue et tous nos supports de communication reflètent enfin la qualité de notre école. INOV a compris notre vision dès le premier brief.",
    stars: 5,
  },
  {
    id: 4,
    name: "Raline Pierre-Louis",
    role: "Fondatrice, Raline's Cosmetics",
    portfolioId: "ralines-cosmetics",
    text: "Le packaging de ma ligne de cosmétiques est maintenant une œuvre d'art. Mes ventes ont nettement progressé depuis le relooking. INOV maîtrise parfaitement les codes du secteur beauté.",
    stars: 5,
  },
  {
    id: 5,
    name: "Monique Beauchamp",
    role: "Gérante, Moni-K Boutik",
    portfolioId: "moni-k-boutik",
    text: "Posts, étiquettes, mockups — INOV a transformé ma boutique en une marque professionnelle. Ma clientèle a remarqué le changement immédiatement.",
    stars: 3,
  },
  {
    id: 6,
    name: "Dr. Kévin Théodore",
    role: "CEO, The Doctor Company",
    portfolioId: "the-doctor-company",
    text: "Identité visuelle soignée, délais respectés, communication fluide. INOV est le partenaire créatif que toute entreprise sérieuse doit avoir.",
    stars: 4,
  },
]

export const faqItems = [
  { q: "Quels sont vos délais de livraison ?", a: "Nos délais dépendent du service, comptés à partir de l'acompte et du brief complet : les services de communication visuelle (28 à 69 $US) sont livrés sous 2 jours max, les services de 77 à 120 $US sous 5 jours, la landing page sous 7 jours, et le package Branding & Identité complet sous 2 semaines." },
  { q: "Comment se passe le paiement ?", a: "Nous demandons un acompte de 70% pour démarrer le projet, le solde de 30% étant dû à la livraison finale. Le paiement se fait via MonCash, Bank Transfer ou Western Union selon votre préférence." },
  { q: "Combien de révisions sont incluses ?", a: "Les services de 28 à 69 $US incluent 4 révisions à demander sous 3 jours après la livraison ; ceux de 77 à 120 $US (et la landing page) incluent 6 révisions sous 7 jours ; le package Branding & Identité offre 1 révision sous 1 mois. Au-delà, les révisions sont facturées à un tarif préférentiel." },
  { q: "Travaillez-vous avec des clients hors d'Haïti ?", a: "Oui ! Nous avons déjà livré des projets pour des clients aux États-Unis, au Canada, en France et dans la Caraïbe. Nous avons déjà accompagné plus de 20 marques et livré plus de 80 visuels, en Haïti comme à distance." },
  { q: "Puis-je commander plusieurs fois le même service ?", a: "Absolument. Notre section Tarifs vous permet de choisir la quantité souhaitée pour chaque service. Besoin de 3 logos pour différentes marques ? Ajoutez simplement la quantité 3 et bénéficiez des réductions par palier." },
  { q: "Y a-t-il des réductions pour les grandes commandes ?", a: "Oui, nous offrons 10% de réduction à partir de 5 unités de services commandées, et 30% de réduction à partir de 10 unités. Ces réductions sont calculées automatiquement dans le panier." },
  { q: "Quel format de fichiers livrez-vous ?", a: "Nous livrons tous les fichiers sources (AI, PSD, Figma) plus les versions finales en haute résolution (PNG, SVG, PDF) et les formats web optimisés. Pour les vidéos : MP4 H.264 en 1080p minimum." },
]
