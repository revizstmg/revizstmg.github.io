# Audit indépendant 2 — comptes, social, réglages — 31 octobre 2026

**Bilan : deux défauts client reproduits (profil entre comptes, retrait parent). 81 parcours ciblés distincts réussis et 60 unitaires ciblés verts. Amis, Boutique et Classe gratuits confirmés.** Les deux sondes de défaut échouent volontairement sur leurs assertions métier ; aucune correction produit.

## Version et méthode

- Dépôt de référence `a85d810272d893ba0f3f7dae6cbfef40c39fbc65` ; compilation racine `52334f12`, source `b4a27b34`.
- Worktree détachée `/workspace/work/audit2-comptes-20261031`, serveur statique `127.0.0.1:4192`, Chromium Playwright, un seul worker. Aucun rapport de l'autre auditeur consulté.
- Audit en lecture seule du produit : seuls des scripts/configurations temporaires de vérification ont été ajoutés dans la worktree. Aucun commit, correction, journal du dépôt principal, requête réelle Supabase, paiement, mail ou IA facturée.
- Comptes et réponses synthétiques via `tests/parcours/eleve.js`, blocage réseau fournisseur. Les vérifications de sauvegarde et suppression interceptent les écritures : elles vérifient les requêtes et l'état client, pas leurs effets dans la vraie base.
- Baseline générale fournie : CI `41198050177`, 688 tests unitaires UTC/Paris, 353 parcours. Cette suite entière n'a pas été rejouée.
- `AGENTS.md`, `CLAUDE.md`, journal de coordination lus. Skill Supabase appliqué à la revue auth/RLS ; index changelog consulté, sans implémentation Supabase ni changement de schéma.

## Couverture et résultats

Les commandes, journaux, configurations et scénarios originaux sont conservés dans `/workspace/work/audit2-comptes-preuves/`.

| Famille | Contrôles ciblés |
|---|---|
| Identité et inscription | Restaurer le bon rôle/profil, élève → professeur → élève, confirmation d’email synthétique, validation des champs, retours OAuth synthétiques, aucune requête sociale anonyme sans session |
| Classes | Création et sélection de plusieurs classes prof/élève, quitter une seule classe, renommage après erreur, groupes/annonces/quiz avec conservation de la saisie, menus et langues DE/AR |
| Amis et duels | Gratuité Amis, demande retardée après changement de compte, score conservé après échec puis renvoyé |
| Boutique et récompenses | Gratuité Boutique, achat/équipement/persistance, pièces insuffisantes, raretés verrouillées, cadeaux uniques, conditions des mois offerts, collecte unique du lot et vrai téléchargement PDF |
| Parent | Publication volontaire, retrait pendant un POST en attente, renouvellement du code ; sonde supplémentaire sur corps de réponse suspendu |
| Réglages | Photo/profil, mot de passe non concordant puis succès synthétique, accessibilité, export, annulation suppression, langues, apparence système, onglets tactiles/clavier et persistance |
| Accès et offres | Cours gratuits, fonctions réservées, ancienne grâce, résiliation serveur simulée, relecture après paiement tardif, prix visiteurs, consentement majeur obligatoire, fonction paiement absente, Checkout/portail/retour simulés |
| Navigation | Desktop clair/sombre, raccourcis et état actif, menu mobile/clavier/Échap/focus, paramètres FR/DE/AR sans débordement ; pages publiques visitées dans les sondes ajoutées |
| Sauvegarde | Envoi de note, absence de réseau puis reprise, conflit entre appareils simulé, déconnexion avec sauvegarde ou choix explicite de déconnexion forcée |
| Passage apprentissage | Accès aux cours et exercices gratuits, choix de matières dans Réviser, note de chapitre/sauvegarde, délai de disponibilité de l’examen et reprise de la demande |

Unitaires ciblés exécutés : `npx vitest run tests/acces.test.js tests/acces-serveur.test.js tests/account-code.test.js tests/parent.test.js` : **41/41**, trois fichiers existants retenus (aucun fichier `parent.test.js`). Puis `npx vitest run tests/auth-session.test.js tests/parent-code.test.js tests/reprise-reseau.test.js` : **19/19**. Total **60 tests ciblés verts**, quotas serveur simulés, concurrence du quota, isolation de session et codes parent inclus.

Parcours compilés ciblés : `cd app && npx playwright test --config=audit2.config.js --grep-invert 'atelier de formules|exercice en plein écran'` : **71/71 verts, 5,7 minutes, aucun ignoré ni réessai**, rapport JSON `resultats.json`, journal `parcours.log`.

Lancement supplémentaire : `npx playwright test --config=audit2-nouvelles.config.js` : **7 verts / 9**, un défaut produit parent et une attente de sonde profil à corriger. Les sept réussites couvrent les pages guide/FAQ/CGU/confidentialité/offres/cours/révision/examen/parent/classement sans compte aux formats FR 1280 px, DE 390 px, AR 320 px, le départ Google bloqué avant fournisseur, l'inscription complète avec langues, leur modification/persistance, et l'export/suppression synthétique.

Après adaptation de l'attente de la sonde profil, `npx playwright test --config=audit2-sondes.config.js` : **deux échecs attendus aux assertions métier**, confirmant C2-01 et C2-02 (pas d'échec de montage). Journaux initiaux et finaux distincts. Les sept autres scénarios n'ont pas été rejoués.

Contrôle final : `npx playwright test --config=audit2-paiement.config.js` : **3/3 verts en 9,7 s**. Réponse de paiement A après déconnexion sans redirection ; nouvelle identité avec nouvelle offre et consentement remis à zéro ; délai borné avec reprise. Total des réussites distinctes : **81 parcours** (71 + 7 + 3). Les deux sondes de défaut sont comptées séparément. Aucune suite générale entière rejouée.

## Défaut reproduit C2-01 — retrait parent bloqué par un corps JSON suspendu

**Priorité proposée P1 (consentement/confidentialité), reproduction synthétique sur compilation publiée.**

1. Compte fictif A, `/moi?section=reglages`, activer « Partager ma progression ».
2. La publication `POST child_stats` reçoit une réponse HTTP avec ses en-têtes, mais son `ReadableStream` JSON ne se termine pas.
3. Désactiver le partage ; le switch affiche `aria-checked=false`. Faire avancer l'horloge navigateur de **60 secondes**.
4. Aucun `DELETE child_stats` supplémentaire n'est envoyé. Libérer enfin le corps `[]` du POST : le DELETE attendu arrive.

Le résultat observé `deletesBeforeRelease=0` déclenche l'assertion du scénario original `audit2-nouvelles.spec.js` (« parent : retrait quand le corps de publication reste suspendu »). Le DELETE après libération sert de contrôle : la suppression est bien attendue dans cette file, elle n'était pas oubliée par le montage du test.

Cause relue : `app/src/parent.js:89` attend `res.json()` après `send()`. Le délai réseau de `app/src/reseau.js` entoure seulement la récupération de la réponse ; il est déjà désarmé pendant la consommation du corps. La file `ordonner()` attend cette promesse avant de lancer la suppression. Une réponse incomplète peut donc conserver l'instantané serveur sans limite alors que le partage est affiché désactivé. Aucun état réel de production n'a été lu ni modifié ; la conservation effective en base reste une conséquence conditionnelle si le POST a déjà été appliqué.

Preuves : `nouvelles.log`, `nouvelles.json`, `preuve-initiale.json`, `preuve-finale.json`, pièce jointe `preuve`, trace `nouvelles-traces/audit2-nouvelles-parent-re-7152d--publication-reste-suspendu/trace.zip`. Aucune correction apportée. À traiter : borner aussi la lecture du corps de publication afin que la file atteigne son retrait, et garder la garantie d'ordre POST puis DELETE.

## Défaut reproduit C2-02 — une sauvegarde de profil A tardive remplace le profil local de B

**Priorité proposée P1 (isolation entre comptes), reproduction synthétique sur compilation publiée.**

1. Compte A, `/parametres?rubrique=compte&reglage=profil`, saisir le prénom « Ancien A » et enregistrer.
2. La réponse du `POST profiles?on_conflict=id` a livré ses en-têtes ; suspendre son corps JSON.
3. Déclencher le changement de session vers le compte fictif B par l'événement de stockage utilisé entre onglets. Attendre `account.id=B` et `profile.firstName=Bob` dans la progression locale. L'application redirige normalement vers l'accueil.
4. Libérer le corps JSON de la réponse A. Après 500 ms, la progression locale contient toujours `account.id=B`, mais le profil est devenu `{"firstName":"Ancien A","lastName":"Test"}`.

La pièce `identite-finale.json` atteste cette combinaison. L'assertion finale attend Bob et reçoit Ancien A. Aucun rôle ni identifiant de compte n'est modifié par la sonde : le défaut confirmé porte sur le profil local. Une éventuelle propagation réelle en base n'a pas été testée.

Cause relue : `app/src/auth.js:276` consomme le corps JSON dans `upsertProfile()` sans revérifier l'identité après cette attente ; `app/src/pages/Settings.jsx:42` appelle ensuite le `setProfile` global avec les valeurs fermées sur l'ancien compte. La clé React par compte démonte le formulaire, mais n'annule pas cette continuation globale.

Preuves : `sondes-finales.log`, `sondes-finales.json`, `identite-finale.json`, trace `sondes-finales-traces/audit2-nouvelles-profil-co-74c3e--A-tardif-après-passage-à-B/trace.zip`. Scénario complet conservé dans `audit2-nouvelles.spec.js`. Aucune correction apportée. À traiter : garde d'identité après lecture du corps et avant la mutation du profil courant.

## Test/outillage et risques non confirmés

- Le premier essai de C2-02 attendait un champ Prénom après le changement de compte ; la navigation normale revient à l'accueil. Cette attente était un défaut de la sonde. Après remplacement par la vérification du profil stocké, le scénario atteint l'assertion finale et reproduit C2-02 ; les deux journaux sont conservés.
- C2-01 a été reproduit deux fois. Son POST est simulé directement dans `fetch` pour délivrer les en-têtes et suspendre le corps : il ne figure donc pas comme requête routée dans `calls`. Le scénario vérifie explicitement `__postStarted`, le nombre de DELETE avant/après libération, et la trace montre cet ordre. Le DELETE initial du montage est soustrait du compteur.
- Aucun autre bug produit confirmé dans les contrôles sélectionnés. Les intégrations réelles et la concurrence entre appareils sont des limites de certification, pas des bugs supplémentaires établis.

## Limites

- Couverture ciblée des principales familles, sans prétention d’épuiser chaque combinaison : acceptation/retrait d’amitié, toutes les phases de duel en direct et tri détaillé du classement n’ont pas été exercés individuellement dans ce passage. Classement : accès, navigation et garde de session ; fonctions réseau relues. Les alternatives pédagogiques ne constituent ici qu’un passage bref indépendant.

- RLS, fonctions SQL réellement appliquées, migrations et droits des rôles en production non interrogés. Les migrations du dépôt montrent des prédicats d'identité et des restrictions d'exécution des quotas, mais cette lecture ne certifie pas leur déploiement.
- Aucun vrai aller-retour Google/Supabase, confirmation d'e-mail, récupération du mot de passe par mail, Stripe Checkout/portail/webhook, abonnement facturé ou quota atomique en base réellement consommé.
- Concurrence entre appareils et état historique des codes ami/parent non certifiés ; le séquencement observé concerne ce client JavaScript.
- Chromium seulement ; pas de Safari/iOS réel, clavier d'assistance ou lecteur d'écran humain. FR/DE/AR contrôlés sur les chemins précisés ; aucune certification linguistique exhaustive.
