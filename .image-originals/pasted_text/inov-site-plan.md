# Plan d'implémentation — INOV Digital Services (site vitrine)

Contexte : site statique (HTML/CSS/JS vanilla, GitHub Pages). Ce document liste les correctifs et améliorations à implémenter, classés par priorité, avec fichiers concernés et critères d'acceptation.

---

## P0 — Bloquant (à faire en premier)

### 1. Formulaire de contact ne transmet aucune donnée
**Fichier** : `js/main.js` (~ligne 598-614)

Le handler `submit` fait un `setTimeout` qui affiche un toast de succès sans jamais envoyer les données. Le champ commenté `// Simulate send (replace with actual EmailJS or Formspree)` confirme que c'est un placeholder resté en prod.

**Action** :
- Intégrer un vrai service d'envoi : **Formspree** ou **EmailJS** (les deux fonctionnent en JS pur, compatibles GitHub Pages, gratuits jusqu'à un certain volume).
- Le formulaire doit poster vers le service choisi et n'afficher le toast de succès qu'après une réponse HTTP 200 confirmée (pas avant).
- En cas d'échec réseau, afficher un message d'erreur clair et proposer le fallback WhatsApp (lien déjà présent sur le site).

**Critère d'acceptation** : soumettre le formulaire avec des données de test doit faire arriver un email à `inov01contact@gmail.com` (ou notification Formspree/EmailJS), vérifiable en conditions réelles.

---

## P1 — Cohérence de marque

### 2. Favicon incohérent avec la charte
**Fichier** : `index.html` (ligne 20)

Le favicon est un SVG en data-URI généré à la volée, fond violet (`#7c3aed`) avec un simple "I" blanc — ne correspond pas au logo réel ni aux couleurs de la marque (orange `#f05d29` / noir).

**Action** :
- Générer un vrai favicon à partir de `assets/logo.png` (format ICO + PNG 32x32/180x180 pour Apple touch icon).
- Remplacer le `<link rel="icon">` data-URI par les fichiers générés, servis depuis `assets/favicon/`.

### 3. `og:image` ne correspond pas à la marque
**Fichier** : `index.html` (ligne 17)

`og:image` pointe vers `assets/hero_bg.png`, un fond abstrait bleu/violet générique. Quand un lien du site est partagé (WhatsApp, Facebook, Instagram bio), l'aperçu ne montrera ni le logo ni les couleurs INOV.

**Action** :
- Créer une image dédiée au partage social (1200×630px, format recommandé Open Graph), reprenant le logo INOV sur fond noir/orange, éventuellement avec le slogan.
- Remplacer la valeur de `og:image` par ce nouveau fichier (ex. `assets/og-cover.png`).

### 4. Variables CSS résiduelles violet/cyan
**Fichier** : `css/style.css`

Le fichier contient encore des variables `--accent-cyan` et `--accent-purple` (définies vers la ligne 214+) utilisées dans plusieurs composants : modal de paiement (`.modal-service-price`), nav mobile (`.nav-mobile a:hover`), footer (`.footer-copy strong`), boutons secondaires du modal. C'est probablement la source du favicon/og:image violet — reliquat d'un thème antérieur jamais nettoyé après le passage à l'identité orange/noir.

**Action** :
- Auditer toutes les occurrences de `--accent-cyan` et `--accent-purple` dans `style.css` (`grep -n "accent-cyan\|accent-purple" css/style.css`).
- Les remplacer par les variables de marque actuelles (`--primary` / orange officiel `#f05d29`, ou noir/gris selon le contexte).
- Supprimer les déclarations `--accent-cyan` / `--accent-purple` du `:root` une fois qu'elles ne sont plus référencées.

**Critère d'acceptation** : `grep -rn "accent-cyan\|accent-purple" css/ index.html` ne retourne plus rien.

---

## P2 — Qualité de code / maintenabilité

### 5. Styles inline excessifs
**Fichier** : `index.html` (81 occurrences de `style="..."`)

Beaucoup de `style="color: #ffffff;"` répétés (labels de formulaire, contact, footer) au lieu de classes CSS. Rend la maintenance et les futurs changements de thème plus risqués.

**Action** :
- Créer des classes utilitaires dans `style.css` (ex. `.text-white`, `.text-muted`) pour les cas répétés.
- Remplacer progressivement les `style="..."` inline correspondants par ces classes, en commençant par les blocs contact/footer qui concentrent la majorité des occurrences.

*(Peut être fait en plusieurs passes, non bloquant pour la mise en prod des points P0/P1.)*

### 6. Chargement de `html2pdf.js` sur toutes les pages
**Fichier** : `index.html` (ligne 30)

Le script CDN `html2pdf.bundle.min.js` (~300 Ko) est chargé dans le `<head>` pour toutes les visites, alors qu'il n'est utilisé que si l'utilisateur clique sur "Télécharger le Devis (PDF)" dans la section tarifs.

**Action** :
- Charger le script dynamiquement (injection du `<script>` en JS) uniquement au premier clic sur "Télécharger le Devis (PDF)", ou déplacer le `<script>` juste avant `</body>` avec l'attribut `defer`.

**Critère d'acceptation** : le temps de chargement initial (First Contentful Paint) diminue mesurablement (vérifiable via Lighthouse).

---

## P1 (nouvelle fonctionnalité) — Génération automatique d'une présentation PowerPoint par sélection client

### 7. Export PPTX personnalisé depuis le panier de tarifs
**Fichiers** : `js/main.js` (logique panier existante), `index.html` (bouton dans `#cart-actions`), nouveau fichier `js/services-data.js` (ou extension du tableau de services déjà utilisé pour générer `#tarifs-body`)

**Objectif** : quand le client sélectionne des services dans le tableau de tarifs, un bouton permet de générer et télécharger un fichier `.pptx` avec **une slide par service sélectionné**, contenant :
- Le nom du service,
- Une description commerciale du service,
- Un visuel à l'appui,
- L'avantage concret que ce service apporte au client.

#### Choix technique
Le site est statique (GitHub Pages, pas de backend) — la génération doit se faire **côté navigateur**, sur le même principe que `html2pdf.js` déjà utilisé pour le devis PDF. Librairie recommandée : **[PptxGenJS](https://gitbrent.github.io/PptxGenJS/)** (JS pur, CDN, pas de build nécessaire, compatible avec l'archi actuelle du site).

```html
<script src="https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js"></script>
```
À charger dynamiquement au premier clic sur le bouton d'export (pas dans le `<head>`), même logique de perf que le point 6 ci-dessus.

#### Modèle de données à préparer (par service)
Étendre la structure de données des services (actuellement les 8 `service-card` de `index.html` + les lignes de `#tarifs-body` générées en JS) avec les champs suivants :

```js
{
  id: "branding",
  title: "Branding & Identité",
  type: "static",              // "static" | "video"
  description: "Texte commercial 2-3 phrases pour la slide.",
  advantage: "Ex : Une image de marque cohérente qui inspire confiance et se démarque de la concurrence.",
  image: "assets/portfolio/branding-01.png",   // requis si type = "static"
  gifPreview: "assets/portfolio/motion-01.gif", // requis si type = "video"
  projectUrl: "https://instagram.com/p/xxxxx"   // requis si type = "video", lien réel vers le projet
}
```

**Action côté contenu (à fournir par INOV, pas par le dev)** :
- Pour les services **statiques** (branding, logo, packaging design, etc.) : une image par service.
- Pour les services **vidéo / motion design** : un GIF de prévisualisation + le lien réel vers le projet publié (Instagram, TikTok, Drive, etc.).

#### ⚠️ Limitation technique importante — GIFs dans PowerPoint
PowerPoint **n'anime pas les GIFs insérés** dans un slide : seule la première frame s'affiche, comme une image statique. Deux options :
1. **Recommandé** : insérer le GIF comme image fixe (aperçu visuel) + ajouter sur la même slide un bouton/texte cliquable **"▶ Voir le projet complet"** en hyperlien vers `projectUrl`, éventuellement un QR code généré pour faciliter le scan sur mobile pendant une présentation en présentiel.
2. Alternative plus lourde : convertir un extrait vidéo réel (mp4) et l'embarquer via `addMedia()` de PptxGenJS — fonctionne mais alourdit fortement le fichier généré et complique la génération 100% côté client. **Non recommandé pour une V1.**

#### Structure de la présentation générée
1. **Slide de couverture** : logo INOV, nom du client (repris du champ `#devis-client-name` déjà existant dans le panier), date, sous-titre "Vos services sélectionnés".
2. **Une slide par service sélectionné** (dans l'ordre de sélection) :
   - Titre du service en haut,
   - Image (ou GIF en aperçu statique) sur un côté,
   - Description du service,
   - Encadré "Avantage pour vous" mis en valeur visuellement (couleur orange de la marque),
   - Si `type === "video"` : bouton hyperlien "Voir le projet complet" + QR code.
3. **Slide de clôture** : coordonnées (WhatsApp, email, Instagram), call-to-action "Prêt à démarrer ?", logo.

#### Intégration UI
Ajouter un bouton dans `#cart-actions` (`index.html`, section pricing), à côté de "Commander via WhatsApp" et "Télécharger le Devis (PDF)" :
```html
<button class="tarifs-btn tarifs-btn-pptx" onclick="telechargerPresentationPPTX()">
  🖼️ Télécharger la Présentation (PPTX)
</button>
```
Nom de fichier généré : `Presentation-INOV-[NomClient]-[date].pptx` (même convention que le devis PDF).

**Critère d'acceptation** :
- Sélectionner 2-3 services dans le panier puis cliquer sur le bouton génère un `.pptx` téléchargeable qui s'ouvre correctement dans PowerPoint/Google Slides/Keynote.
- Chaque slide de service affiche la bonne image/GIF, la bonne description et le bon avantage (pas de contenu mélangé entre services).
- Les slides "vidéo/motion design" contiennent bien un lien cliquable fonctionnel vers le projet réel.
- Le fichier reste raisonnable en poids (< 15-20 Mo même avec plusieurs services sélectionnés) — compresser les images/GIFs en amont si nécessaire.

---

## Résumé priorisé

| # | Sujet | Fichier(s) | Priorité |
|---|-------|-----------|----------|
| 1 | Formulaire de contact ne fonctionne pas | `js/main.js` | P0 |
| 4 | Variables CSS violet/cyan résiduelles | `css/style.css` | P1 |
| 2 | Favicon incohérent | `index.html` | P1 |
| 3 | og:image incohérent | `index.html` | P1 |
| 7 | Export PPTX personnalisé par service sélectionné | `js/main.js`, `index.html`, `js/services-data.js` | P1 |
| 8 | Liste de tarifs en accordéon repliable | `index.html`, `css/style.css`, `js/main.js` | P2 |
| 9 | Sélection multiple du même service (quantité) | `js/main.js`, `css/style.css` | P1 |
| 6 | html2pdf.js chargé partout | `index.html` | P2 |
| 5 | Styles inline excessifs | `index.html` | P2 |

Recommandation d'ordre d'exécution : **1 → 4 → 2 → 3 → 9 → 8 → 7 → 6 → 5**.

*(Le point 9 est placé avant le 8 dans l'ordre d'exécution car les deux modifient le même rendu de ligne `.tarifs-row` — autant construire directement la version finale avec quantités avant d'habiller le conteneur en accordéon, plutôt que de le faire deux fois.)*

**Prérequis avant de lancer le point 7** : INOV doit fournir, pour chacun des 8 services actuels, une description commerciale courte, un texte d'avantage, et un visuel (image pour les services statiques, GIF + lien réel de projet pour vidéo/motion design). Le développement peut commencer avec des placeholders, mais l'export final ne sera utilisable en clientèle qu'une fois ce contenu fourni.

---

## Annexe — Contenu textuel prêt à l'emploi (`js/services-data.js`)

Les descriptions et avantages ci-dessous sont validés et prêts à intégrer. Les champs `image` / `gifPreview` / `projectUrl` sont laissés en placeholder (`"TODO"`) — le développeur peut commencer l'intégration avec des visuels temporaires ("ce qu'il a sous la main"), les vrais assets et liens seront fournis par INOV dans un second temps pour remplacer les `TODO`.

```js
const servicesData = [
  {
    id: "branding",
    title: "Branding & Identité",
    type: "static",
    description: "Nous construisons une identité visuelle complète et cohérente — couleurs, typographie, ton — qui traduit fidèlement les valeurs de votre marque sur tous vos supports.",
    advantage: "Une image de marque professionnelle et reconnaissable qui inspire confiance dès le premier contact avec vos clients.",
    image: "TODO"
  },
  {
    id: "logo",
    title: "Création de Logo",
    type: "static",
    description: "Un logo sur-mesure, pensé pour être simple, mémorable et unique, capable de représenter votre entreprise sur tous les formats — du site web à la carte de visite.",
    advantage: "Une signature visuelle forte qui vous démarque immédiatement de la concurrence et facilite la reconnaissance de votre marque.",
    image: "TODO"
  },
  {
    id: "logo-animation",
    title: "Animation de Logo",
    type: "video",
    description: "Nous donnons vie à votre logo grâce à une animation fluide et percutante, idéale pour vos vidéos, intros de contenu et réseaux sociaux.",
    advantage: "Un rendu dynamique et moderne qui capte l'attention instantanément et renforce le professionnalisme de vos contenus vidéo.",
    gifPreview: "TODO",
    projectUrl: "TODO"
  },
  {
    id: "montage-video",
    title: "Montage Vidéo",
    type: "video",
    description: "Montage professionnel de vos vidéos promotionnelles, clips et contenus pour réseaux sociaux, avec un rythme et un rendu pensés pour maximiser l'engagement.",
    advantage: "Des vidéos prêtes à publier qui captent l'attention plus longtemps et augmentent vos interactions sur les réseaux.",
    gifPreview: "TODO",
    projectUrl: "TODO"
  },
  {
    id: "motion-design",
    title: "Motion Design",
    type: "video",
    description: "Des animations graphiques et effets visuels sur-mesure pour transformer vos messages en contenus captivants et facilement partageables.",
    advantage: "Un contenu qui se démarque dans le flux des réseaux sociaux et communique votre message plus efficacement qu'un visuel statique.",
    gifPreview: "TODO",
    projectUrl: "TODO"
  },
  {
    id: "packaging",
    title: "Packaging Design",
    type: "static",
    description: "Conception d'emballages attractifs et professionnels, pensés pour valoriser votre produit aussi bien en rayon physique qu'en ligne.",
    advantage: "Un packaging qui attire l'œil, inspire confiance sur la qualité du produit et augmente concrètement vos ventes.",
    image: "TODO"
  },
  {
    id: "promotion-en-ligne",
    title: "Promotion en Ligne",
    type: "static",
    description: "Des stratégies de promotion ciblées — visuels, campagnes, contenus — pour maximiser votre visibilité digitale auprès de votre audience.",
    advantage: "Une présence en ligne plus visible et plus efficace, qui touche les bonnes personnes au bon moment.",
    image: "TODO"
  },
  {
    id: "marketing-digital",
    title: "Marketing Digital",
    type: "static",
    description: "Des campagnes de marketing digital complètes, pensées de bout en bout pour développer votre audience et convertir vos visiteurs en clients.",
    advantage: "Une croissance mesurable de votre audience et de vos ventes grâce à une stratégie digitale cohérente et suivie dans le temps.",
    image: "TODO"
  }
];
```

**Note pour le développeur** : les champs `"TODO"` doivent être remplacés par les chemins réels des assets (`assets/portfolio/...`) et les URLs de projets une fois fournis par INOV. Tant que ces champs ne sont pas remplis, prévoir un visuel de remplacement générique (ex. le logo INOV sur fond de couleur de marque) pour que la génération PPTX ne plante pas si un service est sélectionné sans image associée.

---

## P2 (nouvelle fonctionnalité) — Liste de tarifs en accordéon repliable

### 8. Transformer le tableau des 15 services en tiroir déroulant
**Fichiers** : `index.html` (bloc `.tarifs-table-wrapper`, section `#pricing`), `css/style.css` (styles `.tarifs-*`), `js/main.js` (fonction `renderTarifsTable()`, ~ligne 686)

**Contexte actuel** : la section Tarifs affiche déjà **15 services** (`tarifsServices`, tableau JS ligne 666-682 de `main.js`), chacun avec case à cocher, nom, description et prix — rendus en boucle par `renderTarifsTable()` dans `#tarifs-body`. Cette liste complète s'affiche en permanence, ce qui rend la section très longue verticalement, surtout sur mobile.

**Objectif** : replier cette liste dans un panneau accordéon collapsible, fermé par défaut (ou affichant seulement les 3-4 premiers services), que le client peut déplier pour voir l'ensemble des 15 services et continuer à cocher/décocher normalement.

#### Comportement attendu
- Ajouter un en-tête cliquable au-dessus (ou en haut) de `#tarifs-body`, du type :
  ```html
  <button class="tarifs-accordion-toggle" id="tarifs-toggle" aria-expanded="false">
    <span>Voir tous nos services (15)</span>
    <span class="tarifs-accordion-icon">▼</span>
  </button>
  ```
- Par défaut, la liste est **repliée** (hauteur limitée via `max-height` + `overflow: hidden`, transition CSS fluide — pas de saut brutal).
- Au clic, la liste se déplie entièrement (`max-height` recalculée sur le contenu réel, ou `max-height: none` après transition) et l'icône `▼` devient `▲`.
- **Important — ne pas casser l'UX de sélection** : si un service est déjà coché (`service.checked === true`) alors que la liste est repliée, il doit rester visible même replié (ex. toujours montrer les items cochés en haut de la liste, au-dessus du fold), pour que le client garde un visuel de sa sélection sans avoir à dérouler.
- La logique de `renderTarifsTable()`, `toggleTarifsService()`, `updateCart()` et le panier latéral (`#tarifs-cart`) ne changent pas — uniquement l'affichage/conteneur autour de `#tarifs-body` est modifié. Aucune régression fonctionnelle attendue sur le panier, le calcul du total, les réductions par palier (10%/30%) ni la génération PDF/PPTX.

#### Design
- Garder exactement le même style visuel des lignes (`.tarifs-row`), des checkboxes et des prix — seul le conteneur devient collapsible.
- Utiliser les couleurs de marque existantes (orange `#f05d29`, noir) pour l'icône et le bouton toggle, cohérent avec le reste du site.
- Sur mobile, l'accordéon replié doit réduire significativement la hauteur de la section pricing avant le panier (objectif : ne plus obliger un scroll de plusieurs écrans avant d'arriver au bouton "Commander").

**Critère d'acceptation** :
- Au chargement de la page, la section Tarifs occupe nettement moins d'espace vertical qu'actuellement (liste repliée par défaut).
- Cliquer sur le toggle déplie/replie la liste des 15 services sans rechargement de page, avec une animation fluide.
- Cocher/décocher un service fonctionne à l'identique, que la liste soit repliée ou dépliée, et le panier latéral se met à jour correctement dans les deux cas.
- Aucune régression sur : calcul du sous-total/total, badges de réduction (5 services / 10 services), génération du devis PDF, génération de la présentation PPTX (point 7), commande WhatsApp.

---

## P1 (nouvelle fonctionnalité) — Sélection multiple du même service (quantité)

### 9. Permettre au client de choisir plusieurs fois un même service
**Fichiers** : `js/main.js` (`tarifsServices`, `renderTarifsTable()`, `updateCart()`, `toggleTarifsService()`, `removeTarifItem()`), `index.html` / `css/style.css` (styles de la ligne `.tarifs-row` et du panier `.tarifs-cart-item`)

**Contexte actuel** : chaque service dans `tarifsServices` a un simple booléen `checked` (sélectionné ou non). Il est donc impossible de commander, par exemple, "2x Création de Logo" ou "3x Montage Vidéo" — un client qui a besoin du même service pour plusieurs produits/marques doit contourner via le champ "Autre".

**Objectif** : remplacer la case à cocher on/off par un **sélecteur de quantité** (0, 1, 2, 3...) par service, permettant au client de sélectionner un même service plusieurs fois.

#### Changements du modèle de données
Remplacer le champ `checked: boolean` par `qty: number` (0 par défaut) dans `tarifsServices` :
```js
{ id: 1, keyName: 'ts.s1.name', keyDesc: 'ts.s1.desc', price: 72, qty: 0 }
```

#### Changements d'interface — ligne de service (`renderTarifsTable()`)
Remplacer la checkbox par un **stepper quantité** :
```html
<div class="tarifs-qty-stepper">
  <button class="tarifs-qty-btn" onclick="updateTarifQty(${index}, -1, event)" aria-label="Retirer un">−</button>
  <span class="tarifs-qty-value">${service.qty}</span>
  <button class="tarifs-qty-btn" onclick="updateTarifQty(${index}, 1, event)" aria-label="Ajouter un">+</button>
</div>
```
- `qty === 0` → ligne visuellement "non sélectionnée" (même style neutre qu'actuellement pour une case décochée).
- `qty >= 1` → ligne mise en évidence (même style que `.tarifs-row.selected` actuel), avec le prix affiché **multiplié par la quantité** à côté (`${service.price * service.qty} $US`).
- Clic sur `-` quand `qty === 1` ramène à 0 (désélectionne).
- Le clic sur toute la ligne (comportement actuel `row.onclick`) peut être conservé comme raccourci pour incrémenter de 1 si `qty === 0`, mais ne doit plus interférer avec les boutons +/- une fois `qty >= 1`.

#### Changements du panier (`updateCart()`)
- `totalCount` (utilisé pour les paliers de réduction 10%/30%) doit désormais être la **somme des quantités**, pas le nombre de services distincts : `tarifsServices.reduce((sum, s) => sum + s.qty, 0)`.
- Le sous-total doit être `service.price * service.qty` pour chaque ligne, sommé sur tous les services avec `qty > 0`.
- Dans l'affichage du panier (`#cart-items`), chaque ligne doit indiquer la quantité, ex. :
  ```html
  <span class="tarifs-cart-item-name">• ${displayName} <strong>×${service.qty}</strong></span>
  <span class="tarifs-cart-item-price">${service.price * service.qty} $US</span>
  ```
- `removeTarifItem(id)` doit remettre `qty` à `0` (au lieu de `checked = false`).
- Ajouter une nouvelle fonction `window.updateTarifQty(index, delta, event)` qui incrémente/décrémente `qty` (avec un minimum de 0), stoppe la propagation du clic, puis appelle `renderTarifsTable()` + `updateCart()`.

#### Impact sur les fonctionnalités existantes (à vérifier après implémentation)
- **Devis PDF** (`telechargerDevisPDF()`) : chaque ligne du PDF doit refléter la quantité et le prix total par ligne (`prix unitaire × qty`), pas juste le prix unitaire.
- **Commande WhatsApp** (`commanderWhatsAppTarifs()`) : le message pré-rempli doit lister les quantités (ex. "Création de Logo x2").
- **Export PPTX (point 7)** : si un service est sélectionné plusieurs fois, générer **une seule slide** pour ce service (pas de doublon de slide), en indiquant simplement la quantité sur la slide (ex. badge "×2" à côté du titre) — dupliquer des slides identiques n'apporte rien au client.
- **Accordéon (point 8)** : aucun changement de logique nécessaire, uniquement s'assurer que le stepper quantité reste utilisable et lisible même dans le conteneur repliable.

**Note d'implémentation** : les points 8 et 9 modifient tous les deux le markup de `.tarifs-row` généré par `renderTarifsTable()` — les développer dans la même passe (ou en ayant le point 8 comme base) pour éviter de refaire deux fois le rendu de la ligne.

**Critère d'acceptation** :
- Un client peut cliquer plusieurs fois sur `+` pour un même service et voir la quantité, le prix de la ligne et le total du panier se mettre à jour correctement.
- Le calcul des réductions (10% à partir de 5, 30% à partir de 10) se base bien sur la somme totale des quantités, pas sur le nombre de services distincts cochés.
- Le devis PDF, le message WhatsApp et l'export PPTX reflètent tous correctement les quantités sélectionnées, sans doublon ni incohérence de prix.

---