# Hall v4 — décor stylisé, sol uni

24 septembre 2026. Itération locale, sans modification de WordPress.

## Direction retenue
Même accueil bleu nuit / orange / cyan, rendu dessiné de jeu vidéo. Mur du fond simplifié, détails techniques discrets, sol continu bleu-gris mat évoquant un pont de vaisseau. La première variante à petites dalles est conservée comme source intermédiaire ; le sol uni la remplace dans la page.

Les deux portes et leurs coordonnées sont conservées. Les pancartes lumineuses utilisent un point de fuite commun et les réglages `sign` de `hall-layout.json` ; voir `HALL-ENSEIGNES.md`. Elles restent du texte HTML modifiable. Décor masqué, portes coulissantes, intérieurs et pancartes restent indépendants. Le titre central suit désormais l'échelle du décor.

## Fichiers et poids
- Décor final : `../assets/hall-v4/hall-stylise-sol-uni-v4.jpg` (1672 × 941, 161 724 octets).
- Original : `../assets/hall-v4/hall-stylise-sol-uni-v4.png`.
- Variante intermédiaire : `../assets/hall-v4/hall-stylise-v4.png` et `.jpg`.
- Cinq JPEG du hall, portes et intérieurs actuels : 1 236 871 octets au total ; voir `ROOMS-V5.md` pour la mise à jour des Rouages et `ROOMS-V4.md` pour CybertraX.
- Génération : outil intégré `image_gen`, édition d'image. Conversion JPEG qualité 87 uniquement ; pas de retouche créative par script.
- Code précédent sauvegardé dans `archive-v3/`.
- Préparation WordPress future : `build-wordpress-preview.py` produit des fichiers `*-hall-v4.html` ; non exécutée ni publiée pour cette itération.

## Checklist
- [x] Styliser le décor en gardant l'architecture et les accès.
- [x] Simplifier le fond et ajouter quelques détails de science-fiction.
- [x] Remplacer le carrelage par un sol uni après la précision utilisateur.
- [x] Recaler les panneaux séparément des portes.
- [x] Reconstruire la page locale ; syntaxe JavaScript vérifiée.
- [x] Contrôler visuellement à 1280 × 720, images chargées et absence d'erreurs console.
- [ ] Obtenir le retour visuel avant une éventuelle mise à jour WordPress.

## Prompts
### Stylisation du décor
Use case: style-transfer. Edit the supplied image into a CLEARLY STYLIZED 3D VIDEO-GAME ENVIRONMENT, keeping the SAME RECEPTION DESIGN, exact camera, image aspect ratio, wall/ceiling/floor boundaries and exact positions and dimensions of BOTH ORANGE DOOR FRAMES AND THEIR BLACK OPENINGS. Those openings must remain pixel-aligned with the reference because separate moving doors will be composited there. The requested style change must be strong and obvious: clean cel-shaded / hand-painted adventure-game environment, simplified chunky shapes, broad smooth color areas, deliberate graphic edge shading, controlled 2-3 tone material shading, saturated navy/orange/cyan palette, soft painted gradients. NO photorealistic surface grain, NO photographic plaster, NO marble, NO realistic texture noise, NO glossy floor reflections. Keep the orange segmented door surrounds, navy side walls, faceted pale blue-gray ceiling, dark ceiling ribs and cyan strip lights. Simplify the BACK WALL into one broad flat clean navy wall: remove the small inset corners, stacked pilasters and recesses flanking it, keeping the general room perspective. Keep the center of that rear wall free for a separate HTML door. Replace the oversized floor slabs with a regular grid of SMALLER matte blue-gray square tiles, about one third the previous tile width, with clean dark grout lines and consistent perspective. Add a FEW tasteful game-like sci-fi details: compact angular ventilation panels and one or two slim cyan illuminated technical insets on the back wall to either side of its blank center, tiny orange accents, restrained lower-wall cable channels. These details should look designed for a stylized adventure game rather than realistic hardware. Keep clear empty navy zones immediately above both side doors for separate large name signs; do NOT draw signs, letters or words there. Keep both doorway interiors solid black, no door leaves and no room interiors. No people, logos, text, plants or extra furniture. Do not redesign the hall into a spaceship or ornate fantasy chamber. Result should immediately read as an illustration/render from a stylized video game, not an architectural photograph. Preserve the exact two side opening silhouettes and image dimensions.

### Sol uni — image finale
Use case: precise-object-edit. Edit ONLY THE FLOOR of this stylized video-game reception image. Keep the entire ceiling, walls, sci-fi wall details, lights, two orange door frames and both black openings EXACTLY unchanged, with the same camera, positions, dimensions and the same strongly stylized cel-shaded / hand-painted game art style. Replace the grid of floor tiles with a UNIFORM CONTINUOUS SPACESHIP-DECK FLOOR: one uninterrupted matte slate-blue/blue-gray metal surface, no tile grid, no floor divisions, no grout lines, no floor panels, no stripes, no center markings, no circular patterns. A subtle solid-color gradient and broad clean graphic shading provide depth; no realistic grain and no glossy reflection. A very restrained shallow bevel where the deck meets the existing wall base is enough to suggest a spaceship. Keep the same floor plane and horizon, do not add objects, steps or raised platforms. Maintain the friendly restrained science-fiction reception design. Leave all areas above the floor unchanged, including the exact side-door opening silhouettes. No text or signage. Single image, same 1672x941 composition.
