# Hall mobile — correction des portes frontales v8

25 septembre 2026. Correction publiée sur la page de test WordPress 3307 : (adresse de la page de test WordPress, non publiée ici) . L'accueil public reste inchangé.

Cause : le réglage système « animations réduites » activait une ancienne interface mobile avec deux portes affichées de face. Ce n'était pas un cache obsolète. Le mode réduit utilise désormais le même hall en perspective que le mode normal, avec le balayage horizontal et le défilement vertical pilotés par l'utilisateur. Les animations automatiques restent supprimées dans ce mode.

## Checklist

- [x] Reproduire les portes frontales à 390 × 844 avec « animations réduites ».
- [x] Retirer l'ancien affichage mobile et ses styles inutilisés.
- [x] Conserver le balayage et la transition au défilement sous ce réglage.
- [x] Vérifier en local le hall, CybertraX et la porte du fond dans ce mode.
- [x] Publier le bloc HTML corrigé sur la page de test séparée.
- [x] Vérifier la réponse publique avec et sans paramètre de version : l'ancien affichage n'est plus présent.
- [x] Vérifier visuellement sur le domaine réel, à 390 × 844 avec « animations réduites » : hall en perspective et CybertraX accessible au balayage.
- [ ] Tester les gestes et la fluidité sur un téléphone physique.

Sources : `index.html`, `hall-design.css`, `traversee.js`. `build-wordpress-preview.py` produit les fichiers `*-mobile-v8.html`. Les images du décor et des salles ne changent pas.
