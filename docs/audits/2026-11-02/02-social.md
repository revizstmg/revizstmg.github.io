# Audit02 — classes, amis et classement

Version gelée : `f0f70220fd34f6fbba1d6416f3c99e6a0cd3e1e7`, source `05bd1531da93f095780ec1492b756459153a722a`. Index compilé servi en statique sur `http://localhost:4212`, SHA256 `c0cb4337d48b30af6dd6e3fe3556fea854d8b8a7f5e2ae60e7f2089c4d8ea309`, conforme à VERSION.json. Référence fournie : CI41503625386,691 unitaires par fuseau UTC/Paris,359 parcours et4 contrôles publics. Ces nombres ne constituent pas des tests rejoués par cet agent.

Audit indépendant en lecture seule le2 novembre2026. AGENTS.md, CLAUDE.md et docs/COORDINATION.md lus dans la version gelée. Aucun rapport d'un autre agent consulté. Aucun fichier suivi modifié, aucun commit, aucune correction. Comptes synthétiques de `app/tests/parcours/eleve.js`, réponses réseau interceptées, toute destination externe bloquée par le helper hors réponses synthétiques. Un seul worker navigateur, captures viewport uniquement. Les fichiers temporaires de l'agent restent dans la worktree ou preuves-02/.

## Commandes

- `git -C /workspace/revizstmg.github.io worktree add --detach /workspace/work/audit10-20261102/wt-02 f0f70220fd34f6fbba1d6416f3c99e6a0cd3e1e7`
- Racine gelée : `python3 -m http.server 4212` ; dépendances liées depuis app/node_modules du dépôt principal, sans installation ni compilation.
- Dans app : `npx playwright test --config=audit02.config.mjs classes-multiples.spec.js code-classe.spec.js duel-envoi.spec.js social-correctifs.spec.js points-10-28.spec.js --grep 'créer deux classes|rejoindre deux classes|nom libre|groupe et annonce|créer un quiz|code de classe (inconnu puis valide|exclu|profil indisponible)|score gardé|compte gratuit|demande ami retardée|QCM de classe'`
- `npx vitest run tests/classes-identity.test.js tests/reprise-reseau.test.js --maxWorkers=1 --minWorkers=1`

## Résultats de la sélection

17 parcours existants réussis en3,8min (`preuves-02/selection.log` et `resultats-selection.json`).14 unitaires réussis,2 fichiers en26,97s (`unitaires.log`).

## Couverture ciblée

Création de deux classes professeur, choix actif et rechargement ; deux adhésions élève, bascule et retrait ciblé ; noms libres, renommage après erreur503 et conservation du brouillon ; groupes, annonce et quiz après503. Faux code suivi d'un code valide normalisé, élève exclu, refus de sauvegarde du profil, depuis Classe et Classement, y compris vérification d’exclusion indisponible. QCM joué jusqu'au score, conservation locale après erreur d'envoi puis reprise après rechargement ; duel joué et renvoi du score conservé ; demande d'ami suspendue pendant changement de compte. Gratuité explicite des pages Classe et Amis avec abonnement null et navigation transversale Boutique.

## Contrats et limites Supabase

Skill `supabase:supabase` appliqué, changelog et documentation RLS consultés, archivés dans preuves-02/. Le changement TLS annoncé pour10 novembre2026 concerne les anciens clients ; aucune nouvelle intégration n'est implémentée ici.

Lecture des migrations de sécurité : les anciennes politiques ouvertes sont retirées dans `20261020151401_revizstmg_securite_2_regles.sql:6`, droits anon révoqués pour les tables sociales, prédicats auth.uid et membre/propriétaire utilisés, UPDATE accompagnés de WITH CHECK. Les helpers SECURITY DEFINER sont dans un schéma privé avec search_path fixé et EXECUTE restreint ; les RPC publics de recherche ont un code exact et des droits explicitement restreints dans `20261013171408_revizstmg_securite_4_fonctions_app.sql:68`. Le déclencheur de demandes réserve l'acceptation au destinataire ; celui des duels protège les colonnes adverses et transitions d'état. Aucune requête SQL, aucun advisor ni contrôle des règles réellement déployées : RLS réelles, révocation des jetons et concurrence entre appareils non certifiées. Aucune donnée sociale réelle publiée ou modifiée.

## Risques de lecture non reproduits

- `20261020151401_revizstmg_securite_2_regles.sql:160` : l'insertion d'un duel vérifie l'auteur connecté et un adversaire distinct, mais n'exige pas ici de relation d'amitié acceptée. L'interface choisit parmi les amis ; un client REST modifié connaissant l'identifiant d'un autre compte pourrait avoir un contrat plus permissif. Aucun test réel ni certification du déploiement ; ne pas assimiler ce point à un exploit reproduit.
- `app/src/pages/Friends.jsx:20` : la file des scores de duel utilise une clé locale globale indexée par identifiant de duel, contrairement à la file des quiz séparée par compte. Le serveur doit restreindre les duels visibles. Pas de fuite intercompte reproduite dans cet audit.

## Outillage et limites

Une première commande a visé `app/audit02.config.mjs` depuis le dossier app : erreur de chemin corrigée avant le lancement effectif. Les avertissements NO_COLOR/FORCE_COLOR sont ceux du runner. Aucun défaut produit déduit de ces messages. Les tests existants d'accessibilité prenant des captures pleine page ont été exclus ; cet audit ne certifie pas tous les états accessibles, le temps réel multi-utilisateur, les anti-spams réels, ni chaque combinaison de rôles et classes.

## Sondes nouvelles

Script conservé dans `preuves-02/sondes-initiales.spec.js`, commandes : `npx playwright test --config=audit02-sondes.config.mjs audit02-nouvelles.spec.js`, puis reprise ciblée `npx playwright test --config=audit02-reprise.config.mjs audit02-nouvelles.spec.js --grep 'échec acceptation duel|classement et ligue'`. Résultat initial :2 réussites,2 échecs en1,1min. Un échec correspond au défaut de retour d'erreur décrit ci-dessous ; l'autre est une hypothèse de test incorrecte, pas un bug produit.

- Ami gratuit : demande entrante, PATCH503, erreur visible et demande conservée, acceptation réussie, retrait confirmé, puis envoi d'une nouvelle demande normalisée ; identité from/to et statut pending contrôlés.
- Mur gratuit : brouillon conservé après503, renvoi réussi, texte contenant une balise img affiché comme texte sans exécution du onerror. Capturé dans `mur-reprise.png`. Ce contrôle ne constitue pas un audit XSS exhaustif.
- Classement : la première sonde supposait la gratuité et a buté sur le garde d'abonnement. L'assertion `Réessayer` avait de plus visé le bandeau global de sauvegarde du mock, pas le classement. Correction du seul script : compte Premium simulé et sélecteur limité à main ; les traces initiales sont conservées. La gratuité demandée pour Classe/Amis est confirmée ; aucune gratuité de Classement n'est conclue.

## Défaut fonctionnel reproduit — SOCIAL02-01 (P2)

**Acceptation d'un duel : l'erreur réseau est affichée seulement après avoir quitté l'onglet Duels.**

Prérequis : compte synthétique connecté, onglet Amis → Duels, invitation entrante pending ; le PATCH `/rest/v1/friend_duel?id=eq.duel-probe` retourne503 avec un corps JSON. Aucun service réel utilisé.

Étapes : ouvrir `/#/amis`, sélectionner Duels, cliquer « Relever » sur l'invitation. Attendre la fin de la requête. L'invitation reste pending et le bouton redevient disponible ; aucun message d'échec de cette action n'apparaît dans main. Basculer sur Amis fait alors apparaître « Classement momentanément indisponible. Réessaie plus tard. Ta demande n’a pas été confirmée… » dans le formulaire d'ajout d'ami.

Attendu : l'erreur d'acceptation est visible dans le contexte Duels et explique la possibilité de réessayer. Observé : l'échec est silencieux dans Duels ; son message arrive dans une autre rubrique et désigne le classement. Impact : l'élève ne sait pas si son clic a été pris en compte et peut insister sans comprendre la panne ; aucune acceptation ni perte de score n'est observée.

Cause localisée : `app/src/pages/Friends.jsx:168` stocke l'erreur dans `msg`. Son rendu est dans le bloc `view === 'amis'` à la ligne320, ou seulement dans le sous-formulaire de création de duel `flow.step === 'setup'` à la ligne449 ; l'invitation entrante dans Duels ne remplit aucune de ces conditions.

Preuves : `preuves-02/duel-etat-initial.json` conserve l'unique PATCH, le texte intégral de main dans Duels sans erreur, puis dans Amis avec l'erreur ; `duel-erreur-invisible.png` capture le viewport de l'invitation après503. Le bandeau global « Non sauvegardé » de cette première capture est un effet du mock de profil retournant[] ; il est hors de main et n'est pas le message de l'action duel. Le rejeu remplace cette réponse par un profil synthétique valide pour lever cette confusion.

Rejeu : même anomalie reproduite dans un contexte navigateur neuf (profil synthétique valide), assertion vérifiant d'abord que le message existe en Amis, puis constatant son absence dans Duels. Preuves `duel-etat-reproduction.json`, `duel-erreur-reproduction.png`, `artifacts-reprise/…/trace.zip` et `reprise.log`. Le test d'acceptation échoue intentionnellement sur l'attendu produit ; la sonde classement/ligue Premium réussit après503 et réessai pour les deux vues, avec données synthétiques et code masqué `stmg-a•••` (`ligue-reprise.png`). Résultat du rejeu :1 échec produit reproduit,1 réussite,42,5s.

Bilan des exécutions :17 parcours existants et3 nouvelles sondes distinctes réussis,14 unitaires réussis ;1 nouvelle sonde de défaut échoue sur l'attendu produit lors des deux exécutions. L'échec initial de l'hypothèse « Classement gratuit » est classé outillage et repris avec son contrat Premium. Ces comptages se recoupent avec les autres audits et ne mesurent pas20 fonctionnalités uniques.

Fin du worker navigateur et arrêt du serveur local à la remise. Contrôles finaux : HEAD gelée inchangée, `git diff --check` réussi et `git status --porcelain --untracked-files=no` vide. Aucun fichier suivi ni dépôt principal modifié. Aucun appel réel de mutation, relation, message, abonnement ou IA.
