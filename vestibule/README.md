# Vestibule — essai de profondeur

## Exploration en cours : voyages A, B, C (téléphone)

Trois façons d'avancer de pièce en pièce au lieu de défiler une page : traverser des portes (A), descendre en ascenseur (B), petits gestes de déverrouillage (C). Sélecteur de style dans la barre du bas, parcours classique conservé. Détails : `VOYAGES.md`.

## Version locale la plus récente : v13 « le verrou, les deux portes, les clés » (téléphone)

Parcours téléphone entièrement refait : un verrou à glisser, deux grandes portes côte à côte, des fiches de salle avec bouton de réservation toujours visible, la suite en défilement naturel avec une barre de navigation en bas, 5 clés cachées facultatives, et un fondu clair quand le téléphone limite les animations. La version PC est inchangée. Principe, mesures, fichiers et checklist : `MOBILE-V13.md`. `MOBILE-V12.md` décrit la version précédente (poids, WebP, prix), dont ces parties restent valables.

## Version actuelle : hall stylisé, guidage et panoramique mobile v6 — en ligne

La page de test (adresse de la page de test WordPress, non publiée ici) présente la version actuelle, sans lien depuis l’accueil public. Sur téléphone, la première porte est plus basse et plus large, en haut à droite ; le texte reste en bas à gauche. Le défilement montre d’abord les Rouages, déplace ensuite le regard vers CybertraX, puis recentre la vue avant la porte du fond. Les flèches « CLIQUEZ » ou « TOUCHEZ » pulsent pendant le choix. Détails et checklist : `MOBILE-V6.md`.

## Historique : hall stylisé v4, guidage v5 — locale

Décor plus dessiné façon jeu vidéo, fond simplifié, touches de science-fiction et sol continu bleu-gris mat. Portes conservées et pancartes indépendantes recalées au-dessus des encadrements. Les Rouages montrent désormais la comtoise dans un atelier au sol de béton mat, avec plafond et structure métalliques, cuivre et éclairage chaud ; CybertraX garde sa salle sombre aux lumières cyan. Configuration dans `hall-layout.json` ; documentation du décor dans `HALL-V4.md` et des salles dans `ROOMS-V5.md` et `ROOMS-V4.md`. Le décor du hall pèse 161 724 octets ; les cinq JPEG utilisés totalisent 1 236 871 octets. Aperçu : http://127.0.0.1:8768/vestibule/ . Cette itération reste locale.

Dans le hall, les titres génériques au centre et la barre de texte en bas ont disparu. Deux repères « CLIQUEZ » orientés vers les salles suivent la perspective des murs et ouvrent aussi les présentations au clic ; la porte centrale indique « FAITES DÉFILER ↓ ». Un palier de défilement laisse le choix avant la traversée suivante. Réglages, vérifications et checklist : `HALL-INTERACTIONS-V5.md`.

Les enseignes lumineuses sont projetées vers un point de fuite commun au décor ; la variante drapeau et son sélecteur ont été retirés. Coordonnées et checklist : `HALL-ENSEIGNES.md`.

## Historique : accueil à couches indépendantes v3 — locale

Retour demandé au décor de l’accueil précédent : murs bleu nuit, plafond gris à facettes, ossature sombre, bandeaux cyan/blanc et encadrements orange. Davantage de plafond, moins de sol ; grands panneaux fixes au-dessus des accès. Les portes v2 appréciées sont conservées, sans panneau sur leurs vantaux et sans ligne CSS noire supplémentaire au centre.

Le hall est maintenant assemblé avec des images indépendantes : intérieur → porte en deux vantaux → décor dont les ouvertures sont masquées → panneau HTML. Les quatre coins de chaque ouverture sont partagés entre toutes les couches. Changer une porte ou une salle dans `hall-layout.json`, puis exécuter `build.py` ; la même salle sert à l’ouverture et à sa présentation. Détails, prompt et checklist dans `HALL-V3.md`. Code v2 archivé dans `archive-v2`.

Aperçu local : http://127.0.0.1:8768/vestibule/ . Décor JPEG : 196 804 octets. Les cinq images utilisées totalisent 1 434 237 octets (les intérieurs sont maintenant aussi visibles derrière les portes et sont chargés avec le hall). Aucun moteur 3D ni nouveau plugin. La page publique WordPress reste sur la version précédemment publiée. Le préparateur local produit désormais `wordpress-preview-payload-hall-v3.html` et `wordpress-preview-transfer-hall-v3.html` si on lui fournit les cinq URL de médiathèque.

## Historique : révision « jeu vidéo » v2 — locale, 24 septembre 2026

Thèse visuelle : hall bleu nuit à encadrements orange inspiré de l’accueil, deux univers contrastés visibles au-delà des accès ; rendu 3D illustré, sans moteur 3D dans la page. Parcours : entrée → hall avec deux salles cliquables → porte centrale au scroll → informations pratiques. Interaction : les deux vantaux d’un même visuel coulissent latéralement au survol/focus ; le clic ouvre une présentation illustrée, le scroll continue vers le bas.

- [x] Générer un hall commun, deux portes à joint central et deux vues de salles cohérentes.
- [x] Conserver les noms, tarifs, liens et interactions en HTML/CSS/JS modifiables.
- [x] Projeter les portes sur les ouvertures du nouveau hall et vérifier les deux ouvertures.
- [x] Vérifier les deux présentations, leur retour et la suite au défilement en local.
- [x] Livrer des copies JPEG légères et préserver les PNG originaux.
- [ ] Recueillir l’avis sur ce hall avant de redessiner les autres sections ou de mettre à jour la page WordPress.

Aperçu local : http://127.0.0.1:8768/vestibule/ . Cinq illustrations versionnées dans `../assets/game-v2/` ; prompts et contrat de découpe dans `GAME-V2-PROMPTS.md`. Les JPEG affichés totalisent 1 509 672 octets, dont 839 264 octets pour le hall et les portes ; les aperçus de salle sont chargés paresseusement. `prepare-art-game-v2.ps1` reproduit uniquement la conversion JPEG, sans retouche. La page n’utilise ni vidéo, ni Blender côté navigateur, ni bibliothèque 3D.

**La page publique de test WordPress reste sur la version précédente.** Cette itération ne modifie ni cette page, ni l’accueil, ni le menu du site. Le préparateur `build-wordpress-preview.py` accepte désormais cinq URL de médiathèque versionnées et produit des fichiers `*-game-v2.html` séparés après upload éventuel. Les anciens `wordpress-preview-payload.html` et `wordpress-preview-transfer.html` correspondent toujours à la version publiée et ne doivent pas servir à déployer la v2.

## Révision précédente à partir des photos de l’accueil

Le hall utilise désormais un décor généré à partir des trois photos fournies : murs bleu nuit, encadrements orange segmentés, plafond gris à facettes, ossature foncée, éclairage cyan et sol carrelé gris. Les pièces aperçues derrière les portes sont des interprétations illustratives, pas des photographies des salles réelles.

- [x] Décor inspiré des photos, sans reproduire le chantier.
- [x] Porte en bois/laiton avec engrenages et texte HTML « Les rouages de l’apocalypse ».
- [x] Porte futuriste bleu/orange CybertraX.
- [x] Après retour utilisateur : ouverture coulissante en deux vantaux au survol et au focus clavier, entièrement contenue dans l’encadrement. Le pivotement a été remplacé.
- [x] Ouverture des deux présentations au clic, fermeture par bouton et Échap.
- [x] Continuation par la porte centrale au scroll.
- [x] Ajustement des encadrements et des portes au redimensionnement, proportions du décor conservées.
- [x] Aucun échec d’image, erreur console ou débordement horizontal observé ; syntaxe JS vérifiée.

Les deux JPEG livrés pèsent 239 943 et 318 024 octets (557 967 octets au total). Ce chiffre concerne uniquement les deux nouveaux visuels, pas la page complète. Pas de bibliothèque ni de moteur 3D ajoutés. Les portes sont projetées sur les ouvertures par une transformation CSS calculée au redimensionnement ; leurs deux vantaux coulissent en CSS derrière un masque fixe. Les deux ouvertures ont été vérifiées visuellement, ainsi que le clic direct dans le hall et la fermeture de la présentation.

Visuels livrés : `../assets/hall-accueil-v1.jpg` et `../assets/hall-portes-v1.jpg`. Génération avec l’outil intégré image_gen, prompts complets dans `ART-PROMPTS.md`. Conversion JPEG avec `prepare-art.ps1`, sans retouche du contenu. Intégration isolée dans `hall_design.py` et `hall-design.css` ; état précédent conservé dans `archive-v1`. Portée : hall uniquement, suite du site à harmoniser ultérieurement.

Thèse visuelle : un vestibule sombre construit par des lignes de fuite, avec un côté atelier cuivré et un côté laboratoire bleu.
Parcours : entrée → hall des deux salles → porte centrale → préparation de la visite. Le travail de cette itération porte sur le début ; les informations précédentes restent à la suite.
Interactions : ouverture liée au scroll, traversée continue avec perspectives, éclairage des accès au survol et présentation de salle au clic avec retour au même endroit.

## Checklist
- [x] Définir le hall commun et les deux accès latéraux.
- [x] Construire la perspective et les deux présentations cliquables.
- [x] Vérifier entrée, clics, fermeture, porte centrale et retour au scroll.
- [x] Vérifier erreurs et accès aux informations.
- [x] Montrer la maquette locale.

Prévisualisation locale : http://127.0.0.1:8768/vestibule/
HTML/CSS/JS locaux, sans moteur 3D ni bibliothèque ajoutée. L'ancien essai reste dans `/traversee/`.

## Mise en place WordPress — 24 septembre 2026

Page de test : (adresse de la page de test WordPress, non publiée ici) (page WordPress 3307). Initialement privée, elle est maintenant **publiée pour être testée sans connexion, notamment sur téléphone**. Son adresse n’est liée depuis aucun élément de l’accueil public et l’option Slim SEO « Hide from search results » est activée : la page porte une balise `noindex` et est exclue du plan de site par ce réglage. Il ne s’agit pas d’un accès protégé : toute personne ayant l’adresse peut la consulter. La page utilise le modèle **Canevas Elementor** et un seul bloc HTML personnalisé ; aucun élément de l’accueil public ni du menu n’a été remplacé. Quatre illustrations ont été ajoutées à la médiathèque (pièces jointes 3303 à 3306). La police Manrope est intégrée au style de la page. Aucun nouveau plugin.

La page publiée utilise maintenant les cinq JPEG indépendants du hall v4, des deux portes v2 et des intérieurs Rouages v5 / CybertraX v4, ajoutés à la médiathèque le 24 septembre 2026 (pièces jointes 3314 à 3318). `build-wordpress-preview.py` produit `wordpress-preview-payload-mobile-v6.html` et `wordpress-preview-transfer-mobile-v6.html` à partir de leurs URL. Le script inclut la feuille de style de base de `/traversee/`. WordPress transforme les opérateurs `&&` d’un script dans le bloc HTML ; la version intégrée les évite et le préparateur le vérifie.

Checklist de déploiement :

- [x] Créer une page séparée, en plein écran, sans modifier l’accueil.
- [x] Intégrer le décor, les deux portes, les présentations des salles et la suite pratique.
- [x] Vérifier l’entrée, le passage au hall, les deux présentations et la sortie au scroll sur le domaine réel.
- [x] Vérifier le sélecteur de tarifs et l’ouverture de la FAQ.
- [x] Vérifier que la page s’ouvre hors connexion sur la nouvelle adresse.
- [x] Vérifier `noindex` et l’absence de lien vers elle depuis l’accueil public.
- [x] Publier la v6 dans le bloc HTML de la même page isolée et vérifier le nouveau parcours mobile et les cinq images sur le domaine réel.
- [x] Publier la v7 : hall centré, regard latéral au balayage, recentrage avant la sortie. Voir `MOBILE-V7.md`.
- [x] Publier la v8 : retirer les portes frontales qui apparaissaient avec « animations réduites » et vérifier le hall en perspective sur le domaine réel. Voir `MOBILE-V8.md`.
- [x] Préparer la v9 : petit balayage, ouverture automatique après le geste et orientation activée par défaut quand le navigateur le permet. Voir `MOBILE-V9.md`.
- [x] Publier la v9 sur la page isolée depuis la sauvegarde automatique WordPress et vérifier le balayage court et l'ouverture automatique dans Chrome au format téléphone.
- [ ] Contrôler le capteur d'orientation sur un téléphone physique.
- [ ] Tester sur un téléphone physique ; le contrôle visuel actuel utilise une fenêtre de navigateur à 390 × 844.
- [ ] Poursuivre la direction graphique des sections situées après le hall lors d’une prochaine itération.

Validation ordinateur à 1280 × 720 : première ouverture montrant le hall, deux accès cliquables, retour des Rouages à la même position (720 px) avec focus rendu au bouton, fermeture CybertraX par Échap, traversée centrale et tarifs accessibles au scroll. Pas d’erreur console, d’image en échec ou de débordement horizontal observé. Syntaxe JavaScript vérifiée. Défilement natif, deux passages de 612 px à cette taille et courte plage immobile dans le hall pour permettre le choix sans blocage.

À poursuivre si cette piste est retenue : harmoniser les sections du bas comme des pièces, vérifier les petits écrans et intégrer au thème WordPress. Les vues de salles sont des présentations en fenêtre modale, pas encore des pièces traversables. La profondeur est une illusion de perspective CSS/SVG, avec les photos locales existantes.
