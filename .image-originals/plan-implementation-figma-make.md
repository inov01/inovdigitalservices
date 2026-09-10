# Instructions de correction — Site INOV

Contexte : voici le plan de correction à appliquer sur le site existant, par ordre de priorité. Applique chaque point ci-dessous section par section, sans changer l'identité visuelle globale (noir / blanc / orange, typographie arrondie).

---

## 1. Hero (section d'ouverture) — PRIORITÉ CRITIQUE

Le hero affiche actuellement un écran de chargement figé ("Chargement en cours...") au lieu du vrai contenu. Remplace-le par :

- Une **navbar sticky** en haut avec le logo INOV à gauche et les liens : Accueil, Services, Tarifs, Portfolio, Témoignages, FAQ, Contact. Fond transparent au repos, fond noir/blanc opaque au scroll.
- Un **titre principal** (H1) percutant orienté bénéfice client, ex. : "Une identité visuelle qui fait vendre votre marque"
- Un **sous-titre** d'une phrase qui reprend le positionnement : agence créative basée en Haïti, branding + motion design + marketing digital
- **Deux CTA côte à côte** :
  - Bouton principal (noir) : "Voir nos tarifs" → ancre vers la section Tarifs
  - Bouton secondaire (vert WhatsApp) : "Discuter de mon projet" → lien WhatsApp direct
- Le spinner "Chargement en cours" ne doit apparaître que pendant le chargement réel des assets (moins d'1 seconde), jamais comme état final visible.

---

## 2. Footer — vérifier les claims

- Remplacer "Présents dans 12 pays" par une formulation vérifiable, ex. : "Clients servis en Haïti et dans la Caraïbe" — sauf si le chiffre de 12 pays est confirmé et exact, auquel cas le garder.

---

## 3. Section Témoignages — crédibilité

- Remplacer les avatars photo actuels par de vraies photos clients (si disponibles) ou par des avatars à initiales (cercle coloré avec les 2 initiales du nom) plutôt que des photos qui peuvent ressembler à des stock photos.
- Si possible, ajouter un petit lien "Voir l'avis original" pointant vers Google/Instagram sous chaque témoignage.

---

## 4. CTA flottant — conversion

- Ajouter un **bouton WhatsApp flottant** fixe en bas à droite de l'écran, visible sur toutes les sections (icône WhatsApp verte, ronde), qui reste visible pendant tout le scroll de la page.
- Ce bouton doit ouvrir une conversation WhatsApp pré-remplie avec un message du type : "Bonjour, je souhaite un devis pour [service]."

---

## 5. Carrousels — mobile

Sections concernées : Services, La différence INOV, Portfolio (x2), Témoignages.

- Sur mobile, afficher la carte active + un fragment (10-15%) de la carte suivante visible sur le bord, pour indiquer visuellement qu'on peut swiper.
- S'assurer que le swipe tactile fonctionne (pas seulement les flèches cliquables).
- Garder les points de pagination sous chaque carrousel.

---

## 6. Configurateur de devis — validation

Dans la section Tarifs :

- Empêcher l'envoi du devis via WhatsApp si aucun service n'est sélectionné (griser le bouton "Commander via WhatsApp" tant que le panier est vide).
- Rendre le champ "Votre nom" obligatoire avant l'envoi, avec un message d'erreur clair si vide.
- Vérifier que le calcul des réductions (10% dès 5 services, 30% dès 10 services) et la conversion de devise (USD / HTG) se mettent à jour correctement en temps réel dans le panier.

---

## 7. Accessibilité et contenu

- Vérifier que le contraste des textes gris clair sur fond blanc (badges type "• NOS SERVICES", légendes) respecte un ratio minimum de 4.5:1 (norme WCAG AA). Foncer légèrement si besoin.
- Ajouter un texte alternatif descriptif sur chaque image du portfolio (nom du client + type de projet).

---

## Ordre d'exécution recommandé

1. Hero + navbar (bloquant, à faire en premier)
2. Vérification du claim footer
3. Bouton WhatsApp flottant
4. Avatars témoignages
5. Validation du formulaire de devis
6. Comportement swipe mobile des carrousels
7. Contraste et alt text
