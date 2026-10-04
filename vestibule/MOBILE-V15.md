# Vestibule mobile v15 — style D « le décor est l'interface »

Maquette de test uniquement. Suite de `MOBILE-V14.md` et de `VOYAGES.md` : le style C (panneau de commande en bas de l'écran) est remplacé par des mécanismes qui font partie du décor. Les styles classique, A, B et C restent disponibles avec `?v=0`, `?v=a`, `?v=b`, `?v=c` ; `?v=d` active celui-ci.

## Retours pris en compte

- Style proche de l'accueil : nuit, cyan, orange, lignes fines, lueurs discrètes. Pas de matériau imité (bois, papier, laiton) ni de vaisseau spatial.
- Une seule action par porte, qui ouvre la porte directement. Pas de geste à deux pouces, pas d'étape avant.
- Simple et court : un simple toucher joue toujours le geste. Cibles de 44 px minimum, libellés écrits en toutes lettres.
- Hall explicite : l'enseigne dit où l'on va avant d'entrer.
- Une machine par pièce, qui est aussi son contenu.

## Parcours

| Étape | Ce que fait le visiteur |
|---|---|
| Hall | Le sceau de la porte du fond se tourne du doigt (ou on touche une icône). L'enseigne au-dessus affiche en grand « Votre destination : Tarifs » et sa phrase. Le gros bouton « ENTRER » ou l'enseigne y mène. Deux plaques au sol, « Les Rouages » et « CybertraX », tournent la vue vers une porte (le balayage fonctionne toujours). |
| Porte des Rouages | On tourne le grand engrenage (un demi-tour environ, voyants de laiton qui s'allument) : les battants s'ouvrent, puis la fiche de la salle monte. Toucher l'engrenage joue tout seul. |
| Porte de CybertraX | On fait monter l'énergie le long du joint de la porte (un seul glissé vers le haut, les circuits s'allument) : les battants s'ouvrent, puis la fiche monte. Toucher le bouton joue tout seul. |
| Tarifs | Tableau à lamelles : on touche les silhouettes (2 à 6 joueurs), les lamelles basculent. Le billet « Choisir mon créneau » mène à la réservation. |
| Cadeaux | Carte à gratter (ou toucher la carte). Le sceau orange mène aux cartes cadeaux. |
| Avis | Dossier à deux pages : flèches ou balayage, « Lire la suite » ouvre l'avis complet. |
| Questions | Casiers : on touche une question, le casier s'ouvre sur sa réponse (un seul à la fois). |
| Contact | Cadran : on le tourne pour composer le numéro chiffre par chiffre, ou on touche « Appeler ». Adresse, mail et réseaux dessous. |

Navigation entre les pièces : bouton « Hall » en haut, deux grosses plaques en bas qui portent le nom de la pièce précédente et de la suivante (« Réserver » après la dernière).

## Données

Les prix, avis, questions et coordonnées sont lus dans le contenu déjà présent dans la page : rien n'est recopié. Les tarifs de ce dépôt sont encore ceux d'avant le 1er octobre ; les corriger dans `index.html` suffit.

## Laissé de côté dans cet essai

- La pièce « L'équipe » n'a pas de machine : elle n'apparaît pas.
- Le compteur de clés cachées et ses clés sont masqués.
- L'entrée (verrou à glisser) est inchangée.

## Fichiers

`decor.js` (hall, portes, pièces), `decor.css`. Accroches dans `mobile.js` : style `d` accepté, `enterDoor` appelle `eeMobile.doorGate` s'il existe, et `setLook`, `showSheet`, `closeSheet`, `centerDoor` sont exposés. `journey.js` ne fait rien pour le style D. `build-test-site.py --style d` publie ce style par défaut (la page GitHub reste ouvrable avec `?v=c`).

## À valider sur un vrai téléphone

- [ ] Sens et facilité du geste du sceau, de l'engrenage et de l'énergie.
- [ ] Lisibilité des libellés pour un public peu à l'aise (taille, contraste).
- [ ] Grattage de la carte et cadran du téléphone.
- [ ] Le premier toucher après un glissé dans l'émulateur de test a été ignoré une fois ; à confirmer sur un vrai appareil.
