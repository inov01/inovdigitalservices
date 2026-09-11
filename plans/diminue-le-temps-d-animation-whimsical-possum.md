# Plan d'implémentation — 6 fonctionnalités

## Contexte

Six demandes groupées pour améliorer l'expérience utilisateur du site INOV Digital Services :
animations trop longues, textes créoles peu naturels, aperçu script illisible dans l'admin,
UI/UX admin à soigner, et deux nouveaux espaces à créer (formation et collaborateur).

---

## 1. Réduction des durées d'animation (affiches/hero)

**Fichier :** `src/components/Hero.tsx` (lignes 165–168)

Les classes d'animation `hero-slide-in*` passent de **0.6 s** à **0.35 s**, et les délais de
stagger (0.09 s / 0.18 s / 0.27 s) passent à **0.05 s / 0.10 s / 0.15 s**.

```css
/* Avant */
.hero-slide-in        { animation: hero-fade-up 0.6s … both; }
.hero-slide-in-delay  { animation: hero-fade-up 0.6s … 0.09s both; }
.hero-slide-in-delay2 { animation: hero-fade-up 0.6s … 0.18s both; }
.hero-slide-in-delay3 { animation: hero-fade-up 0.6s … 0.27s both; }

/* Après */
.hero-slide-in        { animation: hero-fade-up 0.35s … both; }
.hero-slide-in-delay  { animation: hero-fade-up 0.35s … 0.05s both; }
.hero-slide-in-delay2 { animation: hero-fade-up 0.35s … 0.10s both; }
.hero-slide-in-delay3 { animation: hero-fade-up 0.35s … 0.15s both; }
```

**Fichier :** `src/components/Portfolio.tsx` — réduire `pf-rise` de **0.7 s → 0.4 s**
et `pf-pop` de **0.35 s → 0.2 s**.

---

## 2. Créole plus naturel (écrit et oral)

Le créole haïtien actuel dans le site utilise un registre scolaire/formel peu parlé.
Objectif : adopter le registre écrit standardisé **mais à consonance orale** courant dans
les contenus numériques haïtiens (ex. créole des pages Facebook haïtiennes populaires,
podcasts, influenceurs). Points clés :

- Remplacer "ou" → "w" en position post-vocalique (ex. "biznis ou" → "biznis w")
- Contractions courantes : "ki fè" → "ki fè", "pou li" → "pou l", "se pa" → "se pa"
- Termes locaux : "travay" pour "project", "mak" pour "marque", "kliyan" pour "client"
- Éviter les gallicismes inutiles ("branding" reste "branding" car c'est le terme utilisé)

**Fichiers concernés :**
- `src/i18n/translations.ts` — bloc `ht:` (hero slides, services, FAQ, testimonials,
  contact, about) — réécriture de ~40 chaînes à fort impact visuel
- `src/components/Blog.tsx` — titres et excerpts des articles `ht` (3 vagues d'articles) ;
  les `body[]` des 5-6 articles les plus lus (logo, couleurs, presence, erreurs, motion, reseaux)
- `src/data/briefsLocales.ts` — libellés de formulaire `ht` (moins prioritaire)

**Approche :** réécriture ciblée des textes visibles à l'écran (hero, sections, titres),
sans réécrire l'intégralité des corps d'articles (trop volumineux pour un seul commit).

---

## 3. Aperçu scripts vidéo lisible dans l'admin

**Fichier :** `src/pages/Admin.tsx` — fonction `ScriptRow` (ligne 3790–3797)

Problème : la `<pre>` utilise `font-family: var(--font-space), monospace` + `fontSize: 12.5` +
fond `#f6f5f2` qui ne respecte pas le thème sombre de l'admin.

**Fix :**
- Remplacer `<pre>` par un `<div>` avec formatage propre (paragraphes, titres de sections)
- Utiliser `font-family: var(--font-outfit), sans-serif` — lisible en dark mode
- `fontSize: 14`, `lineHeight: 1.7`, `background: var(--ds-bg-sec)` (respecte le thème)
- Afficher les segments du script séparément avec titres en gras (intro, hook, CTA…)
  en parsant les doubles sauts de ligne du texte brut de `buildScriptText()`

---

## 4. UI/UX et accessibilité de l'espace admin

**Fichier :** `src/pages/Admin.tsx`

Améliorations groupées :

| Zone | Changement |
|---|---|
| Nav (sidebar) | Ajouter `aria-current="page"` sur l'onglet actif ; `role="navigation"` sur le wrapper |
| Chaque tab panel | Ajouter `role="tabpanel"` + `id` + `aria-labelledby` |
| Modals | `aria-modal="true"` + `role="dialog"` + `aria-label` + focus trap (focus retourne au déclencheur à la fermeture) |
| Formulaires | `<label htmlFor>` systématique pour tous les `<input>` sans label visible |
| Boutons icône seuls | `aria-label` manquants sur Trash2, RefreshCw, Download, etc. |
| Couleurs de statut | Ajouter préfixe texte invisible (`.sr-only`) en plus des couleurs (ex. "Nouveau" en orange = ne passe pas seul) |
| Tableaux leads | `<table>` sémantique + `scope="col"` sur les `<th>` |
| Score | Ces améliorations passent le niveau WCAG AA pour l'admin |

---

## 5. Espace Formation

### Public — nouvelle page `/formation`

**Nouveau fichier :** `src/pages/Formation.tsx`

Structure :
- Header : titre, sous-titre, badge "Nouveauté"
- Filtres : Toutes / Gratuites / Payantes / En ligne / En présentiel
- Grille de cartes : chaque carte = `{ titre, description, format, duree, niveau, prix, cta_label, cta_href }`
  - **Gratuit** → bouton "Accéder" (lien direct PDF/vidéo YouTube ou blog)
  - **Payant** → bouton "S'inscrire" (lien WhatsApp pré-rempli ou futur checkout)
- Section "Formation sur mesure" avec CTA vers WhatsApp

**Données initiales (statiques, 4–6 formations) :**
- Gratuit : "Bases du branding pour entrepreneurs" (PDF guide), "Créer un logo mémorable" (vidéo blog)
- Payant : "Maîtriser Canva Pro" (live en ligne, $49), "Stratégie de marque complète" (coaching 1h, $75)

**Route :** ajouter `formation` dans `src/routes.tsx` (lazy import)

**Nav/footer :** ajouter le lien `/formation` dans le footer colonne "Espace client"
et en option dans la nav header.

### Admin — gestion des formations

Nouveau tab `"formations"` dans l'admin (icône `GraduationCap`) avec :
- Liste des formations (titre, prix, type, statut publié/brouillon)
- Formulaire d'ajout/édition inline
- Toggle publier/masquer
- Les formations sont stockées dans `SiteSettings.formations[]` (déjà persisté via `adminApi.saveSettings`)

---

## 6. Espace Collaborateur

### Concept

Les professionnels créent **gratuitement** une "conception" (création graphique promouvant les
services INOV) via un formulaire public. L'admin valide ou refuse. Si validé, la conception
est postée dans une vitrine publique "Nos Collaborateurs". Le collaborateur reçoit des leads
qualifiés et INOV prend une commission sur les contrats générés.

### Public — page `/collaborateur`

**Nouveau fichier :** `src/pages/Collaborateur.tsx`

Sections :
1. **Hero** : pitch du programme, avantages (commission 20–30%, visibilité, support INOV)
2. **Comment ça marche** : 4 étapes (Candidater → Créer → Valider → Gagner)
3. **Domaines recherchés** : liste des spécialités (Branding, Motion, Vidéo, Web, Impression…)
4. **Formulaire de candidature** :
   - Nom complet, email, WhatsApp
   - Spécialité (select)
   - Portfolio/réseaux sociaux (lien)
   - Lien Google Drive vers la "conception" promotionnelle INOV (champ URL, validation `https://`) — même pattern que dans `Brief.tsx`
   - Message libre
   - Conditions acceptées (checkbox)
5. **Vitrine** : grille des collaborateurs validés (nom, spécialité, lien portfolio)

Soumission → `api.submitLead({ source: "collaborateur", … })` → apparaît dans l'admin.

### Admin — onglet Collaborateurs

Nouveau tab `"collaborators"` (icône `Users2`) entre "reviews" et "links" avec :
- Liste des candidatures (nom, spécialité, lien drive, date, statut pending/approved/rejected)
- Boutons Approuver / Rejeter (met à jour `status` via `adminApi`)
- Les approuvés alimentent la vitrine publique via `SiteSettings.collaborators[]`

### Lien footer

Dans `Footer.tsx`, colonne "Espace client", ajouter discrètement :
```
Devenir collaborateur → /collaborateur
```

### Lien admin sidebar

Dans `Admin.tsx` navItems, ajouter `"collaborators"` avec libellé "Collaborateurs".
Le badge de compteur affiche les candidatures en attente (comme pour `reviews`).

---

## Fichiers à modifier / créer

| Fichier | Nature |
|---|---|
| `src/components/Hero.tsx` | Modifier durées CSS |
| `src/components/Portfolio.tsx` | Modifier durées CSS |
| `src/pages/Admin.tsx` | Fix script preview + UI/UX + tabs formations/collaborateurs |
| `src/i18n/translations.ts` | Réécriture bloc `ht:` ciblée |
| `src/components/Blog.tsx` | Titres + excerpts + corps prioritaires en `ht` |
| `src/data/briefsLocales.ts` | Libellés `ht` (second ordre de priorité) |
| `src/pages/Formation.tsx` | Nouveau fichier |
| `src/pages/Collaborateur.tsx` | Nouveau fichier |
| `src/routes.tsx` | +2 routes (`/formation`, `/collaborateur`) |
| `src/components/Footer.tsx` | +2 liens discrets |
| `src/lib/api.ts` | Éventuellement : type `Collaborator` si nécessaire |

---

## Vérification

1. **Animations** : ouvrir l'accueil, vérifier que le hero s'anime en < 0.5 s et le portfolio en < 0.6 s
2. **Script preview** : aller dans Admin > Blog > Scripts vidéo, cliquer "Aperçu" — texte lisible en dark mode
3. **Admin a11y** : passer le tab keyboard dans la sidebar, vérifier focus trap des modals
4. **Formation** : naviguer `/formation`, vérifier les filtres, tester le CTA WhatsApp
5. **Collaborateur** : naviguer `/collaborateur`, soumettre le formulaire, vérifier l'entrée dans Admin > Collaborateurs, approuver → vérifier la vitrine publique
6. **Créole** : changer la langue du site en "Kreyòl", lire le hero et les sections — vérifier la naturalité
