# Vestibule mobile v16 — style E « un site classique qui défile, avec un menu clair »

Maquette de test uniquement. Retour demandé après les essais de navigation en 3D (couloir, carrousel, tambour) : un site classique où l'on balaie vers le bas, « plus simple pour tout le monde », avec un menu clair pour aller directement où l'on veut. `?v=e` active ce style (il est aussi celui de la page publiée) ; `?v=d` garde l'essai précédent (pièces plein écran), `?v=c`, `?v=a`, `?v=b` et `?v=0` les anciens.

## Parcours

1. **Entrée** : le verrou à glisser, inchangé (le « truc à ouvrir pour le style »).
2. **Hall** : le hall en fausse 3D avec ses deux portes, inchangé. On balaie vers une porte, on la touche, on tourne l'engrenage (Rouages) ou on fait monter l'énergie (CybertraX), la fiche de la salle monte. La porte du fond, « TARIFS & INFOS ↓ », mène à la suite.
3. **Le reste de la page défile** : Tarifs, Carte cadeau, Événements, Professionnels, Avis, Questions, Contact, puis le pied de page légal. Chaque section a son décor dessiné, ses informations en premier et, quand il y a de la place, son énigme bonus.

## Le menu

- **Barre du bas, toujours visible** : Salles · Tarifs · Cadeaux · Menu · Réserver. La section en cours est repérée (orange).
- **Bouton « Menu »** : une fenêtre qui monte du bas avec **toutes** les destinations, chacune avec une ligne d'aperçu (« dès 24 € par personne », « 263 avis Google »…), un grand bouton « Réserver mon créneau » et les liens CGV, mentions légales, confidentialité, cookies.
- Un toucher mène directement à la section ; Échap ou « Fermer » referme.

## Sections

| Section | Contenu | Énigme bonus (une clé chacune) |
|---|---|---|
| Tarifs | Les cinq tarifs d'un coup, « Choisir mon créneau » | Lampe UV : éteint la section, la lampe éclaire partout, la clé change de place |
| Carte cadeau | Carte et bouton « Offrir une carte cadeau » | Cryptex à six anneaux, message chiffré (A = 1) |
| Événements (nouveau) | EVJF / EVG, anniversaire, mariage, cousinade ; jusqu'à 12 dans nos locaux, au-delà animation mobile ; appel et lien vers la page événements | aucune |
| Professionnels (nouveau) | Team building, séminaire, salon ; 20 à 100+ participants, partout, clé en main, 2 modes ; devis et appel | aucune |
| Avis | Dossier à deux pages | Une clé glissée à la dernière page |
| Questions | Réponses du site, un instrument par question | Lumière éteinte dans « Effrayé ? » |
| Contact | Adresse, téléphone, mail, réseaux ; téléphone à touches avec tonalités et secrets | Code écrit à la lampe UV dans Tarifs |

Les contenus des deux sections nouvelles sont repris de https://elucidescape.fr/evenements/ et https://elucidescape.fr/entreprises/. Elles renvoient vers ces pages pour le détail. Les cinq clés donnent toujours l'écran « Porte-clé gagné ! » (à brancher plus tard sur le panier de réservation).

## Ce qui change dans le code

`decor.js` a deux modes : `d` (pièces plein écran) et `e` (sections qui défilent, `SCROLL`). Dans le mode `e`, les anciennes sections du classique sont retirées après lecture de leurs données, le dock est remplacé, le menu est ajouté. `decor.css` : mode `e` en fin de fichier, ajustements « petit écran » limités au mode `d`. `mobile.js` accepte le style `e` ; `journey.js` s'efface.

## À valider sur un vrai téléphone

- [ ] Menu et barre du bas : clarté, taille des zones, repère de la section en cours.
- [ ] La lampe UV assombrit toute la section : on ne peut plus défiler dedans tant qu'elle est allumée (le bouton « Éteindre » reste accessible).
- [ ] Durée et difficulté des énigmes ; sons du téléphone.
- [ ] Un toucher juste après un défilement sert à arrêter l'élan, comme sur tout téléphone : le simulateur de test en a ignoré plusieurs.
