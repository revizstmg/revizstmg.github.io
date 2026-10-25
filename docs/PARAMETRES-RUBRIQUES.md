# Paramètres par rubriques

Demande du propriétaire pendant la PR #114 : remplacer la page contenant tous les formulaires par une navigation hiérarchique.

La page `/#/parametres` affiche seulement sept entrées avec une courte description. Aucun formulaire de profil, mot de passe, notification ou suppression n’y est monté.

| Rubrique | Réglages |
| --- | --- |
| Mon compte | Mon profil ; Sécurité |
| Apparence | Affichage et langue ; Mes onglets |
| Révision | Langues étudiées ; Date de mon bac |
| Notifications | Rappels de révision |
| Accessibilité | Confort de lecture, contraste et taille du texte |
| Confidentialité et données | Télécharger mes données ; Suivi parental ; Supprimer mon compte |
| Application | Installation et disponibilité hors connexion |

Un groupe ouvre ses sous-rubriques ; une rubrique ne contenant qu’un panneau ouvre directement ce panneau. Les réglages sont rendus uniquement dans la sous-page correspondante. La suppression est séparée de l’export et conserve la confirmation existante. Un lien Retour ramène au groupe ou à la liste principale ; l’historique navigateur et le rechargement conservent la sous-page (`rubrique` et `reglage` dans la requête de la route).

Le lien Réglages des progrès mène vers ce nouvel espace. Les anciens liens directs `/#/moi?section=reglages` restent compatibles ; les entrées courantes utilisent `/parametres`. Les fonctions de profil/photo, mot de passe, export/suppression, partage parental, rappels, langues et mode hors ligne sont réutilisées. `Profile` accepte un filtre `settingsSection` pour afficher un seul panneau, sans réimplémenter ces actions.

Le thème système utilise `null`, comme le magasin existant, au lieu de la chaîne non prise en charge `system`. Les formulaires restent séparés par compte ; les champs de mot de passe sont vidés lorsque l’on quitte Sécurité. Les traductions des rubriques sont intégrées en français, anglais, espagnol, italien, arabe et allemand.

Aucun changement d’API, de schéma, de fournisseur, de réglage Supabase ou de préférence existante. Tests réseau simulés ; aucun changement de compte réel. Le menu principal commun téléphone/ordinateur est livré dans la même PR.
