> Rapport partiel : rédaction interrompue par la limite d’utilisation. Les journaux terminés ont ensuite été récupérés par le coordinateur ; voir README.md. Les mentions « à compléter » ci-dessous ne constituent pas une validation.

# Contre-audit indépendant : identités, classes, social et suivi parent

30 octobre 2026. Audit en lecture et navigation sur données synthétiques, sans correction. Source publiée cbfda015 (#153), compilation examinée a0ba33ca5473842649bbf5aa3da5fd56cdf2dac9. Worktree détachée `/workspace/work/contre-audit-identites`. Aucun rapport des quatre autres agents consulté.

## Méthode et limites

Consignes AGENTS.md, CLAUDE.md et docs/COORDINATION.md lues ; skill Supabase consulté, index du changelog vérifié. Serveur statique de la racine compilée sur 4187. Chromium mobile Pixel 7, un worker ; interceptions du helper `app/tests/parcours/eleve.js` et réponses synthétiques. Aucun paiement, courrier, micro réel, compte réel ni IA facturée. Aucun changement applicatif, migration, commit ou PR.

Les validations CI 41021772448 (688 unitaires UTC/Paris, 349 parcours) et Pages 41023616609 sont des références fournies par le coordinateur, pas une validation serveur faite par cet agent. Sans link_id Supabase utilisable, les règles réellement appliquées, codes historiques, suppression serveur, export serveur et déploiements de fonctions restent **non vérifiés**. Aucun contenu personnel de la base consulté. La relecture des migrations démontre seulement l'intention du dépôt.

Les nouveaux scénarios sont conservés hors dépôt dans `/workspace/work/identites-preuves/scenarios.spec.js`. Les traces et pièces jointes sont sous `/workspace/work/identites-resultats`, les journaux sous `/workspace/work/identites-*.log`. Trois premiers essais navigateur démarrés avant le serveur ont échoué par connexion refusée ; ils ne constituent pas des défauts du produit et font l'objet d'une reprise.

## Couverture exécutée

Résultats définitifs en cours de consolidation.

### Vérification unitaire complémentaire

`npx vitest run tests/parent-code.test.js tests/auth-session.test.js tests/compte.test.js` : **19 tests réussis sur 3 fichiers** (`identites-unitaires.log`). Rôles restaurés depuis le profil, absence de transfert des classes/progression professeur à l'élève, fusion du même compte, refus d'un profil d'une autre identité, rattachement d'essai, réponses auth tardives 200/401, déconnexion hors ligne, renouvellement de jetons, refus social anonyme, code parent cryptographique stable et stockage indisponible.

## Nouveaux constats

### ID-01 — Une demande d'ami commencée par A peut être envoyée au nom de B après réception tardive du corps (gravité moyenne)

**Reproduction sur compilation, réseau entièrement synthétique.** Ouvrir `/amis` comme A (Léa Test), saisir `ABCDEF`, envoyer. La recherche `revizstmg_trouver_ami` renvoie immédiatement ses en-têtes mais son corps JSON attend. Changer la session et restaurer le compte B (Bob Audit), puis libérer le corps contenant l'ami C.

**Attendu :** l'opération commencée par A s'arrête ; B n'émet aucune demande qu'il n'a pas initiée.

**Observé :** un POST `friend_request` utilise le jeton `token-B`, `from_device=B`, `to_device=C`, mais `from_name="Léa Test"`. La réponse tardive fait donc agir le nouveau compte tout en transférant l'ancien nom. Le scénario passe en affirmant explicitement ces valeurs fautives. Il n'implique aucune relation réelle.

**Sources :** `app/src/auth.js:119` vérifie l'identité autour de `fetch`, avant la consommation ultérieure du corps ; `app/src/reseau.js:50` lit ensuite `res.text()` sans garde d'identité ; `app/src/friends.js:58` attend la recherche, puis calcule `deviceId()` et poursuit ses requêtes ; `app/src/pages/Friends.jsx:121` conserve le nom de A dans la fermeture. La règle `fr_ajouter` dans `supabase/migrations/20261020151401_revizstmg_securite_2_regles.sql:149` ne peut pas distinguer cette erreur : la demande appartient bien à B. Cette dernière remarque est une lecture du dépôt, pas une certification des règles de production.

**Preuves :** scénario `demande ami retardée après changement de compte`, journal `identites-complement.log`, puis reprise avec fichier synthétique `identites-preuves/ami-retarde.json`. L'interception d'un `Response` à flux différé reproduit la distinction réelle entre arrivée des en-têtes et réception complète du corps.

### ID-02 — Retirer le consentement parent ne neutralise pas une publication déjà en vol (gravité majeure pour la confidentialité, condition de concurrence)

**Défaut de séquencement client reproduit ; conséquence de persistance modélisée, pas constatée en production.** Dans les réglages, activer « Partager ma progression ». Attendre le POST `child_stats` après le délai de trois secondes et le retenir avant application. Désactiver le partage ; laisser réussir le DELETE. Appliquer et terminer ensuite le POST initial, puis attendre quatre secondes.

**Attendu :** une fois le retrait terminé, aucune publication antérieure ne peut laisser de nouveau un instantané consultable par code.

**Observé :** le commutateur reste faux ; aucune suppression compensatoire n'est émise après le POST tardif. Le serveur synthétique qui applique les écritures dans cet ordre conserve une ligne (`exists=true`). L'ordre de requêtes est DELETE initial, POST, DELETE de retrait ; le POST se termine après le dernier DELETE. L'effet de suppression pose en outre le marqueur local `stmg_parent_efface`, qui évite une nouvelle tentative aux prochaines ouvertures. Le dépôt ne contient pas ici de consentement serveur durable qui empêcherait le POST tardif.

**Sources :** `app/src/store.jsx:321` annule uniquement le minuteur de publication, pas une requête déjà lancée ; `app/src/store.jsx:330` supprime indépendamment et mémorise le succès ; `app/src/parent.js:43` publie sans réévaluer le consentement après l'envoi. Les règles `cs_ajouter`/`cs_modifier` du fichier de migration ci-dessus vérifient l'identité du propriétaire, pas la version du consentement.

**Preuves :** scénario `retrait consentement pendant publication parent`, `identites-complement.log`, reprise et `identites-preuves/parent-consentement.json`. Aucune donnée réelle n'a été publiée ni lue. Le test prouve les appels émis et l'absence de rattrapage ; le maintien d'une ligne réelle dépend de l'ordre d'application côté serveur et reste à vérifier dans un environnement de test autorisé.
