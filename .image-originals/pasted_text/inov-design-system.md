# INOV Digital Services — Spec design pour reconstruction Figma

Ce document extrait **exactement** le design system et le contenu du site actuel (`index.html` / `style.css`), pour que tu puisses le reconstruire dans Figma sans avoir à redeviner les couleurs, tailles ou espacements. Structure : d'abord le design system (à monter en premier dans Figma sous forme de styles/variables), ensuite le détail section par section.

---

## 1. Setup Figma recommandé (à faire en premier)

1. Crée un fichier Figma, nomme-le `INOV Digital Services — Site Web`.
2. Crée 3 pages : **`🎨 Design System`**, **`🖥️ Desktop`**, **`📱 Mobile`**.
3. Sur la page Design System, crée les **Color Styles** et **Text Styles** listés ci-dessous (section 2) avant de commencer les frames — ça te fera gagner énormément de temps ensuite.
4. Frames desktop : **1440 × hauteur libre** par section (le site utilise `max-width: 1280px` centré, donc garde une colonne de contenu de 1280px avec 80px de marge de chaque côté sur un frame de 1440).
5. Frames mobile : **375 × hauteur libre**, padding horizontal de 24px (le site utilise `padding: 0 24px` sur `.container`).

---

## 2. Design System — Couleurs

Le site est un thème **noir & blanc à haut contraste**, avec l'orange de marque utilisé uniquement en accent ponctuel (badges, liens actifs, highlights) — **pas** en couleur dominante.

| Nom du style Figma | Hex | Usage |
|---|---|---|
| `Background/Primary` | `#FFFFFF` | Fond général des sections |
| `Background/Secondary` | `#F6F6F9` | Fond de sections alternées (why-us, testimonials) |
| `Background/Card` | `#FFFFFF` | Fond des cartes |
| `Background/Card Hover` | `#F0F0F5` | État hover des cartes |
| `Text/Primary` | `#000000` | Titres, texte fort |
| `Text/Secondary` | `#4A4A58` | Paragraphes, descriptions |
| `Text/Muted` | `#5F5F6B` | Texte secondaire, légendes |
| `Text/On Dark` | `#FFFFFF` | Texte sur fond noir |
| `Accent/Black` | `#000000` | Boutons primaires, bordures fortes |
| `Accent/Dark` | `#121218` | Fonds dégradés foncés |
| `Accent/Orange` | `#FF5500` | **Accent de marque** — badges, liens hover, highlights, icônes actives |
| `Accent/Orange Light` | `#FF8800` | Dégradé avec l'orange (barre de progression, halos) |
| `Border/Default` | `rgba(0,0,0,0.1)` | Séparateurs, bordures de cartes |
| `Border/Accent` | `#000000` | Bordures de boutons secondaires, section-tag |

**Dégradés à recréer** :
- `Gradient/Primary` : linéaire 135°, `#000000` → `#22222C`
- `Gradient/Hero` : linéaire 135°, `#FFFFFF` → `#F6F6F9`
- `Gradient/Orange Bar` : linéaire 90°, `#FF5500` → `#FF8800`
- `Gradient/Text` (effet sur certains titres) : linéaire 90°, `#000000` → `#333340`

---

## 3. Design System — Typographie

Deux familles Google Fonts :
- **`Outfit`** (police principale) — poids utilisés : 300, 400, 500, 600, 700, 800, 900
- **`Space Grotesk`** (police secondaire, accents/citations) — poids : 300 à 700

Ajoute ces deux polices dans Figma (Google Fonts, disponibles nativement).

| Style Figma | Police | Taille (desktop) | Poids | Line-height | Letter-spacing | Usage |
|---|---|---|---|---|---|---|
| `Heading/Hero` | Outfit | 67px *(clamp 2.2rem→4.2rem)* | 900 | 1.12 | -2% | Titre principal du hero |
| `Heading/Section` | Outfit | 56px *(clamp 2rem→3.5rem)* | 800 | 1.15 | -2% | Titres de section (H2) |
| `Heading/H3` | Outfit | 35px | 800 | 1.15 | -2% | Sous-titres de cartes/blocs |
| `Body/Hero Description` | Outfit | 19px | 500 | 1.7 | 0 | Texte sous le hero-title |
| `Body/Section Subtitle` | Outfit | 17.6px | 400 | 1.7 | 0 | Sous-titre de section |
| `Body/Default` | Outfit | 16px | 400 | 1.6 | 0 | Texte courant |
| `Label/Tag` | Outfit | 12.8px | 700 | 1 | +15% | `.section-tag` (badges pilule en majuscules) |
| `Label/Button` | Outfit | 15.2px | 700 | 1 | 0 | Texte des boutons |

**Note importante** : les titres utilisent `clamp()` en CSS (taille fluide selon la largeur d'écran). En Figma, prépare **deux valeurs figées** : desktop (valeur max ci-dessus, ex. 67px) et mobile (valeur min : hero ≈ 35px, section-title ≈ 32px), avec un style de texte distinct par breakpoint.

---

## 4. Design System — Composants

### Boutons
| Composant | Fond | Texte | Bordure | Radius | Padding | Ombre |
|---|---|---|---|---|---|---|
| `Button/Primary` | `#000000` | `#FFFFFF` | — | 100px (pilule) | 16px / 32px | `0 8px 25px rgba(0,0,0,0.25)` |
| `Button/Primary Hover` | `#22222A` | `#FFFFFF` | — | 100px | idem | `0 14px 35px rgba(0,0,0,0.35)` + translateY(-3px) |
| `Button/Secondary` | `#FFFFFF` | `#000000` | 2px `#000000` | 100px | 16px / 32px | `0 4px 15px rgba(0,0,0,0.05)` |
| `Button/Secondary Hover` | `#000000` | `#FFFFFF` | 2px `#000000` | 100px | idem | inversion des couleurs |

Construis ces 2 boutons comme **composants Figma avec variants** (`Property: State = Default / Hover`) pour pouvoir les réutiliser partout sur le site.

### Badge / Section Tag
Pilule blanche, bordure noire 1.5px, texte majuscule 12.8px bold, avec un petit point noir animé (pulse) avant le texte. Padding 6px/16px, radius 100px.

### Cartes (services, portfolio, témoignages)
- Radius : `--radius-lg` = 24px (cartes principales) ou `--radius-md` = 16px (cartes secondaires/modals)
- Ombre douce type `0 10px 30px rgba(0,0,0,0.15)` au hover
- Fond blanc sur fond de section blanc/gris clair

---

## 5. Structure de la page (ordre des sections, contenu réel)

Reconstruis les frames dans cet ordre exact. Pour chaque section : le contenu texte réel est indiqué pour que tu n'aies pas à retourner voir le HTML.

### 5.1 — Header / Navigation (fixe, sticky)
Logo INOV à gauche + menu horizontal (Accueil, Services, Pourquoi Nous, Tarifs, Portfolio, Témoignages, FAQ, Contact) + sélecteur de langue FR/EN + bouton "Demander un devis" en `Button/Primary`.

### 5.2 — Hero (`#home`)
- `section-tag` (badge) en haut
- `hero-title` (H1, 900, orange sur le mot clé via `.hero-orange-text`)
- `hero-description` en dessous
- `hero-actions` : 2 boutons côte à côte → `Button/Primary` "Voir nos tarifs" (lien `#pricing`) + `Button/Secondary` "Voir le portfolio" (lien `#portfolio`)
- `hero-stats` : ligne de statistiques en grille (ex. "150+ Projets", "80+ Clients", "12 Pays"), séparée du reste par une bordure fine en haut
- Fond : `Gradient/Hero`

### 5.3 — Services (`#services`)
Section avec `section-tag` + `section-title` + `section-subtitle`, puis grille de **cartes services**. D'après le contenu déjà fourni précédemment, les 8 cartes principales à afficher (résumé, version courte pour les cartes — la liste complète des 15 services détaillés est dans la section Tarifs) :
1. Branding & Identité
2. Création de Logo
3. Animation de Logo
4. Montage Vidéo
5. Motion Design
6. Packaging Design
7. Promotion en Ligne
8. Marketing Digital

Chaque carte : icône/emoji en haut, titre (H3), courte description, éventuellement un prix "à partir de".

### 5.4 — Why Us (`#why-us`)
Fond `Background/Secondary` (gris clair `#F6F6F9`), section mettant en avant les arguments différenciants (rapidité, prix marché haïtien, qualité, support WhatsApp direct). Généralement en grille 2-4 colonnes avec icône + titre + texte court par argument.

### 5.5 — Pricing / Tarifs (`#pricing`)
Section la plus complexe de la page :
- `section-tag` + `section-title` + `section-subtitle`
- **Liste des 15 services** avec case à cocher/quantité, nom, description courte, prix (design en accordéon repliable prévu — voir note ci-dessous)
- Deux badges de réduction visibles : "10% dès 5 services" / "30% dès 10 services"
- **Panier latéral** (`#tarifs-cart`) : liste des articles sélectionnés avec bouton retirer (✕), sous-total, ligne réduction, total, montant d'acompte (70%)
- Boutons d'action du panier : "Commander via WhatsApp", "Télécharger le Devis (PDF)", "Télécharger la Présentation (PPTX)"
- Champ "Autre" avec case à cocher + champ texte libre

**Note pour la maquette Figma** : prévoir deux états pour la liste de services — `Accordéon fermé` (aperçu réduit) et `Accordéon ouvert` (liste complète des 15 lignes) — cette fonctionnalité est en cours d'implémentation côté dev (voir plan d'implémentation séparé).

### 5.6 — Portfolio (`#portfolio`)
Grille de projets (`#portfolio-grid`), chaque item cliquable ouvrant une **lightbox modale** (`#portfolio-lightbox`) avec l'image en grand + titre + description du projet. Bouton en bas "Voir tout le portfolio" en `Button/Secondary`.

### 5.7 — Témoignages (`#testimonials`)
Fond `Background/Secondary`. Carrousel ou grille de témoignages clients (photo/avatar, nom, texte de citation en `Space Grotesk`, étoiles de notation).

### 5.8 — FAQ (`#faq`)
Liste de questions/réponses en accordéon (questions cliquables qui déplient la réponse).

### 5.9 — Contact (`#contact`)
Formulaire avec les champs suivants (à reproduire fidèlement) :
- Nom complet (`text`, requis)
- Email (`email`, requis)
- Service souhaité (`select` déroulant)
- Budget estimé (`select` déroulant)
- Message / description du projet (`textarea`, requis)
- Bouton d'envoi en `Button/Primary`

### 5.10 — Footer
Logo, liens rapides, réseaux sociaux (Facebook, TikTok, Instagram — icônes déjà visibles dans les visuels de marque fournis), coordonnées (WhatsApp `+509 3625-5920`, email), mention légale/copyright.

### 5.11 — Éléments flottants globaux (à ne pas oublier)
- **Bouton WhatsApp flottant** (bas droite, toutes pages)
- **Barre de progression orange** en haut de page (chargement des images)
- **Écran de chargement** (`#loader-screen`) : fond noir `#0A0A0F`, logo pulsant avec halo orange, spinner circulaire orange

---

## 6. Responsive — points de rupture à respecter

Le CSS définit ces breakpoints (à reproduire dans les frames mobile/tablette Figma) :
- **≥ 992px** : layout desktop complet (grilles multi-colonnes)
- **≤ 1024px** : ajustements tablette
- **≤ 768px** : passage en 1 colonne pour la plupart des grilles, menu mobile (burger)
- **≤ 480px** : ajustements fins mobile (petits écrans)

Sur mobile, le `hero-title` passe de 67px à environ **35px** (2.2rem), garder les mêmes proportions de hiérarchie ailleurs.

---

## 7. Checklist de construction (ordre suggéré)

- [ ] Color styles + Text styles (section 2 et 3)
- [ ] Composants Button (Primary/Secondary, variants hover)
- [ ] Composant Section Tag (badge)
- [ ] Composant Card (service / portfolio / témoignage)
- [ ] Header/Nav (desktop + mobile burger)
- [ ] Hero
- [ ] Services
- [ ] Why Us
- [ ] Pricing (avec accordéon + panier)
- [ ] Portfolio + lightbox
- [ ] Témoignages
- [ ] FAQ
- [ ] Contact
- [ ] Footer
- [ ] Éléments flottants (WhatsApp, loader)
- [ ] Déclinaison mobile de chaque section

---

**Astuce** : une fois le Design System (section 2-4) posé dans Figma, chaque section suivante ira beaucoup plus vite puisque tu réutilises les mêmes styles de texte, couleurs et composants de boutons partout.