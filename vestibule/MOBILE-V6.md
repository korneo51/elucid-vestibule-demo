# Hall mobile et publication — v6

24 septembre 2026. La maquette reste isolée sur la page WordPress 3307 : (adresse de la page de test WordPress, non publiée ici) . L’accueil public et son menu ne changent pas.

Sur écran étroit, l’entrée garde son texte en bas à gauche et place une porte plus large et plus basse en haut à droite. Un premier défilement amène dans le hall face aux Rouages. Le palier suivant déplace le cadrage horizontalement jusqu’à CybertraX ; la suite revient vers l’axe central et franchit la porte du fond. Les deux salles restent accessibles par toucher. Les repères « CLIQUEZ » / « TOUCHEZ » et leurs flèches pulsent en CSS uniquement quand le hall est interactif ; le mouvement est coupé si l’utilisateur demande une animation réduite.

Réglages : dimensions et tempo dans `traversee.js` ; positions et visuels des accès dans `hall-layout.json` ; présentation des repères dans `hall-design.css`. Les cinq images sont indépendantes et versionnées. L’assemblage WordPress est produit par `build-wordpress-preview.py` dans les deux fichiers `wordpress-preview-*-mobile-v6.html`.

## Checklist

- [x] Réduire la hauteur et élargir la porte du premier écran mobile ; placer le texte en bas à gauche.
- [x] Montrer les Rouages à l’entrée du hall, puis CybertraX par un panoramique commandé au défilement.
- [x] Recentrer le décor avant le franchissement de la porte centrale.
- [x] Garder les portes cliquables et les présentations lisibles sur 390 × 844.
- [x] Faire pulser les consignes et flèches, avec arrêt au survol/focus et en animation réduite.
- [x] Vérifier la syntaxe JavaScript et le bloc WordPress sans opérateur `&&`.
- [x] Téléverser les cinq JPEG versionnés et enregistrer la maquette sur la page de test existante.
- [x] Vérifier sur le domaine réel les médias, la nouvelle logique mobile et la balise `noindex`.
- [ ] Tester les gestes et les performances sur un téléphone physique ; le contrôle actuel utilise un navigateur à 390 × 844.

Les cinq JPEG chargés par le hall et les présentations totalisent 1 236 871 octets. Aucun moteur 3D, vidéo ou nouveau plugin n’a été ajouté. La page de test est publique pour être ouverte sur téléphone ; elle n’est pas protégée par mot de passe.
