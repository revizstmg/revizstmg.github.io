# Corrections de la seconde relecture économique

Demande du 7 novembre 2026 : corriger les huit points et les quatre nuances de la [seconde relecture](audits/2026-11-06/economie-seconde-synthese.md). Travail depuis `0bf976a90f3a4a58053df3be7f4c89a74ccae08c`, sans modification du design, des PDF officiels ou de Supabase.

| Référence | Correction |
| --- | --- |
| E2-01 | Tri `p1-eco-t4-tri` déplacé de la section 4 (banques seules) à la section 7 (financement interne, direct et indirect). Les réponses restent dans le périmètre du chapitre. |
| C2-01 | L’activité dissimulée fait l’objet d’estimations intégrées aux comptes nationaux ; distinction avec les services domestiques non rémunérés. |
| C2-02 / E2-02 | Obligation : créance, rémunération prévue au contrat, coupons fixes ou variables et cas particuliers, risques de défaut et de perte en capital. Retrait de la sûreté absolue. |
| E2-03 | Critères BIT harmonisés dans les définitions, tableaux, rappels, cours et étude documentaire : absence d’emploi, disponibilité sous deux semaines, recherche active récente ou emploi déjà trouvé commençant dans moins de trois mois. |
| C2-03 | Taux directeurs : dépôt, refinancement et prêt marginal. Le taux de refinancement n’est plus la définition de tous les taux directeurs. |
| E2-04 | Dénominateurs : population active pour chômage ; population de la tranche d’âge retenue pour activité et emploi. |
| E2-05 | Retrait du marqueur « cet exemple » en gras et définition BIT autonome avant la conclusion de l’exemple. Les trous générés ne demandent plus ce marqueur. |
| C2-04 | Facteur travail incluant les non-salariés ; capital fixe corporel et incorporel, notamment les logiciels. |
| N2-01 | L’investissement inclut l’acquisition, le renouvellement et l’amélioration, y compris le remplacement sans augmentation du stock net. |
| N2-02 | IDH présenté comme combinaison de trois dimensions, sans donner leur somme comme formule de calcul. |
| N2-03 | Introduction sur la dette harmonisée : les déficits contribuent à son évolution, avec d’autres opérations financières. |
| E2-06 | Effets de l’inflation sur le pouvoir d’achat conditionnés à l’évolution des revenus, dans le QCM et les paragraphes correspondants. |

Les index d’exercices et de missions ainsi que les empreintes du contenu sont régénérés après ces changements pédagogiques voulus. Les tests vérifient le rattachement réellement servi, les trous et bonnes réponses générés sur plusieurs graines, ainsi que les principales contradictions entre couches.

## Sources

Sources des deux rapports, vérifiées à nouveau pour les corrections principales :

- [Insee, chômage BIT](https://www.insee.fr/fr/metadonnees/definition/c1129).
- [Insee, activité dissimulée en base 2020](https://www.insee.fr/fr/metadonnees/source/fichier/fichemethodo1_B2020_activite_dissimulee.pdf).
- [Ministère de l’Économie, obligations](https://www.economie.gouv.fr/particuliers/gerer-mon-argent/gerer-mon-budget-et-mon-epargne/placements-quest-ce-quune-obligation).
- [BCE, facilité de dépôt et autres taux directeurs](https://www.ecb.europa.eu/ecb-and-you/explainers/tell-me/html/what-is-the-deposit-facility-rate.fr.html).
- [Insee, FBCF et actifs corporels/incorporels](https://www.insee.fr/fr/statistiques/8068590).
- [PNUD, dimensions de l’IDH](https://hdr.undp.org/data-center/human-development-index).

Les chiffres des cas pratiques et les PDF historiques ne sont pas réécrits. Les tests ne constituent pas une certification professorale exhaustive ; les résultats de validation et la diffusion sont consignés dans `docs/COORDINATION.md`.

## Livraison vérifiée

PR [#185](https://github.com/revizstmg/revizstmg.github.io/pull/185), source `3dff085822a9fd806315f61e4717b5f15f964ad1`, compilation `fa094850583268fd7a7b3bccf4a0c55b11bbf5de`.

- 39 contrôles ciblés réussis ; 779 tests généraux locaux réussis.
- CI [42351443674](https://github.com/revizstmg/revizstmg.github.io/actions/runs/42351443674) : 779 tests UTC, 779 à Paris, compilation et 392 parcours navigateur réussis, sans reprise signalée.
- Diffusion Pages réussie. Index et douze contrôles publics sur onze URLs distinctes conformes aux fichiers compilés, HTTP 200 et empreintes identiques : [preuves](audits/2026-11-06/economie-seconde-public-corrige.json).

Les deux fichiers de contenu actifs sont identifiés dans le précache du service worker, puis comparés aux fichiers publics : le tri est associé à la section 7 et le marqueur en gras « cet exemple » est absent. Les empreintes sont comparées au commit compilé déposé par la CI. Ces contrôles ne revendiquent pas une validation réelle des fournisseurs IA ou de Supabase ; ces services n’ont pas été modifiés dans ce lot.
