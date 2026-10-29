# Audit fonctionnel du 29 octobre 2026

Deux agents ont audité des périmètres complémentaires : apprentissage et comptes/navigation. Ils ont relevé **10 défauts**, avec reproductions et limites détaillées. Aucun correctif fonctionnel n’a été appliqué par cet audit.

Base examinée : `8764de549f21a8c2c867e257f767d46bf96ca8e6`, artefact publié `a92f308c4ba6c92901192666101c7db86fcd73b7`. L’[inventaire des 44 routes](routes.md) sert au périmètre ; il ne signifie pas que chaque variante a été exécutée.

## Priorités

| Priorité | ID | Défaut et preuve |
| --- | --- | --- |
| P1 | APP-01 | Un microphone peut démarrer après avoir quitté le Grand Oral ; double clic laissant aussi un flux sans arrêt. Interfaces micro simulées. |
| P1 | CN-01 | Code parent commun entre deux comptes d’un même navigateur. Collision client confirmée ; résolution vers un autre enfant simulée d’après le SQL, non constatée en production. |
| P1 | APP-02 | Reprendre une séance de formules hors filtre puis la recommencer provoque un écran d’erreur. |
| P2 | CN-02 | Code ami commun entre comptes ; identité retrouvée ambiguë dans la simulation serveur. |
| P2 | CN-03 | Une offre active de A reste affichée après le passage inter-onglets à B. |
| P2 | CN-04 | Une réponse Checkout de A peut encore provoquer une redirection après sa déconnexion. Aucune transaction réelle. |
| P2 | CN-05 | Chargement des offres sans délai applicatif ni reprise locale ; attente de 17 secondes reproduite. |
| P2 | APP-03 | La lecture audio continue après fermeture ou se superpose après Pause/Suivant. |
| P2 | APP-04 | La fenêtre audio ne gère pas Échap, le focus modal et le rôle de dialogue. |
| P2 | APP-05 | Une ancienne erreur de Terminale peut être proposée dans une séance de Première. |

P1 désigne ici les corrections à traiter avant de promouvoir largement les fonctions concernées ; P2, les autres corrections fonctionnelles. Les défauts sont distincts, bien que plusieurs partagent une cause d’isolation ou de cycle de vie asynchrone.

## Rapports et validation

- [Apprentissage : cinq constats et couverture](apprentissage.md).
- [Comptes et navigation : cinq constats et couverture](comptes-navigation.md).
- [Pièces synthétiques de reproduction](preuves/README.md).
- Référence antérieure, non répétée intégralement : [CI 40858828317](https://github.com/revizstmg/revizstmg.github.io/actions/runs/40858828317), 643 tests unitaires en UTC et Europe/Paris et 328 parcours réussis. Ces cas supplémentaires n’étaient pas couverts par cette validation.
- L’agent comptes a exécuté 50 scénarios ciblés : 48 passent en développement ; les deux écarts de comptage dus à StrictMode ont été rejoués avec succès sur la compilation publiée servie localement. Les trois nouveaux cas d’identité/attente de paiement et les deux collisions sont documentés séparément.
- Six annales répondent avec une signature PDF ; les cinq guides de langues sont structurellement valides. Cela ne constitue pas une relecture pédagogique ou linguistique exhaustive.
- Contre-vérification du coordinateur : collision de codes parent/ami et plantage des formules reproduits de nouveau ; code du microphone et des abonnements relu.

## Limites réelles

Les appels serveur, le micro et les voix nécessaires aux cas limites ont été simulés. OAuth réel, paiements/webhooks réels, inférence fournisseur, installation/push sur téléphone réel et règles Supabase effectivement appliquées ne sont pas certifiés par cet audit. Aucune donnée personnelle ni secret réel utilisé ou publié. Les matrices des deux rapports distinguent essais navigateur, lecture de code, référence à la CI et zones non vérifiées.

Les corrections et leurs tests de régression constituent une étape distincte. Les modifications de base éventuellement nécessaires aux codes doivent être examinées sur le schéma effectif et autorisées selon les consignes du projet.
