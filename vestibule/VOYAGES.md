# Voyages A, B, C — avancer de pièce en pièce

Exploration locale, côté téléphone uniquement. Suite de la v13 (`MOBILE-V13.md`) après le retour : « le défilement est trop classique, j'aurais voulu qu'on avance de pièce en pièce, en gardant l'idée qu'il faut descendre, et des petits gestes façon "glisser pour déverrouiller" pour passer d'une pièce à l'autre ».

Le parcours classique de la v13 reste disponible. Les trois voyages remplacent seulement la partie « après le hall ». Le verrou d'entrée, le hall en 3D (voir `MOBILE-V14.md`) et ses fiches, les clés cachées, les prix et la barre du bas sont communs.

## Choisir le style

Bouton **Style** (⇄) à droite de la barre du bas. Il propose le classique et A, B, C ; le choix est mémorisé pour la session et recharge la page sans repasser par le verrou. Le menu contient aussi « Revoir l'entrée », « Animations » et « Rejouer les clés ».

## Les trois voyages

Sept salles : le hall, les tarifs, les cadeaux, les avis, les questions, l'équipe, le contact. Chacune tient dans un écran. Les questions sont une liste dont chaque réponse s'ouvre dans un volet, les tarifs complets aussi.

**A · Traverser les portes.** Le geste est un vrai défilement du navigateur, mais un geste égale une salle (aimantation, jamais deux salles d'un coup). La salle s'efface, une porte surgit au fond d'un tunnel, ses vantaux s'écartent sur la lumière, on plonge, la salle suivante apparaît. La barre du haut montre la progression et chaque segment est cliquable. Une pastille « Suite · … ↓ » dit où l'on va.

**B · L'ascenseur.** Même geste, mais on descend d'étage en étage (RDC, −1 … −6). Les portes de la cabine se ferment quand on bouge, le compteur lumineux change, la cabine vibre légèrement, puis les portes s'ouvrent sur la salle. Il suffit de descendre.

**C · Les mécanismes.** Pas de défilement : pour passer à la salle suivante, on manipule un petit objet au doigt, un différent à chaque fois. Il ouvre sa propre « porte » et la vue plonge dedans. Plus aucun appui long (il déclenchait le menu contextuel du téléphone).

| Passage | Objet à manipuler | Ce qui s'ouvre |
|---|---|---|
| Hall → Tarifs | levier à faire pivoter en arc | la porte métallique du vestibule |
| Tarifs → Cadeaux | clé à glisser dans le cadenas (elle tourne, l'anse saute) | une boîte cadeau en 3D, couvercle qui se soulève |
| Cadeaux → Avis | roue de coffre à tourner d'un tour (huit voyants s'allument) | porte ronde de coffre-fort qui pivote |
| Avis → Questions | chaîne à tirer vers le bas | rideau métallique qui se relève |
| Questions → Équipe | prise à brancher, câble qui suit le doigt | sas bleu à deux vantaux |
| Équipe → Contact | verrou à tirer vers la gauche | grand portail en bois à deux battants |

Le panneau de commande (métal brossé, vis, voyants rouge puis vert) est dessiné en SVG et CSS, sans image. Le geste pilote déjà la « porte » : elle apparaît et commence à s'ouvrir pendant qu'on tire, puis la plongée finit seule dans une lumière chaude (bleue pour le sas). Lâcher trop tôt ramène l'objet en arrière.

Ce ne sont pas des énigmes. Chaque objet a une alternative : un simple toucher joue le geste tout seul, la touche Entrée aussi. La barre du haut et celle du bas permettent d'aller directement n'importe où. Le panneau est masqué quand on regarde une porte du hall.

## Animations réduites

Les trois styles passent en fondu simple (pas de tunnel, pas de zoom, pas de boucle). Le choix suit celui du téléphone et se change dans le menu Style.

## Ce qu'on a appris en chemin

- Chrome ne s'aimante que sur des blocs en flux normal, pas sur des repères positionnés en absolu.
- La feuille de style de base impose `scroll-padding-top: 100px` : il décalait chaque salle de 100 px. Les voyages le remettent à zéro.
- La vibration n'est autorisée qu'après un premier toucher : le défilement seul ne compte pas, la page attend donc le premier toucher.

## Mesures

Chromium sans GPU, processeur ralenti ×4, téléphone émulé 393 × 851, 2,75 de densité.

| Style | Images lentes (> 33 ms) |
|---|---|
| A | 32 sur 424 |
| B | 14 sur 407 |
| C | 0 sur 1 182 (les six passages, objets et portes) |
| Rappel v13, déverrouillage | 1 sur 199 |

Le tunnel animé (A) est le poste le plus lourd. Si le téléphone rame réellement, il se coupe tout seul pour la session. Le style C n'en a plus : ses « portes » sont des éléments CSS qui ne bougent que par transformation et opacité.

## Vérifications

- A et B : défilement par balayages tactiles réels, une salle à la fois (un coup sec ne saute jamais une salle, un demi-balayage revient en arrière).
- C : les six objets joués avec des événements tactiles réels (arc du levier, glissé de la clé, tour complet de la roue, chaîne, câble, verrou), glissé trop court qui revient, simple toucher, retour par la barre du haut, saut par la barre du bas, et les six « portes » photographiées à sept avancements.
- Aucune erreur console, aucun débordement horizontal, parcours classique et version PC inchangés.

## À décider avec vous

- [ ] Quel voyage donne envie de continuer ? Ou un mélange : par exemple B pour avancer et un geste de déverrouillage seulement sur la porte finale.
- [ ] Les gestes de C : lesquels garder, lesquels trop longs ?
- [ ] Le coffre à code (tambour qui tourne, un clic par cran) a été laissé de côté au profit de C.
- [ ] Appliquer le style retenu à la version PC.

## Fichiers

`journey.js` (moteur, A, B, C), `journey.css`, accroches dans `mobile.js` (style choisi, aimantation de la barre, API). Le balisage est partagé avec la v13 (`<template>` de `index.html`).
