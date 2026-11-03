# Audit 01 — Comptes et identité

Version gelée : `f0f70220fd34f6fbba1d6416f3c99e6a0cd3e1e7`, source `05bd1531da93f095780ec1492b756459153a722a`. Audit du 2 novembre 2026, worktree détachée `wt-01`, compilation statique servie sur `127.0.0.1:4211`. Aucun fichier suivi modifié ; aucun build, mutation réelle, compte réel ou connexion interactive.

Skill appliqué : `supabase:supabase` ; checklist auth/RLS examinée, changelog et documentation sessions récupérés dans les preuves. Contrats du dépôt seulement : le déploiement des migrations, Google réel, les courriels et la révocation effective des sessions ne sont pas certifiés.

## Commandes et couverture

Un seul worker Chromium/Pixel 7 à la fois, réseau externe bloqué par `app/tests/parcours/eleve.js`, réponses Supabase synthétiques.

- `npx playwright test --config audit01.config.js comptes.spec.js oauth.spec.js formulaires.spec.js donnees.spec.js parametres-recompenses.spec.js audit-quatre-correctifs.spec.js --grep 'restaurer le compte|élève →|première connexion|retour Google|vrai lien|création de compte|suivi parent|session absente|paramètres : photo|profil : corps'`.
- `npx vitest run tests/auth-session.test.js --maxWorkers=1 --minWorkers=1` : **10/10 réussis**, journal `preuves-01/unitaires.log`.

Couvre : restauration depuis rôle périmé et autre identité ; parcours complet élève/déconnexion/professeur/déconnexion/élève avec minuteur isolé ; première connexion après confirmation courriel ; retour Google nouveau/existant puis rechargement ; validation formulaire d'inscription ; export et suppression simulée ; invitation à se reconnecter sans requête sociale anonyme ; profil/photo/mot de passe et persistance en clair/sombre ; sauvegarde du profil A dont le corps arrive après passage à B. Petit passage transversal : route inexistante 404, minuteur, accessibilité des paramètres.

## Relecture des contrats Supabase

`profiles` active RLS et impose `auth.uid() = id` pour SELECT/INSERT/UPDATE (USING et WITH CHECK) dans `20260902185821_create_profiles.sql`. Le rôle professeur/élève est stocké dans le profil, pas extrait de user_metadata pour l'autorisation SQL. Les aides privées sociales vérifient l'appartenance et la propriété via auth.uid ; la migration `20261020151401_revizstmg_securite_2_regles.sql` retire les politiques historiques ouvertes et révoque anon. La fonction de suppression `20261019075848_revizstmg_suppression_compte.sql` utilise auth.uid, refuse l'absence d'identité et retire EXECUTE à public/anon. La clé cliente est anon, pas service_role.

Réserve sécurité issue du skill : supprimer auth.users ne suffit pas en général à invalider immédiatement un JWT déjà émis. Le contrat efface les refresh_tokens et les lignes propres, mais cet audit sans base réelle ne prouve pas l'impossibilité de tout appel privilégié avec un ancien JWT jusqu'à son expiration. Aucun défaut exploité ni certification de révocation globale.

## Outillage et limites

Première commande lancée depuis `app/` avec des chemins préfixés `app/` : échec de création du lien/configuration, corrigé immédiatement avant tout test. Aucun résultat produit par cette tentative. Une série principale ciblée, quatre sondes nouvelles puis trois reprises ; aucune suite générale relancée. Les contrôles d'inscription couvrent les validations et la reprise après confirmation, pas la livraison réelle d'un courriel. L'export existant vérifie le téléchargement et son nom ; il ne certifie pas exhaustivement chaque table serveur. Les images des tests paramètres existants restent des vues de paramètres, aucune capture géante de catalogue demandée.

## Résultats et sondes aux limites

Série principale : **13/13 réussis en 3,3 min**, `preuves-01/resultats.json` et `parcours.log`. L'empreinte locale de `index.html` est `c0cb4337d48b30af6dd6e3fe3556fea854d8b8a7f5e2ae60e7f2089c4d8ea309`, conforme à VERSION.json.

Sondes nouvelles : `npx playwright test --config audit01-limites.config.js audit01-limites.spec.js` : **1 réussite, 3 échecs initiaux en 3,0 min**. La sauvegarde du profil en erreur500 conserve Léa ; le réessai200 enregistre Élise. Un échec est le défaut ci-dessous. Deux échecs relèvent de la sonde : attente d'un champ profil après redirection vers l'accueil Bob lors du changement de compte ; recherche d'un rôle alert sur le message OAuth simple, qui est un paragraphe. Les snapshots et traces initiaux sont conservés, les sondes adaptées au comportement réel pour le rejeu.

### C01-01 — Refus OAuth : le pourcentage littéral déclenche une exception

Priorité P3, cas limite de retour fournisseur, aucune donnée personnelle exposée ni compte réel impliqué.

Prérequis : visite sans compte, réponse de refus OAuth avec description contenant un caractère `%` littéral encodé correctement dans le fragment.

Reproduction : ouvrir `http://localhost:4211/#error=access_denied&error_description=Refus%20%C3%A0%20100%25`. Attendu : message « Refus à 100% », nettoyage du fragment et possibilité de se connecter à nouveau. Observé : `URIError: URI malformed`, route sous-jacente « Page introuvable », formulaire restant occupé ; le chemin asynchrone s'interrompt avant la navigation et la remise à zéro de busy. Le fragment est nettoyé avant l'exception.

Cause : `app/src/auth.js:229`, `URLSearchParams.get` a déjà décodé `%25` en `%`, puis `decodeURIComponent` est appelé une deuxième fois. `app/src/components/Welcome.jsx:154` attend ce résultat sans intercepter cette exception. Une description de fournisseur sans `%` ne rencontre pas ce problème. Ce cas est fourni synthétiquement : aucun refus réel Google contenant `%` n'a été observé.

Preuves : résultat/trace du premier test dans `preuves-01/limites.json` et `limites-artifacts/audit01-limites-OAuth-refu-870ad-ant-un-pourcentage-littéral/`; vérification indépendante par appel direct à `consumeOAuthRedirect`, `preuves-01/oauth-decodage.mjs` / `oauth-decodage.json`, donne exactement `{"erreur":"URIError","message":"URI malformed"}`. Aucun correctif effectué.


## Rejeu achevé et bilan final

`npx playwright test --config audit01-reprise.config.js audit01-limites.spec.js --grep 'OAuth refus|changement de compte'` : **2 réussites et 1 échec reproduisant C01-01 en 63,49 s**, sans test ignoré. Journaux `preuves-01/reprise.log` et `reprise.json`. Le changement d'identité affiche l'accueil Bob ; le retour explicite aux paramètres affiche bien le prénom Bob. Le refus OAuth simple affiche son message ; après saisie de courriel/mot de passe valides, le bouton de connexion est disponible. Les deux erreurs de sonde initiales sont donc levées et ne constituent pas des défauts produit.

Le refus avec pourcentage reproduit une seconde fois exactement `exception : URI malformed`. Preuves complémentaires : `preuves-01/reprise-artifacts/audit01-limites-OAuth-refu-870ad-ant-un-pourcentage-littéral/oauth-pourcentage.png`, `error-context.md` et `trace.zip`. Les captures nouvelles sont limitées au viewport.

**Bilan : un défaut P3 confirmé, aucune autre anomalie confirmée dans ce périmètre échantillonné.** Treize parcours existants réussis, quatre sondes nouvelles dont trois finalement réussies et une anomalie reproduite ; dix unitaires auth réussis. Ces nombres ne représentent pas des fonctions uniques et ne doivent pas être additionnés aux autres audits.

Reprise documentaire le 3 novembre après interruption par limite d'utilisation : les trois journaux JSON étaient complets et le worker avait déjà terminé le 2 novembre à19:13:31 UTC. Aucune relance nécessaire. Aucun processus d'audit01 ni serveur4211 restant lors de la vérification finale. `git diff --stat` vide et `git diff --check` réussi : seuls les scripts/configurations temporaires non suivis sont présents dans la worktree. Rapport final, aucune correction applicative, aucun rapport contemporain d'un autre agent consulté.
