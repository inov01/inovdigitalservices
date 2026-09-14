// Portfolio album data + shared work/poster helpers, extracted from Portfolio.tsx.
// Image import paths are relative to src/ so they match the component's originals.
import type * as React from "react"

// ── Client logos
import logoRosie    from "../imports/Rosie_logo.webp"
import logoPhysio   from "../imports/2.webp"
import logoTC       from "../imports/1.webp"
import logoMKB      from "../imports/5.webp"
import logoEglise   from "../imports/3-1.webp"

// ── Project images
import imgCocktailLabel  from "../imports/Cocktail_Rosie.webp"
import imgCocktailFlyer  from "../imports/Rosie_Cocktail.webp"
import imgPhysioSeminaire from "../imports/Physio_Haiti__1_.webp"
import imgPhysioSoins    from "../imports/16.webp"
import imgPhysioMassage  from "../imports/12-1.webp"
import imgPhysioOffre    from "../imports/14-1.webp"
import imgPhysioValentin from "../imports/11_png.webp"
import imgPhysioJournee  from "../imports/14_png.webp"
import imgPhysioTherapie from "../imports/18_png.webp"
import imgPhysioAnniv    from "../imports/10_png.webp"
import logoParrots      from "../imports/1_jpg.webp"
import imgParrotsCours    from "../imports/2_jpg.webp"
import imgParrotsSession  from "../imports/3_jpg.webp"
import imgParrotsCeremonie from "../imports/5_jpg.webp"
import imgParrotsAdresses from "../imports/6.webp"
import imgParrotsInscription from "../imports/8.webp"
import imgParrotsLogoBilingual from "../imports/9_jpg.webp"
import imgParrotsBilingual from "../imports/10_jpg.webp"
import imgLadys          from "../imports/A_LADY_S_CENTER__23_.webp"
import imgLadysAlt       from "../imports/A_LADY_S_CENTER__23_-1.webp"
import imgEtiquette      from "../imports/etiquette_anana.webp"
import imgProductFlyer   from "../imports/product_flyer.webp"
import imgTCQuickbooks   from "../imports/2-2.webp"
import imgMKBPost        from "../imports/7.webp"
import imgMKBLabels      from "../imports/9.webp"
import imgMKBMockup      from "../imports/12-2.webp"
import imgEgliseAjesroLogo from "../imports/4_jpg.webp"
import imgEgliseMissMister from "../imports/1-1_jpg.webp"
import imgEglisePriere1   from "../imports/2-1_jpg.webp"
import imgEglisePriere2   from "../imports/5-2.webp"
import imgEglisePriere3   from "../imports/7-1.webp"
import imgEgliseCongres   from "../imports/6-2.webp"
import imgEgliseSemaine   from "../imports/8-1.webp"
import logoOxe            from "../imports/1-2_jpg.webp"
import imgOxeBiereWings1  from "../imports/2-2_jpg.webp"
import logoSdi            from "../imports/2-3_jpg.webp"
import imgSdiMono         from "../imports/10-1.webp"
import imgSdiCharte       from "../imports/1-3_jpg.webp"
import imgSdiEnseigne     from "../imports/4-1.webp"
import imgSdiPapeterie    from "../imports/5-1_jpg.webp"
import logoCch            from "../imports/1_1_.webp"
import imgCchMono         from "../imports/2_1_.webp"
import imgCchNegative     from "../imports/3_1_.webp"
import imgCchDeclinaisons from "../imports/4_1_.webp"
import logoTdc            from "../imports/1-4_jpg.webp"
import imgTdcBranding     from "../imports/4-2.webp"
import imgTdcSeminaire1   from "../imports/5-3.webp"
import imgTdcSeminaire2   from "../imports/6-1.webp"
import logoDaily          from "../imports/1_1_-1.webp"
import imgDailyMenu       from "../imports/2_1_-1.webp"
import logoRalines        from "../imports/1-2.webp"
import imgRalinesCandle   from "../imports/2-3.webp"
import logoMls            from "../imports/1_1_-2.webp"
import imgMlsDetergent    from "../imports/1-3.webp"
import imgMlsSuavi        from "../imports/5-1.webp"
import logoTchyca         from "../imports/1-5.webp"
import imgTchycaManba     from "../imports/2-4_jpg.webp"
import imgTchycaAnanas    from "../imports/5-4.webp"
import imgTchycaChadeque28 from "../imports/6-3.webp"
import imgTchycaChadeque16 from "../imports/7-2.webp"
import imgTchycaKremas    from "../imports/8-2.webp"
import logoTamimy         from "../imports/11.webp"
import imgTamimyEpices    from "../imports/10-2.webp"
import logoRvTech         from "../imports/1-6.webp"
import imgRvTechEnergie   from "../imports/2-5.webp"
import imgRvTechMaintenance from "../imports/3-4.webp"
import imgRvTechFinance   from "../imports/4-3.webp"
import imgRvTechNoel      from "../imports/1-7.webp"
import imgRvTechAnneuveau from "../imports/2-6.webp"
import logoYokesta        from "../imports/4.webp"
import imgYokestaWebinaire from "../imports/2-4.webp"
import logoTchatcha       from "../imports/3.webp"
import imgTchatchaFlyer   from "../imports/1-4.webp"
import logo2002           from "../imports/2-7.webp"
import img2002Mockup      from "../imports/1-8.webp"
import img2002Noir        from "../imports/3-5.webp"
import img2002Charte      from "../imports/4-4.webp"
import img2002Flyer       from "../imports/5-5.webp"
// ── Newly added client visuals
import imgMlsSuaviFlyer   from "../imports/_509_3625-5920_jpg.webp"
import imgILearnPhoto     from "../imports/_509_3625-5920__1__jpg.webp"
import imgILearnAutoMoto  from "../imports/_509_3625-5920__2__jpg.webp"
import imgNcc             from "../imports/_509_3625-5920__3__jpg.webp"
import imgRvTechTransactions from "../imports/_509_3625-5920__4__jpg.webp"
import logoLadysCenter     from "../imports/1_jpgw.webp"
import imgLadysLogoGreen   from "../imports/16_jpg.webp"
import imgLadysLogoPurple  from "../imports/17_jpg.webp"
import imgLadysCharte      from "../imports/11_jpg.webp"
import imgLadysManba       from "../imports/Manba_flyer_jpg.webp"
import imgLadysCardFront   from "../imports/carte_de_visite_face_jpg.webp"
import imgLadysCardBack    from "../imports/carte_de_visite_dos_jpg.webp"
import imgLadysCardMockup  from "../imports/2_jpgw.webp"
import imgLadysEclat       from "../imports/3_jpgw.webp"
import imgLadysMeres       from "../imports/10_jpgw.webp"
import imgLadysWall        from "../imports/12_jpg.webp"
import imgLadysPolo        from "../imports/13_jpg.webp"
import imgLadysShelf       from "../imports/14_jpg.webp"
import imgLadysLogoHoriz   from "../imports/15_jpg.webp"
import imgLadysManbaGingembre from "../imports/Manba_gingembre_jpg.webp"
import imgLadysManbaLokal  from "../imports/Manba_Sal__jpg.webp"
import imgLadysManbaSucre  from "../imports/Manba_Sucr__jpg.webp"


// A work is either a static image (`img`) or a YouTube video (`videoId`).
// For video works `img` is optional — the YouTube thumbnail is used as the poster.
export interface Work { img?: string; videoId?: string; title: string; category: string; desc: string }

// YouTube poster URL. maxres isn't always generated, so callers fall back to hq on error.
export const ytThumb = (id: string, quality: "maxres" | "hq" = "maxres") => `https://img.youtube.com/vi/${id}/${quality}default.jpg`
// Resolve the display poster for any work (explicit image wins, else the video thumbnail).
export const workPoster = (w: Work) => w.img ?? (w.videoId ? ytThumb(w.videoId) : "")
export const onThumbError = (e: React.SyntheticEvent<HTMLImageElement>, videoId?: string) => {
  if (videoId && !e.currentTarget.dataset.fallback) {
    e.currentTarget.dataset.fallback = "1"
    e.currentTarget.src = ytThumb(videoId, "hq")
  }
}
export interface Album {
  id: string
  client: string
  ceo?: string
  logo: string | null
  logoFit?: "cover"
  logoBg?: string
  tagline: string
  accent?: string          // per-client accent color for subtle theming
  // Attribution of the client's *logo / identity*. Absent = designed by INOV.
  //   "modified" — logo pré-existant retravaillé par INOV (vectorisation, refonte, sous-titre…)
  //   "client"   — logo fourni par le client / conçu par un tiers, présenté ici en contexte projet
  origin?: "modified" | "client"
  originNote?: string      // précision honnête affichée dans la fiche projet
  impact?: string          // persuasive value/impact chip
  serviceIds: number[]
  serviceLabels: string[]
  works: Work[]
}

export const albums: Album[] = [
  {
    id: "rosie",
    client: "Rosie Cocktail",
    logo: logoRosie,
    logoFit: "cover",
    logoBg: "#fff5f5",
    tagline: "Boissons & Produits alimentaires",
    accent: "#E8455F",
    impact: "Identité produit prête à imprimer",
    serviceIds: [6],
    serviceLabels: ["Packaging Design"],
    works: [
      { img: imgCocktailLabel, title: "Étiquette Grenadia Melon", category: "Packaging Design", desc: "Conception de l'étiquette produit pour la gamme Rosie Cocktail — parfum Grenadia Melon, avec liste des ingrédients, code-barres et QR code." },
      { img: imgCocktailFlyer, title: "Flyer Promotionnel — Bouteille", category: "Packaging Design", desc: "Flyer publicitaire avec mise en scène outdoor de la bouteille Rosie Cocktail pour diffusion réseaux sociaux." },
    ],
  },
  {
    id: "physio",
    client: "PhysioHaiti",
    ceo: "Eunice Francesca Montpoint",
    logo: logoPhysio,
    logoFit: "cover",
    logoBg: "#f0f8ff",
    tagline: "Clinique de physiothérapie — Pétion-Ville",
    accent: "#2E86DE",
    impact: "Campagne multi-format print + réseaux",
    serviceIds: [10],
    serviceLabels: ["Flyers & Affiches"],
    works: [
      { img: imgPhysioSeminaire, title: "Séminaire Maderothérapie", category: "Flyers & Affiches", desc: "Affiche de séminaire professionnel — programme, tarifs, date et lieu structurés visuellement." },
      { img: imgPhysioSoins, title: "Soins Avancés — Campagne", category: "Promotion en Ligne", desc: "Flyer de promotion des soins avancés (ultrason, laser, shockwave) avec visuel médical percutant." },
      { img: imgPhysioMassage, title: "Formation Massage Thérapeutique", category: "Flyers & Affiches", desc: "Affiche de formation en massage thérapeutique et relaxant — inscriptions, horaires et tarifs." },
      { img: imgPhysioOffre, title: "Offre Spéciale — 30% de réduction", category: "Promotion en Ligne", desc: "Flyer promotionnel mettant en avant les soins et massages spéciaux avec réduction de 30%." },
      { img: imgPhysioValentin, title: "Special Massage Saint-Valentin", category: "Flyers & Affiches", desc: "Flyer Saint-Valentin — packages solo et couple avec massage, décoration romantique, vin et chocolat." },
      { img: imgPhysioJournee, title: "Journée Mondiale de la Physiothérapie", category: "Flyers & Affiches", desc: "Affiche portes ouvertes du 8 septembre — tous les services à 1000 Gdes, horaires et adresse mis en avant." },
      { img: imgPhysioTherapie, title: "Massage Thérapeutique — Offre Spéciale", category: "Promotion en Ligne", desc: "Flyer promotionnel du massage thérapeutique à 50 \$US, visuel médical premium et argumentaire bien-être." },
      { img: imgPhysioAnniv, title: "Package Massage d'Anniversaire", category: "Flyers & Affiches", desc: "Flyer festif présentant 4 plans de package massage d'anniversaire avec tarifs, décor, musique et champagne." },
    ],
  },
  {
    id: "parrots",
    client: "Parrots Schools",
    origin: "modified",
    originNote: "Le logo original de Parrots (Modern English Schools) n'a pas été conçu par INOV. Nous avons retravaillé le sous-titre de la version « Multilingual Schools ». Pour la vidéo promo, INOV a réalisé le montage — la vidéographie (tournage) est du client. Les flyers, affiches et l'animation de logo ci-dessous sont réalisés par INOV.",
    ceo: "Kimberly",
    logo: logoParrots,
    logoFit: "cover",
    logoBg: "#efe9e0",
    tagline: "École de langues & bilingue — Haïti",
    accent: "#1B3A6B",
    impact: "Identité complète + série cohérente toute l'année",
    serviceIds: [10, 11, 4, 3],
    serviceLabels: ["Flyers & Affiches", "Posts Réseaux Sociaux", "Montage Vidéo", "Animation de Logo"],
    works: [
      { videoId: "7aMvQOuJblA", title: "Vidéo Promo — Parrots Schools", category: "Montage Vidéo", desc: "Vidéo courte pour Parrots Schools — montage dynamique au format vertical réalisé par INOV pour les réseaux sociaux (tournage fourni par le client)." },
      { videoId: "8Q-_Aa8AFJ0", title: "Animation de Logo — Parrots Schools", category: "Animation de Logo", desc: "Animation motion design réalisée par INOV Digital Services — mise en mouvement du logo Parrots Schools pour intros vidéo et réseaux sociaux." },
      { img: imgParrotsLogoBilingual, title: "Logo — Parrots Bilingual School", category: "Logo Existant", desc: "Logo pré-existant de Parrots Bilingual School — perroquet emblématique et toque de diplômé, rendu 3D sur mur texturé." },
      { img: imgParrotsCours, title: "Inscription — Cours d'Anglais", category: "Flyers & Affiches", desc: "Flyer d'inscription aux cours d'anglais — atouts pédagogiques, adresses et contacts sur fond bannière étoilée." },
      { img: imgParrotsSession, title: "Nouvelle Session — 23 août 2025", category: "Flyers & Affiches", desc: "Affiche d'annonce d'une nouvelle session de cours d'anglais pour enfants et adolescents, niveaux débutant et intermédiaire." },
      { img: imgParrotsInscription, title: "Campagne Inscription — Enfants & Ados", category: "Promotion en Ligne", desc: "Visuel réseaux sociaux mettant en avant les deux tranches d'âge accueillies et les atouts de l'école." },
      { img: imgParrotsAdresses, title: "Annonce 2 Adresses", category: "Flyers & Affiches", desc: "Flyer d'annonce de l'ouverture d'une deuxième adresse — signalétique directionnelle Delmas 33 & Pétion-Ville." },
      { img: imgParrotsCeremonie, title: "Cérémonie de Remise de Certificats", category: "Flyers & Affiches", desc: "Affiche événementielle pour la cérémonie annuelle — trois groupes honorés, Hôtel Montana, 15 août 2026." },
      { img: imgParrotsBilingual, title: "Inscriptions Ouvertes 2026-2027", category: "Flyers & Affiches", desc: "Flyer d'inscriptions de l'école bilingue — niveaux Garderie à CP, documents requis, contacts et adresse." },
    ],
  },
  {
    id: "eglise-rocher",
    client: "Église sur le Rocher",
    origin: "client",
    originNote: "Le logo de l'Église sur le Rocher est un logo pré-existant (non conçu par INOV), présenté ici en contexte. En revanche, le logo AJESRO et les affiches événementielles ci-dessous sont conçus par INOV.",
    logo: logoEglise,
    logoFit: "cover",
    logoBg: "#eef0f8",
    tagline: "Église évangélique — Pétion-Ville",
    accent: "#1B2E8A",
    impact: "Identité visuelle + communication événementielle",
    serviceIds: [1, 10],
    serviceLabels: ["Création de Logo", "Flyers & Affiches"],
    works: [
      { img: logoEglise, title: "Logo — Église sur le Rocher de Pétion-Ville", category: "Logo Existant", desc: "Logo pré-existant de l'Église sur le Rocher — croix lumineuse sur rocher ouvert, rendu circulaire sobre et institutionnel." },
      { img: imgEgliseAjesroLogo, title: "Logo — AJESRO", category: "Création de Logo", desc: "Logo de l'Association Juvénile de l'Église sur le Rocher (AJESRO) — silhouette jeune en adoration, palette or & noir premium." },
      { img: imgEgliseMissMister, title: "Miss & Mister Renaissance — AJESRO", category: "Flyers & Affiches", desc: "Affiche événementielle pour le concours Miss & Mister Renaissance organisé par AJESRO — critères de participation, prime à gagner et contacts." },
      { img: imgEgliseSemaine, title: "Semaine de Conférence — Mai 2025", category: "Flyers & Affiches", desc: "Affiche de la semaine de conférence du 11 au 18 mai 2025 — 5 conférenciers présentés, thème général et horaires." },
      { img: imgEglisePriere3, title: "24h de Prière Intense — Juillet 2025", category: "Flyers & Affiches", desc: "Affiche Actions de Grâce pour la veillée de prière intensive du 1er juillet 2025 — verset biblique et appel à la mobilisation." },
      { img: imgEglisePriere2, title: "24h de Prière Intense — Septembre 2025", category: "Flyers & Affiches", desc: "Affiche de prière intensive du 1er septembre 2025 — verset 2 Corinthiens 5:17, visuel épuré bleu marine." },
      { img: imgEgliseCongres, title: "Congrès AJESRO 2025", category: "Flyers & Affiches", desc: "Affiche du Congrès AJESRO du 29 au 31 août 2025 — thème, frais de participation et adresse de l'église." },
      { img: imgEglisePriere1, title: "24h de Prière Intense — Décembre 2025", category: "Flyers & Affiches", desc: "Affiche de prière intensive du 1er décembre 2025 — thème Renaissance, verset biblique et appel festif." },
    ],
  },
  {
    id: "ajesro",
    client: "AJESRO",
    logo: imgEgliseAjesroLogo,
    logoFit: "cover",
    logoBg: "#1a1a0f",
    tagline: "Association Juvénile de l'Église sur le Rocher — Pétion-Ville",
    accent: "#B8960C",
    impact: "Logo + identité événementielle pour la jeunesse",
    serviceIds: [1, 10],
    serviceLabels: ["Création de Logo", "Flyers & Affiches"],
    works: [
      { img: imgEgliseAjesroLogo,  title: "Logo — AJESRO",                       category: "Création de Logo",   desc: "Logo de l'Association Juvénile de l'Église sur le Rocher (AJESRO) — silhouette jeune en adoration, palette or & noir premium." },
      { img: imgEgliseMissMister,  title: "Miss & Mister Renaissance — AJESRO",  category: "Flyers & Affiches",  desc: "Affiche événementielle pour le concours Miss & Mister Renaissance organisé par AJESRO — critères de participation, prime à gagner et contacts." },
      { img: imgEgliseCongres,     title: "Congrès AJESRO 2025",                 category: "Flyers & Affiches",  desc: "Affiche du Congrès AJESRO du 29 au 31 août 2025 — thème, frais de participation et adresse de l'église." },
    ],
  },
  {
    id: "miss-mister-renaissance",
    client: "Miss & Mister Renaissance",
    logo: null,
    tagline: "Concours jeunesse organisé par AJESRO — Pétion-Ville",
    accent: "#B8960C",
    impact: "Affiche événementielle",
    serviceIds: [10],
    serviceLabels: ["Flyers & Affiches"],
    works: [
      { img: imgEgliseMissMister, title: "Miss & Mister Renaissance — AJESRO", category: "Flyers & Affiches", desc: "Affiche événementielle pour le concours Miss & Mister Renaissance organisé par AJESRO — critères de participation, prime à gagner et contacts." },
    ],
  },
  {
    id: "ladys",
    client: "A Lady's Center",
    origin: "modified",
    originNote: "Logo de départ généré par IA côté cliente. INOV l'a vectorisé, modernisé et épuré pour le rendre minimaliste et professionnel.",
    logo: logoLadysCenter,
    logoFit: "cover",
    logoBg: "#ffffff",
    tagline: "Centre de soins & bien-être — Delmas 64",
    accent: "#490b5e",
    impact: "Identité de marque complète + packaging",
    serviceIds: [2, 8, 10, 15, 6],
    serviceLabels: ["Création de Logo", "Conception Graphique", "Affiche Réseaux Sociaux", "Carte de Visite", "Packaging Design"],
    works: [
      { img: logoLadysCenter, title: "Logo — A Lady's Center", category: "Création de Logo", desc: "La cliente partait d'un logo généré par IA, mais savait qu'il ne faisait pas professionnel. Elle nous a contactés via TikTok pour le simplifier et le vectoriser. Résultat : silhouette féminine élancée, feuillage vert et galets de spa dans un cercle violet, typographie élégante « Soins & Bien Être » — un logo net, propre et prêt pour tous les supports." },
      { img: imgLadysLogoPurple, title: "Logo — Déclinaison fond violet", category: "Création de Logo", desc: "Version monochrome blanche du logo sur fond violet profond (#490b5e), pour les supports sombres et les réseaux sociaux." },
      { img: imgLadysLogoGreen, title: "Logo — Déclinaison fond vert", category: "Création de Logo", desc: "Version monochrome noire du logo sur fond vert nature (#76a323), déclinaison de l'identité pour varier les supports." },
      { img: imgLadysLogoHoriz, title: "Logo — Version horizontale", category: "Création de Logo", desc: "Déclinaison horizontale du logo sur fond blanc — signature en ligne idéale pour en-têtes, bannières et supports web." },
      { img: imgLadysCharte, title: "Charte graphique & déclinaisons", category: "Conception Graphique", desc: "Planche d'identité de marque A Lady's Center — mockups (enseigne, mur, polo), palette officielle (#490b5e, #76a323, #6a6a69), typographies Constantia & Calibri et pattern de marque." },
      { img: imgLadysWall, title: "Mockup — Enseigne murale", category: "Conception Graphique", desc: "Mise en situation du logo en relief sur un mur d'accueil éclairé — rendu de l'identité en environnement réel." },
      { img: imgLadysPolo, title: "Mockup — Polo brodé", category: "Conception Graphique", desc: "Broderie du logo A Lady's Center sur polo d'uniforme — déclinaison de la marque sur textile pour l'équipe." },
      { img: imgLadysShelf, title: "Mockup — Présentoir produits", category: "Conception Graphique", desc: "Vitrine de marque mettant en scène soins, huiles et serviettes bicolores violet & vert sous l'enseigne A Lady's Center." },
      { img: imgLadys, title: "Campagne Été — Éclat & Sérénité", category: "Affiche Réseaux Sociaux", desc: "Flyer promotionnel estival — présentation des 9 services du centre dans une identité visuelle élégante." },
      { img: imgLadysAlt, title: "Variante Campagne Été", category: "Affiche Réseaux Sociaux", desc: "Version alternative de la campagne Éclat & Sérénité pour un second placement réseaux sociaux." },
      { img: imgLadysEclat, title: "Affiche — Éclat & Sérénité", category: "Affiche Réseaux Sociaux", desc: "Affiche « Éclat & Sérénité — Préparez votre corps à rayonner tout l'été » listant les 9 prestations du centre, coordonnées et adresse Delmas 64." },
      { img: imgLadysMeres, title: "Promo — Spécial Fête des Mères", category: "Affiche Réseaux Sociaux", desc: "Flyer promotionnel « Spécial Fête des Mères » (du 15 au 31 mai) — grille tarifaire des forfaits massage & soins en gourdes, ambiance spa violet & vert." },
      { img: imgLadysManba, title: "Flyer — Manba (3 saveurs)", category: "Affiche Réseaux Sociaux", desc: "Flyer produit pour le beurre de cacahuète Manba d'A Lady's Center — pot en scène gourmande sur tartine, 3 saveurs (Gingembre, Sucré, Lokal) et coordonnées." },
      { img: imgLadysManbaGingembre, title: "Étiquette Manba — Gingembre", category: "Packaging Design", desc: "Étiquette produit Manba saveur Gingembre — arachides et gingembre en scène gourmande, ingrédients, contacts et drapeau haïtien sur fond vert." },
      { img: imgLadysManbaSucre, title: "Étiquette Manba — Sucré", category: "Packaging Design", desc: "Étiquette produit Manba saveur Sucré — déclinaison de la gamme avec liste d'ingrédients incluant le sucre et coordonnées de la marque." },
      { img: imgLadysManbaLokal, title: "Étiquette Manba — Lokal", category: "Packaging Design", desc: "Étiquette produit Manba saveur Lokal — variante nature de la gamme, ingrédients simples et identité A Lady's Center." },
      { img: imgLadysCardFront, title: "Carte de visite — Recto", category: "Carte de Visite", desc: "Recto de la carte de visite A Lady's Center — logo, vagues bicolores violet & vert, téléphones et adresse (#5, rue Jean Rigaud, Delmas 64)." },
      { img: imgLadysCardBack, title: "Carte de visite — Verso", category: "Carte de Visite", desc: "Verso de la carte de visite — liste complète des prestations : relaxation, soins amincissants, nail-tech, massage, soins du visage, skincare, body treatments, wood therapy, butt lifting." },
      { img: imgLadysCardMockup, title: "Carte de visite — Mockup", category: "Carte de Visite", desc: "Mise en scène des cartes de visite recto-verso en présentation flottante — rendu réaliste de l'impression." },
    ],
  },
  {
    id: "konfiti",
    client: "Konfiti Anana",
    logo: null,
    tagline: "Confiture artisanale — Port-au-Prince",
    accent: "#E67E22",
    impact: "Packaging + mise en scène produit",
    serviceIds: [6],
    serviceLabels: ["Packaging Design"],
    works: [
      { img: imgEtiquette, title: "Étiquette Bocal Ananas", category: "Packaging Design", desc: "Étiquette produit complète pour la confiture artisanale d'ananas — ingrédients, QR code Instagram, drapeau haïtien." },
      { img: imgProductFlyer, title: "Mockup Produit — Scène Naturelle", category: "Promotion en Ligne", desc: "Flyer publicitaire avec mise en scène naturelle du bocal Konfiti Anana pour Instagram et Facebook." },
    ],
  },
  {
    id: "techno-comptable",
    client: "Techno Comptable",
    logo: logoTC,
    logoFit: "cover",
    logoBg: "#e8f4ff",
    tagline: "Formation en comptabilité & logiciels — Haïti",
    accent: "#0077CC",
    impact: "Identité + communication événementielle",
    serviceIds: [7],
    serviceLabels: ["Flyers & Affiches"],
    works: [
      { img: logoTC, title: "Logo Techno Comptable", category: "Logo Existant", desc: "Logo pré-existant de Techno Comptable — emblème tech-comptabilité avec initiales TC sur fond sombre." },
      { img: imgTCQuickbooks, title: "Formation QuickBooks — Fiscalité Haïtienne", category: "Flyers & Affiches", desc: "Affiche de formation pratique sur QuickBooks et la fiscalité haïtienne — programme, dates et tarifs." },
    ],
  },
  {
    id: "moni-k-boutik",
    client: "Moni-K Boutik",
    ceo: "Monique",
    logo: logoMKB,
    logoFit: "cover",
    logoBg: "#f0faf0",
    tagline: "Produits naturels & alimentaires — Haïti",
    accent: "#4CAF50",
    impact: "Branding complet — logo, labels & packaging",
    serviceIds: [1, 6],
    serviceLabels: ["Création de Logo", "Packaging Design"],
    works: [
      { img: logoMKB, title: "Logo Moni-K Boutik", category: "Création de Logo", desc: "Logo 3D métal vert pour Moni-K Boutik — monogramme MKB en relief avec effet chrome élégant." },
      { img: imgMKBPost, title: "Post Produits — Kafelakou, Manbayiti, Chokolakay", category: "Promotion en Ligne", desc: "Visuel réseaux sociaux mettant en scène les 3 produits phares de la marque dans un décor naturel." },
      { img: imgMKBLabels, title: "Étiquettes Produits — Collection Complète", category: "Packaging Design", desc: "Design des 3 étiquettes produit : Kafelakou, Manbayiti et Chokolakay — code-barres, ingrédients et contact." },
      { img: imgMKBMockup, title: "Mockup Packaging — Manbayiti & Chokolakay", category: "Packaging Design", desc: "Rendu 3D réaliste des emballages Manbayiti (pot) et Chokolakay (sachet) sur fond blanc épuré." },
    ],
  },
  {
    id: "oxe-food",
    client: "OXÉ Food",
    logo: logoOxe,
    logoFit: "cover",
    logoBg: "#f4f6f0",
    tagline: "Restaurant & fast-food — Haïti",
    accent: "#1E4620",
    impact: "Identité gourmande + campagnes promotionnelles",
    serviceIds: [1, 10],
    serviceLabels: ["Création de Logo", "Flyers & Affiches"],
    works: [
      { img: logoOxe, title: "Logo — OXÉ Food", category: "Création de Logo", desc: "Logo du restaurant OXÉ Food — fourchette et cuillère croisées dans une horloge, palette vert forêt & orange appétissante." },
      { img: imgOxeBiereWings1, title: "Spécial Bière & Wings — Samedi 13 Décembre", category: "Flyers & Affiches", desc: "Flyer promotionnel événementiel — offres 3 bières à 500 Gdes et plat wings à 1000 Gdes, date, contacts et adresse." },
    ],
  },
  {
    id: "sdi",
    client: "SDI",
    logo: logoSdi,
    logoFit: "cover",
    logoBg: "#ede8d5",
    tagline: "Société pour le Développement et l'Investissement",
    accent: "#195b3e",
    impact: "Branding complet — logo, charte & mockups",
    serviceIds: [1],
    serviceLabels: ["Création de Logo", "Branding Complet"],
    works: [
      { img: logoSdi, title: "Logo — SDI", category: "Création de Logo", desc: "Logo de la Société pour le Développement et l'Investissement — monogramme SDI intégrant une poignée de main, palette or & vert." },
      { img: imgSdiMono, title: "Déclinaisons Monochromes", category: "Création de Logo", desc: "Variantes noir & blanc du logo SDI pour usages sur fonds clairs et foncés, garantissant la lisibilité en toutes conditions." },
      { img: imgSdiCharte, title: "Charte Graphique Complète", category: "Branding Complet", desc: "Planche de marque SDI — logo, palette de couleurs (or #cb9c2e, vert #195b3e), typographies Montserrat et motifs de marque." },
      { img: imgSdiEnseigne, title: "Enseigne — Mockup Façade", category: "Branding Complet", desc: "Rendu 3D de l'enseigne SDI en relief sur la façade d'un immeuble d'affaires — mise en situation premium." },
      { img: imgSdiPapeterie, title: "Papeterie — Mockup", category: "Branding Complet", desc: "Application du logo SDI sur papeterie professionnelle — mise en scène bureau élégante avec stylo et carnet." },
    ],
  },
  {
    id: "cryptociens-haitiens",
    client: "Cryptociens Haïtiens",
    logo: logoCch,
    logoFit: "cover",
    logoBg: "#f4f5fb",
    tagline: "Communauté crypto & Web3 — Haïti",
    accent: "#1e2a78",
    impact: "Identité de marque communautaire — logo & déclinaisons",
    serviceIds: [1],
    serviceLabels: ["Création de Logo", "Branding Complet"],
    works: [
      { img: logoCch, title: "Logo — Cryptociens Haïtiens", category: "Création de Logo", desc: "Emblème circulaire de la communauté Cryptociens Haïtiens — monogramme C dynamique en dégradé bleu nuit & rouge, entouré du nom en cercle." },
      { img: imgCchMono, title: "Version Monochrome", category: "Création de Logo", desc: "Déclinaison noire du logo pour impression et usages sur fonds clairs, préservant la lisibilité de l'emblème." },
      { img: imgCchNegative, title: "Version Négative", category: "Création de Logo", desc: "Déclinaison blanche sur fond sombre — idéale pour supports numériques et arrière-plans foncés." },
      { img: imgCchDeclinaisons, title: "Planche de Déclinaisons", category: "Branding Complet", desc: "Planche des variantes du logo — couleur, monochrome et négatif présentés sur leurs fonds respectifs pour garantir la cohérence de marque." },
    ],
  },
  {
    id: "the-doctor-company",
    client: "The Doctor Company",
    logo: logoTdc,
    logoFit: "cover",
    logoBg: "#f2f6fb",
    tagline: "Formation médicale & pharmaceutique — Haïti",
    accent: "#2e3192",
    impact: "Identité de marque + campagnes de séminaires",
    serviceIds: [1, 10],
    serviceLabels: ["Création de Logo", "Flyers & Affiches"],
    works: [
      { img: logoTdc, title: "Logo — The Doctor Company", category: "Création de Logo", desc: "Logo médical de The Doctor Company — tracé d'électrocardiogramme et stéthoscope stylisés, palette bleu #2e3192 & vert #00a651." },
      { img: imgTdcBranding, title: "Déclinaisons & Mockups", category: "Branding Complet", desc: "Application de la marque sur casquette et mug, avec la palette de couleurs officielle (bleu #2e3192, vert #00a651)." },
      { img: imgTdcSeminaire1, title: "Séminaire de Formation — Janvier 2025", category: "Flyers & Affiches", desc: "Affiche du séminaire Soins Médicaux & Pharmaceutiques (24 au 26 janvier 2025) — programme, tarifs et informations d'inscription." },
      { img: imgTdcSeminaire2, title: "Séminaire de Formation — Février 2025", category: "Flyers & Affiches", desc: "Affiche du séminaire au Cap-Haïtien (21 au 23 février 2025) — programme détaillé, participation et lieu." },
    ],
  },
  {
    id: "daily",
    client: "DAILY",
    logo: logoDaily,
    logoFit: "cover",
    logoBg: "#fff8ed",
    tagline: "Restaurant & pâtisserie — Pétion-Ville",
    accent: "#F39200",
    impact: "Identité gourmande + carte promotionnelle",
    serviceIds: [1, 10],
    serviceLabels: ["Création de Logo", "Flyers & Affiches"],
    works: [
      { img: logoDaily, title: "Logo — DAILY", category: "Création de Logo", desc: "Logo du restaurant DAILY — soleil rayonnant, fourchette et cuillère, signature « Une bouchée, une expérience inoubliable ! »." },
      { img: imgDailyMenu, title: "Carte Promotionnelle", category: "Flyers & Affiches", desc: "Flyer menu — Mini Cakes, Perfect Cakes et petites pièces salées avec prix, adresse et contacts à Pétion-Ville." },
    ],
  },
  {
    id: "ralines-cosmetics",
    client: "Raline's Cosmetics",
    ceo: "Lyne",
    logo: logoRalines,
    logoFit: "cover",
    logoBg: "#fdf3f8",
    tagline: "Cosmétiques & ateliers créatifs — Haïti",
    accent: "#C2186A",
    impact: "Identité élégante + campagnes d'ateliers",
    serviceIds: [1, 10],
    serviceLabels: ["Création de Logo", "Flyers & Affiches"],
    works: [
      { img: logoRalines, title: "Logo — Raline's Cosmetics", category: "Création de Logo", desc: "Logo Raline's Cosmetics — monogramme R en flamme rose & vert, typographie serif raffinée pour une image féminine et premium." },
      { img: imgRalinesCandle, title: "Atelier Candle Making", category: "Flyers & Affiches", desc: "Affiche de l'atelier Candle Making « Créer la flamme qui vous ressemble » — programme, bonus, tarifs et contact." },
    ],
  },
  {
    id: "mls-production",
    client: "MLS Production",
    logo: logoMls,
    logoFit: "cover",
    logoBg: "#e8ecfb",
    tagline: "Produits d'entretien — Haïti",
    accent: "#3730A3",
    impact: "Identité de marque + packaging produits",
    serviceIds: [1, 6, 10],
    serviceLabels: ["Création de Logo", "Packaging Design", "Affiche Réseaux Sociaux"],
    works: [
      { img: logoMls, title: "Logo — MLS Production", category: "Création de Logo", desc: "Logo de MLS Production — monogramme MLS sur un emblème vert évoquant fraîcheur et propreté, sur dégradé bleu." },
      { img: imgMlsDetergent, title: "Étiquette — Détergent M.L.S", category: "Packaging Design", desc: "Étiquette produit du Détergent M.L.S (16oz) — moussant, nettoyant & adoucissant, avec code-barres, pictogrammes de lavage et coordonnées du fabricant." },
      { img: imgMlsSuavi, title: "Étiquette — Suavi M.L.S", category: "Packaging Design", desc: "Étiquette de l'adoucissant Suavi M.L.S (16oz) — élimine 99,9 % des microbes, mise en scène florale fraîche et instructions d'usage." },
      { img: imgMlsSuaviFlyer, title: "Flyer — Suavi en bidon", category: "Affiche Réseaux Sociaux", desc: "Flyer promotionnel de l'adoucissant Suavi M.L.S en bidon — mise en scène des formats rose et bleu, offre « Achte 6 jwenn youn gratis », tarifs par contenance (gallon, ½ et ¼) et coordonnées." },
    ],
  },
  {
    id: "tchyca",
    client: "TCHYCA",
    logo: logoTchyca,
    logoFit: "cover",
    logoBg: "#fdf3df",
    tagline: "Produits alimentaires artisanaux — Haïti",
    accent: "#2E6B2E",
    impact: "Gamme complète d'étiquettes packaging",
    serviceIds: [1, 6],
    serviceLabels: ["Création de Logo", "Packaging Design"],
    works: [
      { img: logoTchyca, title: "Logo — TCHYCA", category: "Création de Logo", desc: "Logo de la marque alimentaire TCHYCA — typographie verte dégradée dans un cadre arrondi, évoquant le naturel et l'artisanal." },
      { img: imgTchycaManba, title: "Étiquette — Manba", category: "Packaging Design", desc: "Étiquette du beurre de cacahuète Manba (32oz) — lettrage gourmand en relief, drapeau haïtien, ingrédients, code-barres et mise en scène tartine." },
      { img: imgTchycaAnanas, title: "Étiquette — Confiture Ananas", category: "Packaging Design", desc: "Étiquette de la Confiture Ananas (16oz) — lettrage sirupeux doré, ananas frais, ingrédients en créole et coordonnées du fabricant." },
      { img: imgTchycaChadeque28, title: "Étiquette — Confiture Chadèque 28oz", category: "Packaging Design", desc: "Étiquette de la Confiture Chadèque (28oz) — visuel de pomelo haïtien, lettrage ambré et liste d'ingrédients en créole." },
      { img: imgTchycaChadeque16, title: "Étiquette — Confiture Chadèque 16oz", category: "Packaging Design", desc: "Déclinaison 16oz de l'étiquette Confiture Chadèque — même identité visuelle adaptée au plus petit format." },
      { img: imgTchycaKremas, title: "Étiquette — Kremas Kokoye", category: "Packaging Design", desc: "Étiquette du Kremas Kokoye (32oz) — crème de coco haïtienne, palmier, noix de coco fraîche et lettrage crémeux gourmand." },
    ],
  },
  {
    id: "tamimy",
    client: "Tamimy",
    logo: logoTamimy,
    logoFit: "cover",
    logoBg: "#eef4e2",
    tagline: "Épices & assaisonnements naturels — Haïti",
    accent: "#C0392B",
    impact: "Identité de marque + étiquette produit",
    serviceIds: [1, 6],
    serviceLabels: ["Création de Logo", "Packaging Design"],
    works: [
      { img: logoTamimy, title: "Logo — Tamimy", category: "Création de Logo", desc: "Logo de la marque Tamimy — lettrage manuscrit blanc sur badge rouge, chaleureux et appétissant." },
      { img: imgTamimyEpices, title: "Étiquette — Épices", category: "Packaging Design", desc: "Étiquette de l'assaisonnement Épices Tamimy (16oz) — 100 % naturel, mise en scène de légumes frais (poireau, ail, persil, poivrons) et liste d'ingrédients." },
    ],
  },
  {
    id: "rv-technology",
    client: "RV Technology",
    origin: "client",
    originNote: "Logo fourni par le client (non conçu par INOV). Les supports promotionnels ci-dessous sont réalisés par INOV.",
    logo: logoRvTech,
    logoFit: "cover",
    logoBg: "#eef2ff",
    tagline: "Technologie, énergie solaire & services financiers — Haïti",
    accent: "#1A3EDB",
    impact: "Communication visuelle complète",
    serviceIds: [8, 10],
    serviceLabels: ["Conception Graphique", "Affiche Réseaux Sociaux"],
    works: [
      { img: logoRvTech,          title: "Logo — RV Technology",          category: "Logo Existant",             desc: "Logo pré-existant de RV Technology — microprocesseur stylisé, typographie techno bleue sur fond blanc." },
      { img: imgRvTechEnergie,    title: "Flyer — Énergie & Solaire",     category: "Affiche Réseaux Sociaux",   desc: "Flyer de communication pour les services énergie de RV Technology : électricité bâtiment et systèmes solaires hybrides, avec tarification main-d'œuvre." },
      { img: imgRvTechMaintenance, title: "Flyer — Maintenance Informatique", category: "Affiche Réseaux Sociaux", desc: "Flyer promotionnel pour le service de maintenance informatique — réparation, nettoyage, récupération de données, interventions domicile/entreprise." },
      { img: imgRvTechFinance,    title: "Flyer — Services Financiers",   category: "Affiche Réseaux Sociaux",   desc: "Flyer de promotion des services de retrait NatCash (BNC & Unibank) disponibles chez RV Technology — design dynamique bilingue FR/HT." },
      { img: imgRvTechNoel,      title: "Flyer — Joyeux Noël 2025",      category: "Affiche Réseaux Sociaux",   desc: "Carte de vœux de Noël 2025 pour RV Technology — typographie 3D bleu glacé, boules de Noël dorées et liste complète des services." },
      { img: imgRvTechAnneuveau, title: "Flyer — Bonne Année 2025",      category: "Affiche Réseaux Sociaux",   desc: "Carte de Bonne Année 2025 pour RV Technology — feux d'artifice dorés sur fond nuit violacé, message chaleureux et lancement de RV SolCash." },
      { img: imgRvTechTransactions, title: "Flyer — Moyens de paiement", category: "Affiche Réseaux Sociaux",   desc: "Flyer « Facilitez vos transactions » pour RV Technology — Zelle, PayPal, Wise, USDT, Moncash, Natcash, Unibank & Sogebank, composition dynamique bleu et or avec billets en fond." },
    ],
  },
  {
    id: "yokesta-organisation",
    client: "Yokesta Organisation",
    origin: "client",
    originNote: "Logo fourni par le client (non conçu par INOV). Les visuels ci-dessous sont réalisés par INOV.",
    logo: logoYokesta,
    logoFit: "cover",
    logoBg: "#fff5f5",
    tagline: "Organisation culturelle & jeunesse — Haïti",
    accent: "#C0392B",
    impact: "Identité visuelle + communication événementielle",
    serviceIds: [10],
    serviceLabels: ["Affiche Réseaux Sociaux"],
    works: [
      { img: logoYokesta,        title: "Logo — Yokesta Organisation",    category: "Logo Existant",             desc: "Logo pré-existant de Yokesta Organisation — mascotte féminine illustrée en tenue traditionnelle haïtienne, badge rouge étoilé." },
      { img: imgYokestaWebinaire, title: "Flyer — Webinaire Exclusif",   category: "Affiche Réseaux Sociaux",   desc: "Flyer pour le webinaire « L'art de la prise de parole chez les jeunes héros » — portrait en N&B, palette orange chaud, typographie impactante." },
    ],
  },
  {
    id: "tchatcha-edition",
    client: "Tchatcha Édition",
    origin: "client",
    originNote: "Logo fourni par le client (non conçu par INOV). Les flyers ci-dessous sont réalisés par INOV.",
    logo: logoTchatcha,
    logoFit: "cover",
    logoBg: "#fff8f0",
    tagline: "Édition de livres pour enfants — Haïti & diaspora",
    accent: "#E67E22",
    impact: "Logo + communication institutionnelle",
    serviceIds: [10],
    serviceLabels: ["Affiche Réseaux Sociaux"],
    works: [
      { img: logoTchatcha,       title: "Logo — Tchatcha Édition",        category: "Logo Existant",             desc: "Logo pré-existant de Tchatcha Édition — silhouettes d'enfants sous un toit avec maracas, typographie orange bold." },
      { img: imgTchatchaFlyer,   title: "Flyer — Réinventons l'avenir",  category: "Affiche Réseaux Sociaux",   desc: "Flyer institutionnel de Tchatcha Édition : missions (culture haïtienne, créole, droits de l'enfant) et catalogue de publications jeunesse avec illustration IA." },
    ],
  },
  {
    id: "2002-store",
    client: "2002 Store & More",
    logo: logo2002,
    logoFit: "cover",
    logoBg: "#f9f0f0",
    tagline: "Mode & lifestyle — livraison à domicile, Haïti",
    accent: "#8B0000",
    impact: "Identité de marque complète",
    serviceIds: [2, 10],
    serviceLabels: ["Création de Logo", "Affiche Réseaux Sociaux"],
    works: [
      { img: logo2002,           title: "Logo — 2002 Store & More",       category: "Création de Logo",          desc: "Logo 2002 Store & More — phénix noir dans un triangle rouge sang, typographie condensée. Fort, mémorable et distinctif dans le secteur mode haïtien." },
      { img: img2002Mockup,      title: "Mockup 3D — Logo sur mur",      category: "Création de Logo",          desc: "Rendu 3D du logo 2002 Store & More sur béton texturé — déclinaison bi-chrome (gris acier + rouge bordeaux) pour une présentation premium." },
      { img: img2002Noir,        title: "Logo — Déclinaison fond noir",  category: "Création de Logo",          desc: "Version fond noir du logo 2002 — phénix bordeaux/blanc sur fond sombre, parfait pour les supports digitaux et les réseaux sociaux en dark mode." },
      { img: img2002Charte,      title: "Charte — Déclinaisons couleur", category: "Création de Logo",          desc: "Planche de déclinaisons du logo 2002 : 4 versions (fond noir/blanc × couleur/N&B) avec palette officielle (#c4161e, #ff0000, #8b0000, #000000)." },
      { img: img2002Flyer,       title: "Flyer — Vêtements pour tous",   category: "Affiche Réseaux Sociaux",   desc: "Flyer promotionnel 2002 Store & More : commande WhatsApp + livraison à domicile — composition lifestyle dynamique, rouge et noir, photo produit intégrée." },
    ],
  },
  {
    id: "i-learn-tech",
    client: "I Learn Tech Professional School",
    origin: "client",
    originNote: "Logo fourni par le client (non conçu par INOV). Les supports ci-dessous sont réalisés par INOV.",
    logo: null,
    tagline: "École professionnelle — Delmas 77, Haïti",
    accent: "#C4161E",
    impact: "Communication événementielle & recrutement",
    serviceIds: [10],
    serviceLabels: ["Affiche Réseaux Sociaux"],
    works: [
      { img: imgILearnPhoto, title: "Flyer — Cours de Photographie", category: "Affiche Réseaux Sociaux", desc: "Flyer pour la nouvelle session du cours de photographie de I Learn Tech — lettrage 3D « PHOTOGRAPHIE » sur fond appareils photo, horaires week-end et coordonnées de l'école." },
      { img: imgILearnAutoMoto, title: "Flyer — Auto & Moto École", category: "Affiche Réseaux Sociaux", desc: "Flyer de l'auto & moto école I Learn Tech — spéciale demi-bourse théorie et pratique, boîtes manuelle & automatique, mise en scène véhicule et moto sur fond rouge dynamique." },
    ],
  },
  {
    id: "ncc",
    client: "NCC — Nayouka Complex Comfort",
    origin: "client",
    originNote: "Logo fourni par le client (non conçu par INOV). Les visuels ci-dessous sont réalisés par INOV.",
    logo: null,
    tagline: "Soins capillaires naturels — Haïti",
    accent: "#1E7A3D",
    impact: "Présentation de gamme produits",
    serviceIds: [8],
    serviceLabels: ["Conception Graphique"],
    works: [
      { img: imgNcc, title: "Présentation — Gamme capillaire NCC", category: "Conception Graphique", desc: "Visuel de présentation de la gamme capillaire NCC (Nayouka Complex Comfort) — shampoing et après-shampoing à l'aloe vera, huile anti-chute et pommade au beurre de karité, avec texte descriptif complet." },
    ],
  },
  {
    id: "motion-design",
    client: "Motion Design",
    logo: null,
    tagline: "Motion design & animation 2D/3D",
    accent: "var(--ds-accent)",
    impact: "Contenu animé prêt pour les réseaux",
    serviceIds: [5],
    serviceLabels: ["Motion Design"],
    works: [
      { videoId: "3X-xLzdu2to", title: "Motion Design — Démonstration", category: "Motion Design", desc: "Animation graphique fluide et percutante — motion design pensé pour capter l'attention dans le flux des réseaux sociaux." },
    ],
  },
  {
    id: "montage-video",
    client: "Montage Vidéo",
    logo: null,
    tagline: "Montage vidéo pour les réseaux sociaux",
    accent: "var(--ds-accent)",
    impact: "Vidéos courtes prêtes à publier",
    serviceIds: [4],
    serviceLabels: ["Montage Vidéo"],
    works: [
      { videoId: "SFtvh7o5F_g", title: "Montage Vidéo — Démonstration", category: "Montage Vidéo", desc: "Montage dynamique au format vertical, optimisé pour maximiser l'engagement sur les réseaux sociaux." },
    ],
  },
]

// Albums with a client logo drive the main carousel; the rest live in the "Autre" section.
export const logoAlbums = albums.filter((a) => a.logo)
export const otherAlbums = albums.filter((a) => !a.logo)

// A work flattened with its parent album context — used to cross-reference
// portfolio pieces from elsewhere (e.g. a blog article about a given service).
export interface WorkWithClient extends Work {
  client: string
  accent?: string
  albumId: string
}

/** Collect works whose category is in `categories`, interleaved round-robin
 *  across albums so different clients show up rather than one client's full set.
 *  Returns [] for an empty category list (caller can then hide the section). */
// Clients kept out of the blog showcases (per request): AJESRO and A Lady's
// Center (ALC). Matched by client name so it survives album-id changes.
const BLOG_EXCLUDED_CLIENTS = new Set(["AJESRO", "A Lady's Center"])

export function worksByCategories(categories: string[], limit = 8): WorkWithClient[] {
  if (categories.length === 0) return []
  const set = new Set(categories)
  const perAlbum: WorkWithClient[][] = []
  for (const a of albums) {
    if (BLOG_EXCLUDED_CLIENTS.has(a.client)) continue
    const matches = a.works
      .filter((w) => set.has(w.category))
      .map((w) => ({ ...w, client: a.client, accent: a.accent, albumId: a.id }))
    if (matches.length) perAlbum.push(matches)
  }
  const out: WorkWithClient[] = []
  for (let i = 0; out.length < limit; i++) {
    let added = false
    for (const list of perAlbum) {
      if (list[i]) {
        out.push(list[i])
        added = true
        if (out.length >= limit) break
      }
    }
    if (!added) break
  }
  return out
}
