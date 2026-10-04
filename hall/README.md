# Hall interactif — maquette ordinateur

Direction : remplacer le parcours imposé au scroll par un hall à plusieurs portes et une navigation libre au clic.
Contenu : deux salles, tarifs, FAQ, avis, carte cadeau, groupes/expérience et contact, repris de la première maquette locale.
Interaction : la porte choisie s’ouvre et s’agrandit ; transitions courtes entre rubriques ; retour au hall toujours visible.

## Checklist
- [x] Relever les contenus de la première maquette.
- [x] Construire le hall et les destinations.
- [x] Vérifier portes, retours, FAQ, tarifs et accès à toutes les rubriques.
- [x] Ouvrir l’aperçu ordinateur.

Essai rapide, local uniquement, sans travail mobile approfondi. Pas de modification du site ni de la première démonstration. HTML/CSS/JS natifs : adaptation ultérieure possible dans un modèle de thème enfant WordPress, sans plugin d’animation. Contenus et avis sont une copie statique du 24 septembre 2026, pas une synchronisation du site.

## Livraison et vérification
Aperçu : http://127.0.0.1:8768/hall/ . Servi par le même serveur local lié à 127.0.0.1 que la première démonstration.

- Quatre portes testées : Rouages, CybertraX, tarifs, FAQ ; huit destinations présentes avec cadeaux, avis, groupes et contact.
- Transitions : ouverture et agrandissement de la porte choisie (~1 seconde), changement de rubrique et retour via deux panneaux (~0,45 seconde). Pas de moteur 3D, vidéo ou dépendance externe.
- FAQ dépliée, tarif 2 joueurs (75 € la session), passage à l’avis 2/9 et retour navigateur vérifiés.
- Images et navigation contrôlées sur ordinateur. Aucun débordement horizontal observé sur les rubriques vérifiées. Pas d’erreur console constatée lors du contrôle.
- Les liens commerciaux réels s’ouvrent dans un autre onglet. Aucun paiement, réservation ou envoi effectué.
- Pas de validation mobile approfondie, de profilage de fluidité ni d’intégration WordPress : essai rapide demandé.

Sources : build.py reprend les sections de ../../accueil-native-2026-09-24/elucid-accueil/home.html ; les images et la police sont réutilisées depuis ../assets/. Le symbole de marque provient aussi de la première maquette.

La version au défilement est conservée à l’adresse du dossier parent. Avant une intégration WordPress, porter les écrans dans le thème enfant, isoler les styles, charger les ressources avec les fonctions WordPress et rétablir des URL/sections adaptées au référencement. Le prototype fonctionne avec des fragments d’URL et des contenus déjà présents dans le HTML ; ce n’est pas encore une architecture de production validée.

## Retour au hall — deuxième essai
- [x] Bouton « Sortir vers le hall » plus visible, dans une barre qui reste accessible pendant la lecture.
- [x] Retour par recul de la rubrique dans sa porte d’origine (Rouages, CybertraX, tarifs, FAQ), puis fermeture du mécanisme ; pas de logo agrandi en plein écran.
- [x] Pour les rubriques sans porte dédiée, retour par recul/fondu vers le hall.
- [x] Défilement vers le haut depuis le haut de la rubrique : geste cumulé de 220 px environ, réinitialisé après une pause de 420 ms. Petite jauge et indication du geste. Aucune capture du défilement pendant la lecture plus bas dans la page.
- [x] Vérifier le bouton, la sortie à la molette depuis CybertraX et le défilement normal de la FAQ développée.
- [ ] Ressenti utilisateur sur les deux manières de sortir.

Les animations sont supprimées si la préférence système de réduction des mouvements est active. Le geste est un essai ordinateur à la molette/pavé tactile ; pas de gestion tactile spécifique ajoutée.
