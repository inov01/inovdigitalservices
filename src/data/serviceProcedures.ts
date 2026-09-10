// Procédures conseillées par service — référence pour l'espace administrateur.
// Chaque entrée décrit la méthode recommandée à communiquer au client : ce qu'il
// doit fournir, le déroulé du projet, les délais, les révisions et les livrables.
// Contenu fidèle au positionnement INOV : 100 % en ligne, le client apporte ses
// propres ressources ; pas d'impression, de shooting photo ni de tournage, mais
// retouche photo et montage/éditing vidéo à partir des rushes fournis.

export interface ServiceProcedure {
  key: string
  name: string
  /** Slug du formulaire de brief associé (route /brief/<brief>), si applicable. */
  brief?: string
  intro: string
  clientProvides: string[]
  steps: string[]
  timeline: string
  revisions: string
  deliverables: string[]
  tips?: string[]
}

export const serviceProcedures: ServiceProcedure[] = [
  {
    key: "logo",
    name: "Création de Logo",
    brief: "logo",
    intro:
      "Un logo clair, unique et déclinable sur tous les supports. Tout se fait en ligne, sans rendez-vous physique.",
    clientProvides: [
      "Nom exact de la marque et slogan (si existant)",
      "Activité, valeurs et public visé",
      "3 à 5 exemples de logos que vous aimez (et pourquoi)",
      "Couleurs souhaitées ou à éviter",
      "Ancien logo ou éléments visuels existants (le cas échéant)",
    ],
    steps: [
      "Le client remplit le formulaire de brief en ligne",
      "Validation du brief et confirmation de l'acompte (50 %)",
      "Recherche + proposition de 2 à 3 pistes de concept",
      "Choix d'une piste par le client, puis affinage",
      "Cycles de révisions sur la piste retenue",
      "Validation finale et solde, puis livraison du pack complet",
    ],
    timeline: "Livraison indicative en 3 à 5 jours ouvrés selon la charge.",
    revisions: "2 à 3 séries de révisions incluses sur la piste choisie.",
    deliverables: [
      "Fichiers vectoriels (SVG / PDF) et images (PNG transparent, JPG)",
      "Versions couleur, noir et blanc",
      "Variantes horizontale / verticale / icône seule",
      "Mini-guide d'utilisation (couleurs + polices)",
    ],
    tips: [
      "Plus le brief est précis, plus les premières pistes tapent juste.",
      "Évitez de multiplier les avis : désignez un seul décideur côté client.",
    ],
  },
  {
    key: "branding",
    name: "Branding & Identité",
    brief: "branding",
    intro:
      "Une identité visuelle cohérente et complète : au-delà du logo, tout l'univers de la marque.",
    clientProvides: [
      "Brief de marque : mission, valeurs, ton, concurrents",
      "Public cible et marchés visés",
      "Références visuelles (moodboard, marques admirées)",
      "Contenus existants (logo, photos, textes) s'il y en a",
    ],
    steps: [
      "Brief approfondi + moodboard de direction",
      "Validation de la direction créative",
      "Conception du système : logo, couleurs, typographies, motifs",
      "Application sur supports clés (carte, réseaux sociaux, en-tête)",
      "Révisions puis finalisation",
      "Livraison de la charte graphique complète",
    ],
    timeline: "Livraison indicative en 7 à 12 jours ouvrés.",
    revisions: "2 séries de révisions incluses par étape validée.",
    deliverables: [
      "Charte graphique (PDF) : logo, couleurs, typographies, usages",
      "Fichiers sources du logo et des gabarits",
      "Modèles réutilisables (réseaux sociaux, documents)",
    ],
    tips: [
      "Le branding se valide par étapes : on ne dessine pas les supports avant d'avoir figé le socle.",
    ],
  },
  {
    key: "site",
    name: "Site web vitrine",
    brief: "site",
    intro:
      "Un site vitrine moderne, rapide et adapté au mobile. Le client fournit textes et images ; INOV conçoit et intègre.",
    clientProvides: [
      "Objectif du site et pages souhaitées",
      "Textes définitifs (ou points clés à rédiger ensemble)",
      "Logo, photos et vidéos en bonne qualité",
      "Accès au nom de domaine / hébergement si déjà existants",
      "Exemples de sites appréciés",
    ],
    steps: [
      "Brief + arborescence (liste des pages et sections)",
      "Maquette de la page d'accueil pour validation du style",
      "Intégration des pages et du contenu",
      "Optimisation mobile, vitesse et référencement de base",
      "Révisions puis recette finale avec le client",
      "Mise en ligne et remise des accès",
    ],
    timeline: "Livraison indicative en 7 à 15 jours ouvrés selon le nombre de pages.",
    revisions: "2 séries de révisions incluses avant mise en ligne.",
    deliverables: [
      "Site en ligne, responsive (mobile / tablette / ordinateur)",
      "Accès d'administration remis au client",
      "Formulaire de contact fonctionnel",
    ],
    tips: [
      "Rassemblez tous les textes et images AVANT le démarrage : c'est ce qui retarde le plus les projets.",
    ],
  },
  {
    key: "video",
    name: "Montage vidéo (editing)",
    brief: "video",
    intro:
      "Montage et éditing à partir de VOS rushes. INOV ne réalise pas le tournage : le client fournit les vidéos et photos brutes.",
    clientProvides: [
      "Toutes les rushes (vidéos) et photos à monter",
      "Durée finale visée et format (16:9, 9:16, carré)",
      "Musique souhaitée ou ambiance (droits à vérifier)",
      "Logo, textes à incruster et ordre des séquences",
      "Exemple de vidéo au rendu souhaité",
    ],
    steps: [
      "Réception et tri des rushes fournis",
      "Montage d'une première version (V1)",
      "Retours du client horodatés (minutage précis)",
      "Ajustements : rythme, transitions, sous-titres, colorimétrie",
      "Validation finale et export dans les formats demandés",
    ],
    timeline: "Livraison indicative en 3 à 7 jours ouvrés selon la durée et le volume de rushes.",
    revisions: "2 séries de révisions incluses (retours horodatés).",
    deliverables: [
      "Vidéo finale exportée (formats et résolutions demandés)",
      "Version(s) adaptée(s) réseaux sociaux si prévu",
    ],
    tips: [
      "Envoyez des rushes de bonne qualité et bien nommés : la qualité finale dépend de la qualité fournie.",
      "Donnez vos retours en indiquant le minutage exact (ex. 00:12 → couper).",
    ],
  },
  {
    key: "motion",
    name: "Motion design / Animation",
    brief: "motion",
    intro:
      "Animation 2D/3D, logo animé, habillage graphique. Idéal pour dynamiser une marque ou une publicité.",
    clientProvides: [
      "Message clé et durée souhaitée",
      "Logo vectoriel et éléments de marque",
      "Script ou storyboard (ou à construire ensemble)",
      "Voix off / musique si applicable",
      "Références d'animations appréciées",
    ],
    steps: [
      "Brief + script / storyboard validé",
      "Style frames (direction visuelle) pour validation",
      "Animation de la première version",
      "Révisions sur le rythme et les détails",
      "Export final dans les formats demandés",
    ],
    timeline: "Livraison indicative en 5 à 10 jours ouvrés.",
    revisions: "2 séries de révisions incluses après validation du storyboard.",
    deliverables: [
      "Animation finale (MP4 + formats réseaux)",
      "Logo animé décliné si prévu",
    ],
    tips: [
      "Le storyboard se valide avant l'animation : modifier après coûte du temps.",
    ],
  },
  {
    key: "powerpoint",
    name: "Présentation PowerPoint",
    brief: "powerpoint",
    intro:
      "Présentations professionnelles et percutantes : pitch, rapport, formation, commercial.",
    clientProvides: [
      "Contenu / plan des diapositives (texte)",
      "Logo et éléments de marque",
      "Nombre de diapositives visé",
      "Modèle existant à respecter (le cas échéant)",
    ],
    steps: [
      "Réception du contenu et structuration",
      "Création du gabarit et de la diapositive type",
      "Mise en forme de l'ensemble des diapositives",
      "Révisions",
      "Livraison du fichier éditable",
    ],
    timeline: "Livraison indicative en 2 à 5 jours ouvrés.",
    revisions: "2 séries de révisions incluses.",
    deliverables: [
      "Fichier PowerPoint (.pptx) éditable",
      "Export PDF",
      "Gabarit réutilisable",
    ],
    tips: [
      "Fournissez le texte finalisé : on met en forme, on ne rédige pas le fond à votre place (sauf accord).",
    ],
  },
  {
    key: "retouche",
    name: "Retouche photo",
    brief: "retouche",
    intro:
      "Amélioration et retouche de VOS photos. INOV ne réalise pas de shooting : le client fournit les images.",
    clientProvides: [
      "Les photos originales en meilleure qualité possible",
      "Type de retouche voulu (peau, couleurs, détourage, fond, montage…)",
      "Exemple du rendu souhaité",
      "Format et dimensions finales",
    ],
    steps: [
      "Réception et évaluation des photos fournies",
      "Retouche d'un premier visuel témoin pour valider le style",
      "Traitement du lot complet",
      "Révisions",
      "Livraison des fichiers finaux",
    ],
    timeline: "Livraison indicative en 1 à 4 jours ouvrés selon le nombre de photos.",
    revisions: "1 à 2 séries de révisions incluses.",
    deliverables: [
      "Photos retouchées (JPG / PNG haute qualité)",
      "Versions adaptées si plusieurs formats demandés",
    ],
    tips: [
      "La qualité de départ compte : une photo floue ou trop petite limite le résultat.",
    ],
  },
  {
    key: "packaging",
    name: "Packaging & Étiquettes",
    intro:
      "Conception de packaging et d'étiquettes prêts à imprimer. INOV crée le fichier ; l'impression est réalisée par le prestataire du client.",
    clientProvides: [
      "Dimensions exactes et gabarit de découpe (dieline) si disponible",
      "Mentions obligatoires et textes définitifs",
      "Logo et éléments de marque",
      "Contraintes de l'imprimeur (formats, marges, profil couleur)",
    ],
    steps: [
      "Brief + récupération du gabarit technique",
      "Proposition de concept",
      "Mise au point des mentions et détails techniques",
      "Révisions",
      "Livraison du fichier prêt pour l'impression",
    ],
    timeline: "Livraison indicative en 4 à 8 jours ouvrés.",
    revisions: "2 séries de révisions incluses.",
    deliverables: [
      "Fichier print (PDF haute résolution, fonds perdus)",
      "Aperçu / mise en situation",
    ],
    tips: [
      "Demandez le gabarit à votre imprimeur AVANT le démarrage pour éviter les reprises.",
    ],
  },
  {
    key: "flyers",
    name: "Flyers, affiches & réseaux sociaux",
    intro:
      "Supports de communication percutants pour le print et le digital.",
    clientProvides: [
      "Textes définitifs et informations à afficher",
      "Logo et visuels / photos à intégrer",
      "Format(s) souhaité(s) et destination (print ou réseaux)",
      "Exemple du style recherché",
    ],
    steps: [
      "Brief + hiérarchie des informations",
      "Proposition de mise en page",
      "Révisions",
      "Déclinaison des formats",
      "Livraison des fichiers",
    ],
    timeline: "Livraison indicative en 1 à 3 jours ouvrés.",
    revisions: "2 séries de révisions incluses.",
    deliverables: [
      "Fichiers print (PDF) et/ou web (PNG / JPG aux bons formats)",
    ],
    tips: [
      "Un seul message principal par visuel : trop d'informations tue l'impact.",
    ],
  },
  {
    key: "carte",
    name: "Carte de visite",
    intro:
      "Carte de visite professionnelle, recto/verso, prête à imprimer.",
    clientProvides: [
      "Coordonnées exactes (nom, poste, téléphone, e-mail, adresse, réseaux)",
      "Logo et couleurs de marque",
      "Contraintes de l'imprimeur si déjà choisi",
    ],
    steps: [
      "Brief + vérification des coordonnées",
      "Proposition recto / verso",
      "Révisions",
      "Livraison du fichier prêt à imprimer",
    ],
    timeline: "Livraison indicative en 1 à 2 jours ouvrés.",
    revisions: "2 séries de révisions incluses.",
    deliverables: [
      "Fichier print (PDF, fonds perdus)",
      "Aperçu",
    ],
    tips: ["Relisez deux fois les coordonnées : une erreur de chiffre = réimpression."],
  },
  {
    key: "infographie",
    name: "Infographie",
    intro:
      "Transformer des données ou un process en un visuel clair et mémorable.",
    clientProvides: [
      "Données / chiffres / étapes à représenter",
      "Message principal à faire passer",
      "Logo et éléments de marque",
      "Format final (web ou print)",
    ],
    steps: [
      "Brief + structuration de l'information",
      "Proposition de mise en forme visuelle",
      "Révisions",
      "Livraison",
    ],
    timeline: "Livraison indicative en 2 à 5 jours ouvrés.",
    revisions: "2 séries de révisions incluses.",
    deliverables: ["Infographie finale (PNG / PDF), formats web et/ou print"],
    tips: ["Fournissez des données déjà vérifiées et sourcées."],
  },
  {
    key: "grandformat",
    name: "Grand format (banner / roll-up)",
    intro:
      "Bâches, banderoles et roll-up grand format prêts pour l'impression.",
    clientProvides: [
      "Dimensions exactes du support",
      "Textes et visuels haute résolution",
      "Contraintes de l'imprimeur (résolution, fonds perdus)",
    ],
    steps: [
      "Brief + dimensions et contraintes techniques",
      "Proposition de mise en page (lisible de loin)",
      "Révisions",
      "Livraison du fichier print",
    ],
    timeline: "Livraison indicative en 2 à 5 jours ouvrés.",
    revisions: "2 séries de révisions incluses.",
    deliverables: ["Fichier print grand format (PDF haute résolution)"],
    tips: ["Un grand format se lit à distance : gros titres, peu de texte, fort contraste."],
  },
]

// Version texte prête à copier-coller (WhatsApp / e-mail) pour un client.
export function procedureToText(p: ServiceProcedure): string {
  const lines: string[] = []
  lines.push(`📋 ${p.name} — INOV Digital Services`)
  lines.push("")
  lines.push(p.intro)
  lines.push("")
  lines.push("✅ Ce que vous devez fournir :")
  p.clientProvides.forEach((x) => lines.push(`• ${x}`))
  lines.push("")
  lines.push("🔄 Déroulé du projet :")
  p.steps.forEach((x, i) => lines.push(`${i + 1}. ${x}`))
  lines.push("")
  lines.push(`⏱️ Délai : ${p.timeline}`)
  lines.push(`✏️ Révisions : ${p.revisions}`)
  lines.push("")
  lines.push("📦 Ce que vous recevez :")
  p.deliverables.forEach((x) => lines.push(`• ${x}`))
  if (p.tips && p.tips.length) {
    lines.push("")
    lines.push("💡 Conseils :")
    p.tips.forEach((x) => lines.push(`• ${x}`))
  }
  return lines.join("\n")
}
