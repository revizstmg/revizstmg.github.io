# Trois nouveaux bugs reproduits

Recherche ciblée du 16 novembre 2026, demandée après les corrections précédentes. Référence : `60e6f519f3183fa40b50ca03c23bb488751b7e11` ; compilation du site public : `725f5e1a8a619e07ec09990a147a054c5d06e2a3`. Aucun changement du produit, de Supabase, de NAH ou des données réelles. Les essais utilisent l’interface publique, des profils fictifs et des réponses de services simulées. Les notes sur 10 expriment la priorité pratique, pas un score CVSS.

## 1. Résultat de Remise en ordre enregistré dans le compte suivant : 7/10

**Déclencheur précis.** Le compte A termine la dernière étape. L’exercice programme sa fin dans 400 ms. Le compte change dans un autre onglet pendant ce délai, puis la réponse retardée s’exécute après restauration de B.

**Reproduction.** Gestion et finance, thème1, fiche19 (index18), exercice `gf-t1-ordre`, « La chaîne comptable ». Compléter les cinq étapes, changer la session via l’événement de stockage utilisé entre onglets, attendre le profil B, puis laisser passer le délai. Une seconde reproduction avec horloge explicitement suspendue confirme le même résultat.

**Observation.** Avant le callback : B a10XP et aucun résultat pour cet exercice. Après : B a60XP et `gf-t1-ordre:100`. Le bonus initial de10XP de B est distinct des50XP du résultat de A. A n’avait encore reçu aucun XP pour cet exercice au moment du changement. Il s’agit d’une contamination de progression entre identités du même navigateur, pas d’un accès démontré à des comptes arbitraires ou d’une fuite d’adresse e-mail.

**Cause.** `app/src/games/Ordre.jsx:20` ne conserve ni n’annule le timer de fin au démontage. `app/src/games/GameHost.jsx:113` n’invalide pas `handleDone` quand l’identité change ; `app/src/store.jsx:417` applique ensuite `recordResult` à la progression courante. Le jeu Association annule déjà son propre timer : ne pas supposer que tous les jeux sont affectés.

**Correction recommandée.** Annuler les callbacks au démontage, capturer l’identité du joueur et refuser tout résultat d’une ancienne identité avant les changements de progression. Ajouter un contrôle de changement de compte pendant les délais de fin. Les timers de Memory méritent une vérification complémentaire ; ce rapport ne prétend pas y avoir reproduit le défaut.

[État observé](preuves/ordre-compte.json), [capture](preuves/ordre-compte.png), [reprise isolée](preuves/ordre-confirme.log).

## 2. Une question de reprise Vrai/Faux change après la réponse : 6/10

**Déclencheur.** Dans « Refaire mes erreurs », une mise à jour de la progression survient pendant la question. La sonde déclenche le même événement que la fin du minuteur de concentration (`focus.jsx:109`), avec un changement déterministe de tirage pour rendre le problème reproductible.

**Reproduction.** Ouvrir le premier chapitre TVA de Gestion et finance, Vrai/Faux des notions. Répondre volontairement à l’inverse des définitions du vrai cours, puis ouvrir la reprise des erreurs. Répondre correctement à la première question de reprise et déclencher la mise à jour de progression.

**Observation.** La question déjà répondue « TVA collectée : Sur les achats → créance sur l’État » devient « Prix HT / TTC : Hors taxes / toutes taxes comprises (HT + TVA) ». Le choix précédent reste mémorisé et le retour devient « Pas tout à fait ». L’élève voit donc une autre question corrigée avec son ancien choix. Aucun changement de question n’a été demandé.

**Cause.** `GameHost.jsx:110` recrée l’objet de reprise à chaque rendu ; `VraiFaux.jsx:9` mémorise son tirage sur cet objet et le remélange. Le correctif QCM précédent reste valide : ce cas touche la reprise Vrai/Faux. Trou et Saisie présentent des dépendances semblables à inspecter, sans les déclarer reproduites ici.

**Correction recommandée.** Stabiliser l’objet/liste de reprise et les dépendances du tirage. Préserver question, réponse et correction lors des mises à jour du contexte ; renouveler uniquement lorsqu’une nouvelle partie est demandée.

[État observé](preuves/reprise-vf.json), [capture](preuves/reprise-vf.png).

## 3. Suppression bloquée avant le RPC si le service de notifications reste suspendu : 6/10

**Déclencheur simulé.** Le navigateur ne résout pas `PushManager.getSubscription()` ou `PushSubscription.unsubscribe()`. Ces deux phases ont été reproduites séparément. Il ne s’agit pas d’une panne actuellement observée sur un compte réel.

**Observation.** Après65secondes, « Un instant… » reste désactivé, la session existe encore et aucun appel à `revizstmg_supprimer_compte` n’a eu lieu. Le délai de15secondes ajouté au RPC fonctionne, mais n’est jamais atteint dans ce scénario : le parcours attend d’abord les notifications.

**Cause.** `app/src/push.js:47–51` borne seulement `serviceWorker.ready`, puis attend les deux autres API sans échéance. `Profile.jsx:86` attend cette désactivation avant la résiliation et la suppression. `store.jsx` l’attend aussi lors d’une déconnexion ; la sonde n’a pas exercé ce second parcours, donc aucun blocage de déconnexion n’est compté comme reproduction indépendante.

**Correction recommandée.** Borner toute l’opération de notifications et traiter explicitement son résultat. Permettre un état d’échec/reprise utilisable sans annoncer une suppression ou une désinscription confirmée à tort.

[GetSubscription](preuves/push-getSubscription.json), [unsubscribe](preuves/push-unsubscribe.json), [capture](preuves/push-getSubscription.png).

## Méthode et limites

- Quatre sondes ont reproduit trois causes : deux phases de notifications, reprise Vrai/Faux et résultat retardé. Le dernier cas a été confirmé une seconde fois avec horloge suspendue.
- Les assertions des sondes vérifient les symptômes observés. Leur affichage « passed » signifie que la reproduction a abouti, pas que le fonctionnement du produit est correct.
- Les sondes de l’interface publique interceptent les API tierces avec des profils fictifs ; aucun compte réel ni suppression, paiement, envoi d’e-mail ou génération facturable n’a été utilisé.
- Les étapes, jeux et définitions proviennent des vrais composants et cours. Le changement de compte et les API suspendues sont simulés pour rendre les courses temporelles reproductibles. Aucune donnée d’élève réelle inspectée.
- Recherche ciblée : ce bilan ne certifie pas toutes les fonctionnalités ou l’exactitude pédagogique. La dernière suite générale877/431 réussie demeure un contrôle positif, pas une preuve d’absence d’autres bugs.
- Aucun de ces trois nouveaux défauts n’est corrigé dans cette livraison documentaire.

[Protocole des sondes](preuves/sondes.spec.js), [journal des premières reproductions](preuves/sondes.log).
