# Vestibule mobile v17 — entrée à clé, hall en cartes, énigmes discrètes

Maquette de test uniquement. Retours après essai sur téléphone : l'entrée manquait de classe et de logo, le glisser n'était pas assez parlant, le hall n'était pas pratique, les énigmes bonus prenaient trop de place et se dénonçaient elles-mêmes.

## Entrée

- Le logo Elucid Escape est affiché en grand, au centre (balise `h1` avec le texte « escape game à Châlons-en-Champagne » caché pour le référencement). Le petit logo de l'en-tête est masqué pendant l'entrée, puis revient.
- Fond : le hall assombri. Une grande porte à deux vantaux, avec la clé dans la serrure.
- **Maintenir la clé** (environ une seconde) : un anneau se remplit, la clé tourne d'un quart de tour, la porte tremble puis s'ouvre ; vibrations légères. Relâcher trop tôt la remet à zéro. Un simple toucher fait trembler la clé et écrit « Gardez le doigt appuyé ! ».
- Clavier et lecteurs d'écran : Entrée ou Espace sur le bouton ouvre directement. Le lien « Aller directement aux infos » reste.

## L'avis « animations réduites »

Il s'affichait en haut de l'écran, par-dessus le logo de l'entrée. Cause : le téléphone déclare `prefers-reduced-motion: reduce`. Ce n'est pas un bug du site : c'est un réglage d'accessibilité (Android : Paramètres › Accessibilité › « Supprimer les animations » / « Réduire les animations » ; iOS : « Réduire les animations »), parfois activé par un mode économie de batterie. Le site obéit : fondu au lieu du zoom.
Désormais l'avis apparaît une seule fois, dans le hall (jamais sur l'entrée), en une phrase avec le bouton « Tout voir ».

## Hall

Plus de balayage, de sélecteur, de flèches ni de jauge : deux grandes cartes illustrées, Les Rouages de l'Apocalypse et CybertraX (pastille « Bientôt »), un seul geste (toucher la carte) qui ouvre la fiche de la salle. Lien « Tarifs et infos pratiques » en dessous.

## Tarifs : la lampe UV

Lampe vue de profil, posée en haut à gauche de la section, qui éclaire vers le haut à gauche un peu au loin (faisceau violet, texte invisible révélé le long du faisceau). La légende « énigme bonus » et le conseil « attrapez la lampe » sont supprimés : la lampe se découvre toute seule (la lentille pulse doucement tant qu'on n'y a pas touché).

## Cadeaux, questions, contact

- Le cryptex et son message codé sont supprimés. La clé se cache maintenant dans le nœud du ruban de la carte (il remue de temps en temps) : une carte de 326 px de haut au lieu d'une section entière.
- Questions : le curseur est **sous** le texte (le pouce ne cache plus ce qui change) ; les réponses sont raccourcies à une phrase, l'instrument visuel porte le reste.
- Âge : le curseur va de 6 à « 100 ans et + ». De 6 à 18 ans la graduation est large (80 % de la barre), de 18 à 100 ans elle est comprimée (20 %), avec le message « Aucune limite d'âge : tout le monde a le droit de s'amuser ! ». La phrase d'état (« Possible, avec un adulte (moins de 15 ans) », « Oui, en autonomie »…) est maintenant **au-dessus** de la barre.
- Contact : la mention « énigme bonus » est retirée ; le clavier est un peu plus compact.
- Avis : la phrase « Une clé est glissée entre les pages » est retirée (la clé reste sur la dernière double page).
- Le compteur de clés nomme les sections sans révéler les cachettes. Détail de toutes les énigmes : `SECRETS.md`.

## Vérifié (Chromium émulé 390 × 844 et 360 × 640, tactile)

- Entrée : toucher bref, maintien interrompu, maintien complet, clavier ; mode « animations réduites » ; aucun message console.
- Hall : carte → fiche → « Retour au hall ».
- Tarifs : lampe saisie et déplacée, clé révélée dans les quatre cachettes possibles ; Cadeaux : nœud puis clé ramassée (compteur à 1/5).

## À valider sur un vrai téléphone

- [ ] Durée du maintien de la clé (950 ms) : trop long ? trop court ? Un long appui peut ouvrir un menu sur certains navigateurs (bloqué par le code, à confirmer).
- [ ] Taille et lisibilité de la lampe UV, confort du faisceau en déplaçant le doigt.
- [ ] Hall : les cartes suffisent-elles, ou faut-il montrer l'ambiance du hall en 3D autrement ?
