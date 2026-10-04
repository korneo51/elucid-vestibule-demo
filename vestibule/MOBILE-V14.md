# Vestibule mobile v14 — « le hall en 3D, on tourne la tête vers une porte »

Maquette de test uniquement, locale. Suite de `MOBILE-V13.md` (verrou, fiches, clés, barre du bas inchangés) et de `VOYAGES.md`.

## Ce qui a été demandé

Deux retours après essai :
1. Les deux portes côte à côte de la v13 sont moins belles que l'effet 3D de la version PC (hall en perspective, portes qui s'ouvrent sur la salle). Trouver une solution sur téléphone.
2. « Le top, ce serait qu'on comprenne bien qu'on peut aller à droite et à gauche pour la salle, avec un swipe à gauche ou à droite. »

## Le principe

Le hall PC est une illustration large (1672 × 941) percée de deux ouvertures. Derrière chaque trou, la salle et les battants de la porte sont plaqués en perspective sur le mur. Le téléphone réutilise exactement cette scène : elle est clonée à la hauteur de l'écran, et seule une tranche de 393 px est visible. La caméra se déplace sur trois positions : porte de gauche, hall, porte de droite.

| Geste | Effet |
|---|---|
| Balayer vers une porte (depuis le hall) | la vue tourne vers cette porte, qui s'entrouvre sur sa salle |
| Balayer encore dans le même sens, ou toucher la porte, ou « Entrer › » | la vue s'avance dans la porte, puis la fiche de la salle monte |
| Balayer dans l'autre sens, ou « ‹ Hall » | retour au hall |

Sens du balayage : on balaie vers la porte voulue (balayer à gauche tourne vers la porte de gauche). Pendant le geste, la vue penche déjà dans ce sens. Si ce sens est contre-intuitif à l'usage, il s'inverse en changeant un signe (`swiped(direction)` dans `mobile.js`).

Comprendre qu'on peut aller de chaque côté :
- un sélecteur « ‹ Les Rouages · Hall · CybertraX › » sous le titre,
- deux languettes sur les bords de l'écran (nom de la salle et flèche qui oscille),
- l'indice « Glissez vers une porte » avec un point qui va et vient (il disparaît après le premier tour de tête),
- à la première visite, la vue dérive d'elle-même un peu vers chaque côté pour montrer qu'elle bouge (ignoré en mode animations réduites),
- les deux enseignes des portes sont visibles dès qu'on regarde de leur côté.

La porte du fond du hall, qui est un calque à part sur PC, est redessinée au centre : « TARIFS & INFOS ↓ » la rend cliquable.

## Fichiers

- `index.html` : le hall du `<template id="m-template">` ne contient plus que le conteneur, le titre, le sélecteur, les languettes, l'indice et le bandeau « Entrer ». Les portes viennent de la scène PC, clonée par `mobile.js` (aucune image ni balisage dupliqués).
- `mobile.js` : projection des calques sur le mur (même calcul de perspective que la page PC), caméra (déplacement et avancée), balayage, boutons, dérive d'accueil, ouverture des fiches, retour.
- `mobile.css` : mise en page du hall, languettes, sélecteur, bandeau, porte du fond.
- `journey.js` / `journey.css` : le panneau de commande du style C et les pièces d'à-côté sont masqués quand on regarde une porte du hall ; `html[data-room]` indique la salle courante.

## Mesures

Chromium sans GPU, processeur ralenti ×4, téléphone émulé 393 × 851, 2,75 de densité.

| | images lentes (> 34 ms) | pire image |
|---|---|---|
| Tourner vers une porte (91 images) | 0 | 17 ms |
| Revenir au hall (78 images) | 0 | 17 ms |
| Entrer dans la porte et monter la fiche (173 images) | 0 | 33 ms |

La caméra ne bouge que par `transform`. Aucun flou ni filtre.

## Vérifications

- Balayages tactiles réels : tourner à gauche, à droite, revenir, entrer par un second balayage, par « Entrer », par un toucher sur la porte.
- Fiches : passage d'une salle à l'autre (la vue tourne avec), fermeture par le bouton, par le tirer-vers-le-bas et Échap, « Voir les tarifs ↓ », barre du bas, porte du fond.
- Styles classique, A (le balayage vertical passe bien à la salle suivante sans toucher la caméra) et C (panneau masqué quand on regarde une porte).
- Animations réduites : tout se fait sans mouvement. 360 × 640 : tout tient, aucun débordement. PC : inchangé. Aucune erreur console.

## À valider sur un vrai téléphone

- [ ] Le sens du balayage (vers la porte, ou à l'inverse en suivant le doigt) : le plus naturel dans la main.
- [ ] La netteté de la salle pendant l'avancée (l'image est agrandie environ 2,3 fois).
- [ ] La dérive d'accueil : utile ou inutile.
