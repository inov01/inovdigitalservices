// ── Smart configurator options (formulaire intelligent) ─────────────────────
// Priced add-on groups attached to a service. Every choice ENRICHES the price:
// each selected option adds its `delta` (USD, base tier) on top of the service
// base price. Deltas are run through the same priceFor()/fmt() pipeline as the
// base price at render time, so PPP + currency still apply everywhere.
//
// Group kinds:
//   • "single" — pick exactly one option (radio). First option is the default.
//   • "multi"  — pick any number (checkbox). Each checked option adds its delta.

export interface ServiceOption {
  id: string
  label: string
  /** Extra USD added to the base price when selected. 0 = included / no change. */
  delta: number
  /** Optional one-line clarification shown under the label. */
  hint?: string
}

export interface ServiceOptionGroup {
  id: string
  label: string
  kind: "single" | "multi"
  options: ServiceOption[]
}

// Reusable groups shared across several services ------------------------------

const FILES_GROUP: ServiceOptionGroup = {
  id: "files",
  label: "Fichiers livrés",
  kind: "single",
  options: [
    { id: "web", label: "Web (JPG / PNG haute résolution)", delta: 0 },
    { id: "print", label: "Print (PDF prêt à imprimer, fonds perdus)", delta: 8, hint: "Format d'impression, marges & fonds perdus inclus." },
    { id: "all", label: "Pack complet (web + print + source)", delta: 18, hint: "Fichier source modifiable inclus." },
  ],
}

const RUSH_GROUP: ServiceOptionGroup = {
  id: "rush",
  label: "Délai",
  kind: "single",
  options: [
    { id: "standard", label: "Standard", delta: 0 },
    { id: "rush", label: "Express (–50 % de délai)", delta: 20, hint: "Livraison prioritaire dès le brief complet." },
  ],
}

const SOURCE_GROUP: ServiceOptionGroup = {
  id: "source",
  label: "Fichier source",
  kind: "multi",
  options: [
    { id: "source", label: "Ajouter le fichier source modifiable", delta: 15 },
  ],
}

// Per-service configuration ---------------------------------------------------
// Keyed by service id (see data/services.ts). Only `configurable: true` services
// need an entry; a missing entry falls back to the generic groups below.

export const SERVICE_OPTIONS: Record<number, ServiceOptionGroup[]> = {
  // 18 — Flyer Événementiel (Festival, Concert…)
  18: [
    {
      id: "pack",
      label: "Contenu du pack",
      kind: "multi",
      options: [
        { id: "ticket", label: "Design du ticket / billet", delta: 20 },
        { id: "story", label: "Déclinaison Story (9:16)", delta: 12 },
        { id: "post", label: "Déclinaison Post carré (1:1)", delta: 12 },
        { id: "cover", label: "Couverture d'événement (Facebook)", delta: 10 },
        { id: "banner", label: "Bannière web / grand format", delta: 15 },
      ],
    },
    RUSH_GROUP,
  ],

  // 29 — Animation de Flyer Événementiel (concert, DJ, festival)
  29: [
    {
      id: "duration",
      label: "Durée de la vidéo",
      kind: "single",
      options: [
        { id: "s10", label: "10 secondes", delta: 0 },
        { id: "s15", label: "15 secondes", delta: 15 },
        { id: "s30", label: "30 secondes", delta: 35 },
      ],
    },
    {
      id: "effects",
      label: "Effets & animations",
      kind: "multi",
      options: [
        { id: "people", label: "Animation des personnes (photo → mouvement)", delta: 40, hint: "À partir des photos statiques que vous fournissez." },
        { id: "light", label: "Effets lumière / particules / concert", delta: 20 },
        { id: "text", label: "Texte animé (dates, lieu, line-up)", delta: 12 },
        { id: "music", label: "Habillage musical / synchro rythme", delta: 15 },
      ],
    },
    {
      id: "formats",
      label: "Formats livrés",
      kind: "multi",
      options: [
        { id: "story", label: "Story / Reel (9:16)", delta: 0 },
        { id: "post", label: "Post carré (1:1)", delta: 10 },
        { id: "wide", label: "Paysage (16:9)", delta: 10 },
      ],
    },
    RUSH_GROUP,
  ],

  // 19 — Design de T-shirt
  19: [
    {
      id: "sides",
      label: "Emplacements",
      kind: "multi",
      options: [
        { id: "front", label: "Recto", delta: 0 },
        { id: "back", label: "Verso", delta: 12 },
        { id: "sleeve", label: "Manche / poitrine", delta: 8 },
      ],
    },
    {
      id: "variants",
      label: "Variantes de couleur",
      kind: "single",
      options: [
        { id: "one", label: "1 déclinaison", delta: 0 },
        { id: "three", label: "3 déclinaisons", delta: 12 },
      ],
    },
    FILES_GROUP,
    RUSH_GROUP,
  ],

  // 20 — Design de Cover Téléphone
  20: [
    {
      id: "models",
      label: "Modèles de téléphone",
      kind: "single",
      options: [
        { id: "one", label: "1 modèle", delta: 0 },
        { id: "three", label: "Jusqu'à 3 modèles", delta: 10 },
      ],
    },
    SOURCE_GROUP,
    RUSH_GROUP,
  ],

  // 21 — Carte d'Invitation & Faire-part
  21: [
    {
      id: "kind",
      label: "Type de carte",
      kind: "single",
      options: [
        { id: "single", label: "Recto seul", delta: 0 },
        { id: "double", label: "Recto / verso", delta: 12 },
        { id: "suite", label: "Suite complète (invitation + RSVP + menu)", delta: 30 },
      ],
    },
    {
      id: "extras",
      label: "Options",
      kind: "multi",
      options: [
        { id: "envelope", label: "Design de l'enveloppe", delta: 10 },
        { id: "digital", label: "Version animée à envoyer (WhatsApp)", delta: 18 },
      ],
    },
    FILES_GROUP,
    RUSH_GROUP,
  ],

  // 22 — Vectorisation de Logo
  22: [
    {
      id: "complexity",
      label: "Complexité du logo",
      kind: "single",
      options: [
        { id: "simple", label: "Simple (formes & texte)", delta: 0 },
        { id: "detailed", label: "Détaillé (dégradés, illustration)", delta: 20 },
      ],
    },
    {
      id: "formats",
      label: "Formats livrés",
      kind: "multi",
      options: [
        { id: "svg", label: "SVG", delta: 0 },
        { id: "ai", label: "AI / EPS", delta: 6 },
        { id: "pdf", label: "PDF vectoriel", delta: 4 },
      ],
    },
    RUSH_GROUP,
  ],

  // 23 — Retouche & Manipulation Photo
  23: [
    {
      id: "level",
      label: "Niveau de retouche",
      kind: "single",
      options: [
        { id: "basic", label: "Basique (lumière, couleurs, nettoyage)", delta: 0 },
        { id: "advanced", label: "Avancée (détourage, peau, montage)", delta: 20 },
        { id: "creative", label: "Manipulation créative (compositing)", delta: 45 },
      ],
    },
    {
      id: "volume",
      label: "Nombre de photos",
      kind: "single",
      options: [
        { id: "one", label: "1 photo", delta: 0 },
        { id: "five", label: "Lot de 5 photos", delta: 60 },
        { id: "ten", label: "Lot de 10 photos", delta: 100 },
      ],
    },
    RUSH_GROUP,
  ],

  // 24 — Profil Réseaux Sociaux Pro
  24: [
    {
      id: "platforms",
      label: "Plateformes",
      kind: "multi",
      options: [
        { id: "fb", label: "Facebook", delta: 0 },
        { id: "ig", label: "Instagram", delta: 8 },
        { id: "li", label: "LinkedIn", delta: 8 },
        { id: "yt", label: "YouTube / TikTok", delta: 8 },
      ],
    },
    {
      id: "templates",
      label: "Modèles de publication",
      kind: "single",
      options: [
        { id: "none", label: "Aucun", delta: 0 },
        { id: "three", label: "3 modèles réutilisables", delta: 25 },
        { id: "six", label: "6 modèles réutilisables", delta: 45 },
      ],
    },
    RUSH_GROUP,
  ],

  // 25 — Mockups Produit
  25: [
    {
      id: "scenes",
      label: "Nombre de mises en situation",
      kind: "single",
      options: [
        { id: "one", label: "1 scène", delta: 0 },
        { id: "three", label: "3 scènes", delta: 25 },
        { id: "five", label: "5 scènes", delta: 45 },
      ],
    },
    SOURCE_GROUP,
    RUSH_GROUP,
  ],

  // 26 — Menu (Restaurant / Bar)
  26: [
    {
      id: "pages",
      label: "Nombre de pages",
      kind: "single",
      options: [
        { id: "one", label: "1 page (recto)", delta: 0 },
        { id: "two", label: "Recto / verso", delta: 12 },
        { id: "multi", label: "Multi-pages (livret)", delta: 30 },
      ],
    },
    {
      id: "extras",
      label: "Options",
      kind: "multi",
      options: [
        { id: "qr", label: "Version QR / menu numérique", delta: 15 },
        { id: "board", label: "Déclinaison affiche / ardoise", delta: 12 },
      ],
    },
    FILES_GROUP,
    RUSH_GROUP,
  ],

  // 27 — CV / Résumé Professionnel
  27: [
    {
      id: "extras",
      label: "Options",
      kind: "multi",
      options: [
        { id: "cover", label: "Lettre de motivation assortie", delta: 12 },
        { id: "linkedin", label: "Bannière LinkedIn assortie", delta: 10 },
        { id: "editable", label: "Version modifiable (Word / Canva)", delta: 8 },
      ],
    },
    RUSH_GROUP,
  ],

  // 28 — Stickers & Autocollants
  28: [
    {
      id: "count",
      label: "Nombre de modèles",
      kind: "single",
      options: [
        { id: "one", label: "1 modèle", delta: 0 },
        { id: "pack", label: "Planche de 5 modèles", delta: 20 },
      ],
    },
    {
      id: "cut",
      label: "Découpe",
      kind: "single",
      options: [
        { id: "standard", label: "Formes standard", delta: 0 },
        { id: "diecut", label: "Découpe sur mesure (die-cut)", delta: 10 },
      ],
    },
    RUSH_GROUP,
  ],
}

// Generic fallback for any static service without a bespoke entry.
export const GENERIC_OPTIONS: ServiceOptionGroup[] = [FILES_GROUP, SOURCE_GROUP, RUSH_GROUP]

// Generic fallback for video/motion services (no print PDF — formats & duration
// are what actually varies) so the "Personnaliser & commander" button stays
// relevant on every service, not only the ones with a bespoke configurator.
export const GENERIC_VIDEO_OPTIONS: ServiceOptionGroup[] = [
  {
    id: "duration",
    label: "Durée",
    kind: "single",
    options: [
      { id: "short", label: "Courte (jusqu'à 15 s)", delta: 0 },
      { id: "mid", label: "Moyenne (jusqu'à 30 s)", delta: 25 },
      { id: "long", label: "Longue (jusqu'à 60 s)", delta: 55 },
    ],
  },
  {
    id: "formats",
    label: "Formats livrés",
    kind: "multi",
    options: [
      { id: "vertical", label: "Vertical (9:16 — Story / Reel / TikTok)", delta: 0 },
      { id: "square", label: "Carré (1:1)", delta: 10 },
      { id: "wide", label: "Paysage (16:9 — YouTube)", delta: 10 },
    ],
  },
  RUSH_GROUP,
]

/** Option groups for a service, falling back to a type-aware generic set. */
export function optionsFor(id: number, type?: "static" | "video"): ServiceOptionGroup[] {
  return SERVICE_OPTIONS[id] ?? (type === "video" ? GENERIC_VIDEO_OPTIONS : GENERIC_OPTIONS)
}

/** Default selection map for a set of groups (first option of each single group). */
export function defaultSelection(groups: ServiceOptionGroup[]): Record<string, string[]> {
  const sel: Record<string, string[]> = {}
  for (const g of groups) {
    if (g.kind === "single") {
      sel[g.id] = g.options.length ? [g.options[0].id] : []
    } else {
      // Multi groups default to any zero-delta ("included") options pre-checked.
      sel[g.id] = g.options.filter((o) => o.delta === 0).map((o) => o.id)
    }
  }
  return sel
}

/** Sum of all selected option deltas (USD, base tier). */
export function selectionDelta(groups: ServiceOptionGroup[], sel: Record<string, string[]>): number {
  let total = 0
  for (const g of groups) {
    const chosen = sel[g.id] ?? []
    for (const opt of g.options) {
      if (chosen.includes(opt.id)) total += opt.delta
    }
  }
  return total
}

/** Human-readable summary lines of the current selection (for quotes / WhatsApp). */
export function selectionSummary(groups: ServiceOptionGroup[], sel: Record<string, string[]>): string[] {
  const lines: string[] = []
  for (const g of groups) {
    const chosen = sel[g.id] ?? []
    const labels = g.options.filter((o) => chosen.includes(o.id)).map((o) => o.label)
    if (labels.length) lines.push(`${g.label} : ${labels.join(", ")}`)
  }
  return lines
}
