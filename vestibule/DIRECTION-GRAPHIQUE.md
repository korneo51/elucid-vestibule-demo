# Direction graphique — réflexion du 24 septembre 2026

La mécanique du vestibule est appréciée. Cette étape prépare la direction visuelle ; aucune modification de la maquette.

## Parcours retenu pour la prochaine proposition
1. Accueil, première porte traversée au scroll.
2. Hall des aventures : deux ouvertures latérales, vantaux ouverts vers le visiteur, épaisseur des encadrements et vrais aperçus d’intérieurs. Rouages à gauche, CybertraX à droite. Noms en texte HTML au-dessus ou sur une plaque séparée ; ouverture entière cliquable. Porte centrale pour continuer.
3. Salon de préparation : prix, cartes cadeaux et avis rassemblés. Prix immédiatement repérables et sélecteur de joueurs ; présentoir cadeau cliquable ; avis lisibles sur un panneau, navigation manuelle. Le décor soutient ces usages, sans chasse aux objets ni déblocage obligatoire.
4. Bibliothèque / bureau des questions : FAQ, accès et contact. Une seule pièce supplémentaire, lecture et défilement naturels si le contenu dépasse l’écran.

## Recommandation de fabrication
Décors préparés en images, séparés en quelques plans, avec perspective et mouvements CSS/JavaScript sobres. Éviter une image unique contenant décor, prix, enseignes et boutons : les textes et contrôles restent du HTML éditable, lisible, accessible et intégrable au thème WordPress.

Blender est une option pertinente pour construire des pièces cohérentes et calculer les éclairages en amont. Exporter quelques images fixes, pas une animation image par image ni une scène 3D à charger par le visiteur. La génération d’images peut servir à explorer une ambiance ; les ouvertures et la perspective doivent rester raccordées aux masques et au parcours.

### Décision après retour utilisateur : style jeu vidéo

Priorité à **une nouvelle génération d’images stylisées**, avec une composition mieux contrôlée. Les visuels actuels visaient un rendu architectural photoréaliste alors que l’objectif est un environnement de jeu vidéo propre et assumé. Commencer par un seul hall, cadrage fixe, palette bleu nuit/orange/cyan, volumes lisibles, portes et plaques générées séparément ; conserver titres, clics et coulissement en HTML/CSS. Évaluer le résultat dans le parcours local avant de toucher à la page WordPress de test.

Ne reconstruire le hall dans Blender que si les nouvelles images échouent encore sur les raccords de perspective, les proportions des ouvertures ou la cohérence entre plusieurs vues. Blender 5.2.1 LTS est installé et un rendu EEVEE de contrôle a réussi sur ce poste ; cela établit la faisabilité technique, pas le temps nécessaire pour modéliser et finaliser un décor. La 3D pré-rendue resterait légère pour le visiteur, mais plus coûteuse à fabriquer et à retoucher.

- [x] Comparer images générées et décor Blender pour le style jeu vidéo demandé.
- [x] Vérifier la présence de Blender et un rendu EEVEE minimal local.
- [ ] Produire une seule proposition de hall stylisé par images générées, avec portes séparées.
- [ ] Juger le rendu visuel et mesurer le poids des fichiers dans la maquette locale.
- [ ] Envisager Blender seulement si les raccords ou la continuité restent insuffisants.

Direction actuelle : reprendre les murs bleu nuit, les cadres orange et le plafond cyan de l’accueil réel, mais avec des formes et des matières stylisées comme dans un jeu vidéo. Accent atelier aux Rouages et lumière bleue provenant de l’intérieur CybertraX. Limiter les lignes lumineuses et les cadres décoratifs ; garder des zones suffisamment claires pour lire les volumes.

## Légèreté et limites
- Images dimensionnées au rendu, WebP/AVIF selon qualité et poids mesurés.
- Quelques plans seulement par pièce : arrière-plan, encadrements/vantaux au premier plan, intérieur derrière les ouvertures.
- Déplacements et opacité comme animations principales ; contrôler les surfaces et couches pour éviter une charge graphique excessive.
- Précharger la prochaine pièce avant son passage ; différer les pièces plus éloignées.
- Objectif provisoire : premier écran sous 1 Mo de ressources transférées, à vérifier avec les vrais décors. Ce n’est pas une mesure de la future réalisation.
- Déplacements de caméra limités : cette illusion ne permet pas de se retourner librement comme dans une vraie scène 3D.
- Prévoir une lecture statique avec animations réduites, et une disposition mobile adaptée.

## Checklist
- [x] Reformuler les portes ouvertes et le regroupement des contenus.
- [x] Comparer décoration CSS, images préparées et 3D exécutée dans le navigateur.
- [x] Définir une méthode graphique légère et compatible avec une intégration WordPress.
- [x] Produire une vue soignée du hall avec les portes entrouvertes au survol (photos d’accueil fournies ensuite).
- [x] Vérifier le rendu dans la traversée existante et mesurer le poids des images ; contrôle visuel des transitions effectué, sans benchmark GPU exhaustif.
- [ ] Décliner le salon pratique puis la pièce FAQ.

## Sources techniques
- https://web.dev/learn/performance/image-performance
- https://web.dev/articles/animations-guide
- https://docs.blender.org/manual/en/5.0/files/media/image_formats.html
