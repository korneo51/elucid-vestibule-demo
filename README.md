# Maquette de passages — 24 septembre 2026

Thèse visuelle : un seuil monumental sombre, une lumière chaude et des ouvertures successives ; contraste entre matière et tracé graphique.
Contenu : entrée Elucid → passage vers les Rouages → pause visuelle → deuxième passage → CybertraX. Textes minimaux, aucun scénario nouveau.
Interactions : déverrouillage puis ouverture et avancée commandés par le scroll ; deux habillages comparables ; navigation directe et retour au début.

## Périmètre
Maquette locale de mouvement uniquement, indépendante des autres prototypes et du site public. HTML/CSS/JavaScript sans moteur 3D, CDN, vidéo ni bibliothèque. Pas de plugin WordPress nécessaire pour ces effets : intégration ultérieure possible dans un modèle de thème enfant, avec chargement WordPress des styles/scripts. Aucune intégration ni validation dans le thème réel dans cette étape.

## Checklist
- [x] Direction de progression confirmée et essai local demandé.
- [x] Réutiliser les images et le logo existants sans les modifier.
- [x] Construire deux habillages d’un parcours court.
- [x] Vérifier entrée, deux traversées, retour et changements de variante.
- [x] Vérifier présentation mobile, accès clavier aux contrôles et mouvements réduits.
- [x] Mesurer les fichiers et documenter les limites.
- [x] Préparer l’aperçu local à présenter à l’utilisateur.
- [ ] Recueillir le ressenti avant de développer davantage.

## Voir et relancer

Aperçu : http://127.0.0.1:8768/ . Faire défiler pour déverrouiller puis traverser les passages. Les boutons du bas comparent « Porte à relief » et « Portail graphique ». Les repères 00/01/02 permettent d’atteindre directement une scène.

Depuis le dossier SEO : `python -m http.server 8768 --bind 127.0.0.1 --directory output/passages-demo-2026-09-24`.
L’ouverture directe d’index.html est également possible ; le serveur local reste préférable pour les polices.

## Vérification et poids

- Sept ressources distinctes de la page : **125 708 octets**, soit environ **126 Ko** avant compression HTTP, images et police comprises. Documentation et licence non chargées exclues. JavaScript : environ 5 Ko.
- Contrôle visuel ordinateur et mobile émulé à 390 × 844 ; absence de débordement horizontal et toutes les images chargées.
- Deux habillages, ouverture au scroll, repères de navigation, arrivée aux deux univers et retour au début vérifiés. Le bouton de la première salle reçoit bien le clic, sans interception par les décors.
- Réduction des mouvements émulée : scènes fixes, portes masquées, textes accessibles. JavaScript désactivé puis page rechargée : les univers restent accessibles dans une page statique.
- Accès au clavier vérifié ; pas d’audit complet d’accessibilité. Aucun avertissement ni erreur console observé.
- Aucun moteur 3D, vidéo, requête tierce ou boucle d’animation JavaScript permanente. Transformations/opacités mises à jour sur demande au défilement, une frame programmée au maximum.
- Pas de profilage GPU, de score Lighthouse ni de test sur téléphone physique : poids mesuré et observation dans le navigateur ne constituent pas une garantie de performance en production.

## Sources et intégration future

Visuels, logo V6, police et licence copiés sans modification depuis `../accueil-native-2026-09-24/elucid-accueil/assets/`. CybertraX utilise uniquement son visuel public existant ; aucun décor réel ou scénario inédit n’est représenté.

Les portes et l’architecture sont un habillage fictif de navigation dessiné en CSS/SVG, pas une reproduction des locaux. Le visuel des Rouages sert ici de fond d’ambiance ; la transition est un agrandissement suivi d’un fondu, pas une visite 3D.

Fichiers : index.html, passages.css, passages.js, assets/. Pour WordPress sans plugin dédié : porter le balisage dans un modèle du thème enfant, préfixer/isoler les styles globaux de cette démo et charger les ressources via wp_enqueue_style/wp_enqueue_script uniquement sur cette page. Les contrôles de comparaison sont propres à la maquette et seraient retirés. Le thème et les extensions existants peuvent charger d’autres ressources : leur présence ne disparaît pas automatiquement. Aucune modification de WordPress, de réservation ou de paiement.
