# Audit indépendant dépôt, documentation et publication

> Statut du 16 novembre : Les quatre défauts de supervision et de documentation sont corrigés. [Livraison et preuves](../../../2026-11-16/sept-correctifs/README.md). Le corps conserve les constats à la référence auditée.

15 novembre 2026. Lecture seule du produit et de GitHub. Référence source : `08f6a79c6401b3dcb7369252aa809eb9c437fce7` ; compilation publiée : `8347153108807c4f81068e669ad123a245345875`.

## Défauts confirmés

### R1. Un échec de publication peut être masqué dans le rapport quotidien — importance 6/10

`app/scripts/stats-sources.mjs:82-87` cherche exclusivement la dernière publication réussie, même lorsqu’une tentative plus récente a échoué. `app/scripts/rapport-mail.mjs:48` privilégie ensuite ce succès ancien face à un échec signalé par la vérification de la routine.

Reproduction synthétique : dernier déploiement en échec à 11 h UTC, précédent réussi à 9 h ; CI et autres contrôles réussis. Le rapport retient le succès de 9 h et produit « ✅ Rien à signaler ». Preuve : `stats-probes.json`, champ `newDeploymentFailed`, scénario dans `probe-stats.mjs`. Aucun véritable déploiement n’a été modifié. La publication actuelle est réussie : il s’agit d’un défaut de surveillance, pas d’une panne actuelle.

Correction recommandée : distinguer « dernière version en ligne » et « dernière tentative ». Un échec véritable récent doit empêcher le bilan entièrement vert. Distinguer les tentatives annulées/remplacées, qui ne constituent pas nécessairement un incident.

### R2. La collecte quotidienne peut rester bloquée sur Supabase — importance 5/10

`app/scripts/stats-sources.mjs:49-58` appelle le RPC de statistiques sans signal d’abandon ni délai maximal. `app/scripts/statistiques.mjs:93` attend cette promesse avant de publier le relevé. Si la connexion ou la réponse reste suspendue, le relevé ne se termine pas jusqu’à la limite globale du job.

Reproduction avec fetch suspendu simulé, sans contacter la base : absence de signal et promesse toujours pendante ; preuve `stats-probes.json`, champ `supabaseHeaders`. Recommandation : délai bornant la requête et la lecture du corps, conversion en contrôle non vérifié, sans arrêter les autres résultats. Le test du corps GitHub dans le même fichier est une simulation volontaire d’un adaptateur ignorant AbortSignal ; il ne démontre pas un défaut du fetch natif et n’est pas compté comme anomalie indépendante.

### R3. README contradictoire avec les fonctionnalités et droits actuels — importance 4/10

La documentation juxtapose des descriptions historiques et des descriptions récentes :

- `README.md:103` présente Premium/Ultimate comme restant à définir ; `:491` affirme que paiement/activation restent à développer et que les fonctions ne réclament plus d’abonnement.
- `README.md:489,496` annonce les outils IA à tout compte connecté pendant le développement. Le contrôle serveur actuel applique au contraire un niveau, des quotas et une grâce explicitement datée : `supabase/functions/examen-blanc/acces.js:6-24,37-50`. Le paiement possède les tarifs Premium 9,99 €, Ultimate 19,99 € et Go établissement : `supabase/functions/revizstmg-paiement/logique.js:11-22`. Cela ne prouve pas l’activation de paiements réels.
- `README.md:516,527` décrit quatre manuels et omet l’allemand ; le produit publie cinq langues, dont le chunk allemand vérifié en ligne.
- Le tableau historique annonce 40 formules et une section récente 169 ; le README mélange également les anciennes descriptions d’accueil et de sauvegarde.
- `README.md:458-465` et `supabase/README.md` se contredisent sur les règles sociales et le déploiement de fiche-vision. La documentation seule ne permet pas de conclure à une exposition réelle de la base ; contrôle réel laissé à l’audit services.

Correction recommandée : réécrire l’état présent dans un bloc faisant autorité ; déplacer les étapes historiques dans le journal ; distinguer code disponible, service déployé, configuration de test et ouverture commerciale.

### R4. Les CGU présentent comme payantes des rubriques gratuites — importance 4/10

`app/src/pages/Cgu.jsx:31,36` annonce « reste du site [...] sur abonnement » / « Le reste du site est réservé aux abonnés ». Pourtant `app/src/data/acces.js:15-26` conserve notamment boutique, amis, classe et parent gratuits. Les offres décrivent également cette gratuité. Un visiteur lisant les conditions reçoit une information trop large.

Correction recommandée : nommer précisément les outils payants et rappeler les espaces gratuits ; harmoniser avec la grille d’offres. Il s’agit d’une incohérence éditoriale démontrée, pas d’un avis juridique. Le classement figure actuellement dans la liste payante : ne pas annoncer sa gratuité sans décision produit.

## Vérifications positives

- GitHub Pages indique `built`, publication depuis la racine de `main`. Dernier job Pages `43730414215` réussi ; CI `43728688183` réussie. Les résultats complets existants sont 866 tests unitaires par fuseau UTC/Paris et 427 parcours navigateur ; ces suites se recouvrent et ne s’additionnent pas.
- 54 tests ciblés ont été exécutés ici : rapport, publication statique, accès navigateur et accès serveur ; tous réussis. Les nouveaux scénarios ci-dessus montrent des cas non couverts par ces tests existants.
- 22 fichiers distants contrôlés répondent HTTP 200 et correspondent exactement au contenu Git : accueil, 404 explicite, SW, manifest, robots, deux sitemaps, llms, pages publiques, cours TVA, entrée et plusieurs chunks dont les cinq langues. Preuves détaillées et SHA-256 : `site-public.json`.
- Sitemap : 858 URL distinctes, aucune route avec fragment et aucun fichier cible local manquant. Sur 855 HTML de cours, titre, H1, canonique et description présents. Cela vérifie la structure, pas une promesse de classement Google.
- Service worker : 148 précaches, tous présents localement ; API tierces non mises en cache par le mécanisme général ; publication conserve la génération précédente de chunks.
- Aucun lien Markdown local cassé dans les deux README contrôlés.
- Recherche limitée de motifs courants de clés privées, secret Stripe réel, jeton GitHub et clé API Google dans les fichiers suivis : aucun résultat. Les clés anon Supabase publiques ne sont pas assimilées à une fuite. Cette recherche ne constitue pas une certification exhaustive d’absence de secrets historiques.
- Workflows : pas de `pull_request_target` relevé ; test avant publication ; permissions d’écriture réservées au job de publication. Les contrôles ne sont pas supprimés.

## Améliorations et limites

- Actions tierces référencées par versions majeures plutôt que SHA : durcir par épinglage et mises à jour automatisées, importance 3/10.
- Définir des limites de durée explicites par job et par collecte externe ; suivre séparément dernier contrôle, dernière réussite et fraîcheur des données.
- Les 22 contrôles publics sont un échantillon réseau ; les 858 cibles du sitemap sont vérifiées localement, pas toutes téléchargées.
- Aucun compte créé, paiement ou génération IA réelle lancé ; pas de mutation Supabase, NAH, GitHub ou produit. Accès réels par rôle, configuration Stripe et politiques actives relèvent de l’agent services. Aucun avis sur l’exactitude de tous les cours n’est formulé.

## Pièces

`site-public.json` ; `stats-probes.json` ; `check-site.py` ; `probe-stats.mjs`.

## Recoupement services transmis par le coordinateur

L’agent services confirme Stripe en mode TEST, des RLS actives sur 21 tables et fiche-vision ACTIVE v1 (rapport : `/workspace/output/audit3-20261115/services/rapport.md`). Cela confirme l’obsolescence des passages README annonçant des règles ouvertes / fiche-vision non déployée. Les mentions CGU non commerciales et provisoires sont à mettre à jour avant l’ouverture réelle, sans les qualifier de panne actuelle. R4 reste la contradiction précise sur les rubriques gratuites.
