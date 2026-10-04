# Enseignes lumineuses du hall

24 septembre 2026. Version locale après retour utilisateur ; la variante drapeau et son sélecteur ont été retirés.

## Perspective

Le point de fuite commun est défini dans `hall-layout.json` : `[836, 635]` dans le décor de 1672 × 941. Il correspond à l'intersection approximative des lignes du plafond et de la jonction mur/sol. Chaque enseigne possède un bord proche (`nearX`, `top`, `bottom`) et un bord éloigné (`farX`). `hall_design.py` calcule le haut et le bas du bord éloigné par interpolation vers le **même** point de fuite. Les deux arêtes horizontales de chaque enseigne y convergent ainsi, sur les deux murs.

Les enseignes restent en texte HTML, séparées du décor et des portes. Leur bord lumineux est cuivré pour Les rouages de l'apocalypse, cyan avec accent orange pour CybertraX. Pour changer leur emplacement ou leur hauteur, modifier les valeurs `sign` ; les quatre coins seront recalculés à la construction.

## Checklist

- [x] Supprimer les enseignes drapeau et le sélecteur de comparaison.
- [x] Déduire un point de fuite commun des lignes du hall.
- [x] Projeter les deux arêtes de chaque panneau vers ce point.
- [x] Vérifier l'écart avec les linteaux orange et la lisibilité à 1280 × 720.
- [x] Reconstruire la maquette locale et vérifier la syntaxe JavaScript.
- [ ] Recueillir le retour visuel avant toute mise à jour WordPress.

Aperçu : http://127.0.0.1:8768/vestibule/ . Aucun changement du site publié.
