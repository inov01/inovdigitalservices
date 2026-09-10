# Plan — Symbole INOV comme icône d'onglet (fait) + parité icône PWA (restant)

## Contexte
L'utilisateur a ajouté `src/imports/logo_INOV_en_symbole.png` (symbole orange INOV) et demande
« met ça pour les onglet » — l'utiliser comme icône affichée dans l'onglet du navigateur.

**Déjà fait** (`src/main.tsx`) : le symbole est importé comme asset Vite et injecté au runtime dans
`<link rel="icon">` et `<link rel="apple-touch-icon">`, remplaçant `/favicon.svg` dans l'onglet.
→ L'icône d'onglet fonctionne déjà. (La copie vers `public/` et `tsc` avaient été refusées par les
permissions ; la voie runtime a évité d'écrire dans `public/`.)

**Restant (optionnel)** : faire que l'icône de l'**app installée (PWA)** utilise aussi le symbole.
Le manifest se sert depuis `public/` par chemin d'URL et ne peut pas pointer vers l'asset bundlé.
Il faut donc écrire le PNG dans `public/` — action qui requiert l'autorisation des permissions.

## Approche recommandée (parité PWA)

1. **Copier le symbole dans `public/`** : `src/imports/logo_INOV_en_symbole.png`
   → `public/favicon-inov.png` (servi à `/favicon-inov.png`). *(nécessite permission d'écriture)*

2. **`public/site.webmanifest`** — dans `icons`, ajouter le PNG en premier
   (`{ "src": "/favicon-inov.png", "sizes": "512x512", "type": "image/png", "purpose": "any" }`),
   conserver l'entrée SVG existante. `theme_color` (#f7601b) inchangé.

Aucune modification supplémentaire de React/`index.html` nécessaire (l'onglet est déjà réglé via
`main.tsx`).

## Note
Le PNG pèse ~448 Ko : lourd pour un favicon mais fonctionnel (mis en cache par le service worker).
Allègement possible plus tard (ex. 256×256) — non bloquant.

## Vérification
- `npx tsc --noEmit -p tsconfig.json` → exit 0 (aucun impact TS attendu).
- Onglet : le symbole orange apparaît déjà (rechargement forcé si favicon en cache).
- PWA : après copie + manifest, `/favicon-inov.png` accessible et référencé ; l'app installée
  affiche le symbole.

## Rappels (inchangés)
- Redéployer la fonction edge Supabase depuis *Make settings* pour les réglages serveur.
- Sécurité : révoquer/renouveler les secrets exposés dans le chat (PAT GitHub `…dFqj`, tokens
  Supabase `sbp_*`, clé Resend `re_*`, `service_role`).
