# Hall mobile — geste court et orientation v9

25 septembre 2026. Version publiée sur la page WordPress de test 3307 : (adresse de la page de test WordPress, non publiée ici)?version=hall-mobile-9 .

Le balayage horizontal déclenche maintenant le cadrage d'une salle après environ 24 px de déplacement. La porte correspondante commence à coulisser 0,5 s après l'arrêt du geste. Un toucher sur la porte ou sa flèche ouvre la présentation ; le défilement vertical reste disponible pour passer la porte du fond. Le geste manuel garde temporairement la priorité sur le capteur afin que l'image ne reparte pas pendant le toucher.

L'orientation du téléphone est proposée par défaut sur les navigateurs HTTPS qui fournissent le capteur sans demande d'autorisation. Dans les navigateurs exigeant une autorisation après une action de l'utilisateur, le bouton « Activer l'orientation » déclenche cette demande. Le même bouton permet de désactiver l'orientation. Le balayage reste toujours possible. Une mesure de référence est prise au début du hall ; l'inclinaison latérale bascule la vue avec une zone neutre pour limiter les oscillations.

Un serveur local sur le réseau (`http://192.168.10.8:...`) permettrait éventuellement de voir le balayage sur téléphone, mais ne constitue pas un essai valable du capteur : l'API d'orientation demande un contexte sécurisé HTTPS (ou `localhost` sur l'appareil même). Aucun accès réseau supplémentaire n'a été ouvert.

## Checklist

- [x] Vérifier la syntaxe JavaScript et reconstruire le bloc WordPress v9.
- [x] Vérifier localement, à 390 × 844, un geste court vers CyberTraX et vers Les Rouages.
- [x] Vérifier que la porte s'ouvre après l'arrêt du geste et qu'un toucher ouvre la présentation.
- [x] Vérifier la présence et la possibilité de désactivation du contrôle d'orientation dans l'interface.
- [ ] Vérifier le capteur et l'éventuelle demande d'autorisation sur un téléphone physique.
- [x] Publier le bloc v9 sur la page de test et vérifier son rendu public. Le contenu v9 existait dans la sauvegarde automatique WordPress 3324 : son HTML a été récupéré dans la comparaison des révisions, puis enregistré dans l'éditeur, sans ouvrir le fichier local bloqué et sans restaurer les champs de thème associés à la révision.
- [x] Vérifier dans Chrome à 390 × 844 le balayage de 35 px vers CybertraX, l'ouverture automatique puis l'ouverture de la présentation au clic. Le capteur physique reste à tester sur téléphone.

Fichiers : `traversee.js`, `hall-design.css`, `index.html` et `build-wordpress-preview.py`. Transfert préparé : `wordpress-preview-transfer-mobile-v9.html`.
