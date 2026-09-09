# Plan — Déployer le travail de la session (rendre les changements visibles en ligne)

## Contexte
Toutes les demandes répétées de l'utilisateur sont **déjà implémentées dans le code** de cette
session. L'utilisateur re-colle le même backlog parce qu'il ne voit pas encore les changements :
le code est bien écrit et commité (Figma Make auto-commite chaque prompt, l'arbre est propre),
mais rien n'a été **déployé** — ni la fonction edge Supabase, ni le site vers GitHub/Vercel.

Le vrai besoin restant n'est donc pas du développement mais un **déploiement + vérification**.

### État des fonctionnalités (toutes présentes dans le code)
- **PWA auto-update** — `public/sw.js` (network-first) + enregistrement/auto-reload dans `src/main.tsx`.
- **Blog sans exemples trompeurs** — les 10 nouveaux articles n'ont aucune entrée dans
  `ARTICLE_WORK_CATEGORIES` (donc aucun visuel portfolio dessous) ; AJESRO & « A Lady's Center »
  exclus via `BLOG_EXCLUDED_CLIENTS` (`src/data/portfolio.ts`).
- **Supprimer/télécharger les fichiers clients** — `adminApi.briefFileDelete` (`src/lib/api.ts`),
  route `POST /brief/file-delete` (`supabase/functions/server/index.tsx`), boutons Ouvrir/Supprimer
  dans `BriefAttachments` (`src/pages/Admin.tsx`).
- **10 nouveaux articles communication visuelle** — dans les 8 langues (`src/components/Blog.tsx`),
  `npx tsc` exit 0. Fidèles aux services réels : 100 % en ligne, pas d'impression/photo/vidéo,
  mais retouche + montage, le client apporte ses ressources.
- **Lecteur audio accent correct** — détection de langue dans `src/components/ArticleAudio.tsx`.
- **Liens admin par langue/pays** — composant `LangCountryLinks` (`src/pages/Admin.tsx` ~L3285),
  génère des URL `?lang=&region=&currency=` honorées par `src/context/AppSettingsProvider.tsx`.
- **Formulaires de brief par service + partage admin** — `src/pages/Brief.tsx`,
  `src/data/briefs.ts` / `briefsLocales.ts`, route `brief/:service`, `BRIEF_LINKS` dans Admin,
  uploads via bucket Supabase `brief-uploads`.

## Actions de déploiement

### 1. Redéployer la fonction edge Supabase (côté utilisateur)
Depuis la page **Make settings**, redéployer `supabase/functions/server/index.tsx`. Indispensable
pour activer les routes `/brief/*`, le bucket `brief-uploads` et la suppression de fichiers.
(Action manuelle utilisateur — je ne peux pas la déclencher.)

### 2. Pousser le site vers GitHub `inov01/inovdigitalservices` (→ Vercel)
Procédure spéciale car `origin` est le git Figma Make (`api.figma.com/git/make/...`) en Git LFS,
et GitHub n'est pas un remote configuré :
1. `git lfs pull` — matérialiser les vrais octets (pas les pointeurs LFS).
2. Branche orpheline d'export : `git checkout --orphan github-export`, neutraliser `.gitattributes`
   (retirer les règles `filter=lfs`) sur cette branche uniquement, exclure `.image-originals/`,
   `git add -A`, `git commit -m "Session: PWA auto-update, 10 blogs, brief forms, admin file mgmt, lang/country links, TTS fix"`.
3. Push : `git push --force "https://x-access-token:<PAT_FRAIS>@github.com/inov01/inovdigitalservices.git" github-export:main`
   — token **inline uniquement**, sortie nettoyée via `sed -E 's/github_pat_[A-Za-z0-9_]+/***TOKEN***/g'`.
4. Nettoyage : `git checkout main`, `git branch -D github-export`, `git checkout -- .gitattributes`,
   vérifier `grep -c "github_pat\|x-access-token" .git/config` → `0`, `origin` inchangé (Figma seul).

**Authentification** : utiliser un **PAT frais et à courte durée** (les précédents sont compromis),
jamais persisté dans `.git/config` ni aucun fichier.

## Vérification
- `npx tsc --noEmit -p tsconfig.json` → exit 0 (déjà vérifié pour le blog).
- Push exit 0 (sortie masquée) ; `.git/config` sans token (grep `0`) ; `origin` = Figma seul.
- Côté utilisateur : commit visible sur GitHub `main`, Vercel redéploie, et sur le site en ligne :
  articles de blog présents, PWA se met à jour seule, formulaires `/brief/<service>` fonctionnels,
  boutons admin Ouvrir/Supprimer sur les fichiers clients, liens langue/pays copiables.

## Sécurité (à re-signaler à l'utilisateur)
Révoquer/renouveler les secrets exposés dans le chat : PAT GitHub, tokens Supabase `sbp_*`,
clé Resend `re_*`, et le `service_role` Supabase. Créer un PAT neuf et court pour ce push.
