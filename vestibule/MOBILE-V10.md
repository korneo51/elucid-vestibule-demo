# Prototype mobile v10 — couloir

Intention visuelle : prolonger l'accueil bleu nuit, cuivre et cyan dans un couloir industriel ample, avec des arches en perspective et une surface de lecture claire à chaque arrêt.

Contenu : entrée → hall gauche / centre / droite → tarifs → cadeaux → avis → FAQ → esprit d'équipe → contact. Le contenu existant est réutilisé, sans nouvelles promesses ni tarifs inventés.

Interactions : un geste vertical termine chaque traversée ; les gestes horizontaux passent par le centre ; les panneaux des murs pivotent vers le lecteur. Variante « Lecture » pour comparer un affichage frontal plus calme. Boutons de secours disponibles.

Diagnostic orientation : le bouton héritait de `pointer-events:none` depuis `.world`. Corrigé explicitement ; ajout d'un délai de diagnostic si aucune donnée n'arrive, et prise en compte de la rotation horizontale en plus de l'inclinaison. Le capteur physique reste à vérifier sur téléphone.

## Checklist

- [x] Définir le parcours et réutiliser le contenu existant.
- [x] Vérifier entrée → hall en un geste, gauche → centre → droite, sortie → couloir en un geste.
- [x] Vérifier progression, retours, FAQ et tarifs dans le couloir.
- [x] Vérifier clic réel sur le bouton d'orientation et état sans données.
- [x] Publier et vérifier la page isolée.
- [ ] Tester les capteurs et le confort sur un téléphone physique.

## Livraison — 25 septembre 2026

Page WordPress 3307 mise à jour via l'éditeur de code dans Google Chrome. Adresse de test : (adresse de la page de test WordPress, non publiée ici)?version=couloir-mobile-10 . Balise noindex confirmée. Page d'accueil et thème non modifiés.

Contrôles : Chrome en 390 × 844, gestes tactiles simulés (60 px vertical / 40 px horizontal), entrée et sortie en un geste, gauche puis retour centre, tarifs → cadeaux en un geste. Les six étapes, changement du nombre de joueurs, avis suivant, ouverture FAQ, retour au hall et modes Perspective / Lecture sont vérifiés. Format PC restauré après vérification. Les erreurs console observées proviennent de l'extension Chrome, pas du prototype.

Différence WordPress corrigée : le thème impose une hauteur de body qui bloquait le scroll programmatique. Le module mobile impose maintenant height:auto uniquement sur cette maquette. Les réponses dépliées recalculent leur comportement tactile pour garder le défilement interne.

Le capteur physique n'est pas validé par ces simulations. Le bouton signale maintenant « AUCUNE DONNÉE » après 4,5 secondes sans événement ; la permission refusée a un libellé distinct. Aucun nouveau plugin, moteur 3D ou visuel lourd : le couloir est en CSS, avec les contenus existants.
