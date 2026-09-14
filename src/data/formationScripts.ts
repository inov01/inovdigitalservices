// Scripts de formation & conférence préenregistrés pour l'espace admin.
// Chaque script est un plan de séance prêt à animer.
//
// Structure imposée :
//  • Chaque séance dure 10 à 25 min.
//  • L'INTRODUCTION annonce d'abord le contenu de la formation, puis explique
//    l'intérêt de la suivre ; la formation démarre ensuite sur ce qui a été annoncé.
//  • Chaque formation est divisée en au moins 4 séances.
//  • Les formations payantes comptent entre 4 et 8 séances.
//  • Le prix est adapté au contenu (durée, niveau, profondeur).

export type ScriptCategory = "gratuite" | "payante"
export type ScriptFormat = "cours" | "conference"
export type ScriptLevel = "Débutant" | "Intermédiaire" | "Avancé"

export interface ScriptSession {
  title: string
  /** Durée de la séance, toujours entre 10 et 25 min. */
  duration: string
  points: string[]
}

export interface FormationScript {
  id: string
  title: string
  category: ScriptCategory
  format: ScriptFormat
  discipline: string
  audience: string
  /** Durée totale indicative (somme des séances). */
  duration: string
  level: ScriptLevel
  /** Prix affiché — uniquement pour les formations payantes. */
  price?: string
  hook: string
  /** Introduction : ce qui est annoncé au public avant de démarrer. */
  intro: {
    /** Le contenu annoncé (ce que la formation va couvrir, séance par séance). */
    announce: string[]
    /** L'intérêt : pourquoi suivre cette formation. */
    interest: string[]
  }
  objectives: string[]
  /** Les séances (≥ 4 ; payantes : 4 à 8), chacune de 10 à 25 min. */
  sessions: ScriptSession[]
  cta: string
}

export const DISCIPLINES = [
  "Communication visuelle",
  "Marketing digital",
  "Graphic design",
  "Brand design",
  "Motion design",
  "Animation de logo",
] as const

export const FORMATION_SCRIPTS: FormationScript[] = [
  // ─────────────────────────── GRATUITES ───────────────────────────
  {
    id: "gv-comm-visuelle-cest-quoi",
    title: "La communication visuelle : c'est quoi et pourquoi c'est vital",
    category: "gratuite",
    format: "conference",
    discipline: "Communication visuelle",
    audience: "Clients & prospects",
    duration: "~1 h (4 séances de 10-25 min)",
    level: "Débutant",
    hook: "En 3 secondes, un client décide s'il vous fait confiance — et il décide avec ses yeux, pas avec ses oreilles. Aujourd'hui je vous montre comment gagner ces 3 secondes.",
    intro: {
      announce: [
        "Séance 1 : ce qu'est vraiment la communication visuelle (et ce qu'elle n'est pas).",
        "Séance 2 : pourquoi elle influence directement la confiance et les ventes.",
        "Séance 3 : les 4 bases à connaître (cohérence, lisibilité, hiérarchie, émotion).",
        "Séance 4 : 3 réflexes simples à appliquer dès demain.",
      ],
      interest: [
        "À la fin, vous saurez pourquoi certaines marques « inspirent confiance » et d'autres non.",
        "Vous repartez avec des réflexes gratuits qui améliorent vos visuels sans logiciel compliqué.",
        "C'est la base indispensable avant de vouloir vendre sur les réseaux.",
      ],
    },
    objectives: [
      "Comprendre ce qu'est réellement la communication visuelle (et ce qu'elle n'est pas)",
      "Saisir pourquoi elle influence directement les ventes et la confiance",
      "Repartir avec 3 réflexes simples à appliquer dès demain",
    ],
    sessions: [
      {
        title: "Séance 1 — Qu'est-ce que la communication visuelle ?",
        duration: "15 min",
        points: [
          "Définition simple : transmettre un message, une émotion et une promesse par l'image plutôt que par le texte seul.",
          "Ce n'est pas « faire joli » : c'est faire comprendre et faire agir.",
          "Exemples du quotidien : un logo, une couleur, une affiche, une story Instagram, un menu de restaurant.",
          "Le cerveau traite une image ~60 000 fois plus vite qu'un texte : votre visuel parle avant vous.",
        ],
      },
      {
        title: "Séance 2 — Pourquoi c'est vital pour votre business",
        duration: "15 min",
        points: [
          "La cohérence visuelle crée la confiance : une marque qui « se tient » paraît sérieuse et fiable.",
          "Elle vous différencie : dans un fil d'actualité saturé, l'œil s'arrête sur ce qui est clair et reconnaissable.",
          "Elle augmente la valeur perçue : un même produit se vend plus cher avec une présentation soignée.",
          "Elle fait gagner du temps : un bon visuel explique en un instant ce qu'un paragraphe met à dire.",
        ],
      },
      {
        title: "Séance 3 — Les 4 bases à connaître",
        duration: "18 min",
        points: [
          "La cohérence : mêmes couleurs, mêmes polices, même ton partout (logo, réseaux, factures).",
          "La lisibilité : contraste suffisant, une seule idée par visuel, de l'espace pour respirer.",
          "La hiérarchie : ce qui est le plus important doit être le plus visible (taille, couleur, position).",
          "L'émotion : la couleur et l'image doivent correspondre à ce que le client doit ressentir.",
        ],
      },
      {
        title: "Séance 4 — 3 réflexes à appliquer dès demain",
        duration: "12 min",
        points: [
          "Choisissez 2 couleurs + 1 police et tenez-vous-y sur TOUTES vos publications.",
          "Avant de publier, demandez-vous : « Est-ce clair en 2 secondes ? »",
          "Réutilisez toujours le même style de gabarit pour être reconnaissable.",
        ],
      },
    ],
    cta: "Vous voulez une identité visuelle claire et cohérente sans y passer des heures ? INOV Digital Services le fait pour vous. Devis gratuit et sans engagement 👉 inovdigitalservices.com",
  },
  {
    id: "gv-vendre-reseaux-bases",
    title: "Vendre sur les réseaux sociaux : les bases visuelles qui convertissent",
    category: "gratuite",
    format: "cours",
    discipline: "Communication visuelle",
    audience: "Commerçants & entrepreneurs",
    duration: "~1 h 20 (5 séances de 10-25 min)",
    level: "Débutant",
    hook: "Poster ne suffit pas. La différence entre un post qui vend et un post ignoré tient à quelques règles visuelles simples que personne ne vous a expliquées.",
    intro: {
      announce: [
        "Séance 1 : le « scroll-stop » — capter l'attention en une seule image.",
        "Séance 2 : l'anatomie d'un post qui vend.",
        "Séance 3 : les bases visuelles à respecter à chaque publication.",
        "Séance 4 : gagner du temps avec des gabarits réutilisables.",
        "Séance 5 : les fondations du marketing digital pour aller plus loin.",
      ],
      interest: [
        "Vous arrêterez de publier au hasard et commencerez à publier pour vendre.",
        "Vous saurez construire un post qui attire l'œil ET déclenche un message ou un achat.",
        "Vous gagnerez des heures grâce à une méthode de gabarits simple.",
      ],
    },
    objectives: [
      "Savoir construire un post qui attire l'œil et donne envie d'agir",
      "Comprendre le rôle de l'accroche visuelle et du texte à l'écran",
      "Créer un mini-gabarit réutilisable pour gagner du temps",
    ],
    sessions: [
      {
        title: "Séance 1 — Le scroll-stop : capter l'attention en 1 image",
        duration: "14 min",
        points: [
          "La première image doit stopper le pouce : contraste fort, visage ou produit net, texte court et gros.",
          "Une seule idée par visuel : trop d'infos = zéro info.",
          "Les 3 premiers mots comptent plus que tout le reste de la légende.",
        ],
      },
      {
        title: "Séance 2 — Anatomie d'un post qui vend",
        duration: "18 min",
        points: [
          "Accroche (le problème ou le désir du client) → Preuve (photo, avis, résultat) → Offre → Appel à l'action.",
          "Montrez le bénéfice, pas seulement le produit : « cheveux impeccables » plutôt que « nouveau shampoing ».",
          "Un CTA clair et unique : « Écrivez-nous en DM », « Commandez via WhatsApp ».",
        ],
      },
      {
        title: "Séance 3 — Les bases visuelles à respecter",
        duration: "16 min",
        points: [
          "Cohérence de marque : mêmes couleurs et police que votre logo.",
          "Photos lumineuses et cadrées : la lumière naturelle est votre meilleure amie.",
          "Texte lisible sur mobile : gros, contrasté, peu de mots.",
          "Format adapté : vertical (4:5 ou 9:16) pour occuper l'écran.",
        ],
      },
      {
        title: "Séance 4 — Gagner du temps avec un gabarit",
        duration: "12 min",
        points: [
          "Créez 3 modèles : promo, témoignage client, conseil/astuce.",
          "Gardez la même structure et changez juste le contenu.",
          "Planifiez à l'avance : la régularité bat la perfection.",
        ],
      },
      {
        title: "Séance 5 — Introduction au marketing digital (les fondations)",
        duration: "20 min",
        points: [
          "Connaître sa cible : à qui je parle, quel problème je résous.",
          "Le tunnel simple : on vous découvre → on vous suit → on vous fait confiance → on achète.",
          "Mesurer ce qui compte : messages reçus, ventes, pas seulement les « likes ».",
        ],
      },
    ],
    cta: "Vous voulez des gabarits sur-mesure à votre image et une stratégie de contenu qui vend ? Parlons-en 👉 inovdigitalservices.com",
  },
  {
    id: "gm-intro-marketing-digital",
    title: "Introduction au marketing digital pour débutants",
    category: "gratuite",
    format: "cours",
    discipline: "Marketing digital",
    audience: "Entrepreneurs débutants",
    duration: "~1 h (4 séances de 10-25 min)",
    level: "Débutant",
    hook: "Le marketing digital n'est pas réservé aux grandes marques ni aux gros budgets. Avec une méthode claire, un téléphone suffit pour commencer.",
    intro: {
      announce: [
        "Séance 1 : ce qu'est vraiment le marketing digital.",
        "Séance 2 : les 4 piliers à connaître.",
        "Séance 3 : par où commencer avec peu de moyens.",
        "Séance 4 : les erreurs de débutant à éviter.",
      ],
      interest: [
        "Vous aurez une carte claire du marketing digital, sans jargon.",
        "Vous saurez exactement par quoi commencer dès cette semaine, avec juste un téléphone.",
        "Vous éviterez les erreurs qui font perdre du temps et de l'argent.",
      ],
    },
    objectives: [
      "Comprendre les grands piliers du marketing digital",
      "Savoir par où commencer avec peu de moyens",
      "Éviter les erreurs les plus fréquentes des débutants",
    ],
    sessions: [
      {
        title: "Séance 1 — C'est quoi le marketing digital ?",
        duration: "13 min",
        points: [
          "Attirer, convaincre et fidéliser des clients grâce aux outils en ligne.",
          "Les canaux : réseaux sociaux, WhatsApp Business, e-mail, site web, publicité.",
          "L'objectif final n'est pas la visibilité : c'est la vente et la relation client.",
        ],
      },
      {
        title: "Séance 2 — Les 4 piliers à connaître",
        duration: "16 min",
        points: [
          "Le contenu : ce que vous publiez pour être utile et crédible.",
          "L'audience : à qui vous parlez et où elle se trouve.",
          "La conversion : transformer l'intérêt en message, puis en vente.",
          "La fidélisation : faire revenir et faire recommander.",
        ],
      },
      {
        title: "Séance 3 — Par où commencer avec peu",
        duration: "15 min",
        points: [
          "Choisir UN réseau où est votre client plutôt que d'être partout.",
          "Publier régulièrement (mieux vaut 3 posts utiles par semaine que 10 au hasard).",
          "Utiliser WhatsApp Business : catalogue, réponses rapides, message d'accueil.",
        ],
      },
      {
        title: "Séance 4 — Les erreurs à éviter",
        duration: "12 min",
        points: [
          "Parler de soi au lieu de parler du problème du client.",
          "Copier les concurrents sans stratégie.",
          "Abandonner après 2 semaines : les résultats demandent de la constance.",
        ],
      },
    ],
    cta: "Prêt à passer à la vitesse supérieure ? Notre formation marketing digital avancée et notre accompagnement sont faits pour vous 👉 inovdigitalservices.com",
  },

  // ─────────────────────────── PAYANTES ───────────────────────────
  {
    id: "pm-marketing-digital-avance",
    title: "Marketing digital avancé : stratégie, contenu & conversion",
    category: "payante",
    format: "cours",
    discipline: "Marketing digital",
    audience: "Entrepreneurs & responsables marketing",
    duration: "~2 h 15 (6 séances de 10-25 min)",
    level: "Intermédiaire",
    price: "79 $ US",
    hook: "Publier au hasard, c'est prier pour vendre. Une stratégie, c'est décider de vendre. Dans cette formation, on construit votre machine à clients.",
    intro: {
      announce: [
        "Séance 1 : stratégie & positionnement (persona, offre, objectifs).",
        "Séance 2 : le tunnel de conversion, étape par étape.",
        "Séance 3 : créer du contenu qui convertit.",
        "Séance 4 : le copywriting et les preuves sociales.",
        "Séance 5 : publicité & acquisition payante.",
        "Séance 6 : mesure, KPIs et optimisation.",
      ],
      interest: [
        "Vous passerez de « je poste » à « je pilote un système de vente ».",
        "Vous saurez transformer des inconnus en clients grâce à un tunnel clair.",
        "Vous lirez enfin vos chiffres pour décider, au lieu de deviner.",
      ],
    },
    objectives: [
      "Bâtir une stratégie de contenu alignée sur des objectifs de vente",
      "Maîtriser le tunnel de conversion et les appels à l'action",
      "Lire ses statistiques pour décider, pas pour deviner",
    ],
    sessions: [
      {
        title: "Séance 1 — Stratégie & positionnement",
        duration: "22 min",
        points: [
          "Définir le persona : douleurs, désirs, objections, langage.",
          "Proposition de valeur unique : pourquoi vous et pas un autre.",
          "Objectifs SMART et indicateurs (leads, taux de conversion, panier moyen).",
        ],
      },
      {
        title: "Séance 2 — Le tunnel de conversion (funnel)",
        duration: "22 min",
        points: [
          "Découverte → Considération → Décision → Fidélisation : un contenu par étape.",
          "Lead magnet et capture : offrir de la valeur contre un contact.",
          "Nurturing par e-mail / WhatsApp : rester présent jusqu'à l'achat.",
        ],
      },
      {
        title: "Séance 3 — Contenu qui convertit",
        duration: "20 min",
        points: [
          "Le calendrier éditorial : piliers de contenu et rythme.",
          "Formats performants : reels, carrousels, témoignages, démonstrations.",
          "Adapter le message au canal et à l'étape du tunnel.",
        ],
      },
      {
        title: "Séance 4 — Copywriting & preuves sociales",
        duration: "20 min",
        points: [
          "Accroches et storytelling qui retiennent l'attention.",
          "Preuve sociale : avis, résultats, études de cas.",
          "Appels à l'action clairs et uniques.",
        ],
      },
      {
        title: "Séance 5 — Publicité & acquisition",
        duration: "22 min",
        points: [
          "Bases des campagnes payantes (objectif, audience, budget, créa).",
          "Tester, mesurer, itérer : la logique A/B.",
          "Retargeting : reparler à ceux qui ont déjà montré de l'intérêt.",
        ],
      },
      {
        title: "Séance 6 — Mesure & optimisation",
        duration: "18 min",
        points: [
          "KPIs qui comptent vs vanity metrics.",
          "Lire un tableau de bord et prendre des décisions.",
          "Boucle d'amélioration continue.",
        ],
      },
    ],
    cta: "Formation payante (79 $ US) avec accompagnement personnalisé. Réservez votre place 👉 inovdigitalservices.com",
  },
  {
    id: "pg-graphic-design-fondamentaux",
    title: "Graphic design : fondamentaux & pratique professionnelle",
    category: "payante",
    format: "cours",
    discipline: "Graphic design",
    audience: "Débutants sérieux & créatifs en reconversion",
    duration: "~2 h 20 (6 séances de 10-25 min)",
    level: "Intermédiaire",
    price: "99 $ US",
    hook: "Le talent ne suffit pas : le design pro, ce sont des règles maîtrisées avant d'être des règles brisées. On va vous donner ces règles.",
    intro: {
      announce: [
        "Séance 1 : les principes fondamentaux (composition, hiérarchie, contraste).",
        "Séance 2 : la couleur et son usage professionnel.",
        "Séance 3 : la typographie et l'association de polices.",
        "Séance 4 : la méthode de projet, du brief à la livraison.",
        "Séance 5 : les outils du designer.",
        "Séance 6 : construire un portfolio qui décroche des clients.",
      ],
      interest: [
        "Vous cesserez de « bricoler » pour concevoir avec des règles solides.",
        "Vous saurez mener un projet client de A à Z, pas juste faire de jolis visuels.",
        "Vous repartez avec les bases d'un portfolio professionnel.",
      ],
    },
    objectives: [
      "Maîtriser les principes fondamentaux du design (composition, couleur, typo)",
      "Prendre en main une méthode de projet du brief à la livraison",
      "Constituer les bases d'un portfolio professionnel",
    ],
    sessions: [
      {
        title: "Séance 1 — Les principes fondamentaux",
        duration: "22 min",
        points: [
          "Composition & grille : alignement, proximité, équilibre, espace blanc.",
          "Hiérarchie visuelle : guider l'œil du plus important au détail.",
          "Contraste et répétition pour créer de la cohérence.",
        ],
      },
      {
        title: "Séance 2 — La couleur",
        duration: "20 min",
        points: [
          "Roue chromatique, harmonies, température.",
          "Psychologie des couleurs et sens culturel.",
          "Accessibilité et contraste (lisibilité pour tous).",
        ],
      },
      {
        title: "Séance 3 — La typographie",
        duration: "20 min",
        points: [
          "Familles de polices et personnalités.",
          "Association de polices (2 maximum en général).",
          "Interlignage, crénage, tailles : le confort de lecture.",
        ],
      },
      {
        title: "Séance 4 — La méthode de projet",
        duration: "22 min",
        points: [
          "Lire un brief et poser les bonnes questions.",
          "Recherche, moodboard, croquis avant l'écran.",
          "Itérations, présentation client, fichiers de livraison.",
        ],
      },
      {
        title: "Séance 5 — Outils du designer",
        duration: "18 min",
        points: [
          "Panorama des outils (vectoriel, mise en page, retouche).",
          "Bonnes pratiques de fichiers et exports.",
          "Organiser ses calques et ses gabarits.",
        ],
      },
      {
        title: "Séance 6 — Construire son portfolio",
        duration: "18 min",
        points: [
          "Choisir et présenter 3 projets solides.",
          "Raconter le problème et la solution, pas seulement montrer.",
          "Où publier son portfolio pour être trouvé.",
        ],
      },
    ],
    cta: "Formation payante certifiante (99 $ US) avec projets encadrés. Inscrivez-vous 👉 inovdigitalservices.com",
  },
  {
    id: "pb-brand-design",
    title: "Brand design : construire une identité de marque mémorable",
    category: "payante",
    format: "cours",
    discipline: "Brand design",
    audience: "Entrepreneurs & designers",
    duration: "~2 h (5 séances de 10-25 min)",
    level: "Avancé",
    price: "129 $ US",
    hook: "Un logo n'est pas une marque. Une marque, c'est une promesse cohérente que les gens reconnaissent et en qui ils croient. Apprenons à la construire.",
    intro: {
      announce: [
        "Séance 1 : les fondations de la marque (mission, valeurs, positionnement).",
        "Séance 2 : le système d'identité visuelle complet.",
        "Séance 3 : la cohérence sur tous les supports.",
        "Séance 4 : rédiger une charte graphique exploitable.",
        "Séance 5 : présenter et vendre la marque au client.",
      ],
      interest: [
        "Vous comprendrez la différence entre un logo, une identité et une marque.",
        "Vous saurez construire un système complet, pas juste un dessin.",
        "Vous livrerez une charte pro que le client pourra vraiment utiliser.",
      ],
    },
    objectives: [
      "Comprendre la différence entre logo, identité et marque",
      "Construire une plateforme de marque et un système visuel complet",
      "Livrer une charte graphique exploitable par le client",
    ],
    sessions: [
      {
        title: "Séance 1 — Les fondations de la marque",
        duration: "24 min",
        points: [
          "Mission, vision, valeurs et personnalité de marque.",
          "Positionnement et audience cible.",
          "Territoire d'expression : ton, style, promesse.",
        ],
      },
      {
        title: "Séance 2 — Le système d'identité visuelle",
        duration: "24 min",
        points: [
          "Logo et ses déclinaisons (responsive branding).",
          "Palette de couleurs, typographies, iconographie, motifs.",
          "Style photographique et illustratif.",
        ],
      },
      {
        title: "Séance 3 — La cohérence sur tous les supports",
        duration: "20 min",
        points: [
          "Applications : réseaux, packaging, papeterie, web.",
          "Modèles et gabarits pour tenir la marque dans le temps.",
        ],
      },
      {
        title: "Séance 4 — La charte graphique (brand guidelines)",
        duration: "22 min",
        points: [
          "Règles d'usage : ce qu'on peut / ne peut pas faire.",
          "Zones de protection, tailles minimales, versions.",
          "Livrable client clair et professionnel.",
        ],
      },
      {
        title: "Séance 5 — Présenter & vendre la marque",
        duration: "18 min",
        points: [
          "Raconter l'histoire de la marque au client.",
          "Justifier les choix par la stratégie, pas par le goût.",
          "Gérer les retours et défendre la cohérence.",
        ],
      },
    ],
    cta: "Formation payante avancée (129 $ US) orientée projet réel. Demandez le programme 👉 inovdigitalservices.com",
  },
  {
    id: "pmo-motion-design",
    title: "Motion design : donner vie à vos visuels",
    category: "payante",
    format: "cours",
    discipline: "Motion design",
    audience: "Designers & créateurs de contenu",
    duration: "~2 h 10 (6 séances de 10-25 min)",
    level: "Intermédiaire",
    price: "109 $ US",
    hook: "Le mouvement attire l'œil et retient l'attention. Le motion design, c'est raconter une histoire en quelques secondes — apprenons ses principes.",
    intro: {
      announce: [
        "Séance 1 : les principes d'animation.",
        "Séance 2 : le timing, l'easing et le rythme.",
        "Séance 3 : composition & storytelling en mouvement.",
        "Séance 4 : le workflow technique.",
        "Séance 5 : exports optimisés pour chaque plateforme.",
        "Séance 6 : projet guidé de bout en bout.",
      ],
      interest: [
        "Vous saurez pourquoi une animation paraît « pro » ou « amateur ».",
        "Vous maîtriserez le timing et l'easing, le vrai secret du motion.",
        "Vous produirez une animation courte propre et exportable.",
      ],
    },
    objectives: [
      "Comprendre les principes d'animation appliqués au motion",
      "Maîtriser le timing, l'easing et le rythme",
      "Produire une animation courte propre et exportable",
    ],
    sessions: [
      {
        title: "Séance 1 — Les principes d'animation",
        duration: "20 min",
        points: [
          "Timing & espacement : la base de toute animation crédible.",
          "Anticipation, accélération/décélération (easing).",
          "Poids, élasticité et « secondary action ».",
        ],
      },
      {
        title: "Séance 2 — Timing, easing & rythme",
        duration: "20 min",
        points: [
          "Lire et régler des courbes de vitesse.",
          "Créer du rythme et des accents.",
          "Éviter les mouvements « plats » et mécaniques.",
        ],
      },
      {
        title: "Séance 3 — Composition & storytelling en mouvement",
        duration: "18 min",
        points: [
          "Guider le regard dans le temps, pas seulement dans l'espace.",
          "Transitions fluides et raccords.",
          "Synchronisation avec le son.",
        ],
      },
      {
        title: "Séance 4 — Workflow technique",
        duration: "22 min",
        points: [
          "Préparer ses fichiers (calques, vectoriel) pour l'animation.",
          "Keyframes, courbes de vitesse, boucles.",
          "Organisation d'un projet propre.",
        ],
      },
      {
        title: "Séance 5 — Exports & plateformes",
        duration: "16 min",
        points: [
          "Exports optimisés pour réseaux et web.",
          "Formats, poids et qualité selon l'usage.",
          "Boucles propres et rendus légers.",
        ],
      },
      {
        title: "Séance 6 — Projet guidé",
        duration: "22 min",
        points: [
          "Animer un pack de stories / une intro de marque.",
          "Feedback et finition professionnelle.",
        ],
      },
    ],
    cta: "Formation payante (109 $ US) avec exercices pratiques encadrés. Réservez 👉 inovdigitalservices.com",
  },
  {
    id: "pla-animation-logo",
    title: "Animation de logo : techniques & principes",
    category: "payante",
    format: "cours",
    discipline: "Animation de logo",
    audience: "Designers & marques",
    duration: "~1 h 10 (4 séances de 10-25 min)",
    level: "Intermédiaire",
    price: "49 $ US",
    hook: "Un logo animé, c'est votre signature en mouvement — la touche pro qui rend une marque mémorable en intro de vidéo. Voici comment le réussir.",
    intro: {
      announce: [
        "Séance 1 : lire le logo avant d'animer.",
        "Séance 2 : les techniques d'animation.",
        "Séance 3 : le son et la finition.",
        "Séance 4 : exports & usages.",
      ],
      interest: [
        "Vous saurez trouver le mouvement naturel d'un logo au lieu d'animer au hasard.",
        "Vous produirez une intro courte, élégante et fidèle à la marque.",
        "Formation courte et ciblée : un résultat concret en 4 séances.",
      ],
    },
    objectives: [
      "Analyser un logo pour trouver son mouvement naturel",
      "Construire une animation courte, élégante et fidèle à la marque",
      "Exporter dans les bons formats pour chaque usage",
    ],
    sessions: [
      {
        title: "Séance 1 — Lire le logo avant d'animer",
        duration: "16 min",
        points: [
          "Décomposer les éléments (symbole, typo, ligne).",
          "Trouver l'idée directrice : révélation, construction, énergie.",
          "Rester fidèle à la personnalité de la marque.",
        ],
      },
      {
        title: "Séance 2 — Techniques d'animation",
        duration: "22 min",
        points: [
          "Reveal (tracé, masque, fondu), assemblage, morphing léger.",
          "Timing court : 2 à 4 secondes suffisent en général.",
          "Easing soigné : c'est ce qui fait la différence « pro ».",
        ],
      },
      {
        title: "Séance 3 — Son & finition",
        duration: "12 min",
        points: [
          "Ajouter un logo sound / whoosh discret.",
          "Boucle propre et image de fin nette.",
        ],
      },
      {
        title: "Séance 4 — Exports & usages",
        duration: "14 min",
        points: [
          "Intro vidéo, stories, site web, signature e-mail.",
          "Formats et poids adaptés à chaque plateforme.",
        ],
      },
    ],
    cta: "Formation payante ciblée (49 $ US). Ou confiez-nous l'animation de votre logo 👉 inovdigitalservices.com",
  },
  {
    id: "pv-comm-visuelle-pro",
    title: "Communication visuelle professionnelle",
    category: "payante",
    format: "cours",
    discipline: "Communication visuelle",
    audience: "Marques, équipes & indépendants",
    duration: "~1 h 55 (5 séances de 10-25 min)",
    level: "Avancé",
    price: "89 $ US",
    hook: "Passer de « faire des visuels » à « communiquer avec stratégie » : c'est ce qui sépare une présence amateur d'une marque professionnelle.",
    intro: {
      announce: [
        "Séance 1 : la stratégie visuelle.",
        "Séance 2 : le système de contenus et de gabarits.",
        "Séance 3 : la production et l'organisation.",
        "Séance 4 : l'adaptation du message par canal et par cible.",
        "Séance 5 : la mesure et l'ajustement de la ligne.",
      ],
      interest: [
        "Vous passerez d'une production au coup par coup à un système tenable.",
        "Vous saurez adapter un même message à chaque canal sans perdre la cohérence.",
        "Vous mesurerez l'impact de vos visuels au lieu de subir.",
      ],
    },
    objectives: [
      "Bâtir une stratégie de communication visuelle cohérente",
      "Créer un système de gabarits et une ligne graphique tenable",
      "Adapter le message par canal et par cible",
    ],
    sessions: [
      {
        title: "Séance 1 — Stratégie visuelle",
        duration: "24 min",
        points: [
          "Objectifs de communication et messages clés.",
          "Ligne graphique : cohérence sur tous les points de contact.",
          "Direction artistique et moodboard.",
        ],
      },
      {
        title: "Séance 2 — Système de contenus",
        duration: "22 min",
        points: [
          "Piliers de contenu et gabarits réutilisables.",
          "Adaptation par format (print, réseaux, web).",
          "Cohérence de ton et d'image dans le temps.",
        ],
      },
      {
        title: "Séance 3 — Production & organisation",
        duration: "20 min",
        points: [
          "Chaîne de production efficace, banque d'assets.",
          "Calendrier et validation.",
        ],
      },
      {
        title: "Séance 4 — Adapter le message",
        duration: "20 min",
        points: [
          "Décliner un message clé par canal et par cible.",
          "Ton, format et cadrage selon la plateforme.",
          "Garder l'unité de marque malgré la diversité des formats.",
        ],
      },
      {
        title: "Séance 5 — Mesure & ajustement",
        duration: "18 min",
        points: [
          "Évaluer l'impact visuel et l'engagement.",
          "Faire évoluer la ligne sans perdre la cohérence.",
        ],
      },
    ],
    cta: "Formation payante (89 $ US) avec accompagnement de marque. Programme détaillé 👉 inovdigitalservices.com",
  },
  {
    id: "pe-design-marketing-entrepreneurs",
    title: "Graphic design + marketing digital pour entrepreneurs & commerçants",
    category: "payante",
    format: "cours",
    discipline: "Marketing digital",
    audience: "Entrepreneurs & commerçants",
    duration: "~2 h 40 (8 séances de 10-25 min)",
    level: "Débutant",
    price: "149 $ US",
    hook: "Vous êtes commerçant, pas designer ni marketeur — et c'est normal. Ce parcours vous donne l'essentiel des deux pour vendre plus, sans dépendre de personne.",
    intro: {
      announce: [
        "Séance 1 : les bases design pour non-designers.",
        "Séance 2 : créer des visuels pro avec des gabarits simples.",
        "Séance 3 : photographier ses produits au téléphone.",
        "Séance 4 : une présence en ligne qui vend.",
        "Séance 5 : attirer et convertir.",
        "Séance 6 : la preuve sociale et les avis clients.",
        "Séance 7 : organisation & régularité.",
        "Séance 8 : devenir autonome sur ses ventes.",
      ],
      interest: [
        "Parcours complet 2-en-1 : design + marketing, pensé pour les commerçants.",
        "Vous créerez des visuels pro et une présence qui vend, sans dépendre de personne.",
        "Le meilleur rapport contenu/prix : 8 séances pour tout mettre en place.",
      ],
    },
    objectives: [
      "Créer des visuels pro simples et cohérents sans être designer",
      "Mettre en place une présence en ligne qui attire et convertit",
      "Autonomiser l'entrepreneur sur ses ventes au quotidien",
    ],
    sessions: [
      {
        title: "Séance 1 — Les bases design pour non-designers",
        duration: "20 min",
        points: [
          "Choisir couleurs et police de sa marque et s'y tenir.",
          "Les règles simples de lisibilité et de hiérarchie.",
          "Ce qui fait qu'un visuel paraît pro ou amateur.",
        ],
      },
      {
        title: "Séance 2 — Créer des visuels avec des gabarits",
        duration: "20 min",
        points: [
          "Créer des visuels clairs avec des gabarits simples.",
          "3 modèles à réutiliser : promo, produit, conseil.",
          "Rester cohérent d'un post à l'autre.",
        ],
      },
      {
        title: "Séance 3 — Photographier ses produits",
        duration: "16 min",
        points: [
          "Photographier ses produits correctement au téléphone.",
          "Lumière naturelle, fond neutre, cadrage.",
          "Retouche minimale et rapide.",
        ],
      },
      {
        title: "Séance 4 — Présence en ligne qui vend",
        duration: "20 min",
        points: [
          "Optimiser sa page (bio, catalogue, coordonnées, avis).",
          "WhatsApp Business et réponses rapides.",
          "Publier utile et régulier plutôt que parfait.",
        ],
      },
      {
        title: "Séance 5 — Attirer & convertir",
        duration: "20 min",
        points: [
          "Promotions et offres qui donnent envie.",
          "Appels à l'action clairs pour déclencher le message/l'achat.",
          "Transformer une conversation en vente.",
        ],
      },
      {
        title: "Séance 6 — Preuve sociale & avis clients",
        duration: "16 min",
        points: [
          "Récolter et mettre en avant les avis clients.",
          "Témoignages en photo/vidéo.",
          "Répondre aux avis pour renforcer la confiance.",
        ],
      },
      {
        title: "Séance 7 — Organisation & régularité",
        duration: "18 min",
        points: [
          "Planifier une semaine de contenu en 1 h.",
          "Réutiliser et recycler ses meilleurs posts.",
          "Suivre ce qui marche et faire plus de ça.",
        ],
      },
      {
        title: "Séance 8 — Autonomie",
        duration: "16 min",
        points: [
          "Une routine simple applicable seul.",
          "Quand faire soi-même vs déléguer à une agence.",
        ],
      },
    ],
    cta: "Parcours payant complet (149 $ US) spécial entrepreneurs & commerçants. Réservez votre place 👉 inovdigitalservices.com",
  },
]
