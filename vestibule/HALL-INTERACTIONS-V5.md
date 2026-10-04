# Guidage et rythme du hall — v5

24 septembre 2026. Maquette locale uniquement ; aucune mise à jour de la page WordPress publiée.

**Thèse visuelle :** le hall garde ses deux enseignes et son décor ; les gestes à faire se lisent sur les murs latéraux, sans bandeau flottant ni panneau sur les portes.

**Contenu :** l'entrée mène au hall ; les enseignes nomment les deux salles ; les repères « CLIQUEZ » pointent vers leurs portes ; « FAITES DÉFILER ↓ » sous la porte centrale indique la suite verticale. Les informations pratiques restent après la traversée.

**Interaction :** un palier de défilement de 68 % d'une étape maintient le hall à l'écran avant que la porte du fond avance. Les deux repères apparaissent à l'arrivée dans le hall et disparaissent pendant la traversée ; leur survol entrouvre la porte correspondante, leur clic ouvre la même présentation que la porte. Les contours des repères sont projetés avec les quatre coins calculés depuis le même point de fuite que les enseignes. Les coordonnées sont modifiables dans `hall-layout.json` ; la durée du palier est dans `traversee.js`.

## Checklist

- [x] Supprimer les deux textes génériques du centre et la consigne en bas du hall.
- [x] Supprimer les panneaux « Découvrir la salle » à l'ouverture des vantaux.
- [x] Projeter deux repères cliquables selon la perspective des murs latéraux.
- [x] Remplacer « vers la porte du fond » par une indication explicite de défilement vertical.
- [x] Garder le hall stable durant un court palier, puis reprendre la traversée au scroll.
- [x] Vérifier la composition sur ordinateur et ouvrir les deux présentations depuis leurs repères.
- [x] Vérifier la syntaxe JavaScript et éviter `&&`, transformé par WordPress dans un bloc HTML personnalisé.
- [ ] Recueillir l'avis sur ces repères et le rythme du scroll avant publication.
