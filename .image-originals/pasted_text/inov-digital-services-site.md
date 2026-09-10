# Prompt pour Figma Make — Site INOV Digital Services

Copie-colle tout le texte ci-dessous dans Figma Make en une seule fois. Si l'outil limite la longueur, envoie-le en 2 messages : d'abord "PARTIE 1" jusqu'à "PARTIE 2", puis le reste.

---

## PARTIE 1 — Contexte, design system et structure

Construis un site web vitrine complet et responsive pour **INOV Digital Services**, une agence créative basée en Haïti (branding, motion design, marketing digital). Le site doit être en noir & blanc à très haut contraste, avec l'orange de marque utilisé uniquement en accent ponctuel (jamais en couleur dominante).

### Couleurs (crée des styles/variables)
- Background primaire : `#FFFFFF`
- Background secondaire (sections alternées) : `#F6F6F9`
- Fond de carte : `#FFFFFF`, hover carte : `#F0F0F5`
- Texte principal : `#000000`
- Texte secondaire (paragraphes) : `#4A4A58`
- Texte atténué (légendes) : `#5F5F6B`
- Texte sur fond noir : `#FFFFFF`
- Accent noir (boutons primaires, bordures fortes) : `#000000`
- Fond dégradé foncé : `#121218`
- **Accent orange de marque** : `#FF5500` (badges, liens hover, highlights, icônes actives)
- Orange clair (dégradés) : `#FF8800`
- Bordure par défaut : `rgba(0,0,0,0.1)`
- Bordure accent : `#000000`

Dégradés à utiliser :
- Primaire : linéaire 135°, `#000000` → `#22222C`
- Hero (fond de section) : linéaire 135°, `#FFFFFF` → `#F6F6F9`
- Barre orange : linéaire 90°, `#FF5500` → `#FF8800`
- Effet texte sur certains titres : linéaire 90°, `#000000` → `#333340`

### Typographie
Deux polices Google Fonts : **Outfit** (police principale, poids 300 à 900) et **Space Grotesk** (accents/citations, poids 300 à 700).

- Titre hero (H1) : Outfit 900, taille fluide desktop ~67px / mobile ~35px, line-height 1.12, letter-spacing -2%
- Titres de section (H2) : Outfit 800, desktop ~56px / mobile ~32px, line-height 1.15, letter-spacing -2%
- Sous-titres H3 (cartes/blocs) : Outfit 800, 35px, line-height 1.15
- Description hero : Outfit 500, 19px, line-height 1.7
- Sous-titre de section : Outfit 400, 17.6px, line-height 1.7
- Texte courant : Outfit 400, 16px, line-height 1.6
- Badges/tags (majuscules) : Outfit 700, 12.8px, letter-spacing +15%
- Texte de bouton : Outfit 700, 15.2px

### Composants de base
**Bouton primaire** : fond noir `#000000`, texte blanc, forme pilule (radius 100px), padding 16px/32px, ombre `0 8px 25px rgba(0,0,0,0.25)`. Au hover : fond `#22222A`, ombre plus marquée, translateY(-3px).

**Bouton secondaire** : fond blanc, texte noir, bordure noire 2px, pilule, même padding. Au hover : inversion des couleurs (fond noir, texte blanc).

**Badge / Section Tag** : pilule blanche, bordure noire 1.5px, texte majuscule bold, avec un petit point noir animé (pulse) avant le texte.

**Cartes** : radius 24px (cartes principales) ou 16px (cartes secondaires/modales), ombre douce `0 10px 30px rgba(0,0,0,0.15)` au hover, fond blanc.

### Breakpoints responsive
- ≥ 992px : layout desktop complet (grilles multi-colonnes)
- ≤ 1024px : ajustements tablette
- ≤ 768px : 1 colonne pour la plupart des grilles, menu mobile en burger
- ≤ 480px : ajustements fins petits écrans

Container centré desktop : max-width 1280px avec marges. Container mobile : padding horizontal 24px.

---

## PARTIE 2 — Sections du site (ordre exact + contenu réel)

### 1. Header / Navigation (fixe, sticky)
Logo "INOV" à gauche. Menu horizontal : Accueil, Services, Pourquoi Nous, Tarifs, Portfolio, Témoignages, FAQ, Contact. Sélecteur de langue FR/EN. Bouton "Demander un devis" en style bouton primaire. Sur mobile : menu burger.

### 2. Hero
- Badge en haut (ex. "Agence créative digitale")
- Titre H1 avec un mot clé en orange
- Description sous le titre
- Deux boutons côte à côte : "Voir nos tarifs" (bouton primaire, lien vers Tarifs) + "Voir le portfolio" (bouton secondaire, lien vers Portfolio)
- Ligne de statistiques en grille séparée par une fine bordure en haut : "150+ Projets", "80+ Clients", "12 Pays"
- Fond : dégradé hero (blanc → gris clair)

### 3. Services
Badge + titre de section + sous-titre, puis grille de 8 cartes (icône/emoji, titre H3, courte description, prix "à partir de") :
1. Branding & Identité
2. Création de Logo
3. Animation de Logo
4. Montage Vidéo
5. Motion Design
6. Packaging Design
7. Promotion en Ligne
8. Marketing Digital

Utilise ces textes commerciaux pour les descriptions (2-3 phrases, ton professionnel) :
- **Branding & Identité** : "Nous construisons une identité visuelle complète et cohérente — couleurs, typographie, ton — qui traduit fidèlement les valeurs de votre marque sur tous vos supports."
- **Création de Logo** : "Un logo sur-mesure, pensé pour être simple, mémorable et unique, capable de représenter votre entreprise sur tous les formats."
- **Animation de Logo** : "Nous donnons vie à votre logo grâce à une animation fluide et percutante, idéale pour vos vidéos et réseaux sociaux."
- **Montage Vidéo** : "Montage professionnel de vos vidéos promotionnelles et contenus pour réseaux sociaux, avec un rythme pensé pour maximiser l'engagement."
- **Motion Design** : "Des animations graphiques et effets visuels sur-mesure pour transformer vos messages en contenus captivants."
- **Packaging Design** : "Conception d'emballages attractifs et professionnels, pensés pour valoriser votre produit en rayon comme en ligne."
- **Promotion en Ligne** : "Des stratégies de promotion ciblées pour maximiser votre visibilité digitale auprès de votre audience."
- **Marketing Digital** : "Des campagnes de marketing digital complètes, pensées pour développer votre audience et convertir vos visiteurs en clients."

### 4. Why Us (fond gris clair `#F6F6F9`)
Grille 2-4 colonnes avec icône + titre + texte court par argument différenciant : rapidité d'exécution, prix adapté au marché haïtien, qualité professionnelle, support direct via WhatsApp.

### 5. Pricing / Tarifs (section la plus complexe)
- Badge + titre + sous-titre
- **Liste de 15 services** avec, pour chacun : un **sélecteur de quantité (stepper − / valeur / +)** plutôt qu'une simple case à cocher (le client doit pouvoir choisir 2x ou 3x le même service), nom du service, description courte, prix unitaire. Quand la quantité est ≥ 1, la ligne est mise en évidence et affiche le prix total (prix unitaire × quantité).
- La liste est présentée en **accordéon** : repliée par défaut (aperçu réduit avec les premiers services ou seulement les services déjà sélectionnés visibles), avec un bouton "Voir tous nos services (15)" qui déplie la liste complète avec une animation fluide. Icône ▼ qui devient ▲ une fois ouvert.
- Deux badges de réduction visibles : "10% dès 5 services" / "30% dès 10 services" — calculés sur la **somme totale des quantités**, pas sur le nombre de services distincts.
- **Panier latéral** (sticky) : liste des articles sélectionnés avec quantité (ex. "Création de Logo ×2"), bouton retirer (✕), sous-total, ligne de réduction appliquée, total, montant d'acompte à 70%.
- Boutons d'action du panier : "Commander via WhatsApp", "Télécharger le Devis (PDF)", "Télécharger la Présentation (PPTX)".
- Champ "Autre" : case à cocher + champ texte libre pour un besoin non listé.

### 6. Portfolio
Grille de projets, chaque item cliquable ouvre une lightbox modale avec image en grand, titre et description du projet. Bouton "Voir tout le portfolio" en style secondaire en bas.

### 7. Témoignages (fond gris clair)
Carrousel ou grille de témoignages clients : avatar, nom, citation en police Space Grotesk, étoiles de notation.

### 8. FAQ
Liste de questions/réponses en accordéon (clic pour déplier/replier).

### 9. Contact
Formulaire avec : Nom complet (texte, requis), Email (requis), Service souhaité (menu déroulant), Budget estimé (menu déroulant), Message/description du projet (textarea, requis), bouton d'envoi en style primaire. Le formulaire doit réellement envoyer les données (prévoir intégration Formspree ou EmailJS) et n'afficher un message de succès qu'après confirmation ; en cas d'échec, afficher une erreur claire avec un lien de secours vers WhatsApp.

### 10. Footer
Logo, liens rapides, icônes réseaux sociaux (Facebook, TikTok, Instagram), coordonnées : WhatsApp `+509 3625-5920`, email de contact, mention légale/copyright.

### 11. Éléments flottants globaux (sur toutes les pages)
- Bouton WhatsApp flottant en bas à droite
- Barre de progression orange en haut de page pendant le chargement
- Écran de chargement initial : fond noir `#0A0A0F`, logo pulsant avec halo orange, spinner circulaire orange

---

## PARTIE 3 — Comportements et fonctionnalités attendues

- Le panier de tarifs est **dynamique** : chaque changement de quantité met à jour en temps réel le sous-total, la réduction par palier et le total dans le panier latéral.
- Le bouton PPTX génère une présentation avec : une slide de couverture (logo, nom du client, date), une slide par service sélectionné (titre, visuel, description, encadré "avantage pour vous" en orange, badge de quantité si applicable, et pour les services vidéo un lien "Voir le projet complet" + QR code), une slide de clôture avec coordonnées et appel à l'action.
- Le bouton PDF génère un devis reprenant les lignes du panier (service, quantité, prix unitaire, total ligne), le sous-total, la réduction et le total avec acompte.
- Le bouton WhatsApp ouvre une conversation pré-remplie listant les services et quantités sélectionnés.
- Menu mobile en burger, header sticky au scroll.
- Toutes les interactions (hover boutons, accordéons, lightbox, stepper de quantité) doivent avoir des transitions fluides et cohérentes avec le style noir/blanc/orange défini plus haut.

---

**Instruction finale pour Figma Make** : génère d'abord le design system (couleurs, typographie, composants boutons/badges/cartes) comme base réutilisable, puis construis les sections dans l'ordre exact ci-dessus, en version desktop (1440px) et mobile (375px), en respectant strictement la palette noir/blanc/orange et en évitant toute couleur violette, cyan ou bleue non mentionnée ici.