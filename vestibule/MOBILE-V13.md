# Vestibule mobile v13 — « le verrou, les deux portes, les clés »

Maquette de test uniquement, locale. Remplace entièrement le parcours téléphone des versions 6 à 12 ; la version PC (défilement au scroll) est inchangée.

> **Le hall (point 2 ci-dessous) a été refait en v14** : les deux portes côte à côte laissent la place au hall en perspective de la version PC, avec balayage gauche/droite (`MOBILE-V14.md`). Le verrou, les fiches, les clés et la suite en défilement restent ceux décrits ici.

## Pourquoi tout refaire

Premier essai de la v12 sur un vrai téléphone :
1. « Dès la première page, il n'y a pas de transition, ça se fait direct. »
2. « On ne comprend pas qu'il faut aller à gauche ou à droite dans le hall. »

Causes trouvées :
- Le téléphone demandait des animations réduites (réglage fréquent des Xiaomi en économie de batterie). Dans ce cas le code ne gardait que 5 états visibles au lieu de 14 : un saut. Et la v12 avait caché le sélecteur de vitesse dans la roue ⚙, donc rien n'expliquait ce qu'on voyait.
- Tout le parcours mobile reposait sur un faux défilement (`scrollTo` à chaque image), fragile dans une page hébergée.
- Le hall est un panorama 16:9 : en portrait, on n'en voit que le centre. Les deux portes étaient hors écran et tout reposait sur un glissement latéral à deviner.

## Le principe

Une idée par écran, et rien à deviner.

1. **Le verrou** : on fait glisser le verrou (« Glissez pour déverrouiller », comme sur un téléphone). Le mécanisme tourne, les vantaux s'écartent sur de la lumière, un clic, puis plongée dans la lumière et fondu vers le hall. Lâcher trop tôt ramène le verrou en arrière (ressort). Un simple toucher fait la même chose automatiquement, comme la touche Entrée au clavier. Lien « Aller directement aux infos » dessous.
2. **Les deux portes côte à côte** : les illustrations de portes (portrait 2:3) sont affichées en grand, avec leur enseigne, leur nom et un bouton. On touche une porte : elle s'ouvre sur sa salle, l'autre s'éteint, puis la fiche monte. La fiche a un grand bouton « Réserver cette aventure » toujours visible en bas, un accès à l'autre porte et aux tarifs, et se ferme en tirant l'image vers le bas, avec « ← Retour au hall » ou Échap.
3. **La suite en défilement naturel** : tarifs, cadeaux, avis (glissement latéral), questions, équipe, contact, comme n'importe quelle page. Barre fixe en bas : Portes · Tarifs · Avis · Questions · **Réserver**, avec l'étape en cours surlignée. Le bouton Réserver du haut reste aussi visible.

Rien n'est à deviner : chaque écran a une seule action évidente, et le défilement est celui du navigateur.

## Les surprises

- **5 clés cachées** dans le vestibule (compteur en haut à côté de « Réserver »). On touche une clé, elle vole jusqu'au compteur ; à la cinquième, une carte « Les 5 clés ! » avec confettis et un bouton Réserver. Facultatif, jamais bloquant, mémorisé pour la session, sans aucune offre inventée.
- Le prix **monte** jusqu'à sa valeur quand on change le nombre de joueurs.
- Enseigne de CybertraX qui vacille, reflet qui traverse les portes, aiguille du verrou qui tourne lentement.
- Légère **profondeur à l'inclinaison** du téléphone sur le hall (silencieuse, facultative ; demande l'autorisation sur iPhone).
- Vibration brève au clic du verrou, à l'ouverture d'une porte et à chaque clé.

## Animations réduites

Si le téléphone demande moins d'animations, le passage devient un **fondu** (sans zoom, sans boucle) et un message l'explique en haut de l'écran, avec un bouton « Tout voir » pour retrouver le voyage complet. Le choix se change aussi en bas de page (« Animations · complètes / calmes »).

## Pour tester

En bas de page, trois boutons : **Revoir l'entrée** (rejouer le verrou), **Animations** (complètes ou calmes), **Rejouer les clés**.

## Poids et fluidité

Mesures Chromium sans GPU, processeur ralenti ×4, téléphone émulé 393 × 851 à 2,75 de densité (valeurs relatives : un vrai téléphone a un GPU).

| | v12 | v13 |
|---|---|---|
| Déverrouillage complet (glisser, ouvrir, plonger, fondre) | transitions de 10 à 22 images lentes sur ~90 | **1 image lente sur 199** |
| Défilement du hall aux questions | — | 0 image lente sur 266 |
| Ouverture d'une porte et de sa fiche | — | 3 sur 393 |
| Poids de la page (15 requêtes) | 492 Ko | 477 Ko |
| Éléments de page en mémoire | 482 | 643 |

Ce qui rend l'ensemble léger : rien ne bouge autrement que par `transform` et `opacity`, aucun flou ni filtre d'arrière-plan, plus de canvas ni de calques en perspective, pas de pilotage du défilement par script, images WebP (hall, portes, salles) partagées avec la version PC.

## Fichiers

- `index.html` : le balisage du parcours mobile est dans `<template id="m-template">` (inerte sur PC, ses images ne se chargent pas). Les sections d'infos ne sont pas dupliquées : `mobile.js` déplace les blocs existants (tarifs, avis, questions…), qui gardent leurs scripts. Les prix restent calculés depuis le tableau HTML.
- `mobile.css` : tout le style téléphone, enveloppé dans `@media(max-width:760px)`.
- `mobile.js` : verrou, portes, fiches, barre du bas, clés, animations réduites, inclinaison.
- `traversee.js` : sur téléphone, le parcours à la molette n'est plus démarré (classe `m-boot`) ; prix et avis restent actifs. Sans `mobile.js` (erreur de chargement), la page redevient une lecture statique au bout de 5 s.
- `mobile-corridor.js` a disparu. `build-test-site.py` et `build-wordpress-preview.py` (sortie v13) ont été mis à jour.

## Vérifications

- Parcours complet en 393 × 851 : verrou (glissé complet, glissé trop court qui revient, simple toucher), hall, ouverture des deux portes image par image, fiches (passage de l'une à l'autre, fermeture), sections, clés (5 sur 5, carte finale, mémorisation après rechargement), saut direct, rejeu de l'entrée. Aucune erreur console, aucun débordement horizontal.
- Mode « animations réduites » : fondu de 10 états visibles, message affiché.
- 360 × 640, 360 × 740 : tout tient, bouton de réservation des fiches visible.
- PC 1280 × 720 : parcours inchangé, prix et en-tête corrects.
- Copie « à plat » dans un squelette d'hébergement simulé : mêmes parcours, mêmes résultats. Préparateur WordPress exécuté avec des URL factices : images réécrites, aucun chemin relatif restant.

## À valider sur un vrai téléphone

- [ ] Le verrou à glisser : confort du geste, seuil de déclenchement, sensation du ressort.
- [ ] La plongée dans la lumière : fluidité sur le Redmi Note 10.
- [ ] La vibration et l'inclinaison (non testables dans la page hébergée, le navigateur intégré les refuse).
- [ ] Safari iOS.
- [ ] Les clés : trouvées trop vite ou trop difficilement ? Ajustable en déplaçant cinq lignes du balisage.
- [ ] Appliquer le même vocabulaire (verrou, portes côte à côte) à la version PC si l'idée plaît.
