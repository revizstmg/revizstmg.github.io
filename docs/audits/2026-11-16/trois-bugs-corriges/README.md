# Trois régressions corrigées

Suite à la [recherche ciblée](../recherche-ciblee/README.md), les trois défauts reproduits sont corrigés par la [PR 228](https://github.com/revizstmg/revizstmg.github.io/pull/228), fusionnée dans `402402c313d90ba6f62fb50939ef697a8458615d`.

## Comportements corrigés

- **Résultat différé :** le jeu Ordre annule son délai de fin au démontage. GameHost vérifie aussi que l’exercice est encore ouvert, que son joueur initial est toujours celui du store et que la session correspond. Un résultat de A ne peut donc plus créditer B lors d’un changement de compte entre onglets.
- **Reprise Vrai/Faux :** l’objet de reprise reste stable quand la progression se met à jour. La question déjà répondue, son choix et sa correction restent associés.
- **Suppression :** toute la tentative locale de désactivation des notifications est bornée à six secondes (trois secondes pour l’attente du service worker). Les réponses tardives ne déclenchent pas de nouvelles opérations après expiration ou changement de compte. La suppression peut poursuivre son RPC, qui retire également les abonnements push du compte côté serveur. Un échec serveur conserve la session et rend le bouton disponible ; il n’est pas présenté comme une suppression réussie.

## Vérifications locales

- Huit nouveaux tests unitaires couvrent quatre attentes silencieuses, une désactivation réussie, une réponse tardive, un changement d’identité et un refus natif.
- Quinze tests unitaires ciblés réussis (notifications et délais du profil). Les cinq tests des pages de cours avaient également réussi lors de la première passe ; seul un matcher non disponible de la nouvelle suite avait échoué et a été corrigé avant la nouvelle exécution.
- Sept nouveaux parcours navigateur réussis : deux blocages natifs, reprise Vrai/Faux stable, changement de compte pendant Ordre, fin normale créditée une seule fois, sortie avant le résultat et suppression refusée par le serveur.
- Les sept nouveaux parcours passent également sur ordinateur.
- Quatre parcours des corrections précédentes réussis : partage parental et stabilité des propositions.
- Compilation réussie. Aucun contrôle supprimé.

## Périmètre

Les parcours utilisent des comptes fictifs et des services simulés, sans écriture réelle dans Supabase, paiement, message ou appel d’IA facturé. Aucun changement des données de NAH, du schéma Supabase, des cours, du design ou des abonnements. Ces tests techniques ne constituent pas une certification pédagogique du site.

## Validation générale et publication

- [CI complète 43891276463](https://github.com/revizstmg/revizstmg.github.io/actions/runs/43891276463) réussie : **885 tests unitaires en UTC**, **885 à l’heure de Paris**, compilation et **438 parcours navigateur**. [Extrait des résultats](preuves/ci-extrait.log).
- Compilation publiée automatiquement dans `6592783c46731d93f9f973841d7d8e90a07e232a`.
- [GitHub Pages 43893910668](https://github.com/revizstmg/revizstmg.github.io/actions/runs/43893910668) réussi.
- Contrôle après publication : **15 fichiers publics sur 15 identiques à Git**, dont GameHost et Profile ; [empreintes](preuves/fichiers-publics.json).
- Les **sept parcours ciblés rejoués sur le site public réussissent**, avec services externes simulés et profils fictifs : [résultats](preuves/parcours-publics.log). Ils vérifient le code réellement servi sans supprimer de compte réel.
