# Livraison finance, ECT et écoles de commerce

Six voies d’études et dix rubriques financières/poursuites ont été ajoutées au bilan Avenir : six domaines de la finance et quatre chemins vers les écoles ou spécialisations. Les 80 questions, leurs identifiants, les réponses enregistrées et le calcul des notes sont conservés. Documentation et sources : [Parcours Avenir](../../../PARCOURS-AVENIR.md).

- PR #218, source `1aae6fcce`, fusion `77673ed0d`.
- CI 43714780618 : 858 tests réussis en UTC, 858 à Paris, 419 parcours navigateur.
- Compilation `ac129e243a153f5c6de484bab5ce021e77c89a60`, Pages 43716385031 réussi.
- `publication.json` : comparaison octet par octet des fichiers publics et de la compilation.
- `public-mobile.json` : bilan, six voies, détail ECT, notes, restauration et démarches avec données fictives, services réels bloqués.
- `local-mobile-print.json` et `pdf-check.json` : absence de débordement, copies réservées à l’impression, dix rubriques retrouvées dans le PDF réel de neuf pages.
- `sources-http.json` : sept pages sources HTTP200 ; deux pages ministérielles refusent le client HTTP automatisé (403), mais ont été ouvertes et lues par l’outil web. Le fichier ne prétend pas que les neuf contrôles HTTP ont réussi.

La première suite locale a terminé avec 854 réussites et un délai interne RPC sur le worker missions. Reprise ciblée : 41 contrôles réussis, puis les 858 ont tous passé dans les deux fuseaux en CI. Aucun contrôle supprimé. Les traductions initiales automatiques ont été retouchées pour les noms de diplômes et le post-bac ; pas de certification par des locuteurs.

Ces parcours sont des possibilités à comparer, pas des garanties d’admission ou d’emploi. Les visas/grades cités sont datés et doivent être vérifiés à la candidature. Les cinq bugs identifiés par les trois audits précédents restent hors du périmètre de cette livraison. Aucune donnée réelle, Supabase/NAH, transaction ni génération IA touchée.
