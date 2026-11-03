# Audit 03 — Boutique et récompenses

Version gelée : `f0f70220fd34f6fbba1d6416f3c99e6a0cd3e1e7`, source `05bd1531da93f095780ec1492b756459153a722a`. Audit local de la compilation publiée, serveur statique port 4213 ; aucune compilation relancée, aucun fichier suivi modifié. Référence fournie : 691 unitaires UTC/Paris, 359 parcours, quatre contrôles publics ; ces résultats ne sont pas des exécutions de cet agent.

## Méthode et preuves

Worktree détachée `wt-03`, un worker Chromium Pixel7 à la fois, réseau externe bloqué par `app/tests/parcours/eleve.js`, données et abonnement synthétiques. Les captures produites pour cet audit sont limitées au viewport. Aucun mail envoyé, lien mailto non ouvert, paiement, activation commerciale, utilisateur réel ou mutation Supabase. Aucun autre rapport contemporain lu, aucun sous-agent, aucune correction ni commit.

Commandes (dans `wt-03/app`) :

- `./node_modules/.bin/playwright test -c audit03.config.js audit03-boutique audit03-missions serie-et-gels --grep-invert 'mission traduite'`
- `./node_modules/.bin/playwright test -c audit03-nouveau.config.js audit03-nouveau.spec.js audit-b3.spec.js parametres-recompenses.spec.js --grep 'gratuit frontière|double événement|défi complet|badges disponibles|récompense utile'`
- `./node_modules/.bin/vitest run tests/shop.test.js tests/reward-kit.test.js` : **12 réussis**, deux fichiers, 42,50 s.
- `./node_modules/.bin/vitest run tests/fusion.test.js -t 'récompense de la semaine' --maxWorkers=1 --minWorkers=1` : **1 réussi**, 22 non sélectionnés, 16,50 s. Il s’agit du seul cas hebdomadaire choisi, pas d’une suite complète validée.

Les tests boutique/missions sont des copies temporaires des scénarios existants ; seule leur capture pleine page est passée à `fullPage:false`. Scripts, configurations, journaux et extraits numérotés sont conservés dans `preuves-03/`.

## Résultats et couverture

Le premier lot est **10/10 réussi en 4,6 min**. Il couvre les achats virtuels et débits du catalogue, titre/bannière/palette équipés et conservés après rechargement, pièces insuffisantes, rareté verrouillée, pack de 3 gels, cadeau unique après rechargement, réservations des deux mois sans activation d’abonnement, missions 320 px clair/sombre (absence de débordement et contrôle axe), mission complète à 100 % avec XP attendus sans bonus arbitraire, défi assisté avec une manche à 0 % et conservation des étapes, horloge reculée et consommations de gels tout-ou-rien.

Le deuxième lot est **5/5 réussi en 1,2 min**, sans réessai ni scénario navigateur ignoré :

- Badges de Première : l’ancien badge de Gestion-Finance reste identifié comme ancien parcours ; sa description n’apparaît pas comme objectif actuel.
- Compte gratuit à 20 000 XP avec 19 thèmes à 100 % : carte Premium à 19/20 et 95 %, bouton désactivé, aucune réservation créée. La capture `frontiere-premium.png` montre ce refus et les conditions de vérification.
- Deux événements synchrones sur l’achat d’un titre à 200 pièces : un seul débit, un seul objet possédé. Deux événements sur la collecte du palier 700 XP : exactement 2 gels ; solde et gels restent identiques au rechargement.
- Défi quotidien joué entièrement : bonus ajouté aux XP et pièces une seule fois ; après rechargement, écran « Défi du jour relevé ! », aucun second gain. Capture du résultat conservée.
- Kit bac : collecte unique de 5 gels, téléchargement `revizstmg-kit-bac.pdf`, bouton PDF et gels conservés après rechargement.

**Bilan local : 15 scénarios navigateur distincts réussis, 13 cas unitaires ciblés réussis ; aucun défaut produit reproduit.** Les vérifications des tableaux `erreurs` du helper n’ont relevé aucune exception/erreur console applicative (les échecs réseau volontairement bloqués sont filtrés). Les refus attendus de pièces, niveau, nombre de thèmes et défi déjà fait ont été explorés. Le passage transversal inclut l’accueil, Mon espace et les badges, en plus des routes boutique/missions/défi.

Journaux complets : `preuves-03/parcours.log`, `parcours-nouveaux.log`, `unitaires.log`, `hebdomadaire.log`. Résultats structurés : `resultats.json` et `resultats-nouveaux.json` (10 puis 5 attendus,0 inattendu,0 instable,0 ignoré). Sept captures PNG : viewport uniquement ; leur taille en pixels tient compte du facteur DPR 2,625 du profil Pixel7. Aucun test en échec à rejouer.

## Intention produit et risques distincts

Les mois offerts sont des **réservations à faire vérifier**, pas des abonnements activés. Conditions cohérentes entre le catalogue (`src/data/shop.js:14`), l’écran (`src/pages/Shop.jsx:57`) et les CGU (`src/pages/Cgu.jsx:42`) : Premium 20 000 XP et 20 thèmes à 90 %, Ultimate 73 500 XP et 30 thèmes à 95 %, compte requis, une attribution par offre/compte, sans paiement ni renouvellement. Le scénario de réservation contrôle que le solde ne baisse pas et qu’aucun champ subscription n’est créé. La formulation de pré-lancement dans la notification de Shop est une intention annoncée, pas une preuve de dysfonctionnement.

Les gains, XP, scores et réservations sont calculés côté navigateur (`src/data/shop.js:18-50`, `src/store.jsx:742-762`). Une modification du stockage ou de l’horloge reste hors de l’intégrité d’un serveur. Le comptage local accepte les clés de thèmes fournies dans l’état ; cela ne certifie pas la réalité des résultats. Les CGU précisent que les XP locaux seuls ne valident pas un mois offert. Aucun contournement d’attribution commerciale réelle n’a été tenté ou reproduit. La procédure humaine de vérification et son caractère opposable côté serveur restent non certifiés.

La fonction personnelle `claimWeekly` (objectif 5, bonus 60) existe et refuse la collecte répétée selon le marqueur de semaine ; aucune invocation depuis les pages/composants n’a été trouvée par recherche de code. L’ancien contrôle UI hebdomadaire n’est donc pas certifié par cet audit. Le test ciblé confirme seulement que la fusion conserve le marqueur déjà réclamé. Ne pas confondre cette fonction résiduelle avec l’objectif collectif de classe.

## Limites et outillage

La première commande de préparation utilisait un chemin relatif depuis app au lieu de la racine ; elle a échoué avant le lancement navigateur puis a été corrigée. Aucun résultat produit associé. Les éventuels ralentissements sont mesurés dans les journaux, sans assimilation automatique à un bug. L’audit ne certifie ni règles Supabase réellement déployées, ni synchronisation multi-appareils réelle, ni toutes les combinaisons de paliers, langues et dates.

Fin du worker navigateur : 2026-11-02 à 19:11:55 UTC. `git diff --exit-code` et `git diff --check` réussis : aucun fichier suivi modifié. Les seuls fichiers de la worktree ajoutés sont la liaison node_modules et les scripts/configurations temporaires, copiés dans les preuves.
