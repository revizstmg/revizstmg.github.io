# Audit 10 — sauvegarde, hors ligne, pages publiques et suivi parent

Audit indépendant en lecture seule, 3 novembre 2026 UTC. Version gelée `f0f70220fd34f6fbba1d6416f3c99e6a0cd3e1e7`, source `05bd1531da93f095780ec1492b756459153a722a`. Empreinte index local `c0cb4337d48b30af6dd6e3fe3556fea854d8b8a7f5e2ae60e7f2089c4d8ea309`, conforme à VERSION.json. CI fournie : 691 unitaires par fuseau et 359 parcours ; non relancée.

## Méthode et portée

Worktree détachée `wt-10`, compilation racine servie par `python3 -m http.server 4220 --bind 127.0.0.1`. Playwright Chromium mobile Pixel 7, un seul worker, réseau externe bloqué via `app/tests/parcours/eleve.js`, réponses REST/RPC synthétiques seulement. Aucun appel à la base réelle, paiement ou fournisseur IA, aucun correctif ni commit. Aucun autre rapport contemporain lu. Les commandes et scripts sont dans `preuves-10/`.

## Contrôles statiques publics

`python3 preuves-10/static-probe.py` : 867 URL du sitemap possèdent un fichier local ; 118 liens locaux dans cinq pages échantillonnées pointent vers un fichier présent. Ces cinq pages (accueil, index cours, TVA Terminale, méthode histoire Terminale, allemand) présentent chacune titre, canonical, description et un H1. Robots autorise le site, référence les deux sitemaps et exclut les dossiers techniques. Preuve : `public-static.json` et script reproductible. Cela vérifie les fichiers de la compilation, pas l'indexation effective ni chaque lien cliquable du site. Aucun trafic ni score de performance n'est inféré.

## Limites

Publication et CI reprises des références fournies ; aucune certification des règles/RLS ou déclencheurs Supabase réellement appliqués. Les tests simulent des conflits et des identités ; ils ne certifient pas la concurrence entre plusieurs appareils réels. L'installation native iOS/Android, notifications, migration depuis toutes les anciennes versions PWA, crash disque et refus du stockage ne sont pas certifiés. Le cache ancien est une réponse de worker simulée ; aucune mise à jour de production n'a été déclenchée. Le souhait EPS, absent de cette version, est hors périmètre. Pas de relecture exhaustive des cours ni de mesure de trafic.

## Parcours ciblés

La sélection historique exerce : envoi d'une note et acquittement de version serveur ; erreur hors ligne, conservation locale puis reprise réseau ; conflit de révision et fusion de trois notes ; avertissement avant déconnexion, choix de rester ou forcer ; propagation identité/déconnexion entre deux onglets ; attribution du temps à un thème et réparation de durées aberrantes ; installation du cache, rechargement hors ligne et ouverture d'une matière jamais visitée ; refus de confirmer une version différente ; renouvellement du code parent, ordonnancement publication/retrait de consentement y compris corps de réponse suspendu ; adresse inconnue et liens de retour, matière/thème/chapitre absents, redirection 404 vers route valide. Les détails exacts des assertions sont conservés dans les tests de la version gelée et les résultats JSON.

Résultat initial : 17 parcours exécutés, 16 réussis et un échec en 5,2 minutes. L'échec est l'assertion d'augmentation du temps après 31 secondes simulées dans la séance guidée (`temps-theme.spec.js:19`) ; l'attribution de la courte visite précédente avait passé ses assertions. Journal et JSON initiaux conservés (`parcours.log`, `parcours.json`), contexte/trace dans `initial-traces/`. Rejeu ciblé effectué séparément avant qualification finale.

## Rejeux et erreurs d'outillage

Le rejeu exact du scénario temps réussit : l'échec initial n'est donc pas retenu comme défaut produit reproduit. La sonde parent code faux/valide, révocation et retrait local réussit. En réponse RPC réseau rejetée, l'ancien instantané reste visible avec le texte « Aucun élève trouvé pour ce code » ; cela confond panne et code absent, sans preuve d'un défaut de révocation serveur.

La première sonde de liaison A/B n'a pas atteint le changement de liaison : elle attendait un bouton Actualiser devenu désactivé pendant une lecture. Aucune confusion d'enfants n'est affirmée. Une sonde dédiée de lectures répétées a été préparée pour isoler la cause. La première sonde de recherche utilisait le mauvais nom accessible `Rechercher` au lieu de `Rechercher un chapitre` : échec d'outillage conservé dans `probes.log`, sélecteur rectifié sans changement produit.

## Défaut reproduit prioritaire

### A10-01 — P2 — L'espace parent lié relance ses lectures RPC sans action

Prérequis : un code parent est mémorisé et le RPC simulé renvoie une ligne valide. Étapes : ouvrir `/#/parent` dans un contexte neuf avec `stmg_parent_link=PTEST23456`, répondre par une ligne synthétique stable, ne rien cliquer. Deux exécutions indépendantes de `audit10-parent-loop.spec.js` ont observé respectivement **28 et 34 requêtes RPC interceptées** pendant les sondes (tests de 1,9 et 2,3 secondes). Le simulateur ne répond qu'aux vingt premières ; les suivantes sont laissées suspendues pour borner l'exploration. Ces nombres décrivent seulement ce navigateur synthétique et ne sont pas des mesures de trafic réel.

Attendu : lecture initiale, puis nouvelle lecture sur action Actualiser ou déclencheur prévu. Observé : lectures répétées et bouton Actualiser désactivé pendant le chargement. Impact : demandes inutiles et interface de rafraîchissement difficile à utiliser ; la sonde A/B initiale a précisément expiré sur ce bouton. Aucun effet sur une base réelle n'a été mesuré.

Cause de code concordante : `app/src/i18n.js:50` retourne une fonction `t` neuve à chaque rendu ; `app/src/pages/Parent.jsx:66` construit `load` avec dépendance `[t]` (ligne75), puis l'effet ligne78 dépend de `load`. La lecture modifie `loading` et `child`, provoquant un rendu, une nouvelle fonction `load` et une nouvelle lecture. Une référence de traduction stable ou une dépendance adaptée doit être étudiée dans un travail correctif séparé.

Preuves : `audit10-parent-loop.spec.js`, `final.log`, pièces `lectures-sans-action` de `final.json`, deux captures de viewport sous `final-traces/audit10-parent-loop-*/parent-boucle.png`. Les sondes réussissent parce qu'elles affirment la présence du défaut, et non le comportement attendu.

## Résultat final et état de remise

17 historiques : 16 verts au premier passage ; le seul échec temps passe au rejeu exact. Sondes : code faux/valide, révocation/retrait et panne simulée vérifiés ; recherche sans résultat puis lien Cours vérifiés après correction du sélecteur ; boucle parent reproduite deux fois. La confusion entre deux enfants n'a pas été démontrée. Un défaut produit retenu (A10-01), et une faiblesse de message hors ligne observée séparément. Pas de correctif pendant l'audit.

Dernier lot : `npx playwright test -c audit10-final.config.js audit10-parent-loop.spec.js audit10-probes.spec.js --grep 'lectures répétées|recherche sans'` : 3 réussites en7,1s. `git diff --check` réussi ; aucun fichier suivi modifié. Worker terminé. Les configurations et scripts temporaires sont copiés dans les preuves ; aucun build ni suite générale relancé.
