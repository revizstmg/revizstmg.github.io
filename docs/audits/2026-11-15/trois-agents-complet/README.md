# Audit de trois agents indépendants

15 novembre 2026. Référence : `08f6a79c6401b3dcb7369252aa809eb9c437fce7`. Compilation publique : `8347153108807c4f81068e669ad123a245345875`.

Vérification demandée du site, de Supabase, de GitHub et de la documentation. Trois agents, copies isolées, aucun changement du produit ou de la base. Les tests client utilisent des profils et des réponses de services fictifs. Les règles Supabase actives ont été consultées en lecture seule. Aucun achat, génération IA facturable, e-mail ou compte réel créé.

## Sept défauts confirmés

Les notes expriment une priorité pratique sur 10, pas une échelle CVSS. Ce relevé décrit les sept défauts au moment de l’audit. Les corrections ultérieures sont suivies dans [le bilan du16novembre](../../2026-11-16/sept-correctifs/README.md).

| Priorité | Défaut et effet | Preuve | Correction recommandée |
| --- | --- | --- | --- |
| 7 | Le partage parent peut être affiché désactivé malgré l'échec du retrait distant. Pas de reprise au simple retour réseau ; reprise possible au rechargement. | [S1, scénario simulé](site/rapport.md), [résultat](site/parent-revoke-offline.json) | Conserver un retrait en attente et attendre confirmation avant d'affirmer que rien n'est partagé. |
| 6 | Suppression du compte : une requête silencieuse laisse « Un instant… » sans délai ni reprise dans cette vue. | [S2, scénario simulé](site/rapport.md), [résultat](site/delete-rpc-silent.json) | Borner l'attente et distinguer résultat inconnu et échec confirmé. |
| 6 | Mur de classe : les règles actives bloquent la création d'annonce par un élève, mais pas la transformation de son propre message en annonce. | [Analyse des règles réelles](services/rapport.md), [catalogue nettoyé](services/preuves.json) | Revalider le rôle pour UPDATE vers une annonce. Aucune exploitation en production effectuée. |
| 6 | Un ancien déploiement réussi peut masquer une tentative plus récente échouée dans le rapport quotidien. | [R1](repo/rapport.md), [reproduction synthétique](repo/stats-probes.json) | Séparer dernière tentative et dernière version publiée. La publication actuelle est réussie. |
| 5 | La collecte des statistiques Supabase n'a pas de délai applicatif et peut retenir le rapport quotidien. | [R2](repo/rapport.md), [fetch suspendu simulé](repo/stats-probes.json) | Borner requête et réponse, signaler le contrôle non vérifié et poursuivre les autres contrôles. |
| 4 | Le README mélange état présent et étapes anciennes : droits, tarifs, langues, règles sociales et services déployés. | [R3 avec repères](repo/rapport.md) | Produire un état actuel unique et déplacer l'historique dans la coordination. La consigne historique de CLAUDE.md sur les tables ouvertes doit aussi être synchronisée avec les règles actives. |
| 4 | Les CGU disent trop largement que le reste du site est payant alors que classe, amis, boutique et parent sont gratuits. | [R4 avec repères](repo/rapport.md) | Nommer précisément les outils payants. Le classement est actuellement dans la liste payante. |

## Autres améliorations, distinctes des défauts ci-dessus

- **4/10, intégrité** : les compteurs du classement restent déclaratifs côté client. Protéger les autres comptes ne garantit pas la sincérité de son propre score. Calcul serveur recommandé.
- **4/10, risque conditionnel** : le défaut de modèle de fiche-vision est ancien ; l'override secret n'a pas été lu. Aucune panne de génération réelle démontrée.
- **4/10, préalable commercial** : Stripe est en mode TEST. Avant vente réelle : configuration live, webhook et parcours autorisé complet, tarifs et documents contractuels définitifs.
- **3/10** : protection contre les mots de passe compromis désactivée ; quatre policies profiles optimisables ; actions GitHub à épingler par SHA.
- **2/10** : deux index de clés étrangères à évaluer selon les plans d'exécution.

Détails et conditions dans les rapports indépendants. Ne pas confondre une recommandation d'advisor, un risque conditionnel et une panne reproduite.

## Contrôles positifs

- Supabase ACTIVE_HEALTHY ; RLS sur les 21 tables ciblées. Les anciennes règles sociales ouvertes décrites par le README ne correspondent plus à la base réelle. Abonnements et quotas non modifiables directement par le client ; RPC sensibles restreints.
- GitHub : dernière CI et publication réussies à la référence auditée. La CI existante valide 866 tests dans chacun des fuseaux UTC et Paris, et 427 parcours navigateur. Les fuseaux et suites se recouvrent : ne pas additionner ces nombres comme des fonctionnalités distinctes.
- Google : configuration OAuth active et redirection vers le domaine officiel vérifiées ; Gemini répond prêt sur les contrôles de configuration et de catalogue, sans génération. [Relevé du même jour](services/google-configuration.json). Cela ne prouve pas le retour de connexion d’un compte réel ni la qualité des corrections.
- 54 tests ciblés supplémentaires de l'agent dépôt réussis.
- 22 fichiers publics HTTP 200 et identiques à Git ; sitemap de 858 URL uniques avec cibles locales existantes ; métadonnées présentes sur 855 HTML de cours ; 148 fichiers de précache présents.
- 82 ouvertures de vues sur mobile et ordinateur, quatre profils fictifs : aucun débordement horizontal, 404 inattendue ni exception JavaScript dans cet échantillon.
- 83 fichiers PDF suivis, 65 contenus distincts, 1 244 pages physiques en comptant les copies : aucun échec de lecture technique ni page sans texte et sans image. [Relevé](synthese/pdf-technique.json). Ce contrôle ne valide pas le fond pédagogique.

## Suite navigateur rejouée

Résultat récupéré après interruption :422réussites et5échecs sur427parcours. B07 avait réussi isolément. Les cinq échecs sont repris dans [la tâche de correction du16novembre](../../2026-11-16/sept-correctifs/README.md), sans les transformer rétroactivement en réussites du lot initial.

## Limites

Cet audit ne certifie pas chaque question, définition, vidéo ou document. La relecture pédagogique et les essais avec enseignants et élèves restent nécessaires. Les vraies connexions Google jusqu'au retour de compte, paiements, livraisons d'avantages, générations et corrections IA n'ont pas été exercés avec des comptes réels. Les contrôles techniques PDF ne valident pas tous les lecteurs ou interactions. Les pages du sitemap ont toutes une cible locale ; seuls les 22 fichiers cités ont fait l'objet du contrôle réseau comparatif.

La base partagée NAH, les secrets, données privées et configurations n'ont pas été modifiés. Aucun contrôle existant supprimé.

## Rapports indépendants

1. [Site et parcours](site/rapport.md)
2. [Supabase et services](services/rapport.md)
3. [Dépôt, README, GitHub et publication](repo/rapport.md)
