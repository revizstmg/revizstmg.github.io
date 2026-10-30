# Corrections de l’audit fonctionnel

Les dix défauts de l’[audit du 29 octobre](audits/2026-10-29/README.md) sont traités dans la PR #153. Les adaptations d’abonnement de Claude (#147 et #152) sont conservées. La version est publiée et a été vérifiée sur le site public le 30 octobre 2026.

| Constat | Correction et contrôle |
| --- | --- |
| APP-01 | Autorisation micro verrouillée, génération de demande et montage contrôlés, flux tardif arrêté, arrêt rattaché au flux de chaque enregistreur. Deux parcours : départ avant permission et double clic. |
| APP-02 | Bilan/redémarrage/reprise des erreurs construits à partir des formules de la séance conservée, indépendamment du filtre d’exploration ; séance vide refusée. Parcours Première/TVA/rechargement/reprise/erreurs/redémarrage. |
| APP-03 | Délai audio annulé et callbacks invalidés sur pause, saut, fermeture et démontage. Deux parcours de fermeture et Pause/Suivant/Jouer. |
| APP-04 | Dialogue audio porté au niveau du document, rôle/nom modal, Échap et focus capturé/restauré avec le mécanisme partagé. Parcours clavier. |
| APP-05 | Carnet de la séance filtré par les thèmes de la filière ; historique conservé et retrouvé en revenant à la filière d’origine. Test unitaire dans les deux sens. |
| CN-01/CN-02 | Codes parent/ami stockés par propriétaire. Ancienne clé globale non attribuée arbitrairement ; code serveur du bon compte conservé, réponses tardives ignorées. Pas de code parent affiché si le stockage est inaccessible. Tests d’isolation, de stabilité et de réponses tardives ; renouvellement parent conservé. |
| CN-03 | Composant d’abonnement réinitialisé par compte ; propriétaire vérifié avant mise à jour de l’affichage et du cache. Parcours de bascule réelle entre onglets. |
| CN-04 | Propriétaire vérifié avant/après les demandes et avant navigation Checkout/portail ; composant démonté invalidé. Parcours réponse après déconnexion et test du helper. |
| CN-05 | Délai de huit secondes et annulation du réseau couvrant aussi la lecture du corps ; état d’échec et reprise visible. Tests de requête et JSON bloqués, puis reprise dans le navigateur. |

## Vérifications et limites

- Neuf nouveaux scénarios navigateur et neuf tests unitaires de régression, en complément des contrôles historiques conservés.
- 28 parcours ciblés réussis sur la compilation intégrant #152, dont droits d’accès et paiements. La suite générale précédente passait 682 tests ; la CI de livraison fait foi pour le résultat complet de la version finale.
- Aucun micro, paiement ou compte réel utilisé pour ces reproductions ; données synthétiques et services simulés.
- Aucune modification de la base ou de ses données. Les codes éventuellement déjà dupliqués historiquement en production ne sont pas déclarés nettoyés ; l’audit n’avait pas accès à ces contraintes/données. Le correctif empêche leur réutilisation locale automatique entre nouveaux comptes et conserve les codes renvoyés pour leur propriétaire.
- Cinq nouveaux agents indépendants sont lancés après confirmation de la publication publique, conformément à la demande du propriétaire.

## Livraison confirmée

- Source #153 : `cbfda015a6e814e872972d81ae0ee83a4d41a608`, compilation automatique `a0ba33ca5473842649bbf5aa3da5fd56cdf2dac9`.
- [CI 41021772448](https://github.com/revizstmg/revizstmg.github.io/actions/runs/41021772448) : 688 tests unitaires sur 76 fichiers dans chaque fuseau UTC/Europe-Paris et 349 parcours navigateur réussis, sans scénario ignoré.
- Pages 41023616609 réussie. Accueil HTTP public identique au fichier publié, SHA-256 `ee4c4c3cd58b4b6bbe47a9c14ebb4ee6a2583f0d4283c32f714703a0b2360ebb`.
- Vérification navigateur public : permission micro simulée résolue après départ du Grand Oral ; trace `stopped` uniquement, aucun démarrage d’enregistrement ni exception.
- Rejeu du scénario de codes : parentCodesEqual=false, friendCodesEqual=false ; le code A retrouve A et le code B retrouve B dans la simulation des RPC. Aucune modification de données de production.
- Les cinq agents indépendants demandés ont été démarrés après ces vérifications, tous sur l’artefact a0ba33ca. Leurs conclusions feront l’objet d’un bilan séparé.
