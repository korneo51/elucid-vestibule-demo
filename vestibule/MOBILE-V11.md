# Prototype mobile v11 — caméra fluide

Thèse visuelle : conserver les décors bleu nuit, cuivre et cyan, puis donner l’impression d’une caméra légère qui traverse les portes et réagit doucement au téléphone.

Contenu : mêmes images, salles, tarifs, cadeaux, avis, FAQ et contacts que la version ordinateur. Le contenu n’est pas dupliqué.

Interactions : un geste court déclenche une transition complète ; le hall garde trois positions ; le capteur utilise gauche-droite pour choisir une position et haut-bas pour la parallaxe ; les panneaux du couloir avancent depuis les murs.

## Checklist

- [x] Séparer le contrôleur mobile du parcours à la molette sur ordinateur.
- [x] Remplacer le changement instantané lié à « réduire les animations » par trois vitesses testables.
- [x] Ajouter la transition entrée → hall et la révélation progressive du couloir.
- [x] Animer les déplacements gauche → centre → droite.
- [x] Centraliser le capteur, corriger son sens par défaut et ajouter le recentrage.
- [x] Ajouter une parallaxe haut-bas sur les décors, panneaux et fenêtres de salle.
- [x] Vérifier les gestes et les états intermédiaires en 390 × 844.
- [x] Vérifier que la version ordinateur reste inchangée.
- [x] Publier la page WordPress isolée et vérifier la v11.
- [ ] Valider le sens et le confort sur Chrome / Redmi Note 10.

## Réglages de test

- Fluide : 800 à 900 ms.
- Plus lent : 1 150 à 1 350 ms.
- Réduit : 180 à 220 ms, sans coupure instantanée.
- Sens inversé activé par défaut pour corriger le comportement observé sur le Redmi Note 10 ; le bouton permet de comparer immédiatement.

## Vérifications locales

- Un geste vertical de 75 px lance une seule transition et atteint le hall en 900 ms.
- Un geste horizontal de 42 px change la position du hall ; le retour au centre reste possible.
- Le couloir apparaît progressivement, puis un geste vertical fait avancer exactement d’un panneau.
- Les modes Fluide, Plus lent et Réduit restent animés.
- À 1 278 × 910, le contrôleur mobile et ses réglages ne sont pas chargés.
- Les seuls messages d’erreur observés dans Chrome provenaient de l’extension de contrôle, pas de la page.

## Vérification en ligne

- Page isolée : (adresse de la page de test WordPress, non publiée ici)?version=mobile-fluid-11
- En 390 × 844, un geste atteint le hall, un geste horizontal de 42 px change de porte, le retour au centre fonctionne et le couloir avance d’un panneau.
- Le site principal n’a pas été remplacé et aucun lien de navigation ne pointe vers cette maquette.
