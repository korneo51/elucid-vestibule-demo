# Hall mobile — regard libre v7

24 septembre 2026. Essai publié sur la page isolée : (adresse de la page de test WordPress, non publiée ici) . La page d'accueil et son menu restent inchangés.

Thèse visuelle : conserver le hall illustré et ses accès en couches séparées. L'arrivée se fait face à la porte du fond ; le cadrage se déplace vers les salles latérales au geste horizontal. Cette version utilise l'image v4 actuelle pour juger la mécanique avant de remplacer éventuellement le panorama.

Parcours : entrée par défilement vertical → hall centré → regard gauche/droite par balayage → toucher d'une salle pour ouvrir sa présentation → reprise au même cadrage → défilement vertical et recentrage vers la porte du fond.

Le mouvement reste léger : translation du décor, de la porte centrale et de son ouverture, sans moteur 3D ni nouvelle image. Le geste horizontal n'agit que sur le palier du hall ; le geste vertical garde le défilement natif. La direction du regard est bornée aux deux côtés. Le mode « animations réduites » conserve sa lecture statique.

L'orientation du téléphone est techniquement envisageable avec `DeviceOrientationEvent`, mais ce n'est pas activé dans cette version. Elle demanderait un bouton d'activation, parfois une autorisation du navigateur, un étalonnage selon l'orientation de l'écran et un essai sur de vrais téléphones. Le balayage est le contrôle principal ; l'orientation ne doit pas en être une dépendance.

## Checklist

- [x] Arriver dans le hall face à la porte centrale, sans panorama automatique.
- [x] Balayer vers Les Rouages et CybertraX sur écran étroit.
- [x] Faire suivre le décor, la porte centrale et son ouverture au même déplacement.
- [x] Garder les salles cliquables et revenir au cadrage choisi après fermeture.
- [x] Recentrer en continu avant le passage dans la porte du fond.
- [x] Vérifier visuellement à 390 × 844, en local et sur la page publiée, avec un glissement simulé à la souris.
- [x] Conserver le bloc WordPress et les cinq images existantes ; enregistrer sur la page de test séparée.
- [x] Recontrôler la réponse publique avec des navigateurs simulés iPhone et Android, puis purger le cache de cette page le 24 septembre ; la page servie contient bien « GLISSEZ POUR REGARDER ».
- [ ] Tester le balayage avec le doigt et la fluidité sur un téléphone physique.
- [ ] Décider après cet essai si le hall doit devenir une illustration panoramique plus large, pensée pour un point de vue fixe.
- [ ] N'ajouter l'option d'orientation du téléphone que si son confort est confirmé sur appareil réel.

Fichiers de travail : `traversee.js` (geste, cadrage et transition), `hall-design.css` (indication mobile), `index.html` (texte de l'indication). `build-wordpress-preview.py` produit les fichiers de transfert `*-mobile-v7.html` pour la page WordPress 3307.
