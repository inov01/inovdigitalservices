// ── Smart configurator options (formulaire intelligent) ─────────────────────
// Priced add-on groups attached to a service. Every choice ENRICHES the price:
// each selected option adds its `delta` (USD, base tier) on top of the service
// base price. Deltas are run through the same priceFor()/fmt() pipeline as the
// base price at render time, so the currency conversion applies everywhere.
//
// Group kinds:
//   • "single", pick exactly one option (radio). First option is the default.
//   • "multi", pick any number (checkbox). Each checked option adds its delta.
//
// Explanations (shown in expandable panels by the configurator):
//   • group.intro, what the whole group is about and how to choose.
//   • option.help, what that specific option contains.

export interface ServiceOption {
  id: string
  label: string
  /** Extra USD added to the base price when selected. 0 = included / no change. */
  delta: number
  /** Optional one-line clarification shown under the label. */
  hint?: string
  /** Optional longer explanation, revealed on demand. */
  help?: string
}

export interface ServiceOptionGroup {
  id: string
  label: string
  kind: "single" | "multi"
  /** Optional explanation of the group, revealed on demand. */
  intro?: string
  options: ServiceOption[]
}

// Reusable groups shared across several services ------------------------------

const FILES_GROUP: ServiceOptionGroup = {
  id: "files",
  label: "Fichiers livrés",
  kind: "single",
  intro: "Le format dépend de l'usage : écran (réseaux, site, WhatsApp) ou imprimerie. Si vous imprimez, choisissez Print : le fichier est préparé avec les marges et fonds perdus qu'exige l'imprimeur.",
  options: [
    { id: "web", label: "Web (JPG / PNG haute résolution)", delta: 0, help: "Images prêtes pour les écrans : réseaux sociaux, site web, WhatsApp, e-mail." },
    { id: "print", label: "Print (PDF prêt à imprimer, fonds perdus)", delta: 8, hint: "Format d'impression, marges & fonds perdus inclus.", help: "PDF en haute définition (300 dpi, couleurs CMJN) avec fonds perdus et traits de coupe. Votre imprimeur peut l'utiliser directement." },
    { id: "all", label: "Pack complet (web + print + source)", delta: 18, hint: "Fichier source modifiable inclus.", help: "Tous les formats (écran et impression) plus le fichier source modifiable, pour faire retoucher le visuel plus tard par vous ou un autre designer." },
  ],
}

const RUSH_GROUP: ServiceOptionGroup = {
  id: "rush",
  label: "Délai",
  kind: "single",
  intro: "Le délai standard est indiqué plus haut. L'option Express passe votre projet en priorité dès que le brief est complet et l'acompte reçu.",
  options: [
    { id: "standard", label: "Standard", delta: 0 },
    { id: "rush", label: "Express (délai réduit de moitié)", delta: 20, hint: "Livraison prioritaire dès le brief complet.", help: "Votre commande passe devant les autres. Le délai maximum est divisé par deux, à condition que le brief et les éléments (logo, textes, photos) soient fournis dès le départ." },
  ],
}

const SOURCE_GROUP: ServiceOptionGroup = {
  id: "source",
  label: "Fichier source",
  kind: "multi",
  intro: "Le fichier source est le fichier de travail du designer. Il permet de modifier textes, couleurs et éléments sans repartir de zéro.",
  options: [
    { id: "source", label: "Ajouter le fichier source modifiable", delta: 15, help: "Livré dans un format éditable (selon le service : PSD, AI, Figma ou Canva)." },
  ],
}

// Added to every service, just before the delay group.
const REVISIONS_GROUP: ServiceOptionGroup = {
  id: "moreRevisions",
  label: "Révisions supplémentaires",
  kind: "single",
  intro: "Un nombre de révisions est déjà inclus dans votre formule. Si votre projet implique plusieurs décideurs ou beaucoup d'ajustements, vous pouvez en ajouter à l'avance à tarif réduit.",
  options: [
    { id: "none", label: "Celles de ma formule me suffisent", delta: 0 },
    { id: "plus2", label: "+2 tours de révisions", delta: 10, help: "Deux tours de corrections en plus de ceux inclus, dans la même fenêtre de révision." },
    { id: "plus5", label: "+5 tours de révisions", delta: 22, help: "Idéal si plusieurs personnes valident le visuel ou si vous hésitez encore sur la direction." },
  ],
}

// Added to every service, just before the delay group.
const USAGE_GROUP: ServiceOptionGroup = {
  id: "usage",
  label: "Droits d'utilisation",
  kind: "single",
  intro: "Les droits définissent ce que vous pouvez faire du visuel livré. Pour la plupart des petites entreprises, l'usage standard suffit.",
  options: [
    { id: "standard", label: "Usage standard (commercial, votre activité)", delta: 0, help: "Vous pouvez utiliser le visuel pour votre activité : réseaux, site, impression, publicité." },
    { id: "extended", label: "Usage étendu (revente, merchandising, grands tirages)", delta: 25, help: "Nécessaire si vous revendez le design (produits dérivés, t-shirts, packaging distribué en grande quantité) ou pour une campagne à grande échelle." },
    { id: "exclusive", label: "Cession complète des droits", delta: 60, help: "Le design vous appartient entièrement et ne peut pas être réutilisé ni présenté comme modèle. Recommandé pour un logo ou une marque déposée." },
  ],
}

const LANGUAGES_GROUP: ServiceOptionGroup = {
  id: "languages",
  label: "Langues du visuel",
  kind: "single",
  intro: "Si votre public parle plusieurs langues, nous adaptons la mise en page pour chaque langue (les textes sont fournis par vous).",
  options: [
    { id: "one", label: "1 langue", delta: 0 },
    { id: "two", label: "2 langues (ex. français et anglais)", delta: 10, help: "Une version par langue, avec la même mise en page ajustée à la longueur des textes." },
    { id: "three", label: "3 langues (ex. français, anglais, créole)", delta: 18 },
  ],
}

const COPY_GROUP: ServiceOptionGroup = {
  id: "copy",
  label: "Accompagnement contenu",
  kind: "multi",
  intro: "Un bon visuel repose sur de bons textes et de bonnes images. Si vous n'avez pas encore tout, nous pouvons vous aider.",
  options: [
    { id: "copywriting", label: "Rédaction / reformulation des textes", delta: 12, help: "Nous rédigeons ou améliorons les textes du visuel (titre, accroche, mentions) à partir de votre brief." },
    { id: "stock", label: "Recherche d'images premium", delta: 10, help: "Sélection et licence d'images de qualité professionnelle adaptées à votre message." },
  ],
}

// Per-service configuration ---------------------------------------------------
// Keyed by service id (see data/services.ts). A missing entry falls back to the
// generic groups below. REVISIONS_GROUP and USAGE_GROUP are appended to every
// service by optionsFor().

export const SERVICE_OPTIONS: Record<number, ServiceOptionGroup[]> = {
  // 1, Branding & Identité
  1: [
    {
      id: "concepts",
      label: "Pistes créatives initiales",
      kind: "single",
      intro: "Au départ du projet, nous vous présentons plusieurs directions de logo pour que vous choisissiez celle qui vous ressemble.",
      options: [
        { id: "two", label: "2 pistes créatives", delta: 0 },
        { id: "four", label: "4 pistes créatives", delta: 40, help: "Plus de choix au départ, utile si vous n'avez pas encore d'idée précise du style voulu." },
      ],
    },
    {
      id: "identity",
      label: "Éléments d'identité supplémentaires",
      kind: "multi",
      intro: "Le package de base couvre l'essentiel. Ces éléments complètent votre identité pour la rendre cohérente partout.",
      options: [
        { id: "charter", label: "Charte graphique complète (guide de marque)", delta: 120, help: "Document de référence : logo et ses usages, couleurs, typographies, règles de mise en page, exemples. Il permet à n'importe quel prestataire de rester fidèle à votre marque." },
        { id: "stationery", label: "Papeterie complète (en-tête, enveloppe, facture)", delta: 60, help: "Documents administratifs à votre image : papier à en-tête, enveloppe, modèle de facture et de devis." },
        { id: "social", label: "Kit réseaux sociaux (profil, bannières, 6 modèles)", delta: 70, help: "Photo de profil, couvertures et six modèles de publication réutilisables pour garder un fil cohérent." },
        { id: "email", label: "Signature e-mail professionnelle", delta: 15 },
        { id: "guide", label: "Guide d'utilisation du logo (à faire / à éviter)", delta: 25, help: "Une page claire qui explique les tailles minimales, les fonds autorisés et les erreurs à éviter." },
        { id: "deck", label: "Présentation d'entreprise (10 diapositives)", delta: 90 },
        { id: "print", label: "Accompagnement impression (devis imprimeur, vérification des épreuves)", delta: 30, help: "Nous vous aidons à demander des devis, à choisir les papiers et à contrôler l'épreuve avant impression." },
      ],
    },
    COPY_GROUP,
  ],

  // 2, Création de Logo
  2: [
    {
      id: "concepts",
      label: "Pistes créatives",
      kind: "single",
      intro: "Une piste est une direction de logo différente. Plus vous en avez, plus le choix est large avant de peaufiner la meilleure.",
      options: [
        { id: "two", label: "2 pistes", delta: 0 },
        { id: "three", label: "3 pistes", delta: 25 },
        { id: "five", label: "5 pistes", delta: 55, help: "Recommandé si vous hésitez entre plusieurs styles (moderne, classique, illustratif, typographique)." },
      ],
    },
    {
      id: "variants",
      label: "Déclinaisons du logo",
      kind: "multi",
      intro: "Un logo doit fonctionner partout : sur fond clair, sur fond sombre, en petit, en carré. Ces déclinaisons le garantissent.",
      options: [
        { id: "layouts", label: "Versions horizontale, verticale et icône seule", delta: 20, help: "Le même logo adapté à tous les emplacements : en-tête de site, carré de profil, tampon, étiquette." },
        { id: "mono", label: "Version monochrome et fond sombre", delta: 10 },
        { id: "profile", label: "Favicon et photo de profil réseaux", delta: 8 },
        { id: "palette", label: "Mini-charte (couleurs et typographies)", delta: 25, help: "Une page qui liste vos couleurs (codes) et vos polices pour rester cohérent." },
        { id: "card2", label: "Carte de visite supplémentaire (autre nom ou poste)", delta: 12 },
      ],
    },
    FILES_GROUP,
    COPY_GROUP,
  ],

  // 3, Animation de Logo
  3: [
    {
      id: "style",
      label: "Style d'animation",
      kind: "single",
      intro: "Le style détermine le niveau de mouvement et de mise en scène. Un style simple convient aux intros courtes, un style cinématique aux vidéos de présentation.",
      options: [
        { id: "simple", label: "Révélation simple (apparition élégante)", delta: 0 },
        { id: "dynamic", label: "Dynamique (formes, transitions, énergie)", delta: 20, help: "Le logo se construit avec des mouvements de formes et des transitions rythmées." },
        { id: "cinematic", label: "Cinématique (effets 3D, lumière, profondeur)", delta: 50, help: "Mise en scène plus riche avec profondeur, éclairage et effets de matière. Idéal pour une introduction de vidéo premium." },
      ],
    },
    {
      id: "duration",
      label: "Durée",
      kind: "single",
      options: [
        { id: "s5", label: "Jusqu'à 5 secondes", delta: 0 },
        { id: "s10", label: "Jusqu'à 10 secondes", delta: 15 },
      ],
    },
    {
      id: "extras",
      label: "Options",
      kind: "multi",
      options: [
        { id: "sound", label: "Habillage sonore (effet sonore et musique)", delta: 15, help: "Nous ajoutons un son qui souligne l'animation pour un effet plus professionnel." },
        { id: "alpha", label: "Fond transparent (pour superposer dans vos vidéos)", delta: 10, help: "Livraison avec transparence, pratique pour poser le logo animé sur une autre vidéo dans votre logiciel de montage." },
        { id: "tagline", label: "Slogan animé sous le logo", delta: 10 },
      ],
    },
    {
      id: "formats",
      label: "Formats livrés",
      kind: "multi",
      options: [
        { id: "wide", label: "Paysage (16:9, YouTube)", delta: 0 },
        { id: "vertical", label: "Vertical (9:16, Story / Reel)", delta: 8 },
        { id: "square", label: "Carré (1:1)", delta: 8 },
      ],
    },
  ],

  // 4, Montage Vidéo
  4: [
    {
      id: "duration",
      label: "Durée de la vidéo finale",
      kind: "single",
      intro: "C'est la durée de la vidéo terminée, pas celle des rushes. Plus la vidéo est longue, plus le montage demande de temps.",
      options: [
        { id: "short", label: "Jusqu'à 1 minute", delta: 0 },
        { id: "mid", label: "Jusqu'à 3 minutes", delta: 35 },
        { id: "long", label: "Jusqu'à 5 minutes", delta: 70 },
        { id: "xl", label: "Jusqu'à 10 minutes", delta: 130 },
      ],
    },
    {
      id: "finish",
      label: "Finitions et habillage",
      kind: "multi",
      intro: "Ces finitions donnent un rendu professionnel à votre vidéo.",
      options: [
        { id: "subs", label: "Sous-titres incrustés (une langue)", delta: 20, help: "Sous-titres stylisés à l'écran, très utiles car beaucoup de personnes regardent sans le son." },
        { id: "subs2", label: "Sous-titres dans une deuxième langue", delta: 15 },
        { id: "grade", label: "Étalonnage couleur", delta: 18, help: "Harmonisation et mise en valeur des couleurs pour un rendu cohérent et cinématographique." },
        { id: "music", label: "Musique libre de droits", delta: 10 },
        { id: "branding", label: "Intro et outro avec votre logo", delta: 20 },
        { id: "thumb", label: "Miniature YouTube accrocheuse", delta: 12 },
      ],
    },
    {
      id: "formats",
      label: "Formats livrés",
      kind: "multi",
      options: [
        { id: "wide", label: "Paysage (16:9, YouTube)", delta: 0 },
        { id: "vertical", label: "Vertical (9:16, Story / Reel / TikTok)", delta: 15, help: "Version recadrée et réorganisée pour le plein écran du téléphone." },
        { id: "square", label: "Carré (1:1)", delta: 12 },
      ],
    },
  ],

  // 5, Motion Design / Animation 2D-3D
  5: [
    {
      id: "style",
      label: "Type d'animation",
      kind: "single",
      intro: "La 2D est plus rapide à produire, la 3D offre plus de volume et de réalisme. Nous vous conseillons selon votre message et votre budget.",
      options: [
        { id: "2d", label: "Motion design 2D (formes, textes, icônes)", delta: 0 },
        { id: "2dplus", label: "2D élaborée (personnages, scènes illustrées)", delta: 60 },
        { id: "3d", label: "3D (objets et scènes en volume)", delta: 120, help: "Modélisation et animation d'éléments en trois dimensions, pour présenter un produit ou donner de l'impact à une scène." },
      ],
    },
    {
      id: "duration",
      label: "Durée",
      kind: "single",
      options: [
        { id: "s15", label: "Jusqu'à 15 secondes", delta: 0 },
        { id: "s30", label: "Jusqu'à 30 secondes", delta: 45 },
        { id: "s60", label: "Jusqu'à 60 secondes", delta: 100 },
      ],
    },
    {
      id: "extras",
      label: "Options",
      kind: "multi",
      options: [
        { id: "script", label: "Écriture du scénario et du storyboard", delta: 35, help: "Nous découpons votre message en scènes et vous montrons un storyboard avant de produire l'animation." },
        { id: "sound", label: "Habillage sonore et synchro musique", delta: 20 },
        { id: "subs", label: "Sous-titres animés", delta: 15 },
        { id: "logo", label: "Intégration de votre identité (logo, couleurs, polices)", delta: 0 },
      ],
    },
    {
      id: "formats",
      label: "Formats livrés",
      kind: "multi",
      options: [
        { id: "wide", label: "Paysage (16:9)", delta: 0 },
        { id: "vertical", label: "Vertical (9:16)", delta: 12 },
        { id: "square", label: "Carré (1:1)", delta: 12 },
      ],
    },
  ],

  // 6, Packaging Design
  6: [
    {
      id: "support",
      label: "Type d'emballage",
      kind: "single",
      intro: "Le pack de base comprend l'étiquette, le code-barres, un mockup et un flyer. Une boîte demande en plus un plan technique de découpe.",
      options: [
        { id: "label", label: "Étiquette sur contenant (bouteille, pot, sachet)", delta: 0 },
        { id: "box", label: "Boîte ou carton (avec plan de découpe)", delta: 40, help: "Création du dessin à plat de la boîte (dieline) et mise en page du design sur chaque face." },
        { id: "both", label: "Étiquette et boîte assorties", delta: 65 },
      ],
    },
    {
      id: "range",
      label: "Gamme de produits",
      kind: "single",
      intro: "Si vous avez plusieurs saveurs, parfums ou tailles, nous déclinons le design pour que la gamme reste cohérente en rayon.",
      options: [
        { id: "one", label: "1 produit", delta: 0 },
        { id: "three", label: "Jusqu'à 3 variantes (saveurs, parfums)", delta: 30 },
        { id: "six", label: "Jusqu'à 6 variantes", delta: 60 },
      ],
    },
    {
      id: "extras",
      label: "Options",
      kind: "multi",
      options: [
        { id: "dieline", label: "Plan technique pour l'imprimeur", delta: 25, help: "Fichier prêt pour l'imprimeur avec repères de coupe, pliage et zones de sécurité." },
        { id: "mockup", label: "Mockup 3D supplémentaire", delta: 12 },
        { id: "legal", label: "Mise en page des mentions légales et nutritionnelles", delta: 15, help: "Nous intégrons proprement les textes obligatoires (ingrédients, poids, conservation) que vous nous fournissez." },
        { id: "barcode", label: "Génération d'un code-barres supplémentaire", delta: 8 },
      ],
    },
    FILES_GROUP,
    LANGUAGES_GROUP,
  ],

  // 7, Étiquette Simple
  7: [
    {
      id: "shape",
      label: "Forme de l'étiquette",
      kind: "single",
      options: [
        { id: "std", label: "Rectangle ou carré standard", delta: 0 },
        { id: "round", label: "Ronde ou ovale", delta: 5 },
        { id: "custom", label: "Forme découpée sur mesure", delta: 10, help: "La forme de l'étiquette suit le design (par exemple le contour d'un fruit). La découpe se fait chez l'imprimeur." },
      ],
    },
    {
      id: "variants",
      label: "Variantes",
      kind: "single",
      intro: "Une variante est une version de l'étiquette pour un autre goût, parfum ou format, avec le même style.",
      options: [
        { id: "one", label: "1 étiquette", delta: 0 },
        { id: "three", label: "3 variantes", delta: 15 },
        { id: "five", label: "5 variantes", delta: 25 },
      ],
    },
    {
      id: "extras",
      label: "Options",
      kind: "multi",
      options: [
        { id: "barcode", label: "Code-barres intégré", delta: 8 },
        { id: "mockup", label: "Mockup de présentation", delta: 10 },
        { id: "legal", label: "Mise en page des mentions obligatoires", delta: 10 },
      ],
    },
    FILES_GROUP,
  ],

  // 9, Flyers & Affiches
  9: [
    {
      id: "format",
      label: "Format",
      kind: "single",
      intro: "Choisissez le format selon l'endroit où le visuel sera affiché ou distribué. Un grand format demande un fichier plus détaillé.",
      options: [
        { id: "small", label: "Flyer A5 ou A6", delta: 0 },
        { id: "a4", label: "Affiche A4 ou A3", delta: 5 },
        { id: "large", label: "Grande affiche A2 ou A1", delta: 12 },
      ],
    },
    {
      id: "sides",
      label: "Faces",
      kind: "single",
      options: [
        { id: "front", label: "Recto seul", delta: 0 },
        { id: "both", label: "Recto et verso", delta: 10 },
      ],
    },
    {
      id: "versions",
      label: "Nombre de versions",
      kind: "single",
      intro: "Une variante permet de tester deux messages ou de s'adresser à deux publics avec le même style.",
      options: [
        { id: "one", label: "1 design", delta: 0 },
        { id: "two", label: "2 variantes (A et B)", delta: 15 },
        { id: "three", label: "3 déclinaisons", delta: 25 },
      ],
    },
    {
      id: "extras",
      label: "Options",
      kind: "multi",
      options: [
        { id: "social", label: "Déclinaison Story et post carré", delta: 10, help: "Le même visuel adapté aux formats des réseaux sociaux (9:16 et 1:1)." },
        { id: "qr", label: "QR code intégré (site, WhatsApp, menu)", delta: 5 },
        { id: "bleed", label: "Préparation pour imprimeur (CMJN, fonds perdus)", delta: 5 },
      ],
    },
    COPY_GROUP,
    LANGUAGES_GROUP,
    FILES_GROUP,
  ],

  // 10, Affiche Réseaux Sociaux
  10: [
    {
      id: "formats",
      label: "Formats",
      kind: "multi",
      intro: "Chaque réseau a ses dimensions. Sélectionnez les formats dont vous avez besoin, nous adaptons le même visuel.",
      options: [
        { id: "square", label: "Post carré (1:1)", delta: 0 },
        { id: "story", label: "Story / Reel (9:16)", delta: 8 },
        { id: "wide", label: "Paysage ou miniature YouTube (16:9)", delta: 8 },
        { id: "cover", label: "Couverture Facebook ou LinkedIn", delta: 8 },
      ],
    },
    {
      id: "series",
      label: "Nombre de visuels",
      kind: "single",
      intro: "Une série garde le même style pour que votre page paraisse cohérente et reconnaissable.",
      options: [
        { id: "one", label: "1 visuel", delta: 0 },
        { id: "three", label: "Série de 3 visuels cohérents", delta: 20 },
        { id: "six", label: "Série de 6 visuels cohérents", delta: 40 },
      ],
    },
    {
      id: "extras",
      label: "Options",
      kind: "multi",
      options: [
        { id: "carousel", label: "Carrousel (jusqu'à 5 diapositives)", delta: 25, help: "Un post à faire défiler, très efficace pour expliquer une offre ou donner des conseils." },
        { id: "gif", label: "Version animée simple (GIF ou MP4)", delta: 20 },
        { id: "highlights", label: "Icônes de stories à la une", delta: 12 },
      ],
    },
    COPY_GROUP,
    LANGUAGES_GROUP,
  ],

  // 12, Grand Format (Banner / Roll-up)
  12: [
    {
      id: "support",
      label: "Support",
      kind: "single",
      intro: "Le support détermine la taille et la mise en page. Dites-nous où le visuel sera installé, nous adaptons la lisibilité à la distance de lecture.",
      options: [
        { id: "banner", label: "Bannière ou bâche", delta: 0 },
        { id: "rollup", label: "Roll-up (environ 85 x 200 cm)", delta: 0 },
        { id: "flag", label: "Kakemono ou drapeau publicitaire", delta: 10 },
        { id: "backdrop", label: "Backdrop ou mur d'image événementiel", delta: 25, help: "Grand panneau pour photos et prises de parole (mariages, conférences, lancements) avec logos et partenaires." },
      ],
    },
    {
      id: "extras",
      label: "Options",
      kind: "multi",
      options: [
        { id: "sizes", label: "Plusieurs formats du même visuel", delta: 20, help: "Par exemple une bannière, un roll-up et une affiche avec le même design." },
        { id: "prepress", label: "Préparation du fichier pour l'imprimeur (CMJN, fonds perdus)", delta: 10 },
        { id: "mockup", label: "Mockup de présentation sur le lieu", delta: 10 },
        { id: "sponsors", label: "Bandeau partenaires et sponsors", delta: 12 },
      ],
    },
    FILES_GROUP,
    LANGUAGES_GROUP,
  ],

  // 13, Infographie
  13: [
    {
      id: "size",
      label: "Quantité d'informations",
      kind: "single",
      intro: "Comptez les blocs d'information (une statistique, une étape ou un conseil = un bloc). Plus il y en a, plus la mise en page est longue.",
      options: [
        { id: "small", label: "Jusqu'à 5 blocs", delta: 0 },
        { id: "mid", label: "De 6 à 10 blocs", delta: 30 },
        { id: "long", label: "Long format (12 blocs ou plus)", delta: 60 },
      ],
    },
    {
      id: "extras",
      label: "Options",
      kind: "multi",
      options: [
        { id: "icons", label: "Icônes et illustrations sur mesure", delta: 25, help: "Au lieu d'icônes génériques, nous dessinons des pictogrammes cohérents avec votre marque." },
        { id: "charts", label: "Graphiques et schémas détaillés", delta: 20 },
        { id: "anim", label: "Version animée", delta: 40 },
        { id: "research", label: "Structuration et synthèse de vos données", delta: 20, help: "Vous nous donnez les informations brutes, nous les organisons et les résumons pour qu'elles soient claires." },
        { id: "carousel", label: "Version carrousel pour réseaux", delta: 20 },
      ],
    },
    FILES_GROUP,
    LANGUAGES_GROUP,
  ],

  // 14, Présentation PowerPoint
  14: [
    {
      id: "slides",
      label: "Nombre de diapositives",
      kind: "single",
      options: [
        { id: "s10", label: "Jusqu'à 10 diapositives", delta: 0 },
        { id: "s20", label: "De 11 à 20 diapositives", delta: 40 },
        { id: "s35", label: "De 21 à 35 diapositives", delta: 80 },
      ],
    },
    {
      id: "extras",
      label: "Options",
      kind: "multi",
      intro: "Ces options rendent la présentation plus impactante et plus facile à réutiliser.",
      options: [
        { id: "template", label: "Modèle réutilisable (masques et mises en page)", delta: 35, help: "Vous pourrez créer vous-même de nouvelles diapositives dans le même style, sans tout refaire." },
        { id: "anim", label: "Animations et transitions", delta: 20 },
        { id: "charts", label: "Graphiques et infographies", delta: 25 },
        { id: "content", label: "Structuration du contenu (plan et messages clés)", delta: 30, help: "Nous organisons votre propos en un récit clair : problème, solution, preuves, appel à l'action." },
        { id: "pdf", label: "Version PDF et version imprimable", delta: 5 },
      ],
    },
    LANGUAGES_GROUP,
  ],

  // 15, Carte de Visite
  15: [
    {
      id: "sides",
      label: "Faces",
      kind: "single",
      options: [
        { id: "front", label: "Recto seul", delta: 0 },
        { id: "both", label: "Recto et verso", delta: 8 },
      ],
    },
    {
      id: "people",
      label: "Nombre de personnes",
      kind: "single",
      intro: "Si plusieurs membres de votre équipe ont besoin d'une carte, nous déclinons le même design avec leurs coordonnées.",
      options: [
        { id: "one", label: "1 personne", delta: 0 },
        { id: "three", label: "Jusqu'à 3 personnes", delta: 12 },
        { id: "six", label: "Jusqu'à 6 personnes", delta: 25 },
      ],
    },
    {
      id: "extras",
      label: "Options",
      kind: "multi",
      options: [
        { id: "finish", label: "Préparation pour finitions (vernis sélectif, dorure, coins arrondis)", delta: 10, help: "Nous préparons les calques spéciaux demandés par l'imprimeur pour ces finitions premium." },
        { id: "qr", label: "QR code (contact ou site)", delta: 5 },
        { id: "signature", label: "Signature e-mail assortie", delta: 12 },
      ],
    },
    FILES_GROUP,
  ],

  // 16, Pack Lancement Express
  16: [
    {
      id: "sections",
      label: "Nombre de sections",
      kind: "single",
      intro: "Une section est un bloc de la page (présentation, services, témoignages, contact, etc.).",
      options: [
        { id: "five", label: "Jusqu'à 5 sections", delta: 0 },
        { id: "eight", label: "De 6 à 8 sections", delta: 90 },
      ],
    },
    {
      id: "extras",
      label: "Fonctionnalités et services",
      kind: "multi",
      intro: "Ajoutez ce dont votre site a besoin pour convaincre et convertir.",
      options: [
        { id: "copy", label: "Rédaction des textes du site", delta: 80, help: "Nous rédigeons les textes de chaque section à partir de votre brief, pour un message clair et orienté client." },
        { id: "booking", label: "Formulaire de réservation ou de commande", delta: 40 },
        { id: "bilingual", label: "Version bilingue (2 langues)", delta: 90 },
        { id: "seo", label: "Optimisation de base pour Google (SEO)", delta: 50, help: "Titres, descriptions, structure et vitesse optimisés pour que votre site soit mieux référencé." },
        { id: "social", label: "Intégration WhatsApp et réseaux sociaux", delta: 15 },
        { id: "training", label: "Séance de prise en main (1 heure)", delta: 30, help: "Nous vous montrons comment modifier votre contenu et suivre vos visiteurs." },
      ],
    },
  ],

  // 18, Flyer Événementiel (Festival, Concert…)
  18: [
    {
      id: "pack",
      label: "Contenu du pack",
      kind: "multi",
      intro: "Le flyer principal est inclus. Ajoutez les supports dont vous avez besoin pour promouvoir l'événement partout.",
      options: [
        { id: "ticket", label: "Design du ticket / billet", delta: 20 },
        { id: "story", label: "Déclinaison Story (9:16)", delta: 12 },
        { id: "post", label: "Déclinaison Post carré (1:1)", delta: 12 },
        { id: "cover", label: "Couverture d'événement (Facebook)", delta: 10 },
        { id: "banner", label: "Bannière web / grand format", delta: 15 },
        { id: "teaser", label: "Série de 3 visuels teasing (line-up, date, lieu)", delta: 25, help: "Trois visuels à publier avant l'événement pour faire monter l'attente." },
        { id: "a3", label: "Affiche A3 prête à imprimer", delta: 8 },
      ],
    },
    LANGUAGES_GROUP,
  ],

  // 29, Animation de Flyer Événementiel (concert, DJ, festival)
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
      intro: "Ces effets donnent vie à votre flyer. Plus il y en a, plus la vidéo est spectaculaire.",
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
  ],

  // 19, Design de T-shirt
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
      intro: "Un même design peut être décliné sur des t-shirts de couleurs différentes (clair, foncé) en ajustant les teintes pour rester lisible.",
      options: [
        { id: "one", label: "1 déclinaison", delta: 0 },
        { id: "three", label: "3 déclinaisons", delta: 12 },
        { id: "five", label: "5 déclinaisons", delta: 20 },
      ],
    },
    {
      id: "extras",
      label: "Options",
      kind: "multi",
      options: [
        { id: "technique", label: "Séparation des couleurs pour sérigraphie", delta: 12, help: "Préparation technique : chaque couleur est livrée sur un calque séparé, nécessaire pour la sérigraphie." },
        { id: "mockup", label: "Mockup du t-shirt porté", delta: 10 },
        { id: "size", label: "Plusieurs tailles de motif (enfant, adulte)", delta: 8 },
      ],
    },
    FILES_GROUP,
  ],

  // 20, Design de Cover Téléphone
  20: [
    {
      id: "models",
      label: "Modèles de téléphone",
      kind: "single",
      options: [
        { id: "one", label: "1 modèle", delta: 0 },
        { id: "three", label: "Jusqu'à 3 modèles", delta: 10 },
        { id: "six", label: "Jusqu'à 6 modèles", delta: 22 },
      ],
    },
    {
      id: "extras",
      label: "Options",
      kind: "multi",
      options: [
        { id: "mockup", label: "Mockup de la coque", delta: 8 },
        { id: "series", label: "Série de 3 designs assortis", delta: 30, help: "Trois visuels dans le même univers pour proposer une petite collection." },
      ],
    },
    SOURCE_GROUP,
  ],

  // 21, Carte d'Invitation & Faire-part
  21: [
    {
      id: "kind",
      label: "Type de carte",
      kind: "single",
      options: [
        { id: "single", label: "Recto seul", delta: 0 },
        { id: "double", label: "Recto / verso", delta: 12 },
        { id: "suite", label: "Suite complète (invitation + RSVP + menu)", delta: 30, help: "Un ensemble assorti : l'invitation, la carte-réponse et un menu ou programme, avec le même style." },
      ],
    },
    {
      id: "extras",
      label: "Options",
      kind: "multi",
      options: [
        { id: "envelope", label: "Design de l'enveloppe", delta: 10 },
        { id: "digital", label: "Version animée à envoyer (WhatsApp)", delta: 18 },
        { id: "seating", label: "Plan de table et cartons de placement", delta: 20 },
        { id: "thanks", label: "Carte de remerciement assortie", delta: 10 },
      ],
    },
    LANGUAGES_GROUP,
    FILES_GROUP,
  ],

  // 22, Vectorisation de Logo
  22: [
    {
      id: "complexity",
      label: "Complexité du logo",
      kind: "single",
      intro: "Un logo simple (formes et texte) se vectorise vite. Un logo détaillé (dégradés, illustration, textures) demande plus de précision.",
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
        { id: "svg", label: "SVG", delta: 0, help: "Format vectoriel pour le web, utilisable à toutes les tailles sans perte de qualité." },
        { id: "ai", label: "AI / EPS", delta: 6, help: "Formats professionnels pour les imprimeurs et les logiciels de design." },
        { id: "pdf", label: "PDF vectoriel", delta: 4 },
      ],
    },
    {
      id: "extras",
      label: "Options",
      kind: "multi",
      options: [
        { id: "mono", label: "Version monochrome et fond sombre", delta: 10 },
        { id: "fonts", label: "Identification des polices et des couleurs", delta: 8, help: "Nous retrouvons les polices d'origine et les codes couleurs pour que vous puissiez rester cohérent." },
        { id: "refresh", label: "Léger rafraîchissement (alignements, harmonisation)", delta: 15 },
      ],
    },
  ],

  // 23, Retouche & Manipulation Photo
  23: [
    {
      id: "level",
      label: "Niveau de retouche",
      kind: "single",
      intro: "Choisissez selon le résultat attendu : un simple nettoyage, une retouche poussée ou une création à partir de plusieurs images.",
      options: [
        { id: "basic", label: "Basique (lumière, couleurs, nettoyage)", delta: 0 },
        { id: "advanced", label: "Avancée (détourage, peau, montage)", delta: 20 },
        { id: "creative", label: "Manipulation créative (compositing)", delta: 45, help: "Assemblage de plusieurs images en une scène unique et réaliste (décors, effets, ambiance)." },
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
    {
      id: "extras",
      label: "Compléments",
      kind: "multi",
      options: [
        { id: "background", label: "Changement ou suppression de fond", delta: 10 },
        { id: "skin", label: "Retouche de peau professionnelle", delta: 12 },
        { id: "restore", label: "Restauration de photo ancienne ou abîmée", delta: 25, help: "Réparation des rayures, taches et déchirures, avec amélioration de la netteté." },
        { id: "colorize", label: "Colorisation d'une photo noir et blanc", delta: 25 },
        { id: "upscale", label: "Agrandissement haute qualité", delta: 10 },
      ],
    },
  ],

  // 24, Profil Réseaux Sociaux Pro
  24: [
    {
      id: "platforms",
      label: "Plateformes",
      kind: "multi",
      intro: "Chaque plateforme a ses tailles de photo de profil et de couverture. Sélectionnez celles où vous êtes présent.",
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
      intro: "Un modèle est une mise en page que vous réutilisez en changeant simplement le texte et la photo.",
      options: [
        { id: "none", label: "Aucun", delta: 0 },
        { id: "three", label: "3 modèles réutilisables", delta: 25 },
        { id: "six", label: "6 modèles réutilisables", delta: 45 },
      ],
    },
    {
      id: "extras",
      label: "Options",
      kind: "multi",
      options: [
        { id: "highlights", label: "Icônes de stories à la une (5 icônes)", delta: 15 },
        { id: "bio", label: "Rédaction de la bio et de la description", delta: 10 },
        { id: "grid", label: "Plan de grille Instagram cohérent (9 visuels)", delta: 40, help: "Une proposition d'organisation visuelle de vos neuf premières publications pour une page harmonieuse." },
      ],
    },
  ],

  // 25, Mockups Produit
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
    {
      id: "extras",
      label: "Options",
      kind: "multi",
      options: [
        { id: "animated", label: "Mockup animé (vidéo courte)", delta: 30, help: "Votre produit présenté en mouvement, idéal pour les réseaux sociaux." },
        { id: "angles", label: "Plusieurs angles du même produit", delta: 15 },
        { id: "bg", label: "Fond ou décor personnalisé", delta: 10 },
      ],
    },
    SOURCE_GROUP,
  ],

  // 26, Menu (Restaurant / Bar)
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
        { id: "qr", label: "Version QR / menu numérique", delta: 15, help: "Une version pour téléphone, accessible par QR code posé sur les tables. Elle se met à jour plus facilement qu'un menu imprimé." },
        { id: "board", label: "Déclinaison affiche / ardoise", delta: 12 },
        { id: "icons", label: "Icônes et illustrations de plats", delta: 20 },
        { id: "update", label: "Une mise à jour de prix ou de plats incluse (3 mois)", delta: 8 },
      ],
    },
    LANGUAGES_GROUP,
    FILES_GROUP,
  ],

  // 27, CV / Résumé Professionnel
  27: [
    {
      id: "extras",
      label: "Options",
      kind: "multi",
      options: [
        { id: "cover", label: "Lettre de motivation assortie", delta: 12 },
        { id: "linkedin", label: "Bannière LinkedIn assortie", delta: 10 },
        { id: "editable", label: "Version modifiable (Word / Canva)", delta: 8 },
        { id: "bilingual", label: "Version dans une deuxième langue", delta: 15 },
        { id: "portfolio", label: "Page portfolio d'une page", delta: 25 },
        { id: "rewrite", label: "Reformulation de votre parcours", delta: 15, help: "Nous reformulons vos expériences pour mettre en avant vos résultats plutôt que vos tâches." },
      ],
    },
  ],

  // 28, Stickers & Autocollants
  28: [
    {
      id: "count",
      label: "Nombre de modèles",
      kind: "single",
      options: [
        { id: "one", label: "1 modèle", delta: 0 },
        { id: "pack", label: "Planche de 5 modèles", delta: 20 },
        { id: "big", label: "Planche de 10 modèles", delta: 35 },
      ],
    },
    {
      id: "cut",
      label: "Découpe",
      kind: "single",
      intro: "La découpe sur mesure suit le contour du dessin. Elle demande un tracé de découpe dédié pour l'imprimeur.",
      options: [
        { id: "standard", label: "Formes standard", delta: 0 },
        { id: "diecut", label: "Découpe sur mesure (die-cut)", delta: 10 },
      ],
    },
    {
      id: "extras",
      label: "Options",
      kind: "multi",
      options: [
        { id: "mascot", label: "Illustration ou mascotte sur mesure", delta: 30 },
        { id: "mockup", label: "Mockup de présentation", delta: 8 },
      ],
    },
  ],
}

// Generic fallback for any static service without a bespoke entry.
export const GENERIC_OPTIONS: ServiceOptionGroup[] = [FILES_GROUP, SOURCE_GROUP, COPY_GROUP, LANGUAGES_GROUP]

// Generic fallback for video/motion services (no print PDF, formats & duration
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
      { id: "vertical", label: "Vertical (9:16, Story / Reel / TikTok)", delta: 0 },
      { id: "square", label: "Carré (1:1)", delta: 10 },
      { id: "wide", label: "Paysage (16:9, YouTube)", delta: 10 },
    ],
  },
]

/** Option groups for a service: its own groups, then revisions, usage rights and delay. */
export function optionsFor(id: number, type?: "static" | "video"): ServiceOptionGroup[] {
  const own = SERVICE_OPTIONS[id] ?? (type === "video" ? GENERIC_VIDEO_OPTIONS : GENERIC_OPTIONS)
  return [...own.filter((g) => g.id !== "rush"), REVISIONS_GROUP, USAGE_GROUP, RUSH_GROUP]
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
