# Prototype v12 — plus simple, plus léger

> **Remplacée sur téléphone par la v13** (`MOBILE-V13.md`) : le hall en panorama, le couloir en 3D et la roue ⚙ ont disparu. Le poids, les WebP, les prix, l'en-tête PC et les fiches PC décrits ici restent valables.

Maquette de test uniquement, locale : la page WordPress isolée et l'accueil public ne sont pas concernés. Suite de `REVUE-2026-10-04.md`.

Thèse : même décor et mêmes interactions que la v11, mais une seule chose à comprendre à la fois, un téléphone qui ne rame pas, et un PC qui garde « Réserver » à portée de clic.

## Ce qui change

**Poids (PC et mobile)**
- Les cinq images du hall, des portes et des salles passent en WebP (`assets/v12/`) : 1 236 871 → 339 908 octets, différence invisible à l'œil (PSNR 34–39 dB). Les JPEG/PNG d'origine restent dans le dépôt.
- Les feuilles de style ne s'enchaînent plus par `@import` (3 requêtes l'une après l'autre) : quatre `<link>` en parallèle. `/traversee/` reçoit le même traitement.
- Image du hall et police préchargées.
- Le flou plein écran derrière les fiches de salle est remplacé par un fond plus opaque : il faisait chuter la fluidité à l'ouverture.

**Mobile**
- Le bouton de test « MOUVEMENT » devient une petite roue ⚙ à côté de « Réserver ». Elle contient : vitesse, inclinaison (ex-bouton « AUCUNE DONNÉE · RÉESSAYER »), recentrer, sens inversé, vue perspective/lecture, vibrations, effets légers.
- Hall : une seule rangée `← Rouages | ◉ | CybertraX →` avec les vrais noms. Un second appui sur une porte déjà regardée (« Entrer ↗ ») ouvre la fiche. Un seul bouton principal en bas : « Tarifs & infos ↓ ». L'indice « glissez » disparaît tout seul après quelques secondes.
- Première arrivée dans le hall : petit coup d'œil automatique à gauche puis à droite (les portes s'entrouvrent) pour montrer qu'il y a deux portes. Le moindre geste l'annule ; ignoré avec « Réduit ».
- Couloir : rangée d'onglets `Tarifs · Cadeaux · Avis · Questions · Équipe · Contact` pour aller directement où on veut ; « Réserver ↗ » toujours visible dans l'en-tête ; pastille « ↓ la suite de la carte » quand une carte déborde (c'était la cause du « balayage qui fait défiler la carte au lieu d'avancer »).
- Entrée : lien « Aller directement aux infos » ; le fondu vers le couloir fonctionne aussi depuis l'entrée.
- Vibration très brève (8 à 15 ms) aux transitions et à l'ouverture d'une fiche, sur les navigateurs qui la permettent.
- Écrans courts (360 × 640 / 740) : plus de chevauchement du bouton et du texte d'entrée, ni de l'indice et de la porte.

**PC**
- L'en-tête (logo, nos aventures, infos, **Réserver**) reste affiché pendant tout le parcours ; fond plein une fois dans la partie pratique pour ne pas recouvrir les titres.
- Lien d'évitement « Passer l'intro » au premier appui sur Tab.

**Fiches de salle (PC et mobile)**
- Vrai bouton « Réserver cette aventure », pastilles d'infos (2–6 joueurs · 90 minutes · dès 8 ans), image qui remplit son cadre (plus de bande brune).
- CybertraX : « Être prévenu de l'ouverture » (lien mail vers `contact@elucidescape.fr`, adresse déjà présente sur la page).

**Prix** : le tableau HTML est la seule source. Le sélecteur, le prix unitaire et le total de session en sont déduits au chargement. Les montants sont ceux du site réel depuis le 1ᵉʳ octobre : 78 € la session à 2 joueurs, puis 31 / 27 / 24 / 24 € par personne de 3 à 6 joueurs. Une seule ligne à modifier à la prochaine hausse.

## Allègement du couloir mobile

Mesures Chromium sans GPU, processeur ralenti ×4, téléphone émulé 393 × 851 à 2,75 de densité. Valeurs relatives : un vrai téléphone a un GPU, donc les chiffres absolus y seront meilleurs, mais la hiérarchie des coûts reste informative.

| | v11 | v12 |
|---|---|---|
| Poids de la page (14 requêtes) | 1 377 924 o | 491 689 o |
| Chargement local, sans limitation | 1 200 ms | 410 ms |
| Couloir, passage d'une carte à l'autre : images lentes sur 90 | 21 | 15–18, **0 en mode léger** |
| Tâches de rasterisation pendant ce passage | 835 | ≈ 140 |
| Recalculs de mise en page pendant ce passage | 147 | 32–71 |
| Ouverture d'une fiche sur PC : images lentes | 17 sur 21 (pic 117 ms) | 12 sur 58 (pic 50 ms) |

Causes trouvées :
- les sept « nervures » du tunnel étaient sept calques plein écran en perspective, re-rasterisés à chaque image : remplacés par un seul canvas basse résolution ;
- `render()` relisait la hauteur des six cartes à chaque image, ce qui forçait une mise en page par carte : mesure faite une fois, sur la carte courante ;
- le fondu d'entrée du couloir animait aussi une échelle, donc re-rasterisait tout le couloir : opacité seule ;
- les cartes éloignées restent dessinées avec une opacité nulle : elles sont maintenant masquées.

**Garde-fou** : si une transition perd au moins 4 images (plus de 48 ms), les nervures et les ombres des cartes sont coupées automatiquement pour la session (⚙ → « Effets légers », réversible). Un téléphone qui rame se protège tout seul ; un téléphone fluide garde l'effet complet.

## Vérifications

- Parcours complet en 393 × 851, 412 × 915, 360 × 740 et 360 × 640 (tactile émulé) : entrée → hall → coup d'œil → dock (regarder puis entrer) → deux fiches → couloir → onglets → retour hall → entrée → lien « directement aux infos ». Aucun message console, aucun débordement horizontal.
- PC 1280 × 720 : parcours, survol et clic des portes, deux fiches, sélecteur de prix (2 à 6 joueurs, mêmes montants qu'avant), « Réserver » visible à toutes les positions, lien d'évitement au clavier.
- `/traversee/` et la page d'accueil de la maquette chargent toujours leurs styles. Le 404 de `/hall/` sur `symbole.svg` existait déjà (chemin hors dépôt).
- `build-wordpress-preview.py` (renommé v12) a été exécuté avec des URL factices : cinq images réécrites, aucun chemin relatif restant, aucun `&&`. Sorties non versionnées.

## Tester directement

`python3 vestibule/build-test-site.py --out <dossier>` copie uniquement ce dont la page a besoin (14 fichiers, 509 Ko), réécrit les chemins `../assets/`, intègre la police et affiche l'adresse e-mail en clair (les liens `mailto:` sont peu fiables dans une page hébergée). Le dossier obtenu se publie tel quel comme page de test privée. `index.html` du dépôt n'est jamais modifié.

Limites d'une page hébergée : le capteur d'orientation et la vibration y sont refusés par le navigateur intégré. Gestes, transitions, poids et fluidité se jugent bien ; le sens et le confort du capteur demandent une adresse ouverte directement dans Chrome sur le téléphone (page WordPress isolée, ou GitHub Pages, indisponible tant que le dépôt est privé et que Pages n'est pas activé).

## À savoir

- `index.html` fait foi. `build.py` et `hall_design.py` lisent un dossier source (`accueil-native-2026-09-24`) absent de ce dépôt : les relancer écraserait ces changements.
- Les nouveaux WebP doivent être ajoutés à la médiathèque WordPress avant d'exécuter le préparateur (WordPress accepte le WebP depuis la 5.8).
- Changer d'orientation en passant sous/sur 760 px ne bascule pas proprement entre les deux modes sans recharger : limite déjà présente en v11.

## Checklist

- [x] Prix : source unique.
- [x] Mobile : réglages derrière une roue, deux portes nommées, une seule action en bas.
- [x] « Réserver » toujours visible (PC et couloir), accès direct aux infos.
- [x] Fiches de salle : vrai bouton, infos clés, image qui remplit, CybertraX avec une action.
- [x] Poids divisé par près de trois (÷ 2,8), couloir allégé, mode léger automatique.
- [ ] Valider sur le Redmi Note 10 : ressenti du coup d'œil, vibrations, bascule automatique en mode léger, capteur.
- [ ] Safari iOS (capteur à autoriser par un geste : bouton dans ⚙).
- [ ] Fond de couloir illustré dans le style du hall (demande de nouvelle illustration).
- [x] Prix alignés sur le site réel (78 / 31 / 27 / 24 / 24 €).
- [ ] Réglages WordPress (police, logo, titre, meta description) avant toute mise en ligne.
