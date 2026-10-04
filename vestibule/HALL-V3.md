# Hall v3 — retour à l’accueil et séparation des couches

Demande : retrouver l’architecture de l’essai photo précédent, légèrement stylisée, avec moins de sol, plus de plafond, grands panneaux fixes au-dessus des portes et réglage commun de l’orientation.

## Composition

Les quatre couches sont, de l’arrière vers l’avant : image de salle, deux vantaux coulissants, image du hall avec ouvertures découpées à l’affichage, panneaux HTML. Le masque SVG de l’image du hall et la projection des portes/intérieurs/panneaux utilisent les mêmes quatre coins, définis une seule fois dans `hall-layout.json`. Aucun intérieur n’est figé dans le décor. La jonction centrale utilise uniquement celle du visuel : le trait sombre CSS supplémentaire a été supprimé. Les noms restent entièrement visibles pendant l’ouverture.

Le fichier `hall-layout.json` permet de changer séparément `background`, `door`, `interior`, `title` et `corners`. Modifier `interior` met également à jour l’image de la présentation de salle. Reconstruire ensuite avec `python build.py`. Les PNG originaux et la version v2 du code sont conservés ; les fichiers réellement affichés sont des JPEG.

## Assets

- Nouveau décor : `../assets/hall-v3/hall-reception-v3.png` (source) et `.jpg` (livraison à qualité 87), 1672 × 941.
- Portes conservées : `../assets/game-v2/door-rouages-v2.jpg` et `door-cybertrax-v2.jpg`.
- Intérieurs indépendants : `../assets/game-v2/room-rouages-v2.jpg` et `room-cybertrax-v2.jpg`, aussi utilisés dans les présentations.
- Les précédentes consignes de génération des portes et salles restent dans `GAME-V2-PROMPTS.md`.

## Génération du nouveau décor

Outil intégré `image_gen__imagegen`, mode édition. Cible : `../assets/hall-accueil-v1.jpg`. Référence supplémentaire : photo de plafond `IMG_20230818_114339_preview.jpeg` fournie par l’utilisateur. Copie originale conservée dans le dossier du projet, conversion JPEG sans retouche. La découpe des ouvertures est un masque SVG déterministe dans la page, pas une retouche destructive du fichier.

Prompt final :

Use case: style-transfer. Asset type: editable background plate for an interactive website hall. Image 1 is the EDIT TARGET and architectural design to preserve; Image 2 is the user's actual reception ceiling, an identity/style reference. Rework Image 1 into a clean slightly stylized video-game render of THE SAME SIMPLE RECEPTION, not a fantasy hall. Keep its plain midnight-navy flat walls, light gray faceted pitched ceiling, straight dark metal ribs, cyan ceiling light strips, white strip at the top of the walls, segmented vivid orange door surrounds, large plain light-gray square floor tiles. No brass, no wood trim on the hall, no plants, no ornaments, no spaceship architecture. Camera level, centered one-point perspective, straight verticals. Reframe to show noticeably MORE CEILING and LESS FLOOR: ceiling approx top 35 percent, back floor line at 82 percent image height, just 18 percent floor visible. Two broad side-wall doorway openings, one left and one right, each roughly 22 percent of image width, same orientation as the target but a less extreme angle. Both doorways have ample blank navy wall space immediately ABOVE their lintels for LARGE separate HTML name signs; lower the door tops to about 43 percent frame height near the outer edges, and 48 percent near the inner edges. Keep side doors wide. Their lower outer corners at about 93 percent image height and inner lower corners at 82 percent. Doorway openings must be empty solid near-black flat surfaces, NO room interiors, NO door leaves. Orange frames are crisp and continuous, with straight inner edges, no objects across openings. Back wall blank navy with room for a small later-added central passage. Style: polished game environment with slightly simplified shapes and subtle painted material texture; bright readable real reception materials, restrained soft lighting. This is a conservative refinement of the provided old hall, not a redesign. No text, no signage baked in, no logos, no people. Single wide 16:9 image.

## Checklist

- [x] Reprendre le décor précédent et son identité bleu nuit/orange/gris/cyan.
- [x] Séparer les images de décor, de porte et d’intérieur.
- [x] Partager les mêmes points entre masque et projection, sans seconde géométrie à ajuster.
- [x] Déplacer les noms sur de grands panneaux fixes au-dessus des portes.
- [x] Vérifier visuellement la porte gauche et son intérieur indépendant.
- [x] Vérifier porte droite, clics, retour et traversée centrale complète à 1475 × 910.
- [x] Contrôle final après correction de l’espacement du texte central : 12,7 px libres avant le cadre central, aucune image en échec, aucun avertissement/erreur console observé et aucun débordement horizontal.
- [ ] Recueillir le retour visuel de l’utilisateur.

Portée : maquette locale `/vestibule/`. Aucun changement de la page WordPress publique pendant cette révision. Le préparateur WordPress local a été adapté au nouveau décor et conserve le principe HTML/CSS/JS sans nouveau plugin.
