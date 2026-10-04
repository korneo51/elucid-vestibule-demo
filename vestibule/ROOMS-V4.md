# Salles vues depuis les portes latérales — v4

24 septembre 2026. Travail local à partir des deux photos fournies. Le site WordPress publié n'a pas été modifié.

Historique : CybertraX v4 reste utilisée. Pour les Rouages, la version actuellement utilisée est documentée dans `ROOMS-V5.md` (sol béton et structure métallique).

## Décision visuelle

Les anciennes illustrations montraient chaque salle de face. Leur projection dans les portes latérales donnait l'effet d'un tableau plaqué dans l'ouverture. Les nouvelles vues possèdent une profondeur interne orientée vers la gauche (Rouages) et vers la droite (CybertraX), dans le sens du passage depuis le hall. Le hall donne seulement le langage graphique : volumes simplifiés et ombres nettes. Chaque salle garde sa propre palette.

- Rouages : référence de la vraie comtoise, atelier beige/brun, bois sombre, cuivre et laiton ; cadrage oblique et comtoise en trois quarts.
- CybertraX : référence de la vraie paroi de serveurs à motifs chevrons ; salle presque noire, barres cyan, sans éclairage rouge.
- Les deux images remplissent les ouvertures et servent aussi aux présentations des salles. La comtoise est affichée en entier dans sa présentation.
- Les portes, encadrements et enseignes restent des couches indépendantes ; aucun moteur 3D ni plugin ajouté.

## Fichiers

- `../assets/rooms-v4/rouages-comtoise-oblique-v4.png` : original éditable ; `.jpg` : 274 814 octets.
- `../assets/rooms-v4/cybertrax-serveurs-oblique-v4.png` : original éditable ; `.jpg` : 188 381 octets.
- Conversion JPEG qualité 86 via `prepare-room-v4.py`. Les cinq JPEG visibles dans le hall totalisent 1 191 944 octets.
- Les deux photos source restent dans `<dossier utilisateur>/Downloads/` : `IMG_20230102_155120_preview.jpeg` et `IMG_20250528_170157_preview.jpeg`.
- Génération et éditions : outil intégré `image_gen` ; les premiers essais et leurs PNG non retenus restent dans `assets/rooms-v3/`.

## Checklist

- [x] Analyser les deux photos et les illustrations précédentes.
- [x] Définir un axe de profondeur distinct pour chaque porte.
- [x] Générer les deux décors dans la palette propre à chaque salle.
- [x] Retenir un second cadrage des Rouages pour rendre la vue de biais plus évidente.
- [x] Intégrer les JPEG dans les ouvertures et les présentations de salle.
- [x] Contrôler les deux portes au survol en local ; les images chargent.
- [ ] Recueillir l'avis visuel avant toute publication WordPress.

## Prompts utilisés avec l'outil intégré

### Rouages — base

Use case: stylized-concept. Generate one finished portrait 2:3 video-game environment illustration to be seen THROUGH THE LEFT SIDE DOORWAY of the supplied hall. Image 1 is a reference photo of the ACTUAL Elucid Escape comtoise mechanism: retain its unmistakable tall, narrow, black grandfather-clock silhouette, arched top, exposed chains and gears, brass pipes, and small blue numeric window; stylize it faithfully as a recognizable room feature. Image 2 is the HALL STYLE reference only: match its clean, simplified, cel-shaded 3D-adventure-game art direction, broad matte navy surfaces, deliberate faceted edges, controlled amber/cyan lighting, and restrained orange trim. Camera geometry is the critical requirement: the viewer stands in the hall, outside a doorway in the LEFT wall, looking diagonally LEFT into this room. The workshop's floor seams, ceiling beams, long walls, and furniture all RECEDE TOWARD A VANISHING POINT BEYOND THE LEFT EDGE of the portrait frame; the room is not square-on, not bilaterally symmetric, and nothing points to a vanishing point in the middle. Show the comtoise slightly left of center in the room beyond the opening, large enough to identify, with its full upper arch and much of its gearwork visible. A modest steampunk workshop around it: dark blue-black wall panels, copper pipes and a few warm work lights; keep the visual language connected to the hall and let the physical clock dominate. Open floor area at the bottom of the image so it reads as a room one could enter. No gigantic circular clock, no central frontal workbench, no photorealism, no realistic photo texture, no people, no signs or lettering, no outer doorway frame, no door leaves, no vignette or black margins. Fill the entire portrait image edge to edge.

### Rouages — palette chaude

Use case: style-transfer. Image 1 is the previous game-art room and EDIT TARGET. Image 2 is the real comtoise reference and must remain recognizable. Correct this artwork for the room LES ROUAGES DE L'APOCALYPSE. Critical palette correction: change the environment from navy/cyan/orange to overwhelmingly WARM BEIGE plaster and aged BROWN wood with COPPER and dark BRASS machinery. Soft warm lamp light, ochre highlights, no blue walls, no cyan strips, no orange wall framing. The clock itself is a tall narrow nearly black-brown comtoise with arched top, exposed chain and gears, copper pipes, and a tiny subdued numeric display; preserve its actual distinctive silhouette and machinery from Image 2. Critical perspective correction: this image is seen through a doorway in the LEFT side wall of another hall. Rebuild the room as a visibly oblique view looking LEFT. Architecture, floorboards and ceiling beams must recede toward a vanishing point beyond the LEFT border. Show the comtoise in three-quarter view along the deeper beige wall, not front-facing on a flat centered back wall. Its upper arch and lower gears remain prominent within the portrait crop. Keep the simplified clean cel-shaded adventure-video-game rendering technique, broad matte color planes, and deliberate edges from Image 1, but only the rendering technique; do not copy the former blue/orange hall palette. Portrait 2:3 image, full bleed. No text, no logos, no people, no outer door frame, no circular clock, no glossy floor, no photoreal texture.

### Rouages — angle final

Use case: precise-object-edit. Image 1 is the warm beige-and-copper stylized workshop EDIT TARGET; Image 2 is the actual comtoise photo reference. Change the CAMERA GEOMETRY of Image 1 while retaining its warm beige, brown, dark wood, aged copper palette and the clean cel-shaded video-game rendering. This room is viewed from a hall through a doorway in the hall's LEFT side wall. Rotate the virtual camera substantially: looking LEFT into a space that extends to the left, with an obvious diagonal axis and the vanishing point beyond the LEFT EDGE of the frame. The current clock is too front-facing and the back wall too flat. Instead place the real tall black-brown arched comtoise along an oblique wall: see its front AND one side in a clear three-quarter view; the wall behind it and the floor planks angle strongly leftward into the room. The clock remains recognizable, visually prominent, nearly full height, with its arched head, exposed gear/chain mechanisms, copper pipes, and small subdued numeric indicator. Keep a little shelving and copper work equipment near the side, with substantial open floor leading inside from the bottom. The image will be compressed into a steeply angled side doorway, so the OFF-AXIS room perspective must remain unmistakable at small size. Portrait 2:3 full bleed. Do not create a symmetrical frontal room, a front-view clock, a centered back wall, or a centered vanishing point. No blue/cyan/orange hall palette, no photorealism, no text, no logo, no people, no outer door frame.

### CybertraX — base

Use case: stylized-concept. Generate one finished portrait 2:3 video-game environment illustration to be seen THROUGH THE RIGHT SIDE DOORWAY of the supplied hall. Image 1 is a reference photo of the ACTUAL CybertraX server wall: retain the recognizable repeating gridded modules, angular chevron/X-shaped fronts, and short horizontal luminous bars. Reinterpret the harsh red photo lighting as overwhelmingly deep NAVY and vivid CYAN-BLUE light, with only small warm orange accent lights. Image 2 is the HALL STYLE reference only: match its clean, simplified, cel-shaded 3D-adventure-game art direction, broad matte blue surfaces, deliberate faceted edges, controlled cyan lighting and orange framing. Camera geometry is the critical requirement: the viewer stands in the hall, outside a doorway in the RIGHT wall, looking diagonally RIGHT into this server room. The server rows, ceiling ribs and matte floor seams RECEDE TOWARD A VANISHING POINT BEYOND THE RIGHT EDGE of the portrait frame. This must be an off-axis glimpse into a real adjacent room, not a frontal centered painting; asymmetrical composition, visible side faces and depth. The repeating server modules occupy a substantial wall plane and remain the unmistakable focal subject. Keep enough floor visible at the bottom to imply entry into a space. No big circular portal, central science-fiction pod, holographic globe, people, labels, logos, text, outer doorway frame, door leaves, black margins, photographic noise or glossy floor reflections. Fill the entire portrait image edge to edge.

### CybertraX — palette finale

Use case: precise-object-edit. Image 1 is the previous game-art server room and EDIT TARGET. Image 2 is the actual server-wall reference. Correct this artwork for CYBERTRAX. Critical palette correction: the room is almost BLACK and CHARCOAL, with banks of dark graphite server modules. The ONLY prominent lighting is electric CYAN-BLUE from the short horizontal light bars, a few tiny indicator points, and a few subtle ceiling strips. Remove every orange and red light, warm trim, orange ceiling beam, orange bar and blue-painted wall. Do not turn the black modules blue; let cyan light glance off their edges. Preserve and emphasize the distinctive repeated X/chevron module fronts from Image 2. Preserve the strong oblique camera of Image 1: viewed from outside a doorway in the RIGHT wall, server banks, ceiling seams and a dark matte floor recede toward a vanishing point BEYOND THE RIGHT EDGE, never centrally. Keep the same simplified, crisp, cel-shaded adventure-video-game illustration technique and the same portrait 2:3 full-bleed frame. No holographic globe, no circular portal, no people, no text, no logo, no external door frame, no photorealistic texture, no glossy reflections.
