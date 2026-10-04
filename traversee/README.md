# Traversée continue — maquette 3

Direction : progression au scroll uniquement, trois portes placées alternativement à droite, à gauche puis à droite. La scène suivante existe déjà derrière chaque ouverture ; pas de remplacement de photographie au milieu du passage.
Contenu : entrée → Rouages → CybertraX → informations pratiques, suivies des contenus de la maquette initiale.
Mouvement : déverrouillage court, ouverture, déplacement et agrandissement du plan de mur autour de son ouverture. Retour naturel en remontant le scroll. Pas de moteur 3D.

## Checklist
- [x] Nouvelle direction demandée : abandonner la navigation par clic, réduire la longueur des transitions.
- [x] Construire trois traversées continues et les infos à la suite.
- [x] Vérifier début, passages, positions des portes et retour en arrière sur ordinateur.
- [x] Vérifier FAQ/tarifs et absence de blocage du défilement.
- [x] Ouvrir la maquette.

## Essayer
http://127.0.0.1:8768/traversee/

Validation du 24 septembre : parcours visuel à 1280 × 720, traversée des trois portes et retour au scroll, arrivée aux tarifs et à la FAQ, sélection de 2 joueurs (75 € la session), ouverture d’une réponse. Aucun débordement horizontal ni avertissement/erreur console observé. À cette taille, chaque passage occupe 612 px de défilement, soit 1 836 px au total avant la scène d’arrivée. Pas de capture de la molette ni de défilement forcé par étapes.

L’illusion repose sur des plans CSS et des images locales, sans bibliothèque 3D, vidéo ou plugin. HTML, CSS et JavaScript séparés pour une adaptation ultérieure à WordPress. Repli statique prévu pour la réduction des animations ; validation mobile et intégration au thème à faire si cette direction est retenue.

Prototype ordinateur local uniquement. Pas d’intégration WordPress ni de modification des essais précédents. Les contenus sont les copies locales du 24 septembre 2026.
