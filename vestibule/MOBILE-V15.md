# Vestibule mobile v15 — style D « le décor est l'interface »

Maquette de test uniquement. Suite de `MOBILE-V14.md` et de `VOYAGES.md` : le style C (panneau de commande en bas de l'écran) est remplacé par des mécanismes qui font partie du décor. Les styles classique, A, B et C restent disponibles avec `?v=0`, `?v=a`, `?v=b`, `?v=c` ; `?v=d` active celui-ci. `?keys=0` remet le compteur de clés à zéro pour les essais.

## Retours pris en compte

- Style proche de l'accueil : nuit, cyan, orange, lignes fines, lueurs discrètes. Pas de matériau imité ni de vaisseau spatial.
- Une seule action par porte, qui ouvre la porte directement. Pas de geste à deux pouces, pas d'étape avant.
- Simple et court : un simple toucher joue toujours le geste. Cibles de 44 px minimum, libellés écrits en toutes lettres.
- Hall explicite : l'enseigne dit où l'on va avant d'entrer.
- **Les informations d'abord** : dans chaque pièce, le contenu utile (tarifs, carte cadeau, avis, réponses, coordonnées) est la première chose visible. Les énigmes sont un supplément.
- **Rien à faire défiler** : chaque pièce tient dans la hauteur de l'écran (testé à 393 × 780, 393 × 740 et 360 × 640).
- **Des énigmes dans l'esprit de l'escape game**, et une clé cachée par pièce. Cinq clés trouvées avant la réservation : un porte-clé Elucid Escape à récupérer le jour de la session.

## Parcours

| Étape | Ce que fait le visiteur |
|---|---|
| Hall | Le sceau de la porte du fond se tourne du doigt (ou on touche une icône). L'enseigne au-dessus affiche « Votre destination : Tarifs » et sa phrase. Le gros bouton « ENTRER » y mène. Deux plaques au sol, « Les Rouages » et « CybertraX », tournent la vue vers une porte (le balayage fonctionne toujours). |
| Porte des Rouages | On tourne le grand engrenage (un demi-tour environ) : les battants s'ouvrent, puis la fiche de la salle monte. Toucher l'engrenage joue tout seul. |
| Porte de CybertraX | On fait monter l'énergie le long du joint de la porte (un seul glissé vers le haut) : les battants s'ouvrent, puis la fiche monte. Toucher le bouton joue tout seul. |
| Tarifs | Le tableau des cinq tarifs (par personne et par session) et le bouton « Choisir mon créneau » en haut. Le bouton « Allumer la lampe UV » éteint la pièce : le doigt promène la lampe n'importe où (ou on touche et elle fouille seule). Des mots cachés apparaissent en violet, dont le mot de passe du standard, et une clé qui change de place à chaque visite. |
| Cadeaux | La carte cadeau et son bouton « Offrir une carte cadeau » d'abord. Dessous, un cryptex à six anneaux gravé d'un message chiffré (5 · 14 · 9 · 7 · 13 · 5) avec l'alphabet numéroté (A = 1, B = 2…) : on déchiffre le mot, on tourne les anneaux (toucher ou glisser), la clé sort. |
| Avis | Dossier à deux pages : flèches ou balayage, « Lire la suite » ouvre l'avis complet. Une clé est glissée entre les pages, à la dernière. |
| Questions | Les réponses du site, avec un instrument par question : loquet à glisser, curseur d'âge, frise de la partie, jauge de difficulté, interrupteur de lumière. Éteindre la lumière dans « Effrayé ? » fait briller une clé dans le noir. |
| Contact | Adresse, téléphone, mail et réseaux d'abord. Dessous, un téléphone à touches qui fait entendre les tonalités ; « Appeler » compose le numéro. Le pense-bête dit que le maître du jeu ne décroche que pour ceux qui savent lire dans le noir : le mot de passe (6 9 0 #) est écrit à la lampe UV dans Tarifs. Bon code : une clé sort du retour de monnaie. |

Navigation entre les pièces : bouton « Hall » en haut, deux grosses plaques en bas qui portent le nom de la pièce précédente et de la suivante (« Réserver » après la dernière).

## Easter eggs

- Composer le numéro d'Elucid Escape (03 26 67 38 01) : « Allô ? Bienvenue chez Elucid Escape, le meilleur escape game de Châlons-en-Champagne ! (en même temps, on est les seuls) », avec un bouton pour appeler pour de vrai.
- Jouer « Au clair de la lune » sur le clavier (1 1 1 2 3 2 1 3 2 2 1) : « Bravo, vous êtes un super musicien », avec la mélodie.
- Codes courts, après une pause : 112 / 15 / 17 / 18, 3615, 666, 0000 ou 1234, 42, 007.
- Questions : basculer l'interrupteur de lumière huit fois de suite : « Court-circuit ! ».

## Décors

Chaque pièce a son décor dessiné (dans l'attente d'illustrations) : salle noire aux tubes UV (Tarifs), salle du coffre (Cadeaux), bibliothèque (Avis), salle de contrôle (Questions), standard téléphonique (Contact). Voir `scenes` dans `decor.js`.

## Clés et récompense

Cinq clés, une par pièce (Tarifs, Cadeaux, Avis, Questions, Contact), comptées dans l'en-tête et mémorisées pour la session. Les cinq trouvées : une fenêtre « Porte-clé gagné ! » demande de montrer l'écran à l'accueil le jour de la session. **Il n'y a aucune vérification côté serveur** : à décider (code à citer, mention dans la réservation…) avant toute mise en ligne.

## Données

Les prix, avis, questions et coordonnées sont lus dans le contenu déjà présent dans la page : rien n'est recopié. Les tarifs de ce dépôt sont encore ceux d'avant le 1er octobre ; les corriger dans `index.html` suffit.

## Laissé de côté dans cet essai

- La pièce « L'équipe » n'a pas de machine : elle n'apparaît pas.
- L'entrée (verrou à glisser) est inchangée.
- L'énigme du cryptex et celle du téléphone sont volontairement courtes ; elles se règlent dans `buildGift` et `buildContact` de `decor.js`.
- Événements, professionnels et pages légales : voir `SITE-INVENTAIRE.md`.

## Fichiers

`decor.js` (hall, portes, pièces, clés), `decor.css`. Accroches dans `mobile.js` : style `d` accepté, `enterDoor` appelle `eeMobile.doorGate` s'il existe, et `setLook`, `showSheet`, `closeSheet`, `centerDoor` sont exposés. `journey.js` ne fait rien pour le style D. `build-test-site.py --style d` publie ce style par défaut (la page GitHub reste ouvrable avec `?v=c`).

## À valider sur un vrai téléphone

- [ ] Sens et facilité du geste du sceau, de l'engrenage et de l'énergie.
- [ ] Lisibilité des libellés pour un public peu à l'aise (taille, contraste).
- [ ] Lumière noire, cryptex, instruments et téléphone : durée et difficulté réelles.
- [ ] Sons du téléphone (tonalités) : volume, et comportement quand le téléphone est en silencieux.
- [ ] Le premier toucher après un glissé dans l'émulateur de test a été ignoré une fois ; à confirmer sur un vrai appareil.
