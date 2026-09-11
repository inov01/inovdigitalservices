# Redéployer la fonctionnalité « Avis clients » sur GitHub

## Context
La fonctionnalité de témoignages clients (soumission côté client + modération admin approuver/supprimer)
est **entièrement codée et passe `tsc --noEmit` (exit 0)**, mais le déploiement GitHub précédent a échoué :
le `GH_TOKEN` de l'environnement renvoyait `401`, donc le `git push` n'a jamais abouti. Le HEAD de
`inov01/inovdigitalservices` est resté sur `efdd7c1` (audio du blog) — les 4 fichiers de la fonctionnalité
ne sont jamais arrivés sur GitHub, donc ni Vercel (prod) ni la fonction Supabase n'ont les nouvelles routes.

Le PAT fourni dans `new-file.tsx` a été vérifié : accès repo = **200 OK**. `new-file.tsx` est **untracked et
dans `.gitignore`** (ligne 25) → le secret ne partira PAS dans le push.

## Fichiers à déployer (tous DIFF vs GitHub main, déjà écrits + typecheck OK)
- `supabase/functions/make-server-df4bb120/index.ts` — routes testimonials (POST public + rate-limit, GET approuvés, GET all/approve/delete admin)
- `src/lib/api.ts` — `api.submitTestimonial` / `listTestimonials` ; `adminApi.listTestimonials`/`approveTestimonial`/`deleteTestimonial`
- `src/components/Testimonials.tsx` — bouton « Laisser un avis » + formulaire modal + affichage des avis approuvés
- `src/pages/Admin.tsx` — onglet « Avis clients » (badge en attente, approuver/supprimer)

## Étapes de déploiement (méthode fast-forward sûre)
1. Ajouter remote temporaire avec le PAT : `git remote add ghtmp https://x-access-token:<PAT>@github.com/inov01/inovdigitalservices.git`
2. `git fetch ghtmp main`
3. Créer une branche de déploiement à partir de GitHub HEAD : `git branch -f gh-deploy ghtmp/main` puis `git checkout -q gh-deploy`
4. Prendre UNIQUEMENT les 4 fichiers voulus depuis main local : `git checkout main -- <les 4 fichiers>`
   (évite le bruit LFS des 278 fichiers `.image-originals/` et `src/imports/`)
5. Vérifier `git diff --cached --name-only` → doit lister exactement les 4 fichiers, **pas** `new-file.tsx`
6. Commit, puis vérifier fast-forward : `git merge-base --is-ancestor ghtmp/main HEAD`
7. `git push ghtmp HEAD:main`
8. Nettoyage : `git checkout -qf main` ; `git branch -D gh-deploy` ; `git remote remove ghtmp`
9. Confirmer le déclenchement du workflow (déploiement fonction Supabase + build Vercel) via l'API Actions.

## Vérification
- `git log --oneline -1 ghtmp/main` doit pointer sur le nouveau commit avant nettoyage.
- Le run GitHub Actions de déploiement de la fonction doit passer (`conclusion: success`).
- Test bout-en-bout : sur le site, section Témoignages → « Laisser un avis » → soumettre → doit apparaître
  « en attente » côté admin (onglet Avis clients) → Approuver → apparaît dans le carrousel public.

## ⚠️ Sécurité (rappel important)
Le PAT GitHub, la clé Supabase `sbp_...` et le mot de passe d'application Gmail sont maintenant exposés
(dans `new-file.tsx` et l'historique de conversation). **À révoquer/régénérer après ce déploiement.**
Je propose de purger l'historique git une fois les identifiants révoqués.
