# Corrections des exercices et programmes

Périmètre : les 26 constats EX et quatre précisions NU du [rapport initial](AUDIT-EXERCICES-PROGRAMMES-20261107.md). PR #188 et complément #189. Les références primaires et contre-exemples restent consultables dans ce rapport et `audits/2026-11-07/`.

| Points | Correction |
| --- | --- |
| EX01–03 | Correcteur linguistique respectant les accents, variantes anglaises et italiennes, productions ouvertes autoévaluées face au corrigé. Distinction arabe مَن / مِن préservée quand elle est explicitement demandée. Cinq PDF régénérés. |
| EX04 | Tolérances compatibles avec les arrondis demandés ; seuil de rentabilité explicitement arrondi à l’euro. |
| EX05 | Listes d’exemples résolus exclues de l’extraction des définitions générales. |
| EX06 | Astérisque SQL préservé par le nettoyage Markdown. |
| EX07 | Expressions chronologiques équivalentes regroupées pour exclure les distracteurs également corrects. |
| EX08–09 | Monotonie distinguée de la stricte monotonie ; premier dépassement des effectifs corrigé au rang 11. |
| EX10 | Discriminant et formule du sommet retirés des exercices attendus en Première ; factorisation et lecture des racines privilégiées. |
| EX11–12 | Ancien thème Terminale sur loi normale et confiance retiré de la navigation et remplacé par exponentielles et logarithme décimal ; statistiques à deux variables et ajustement affine ajoutés en Première. Nouveau thème math-c8 pour ne pas réutiliser la maîtrise de l’ancien math-c7. Formules associées actualisées. |
| EX13–15 | Valeur ajoutée commerciale, CAF/autofinancement, amortissement et hypothèse de valeur résiduelle harmonisés. |
| EX16–17 | TVA énergétique datée et contextualisée ; formulaire CA3 rattaché au régime réel normal, distinction CA12. |
| EX18–20 | Responsabilité limitée rattachée aux SARL/SAS ; exceptions à l’indemnité de CDD ; quatre effets possibles du contrat selon l’article 1101. |
| EX21–23 | Diversification définie par le nouveau DAS ; liberté et libre arbitre distingués chez Spinoza ; définition du génocide complétée. |
| EX24 | PIB aux prix du marché intégrant les impôts nets de subventions sur les produits ; dette distinguée du cumul simplifié des déficits. |
| EX25 | Communication formelle orale ou écrite, y compris transversale. |
| EX26 | Comparaison SQL conservant les littéraux et acceptant les alias simples, sans accepter une autre requête ni une instruction supplémentaire. |
| NU01–04 | BFR/BFRE distingués ; seuils financiers contextualisés ; indicateurs sociaux sans causalité automatique ; réforme électorale de 1962 distinguée du premier scrutin direct de 1965. |

Les deux catalogues de formules restent distincts : l’aide-mémoire conserve ses notions qualitatives, l’atelier ses calculs paramétrés. Les notions hors programme retirées concernent les entrées mathématiques identifiées, sans suppression des autres matières.

## Vérifications

Contrôles ciblés : 28 tests réussis dans trois fichiers, dont dix nouvelles régressions. Les cinq PDF de langues ont été régénérés et leur texte extrait vérifié (71 000 à 92 000 caractères selon la langue). Suite générale initiale : **791 tests réussis dans 84 fichiers**. Après le complément de traduction : **792 tests réussis dans 84 fichiers**. Index des missions : dix tests réussis dans un processus neuf ; logique et empreintes intentionnelles : 94 tests réussis. Compilation complète : 857 pages publiques générées. Les deux suites UTC et Paris de la PR ont également réussi. Publication confirmée après le workflow main. Les tests supplémentaires rejouent les contre-exemples de langues, de SQL et de génération, contrôlent les programmes actifs et recomputent indépendamment les nouveaux calculs sur plusieurs graines.

Aucun changement de Supabase, aucune donnée réelle d’élève, aucun appel payant de correction. Le design et les PDF officiels des examens sont conservés. Cette correction des constats identifiés ne constitue pas une certification individuelle de toutes les sorties automatiques futures.


## Complément de validation navigateur

La première CI de la PR #188 a réussi les deux suites unitaires et 388 des 392 parcours. Quatre parcours ont révélé un nombre de formules attendu devenu obsolète et huit nouveaux libellés manquant dans les dictionnaires hors ligne. La publication a été interrompue avant livraison. La PR #189 ajoute les traductions dans les cinq langues et actualise le compteur attendu à 161 formules/805 questions ; aucun contrôle n’est supprimé.

Après correction : 27 tests de traduction et les six parcours Formules/Hors ligne sont réussis localement, sans reprise. Les contrôles hors ligne comprennent Première, Terminale et professeur. Le premier parcours navigateur général local avait été interrompu volontairement après 91 réussites pour libérer le processeur ; il n’est pas compté comme une suite complète. La référence complète de livraison est la CI finale de main.

Source fusionnée : `8fff5f15ac8a7c8949773b26623e04a3fbcbafe9`. Workflow final : `42380729414`. Compilation publiée : `2a623b2b8920beb1c7876cbcd6136b25ebd3abff`. La CI finale `42380729414` est réussie : **792 tests UTC, 792 tests à Paris et 392 parcours navigateur**, sans reprise signalée. GitHub Pages `42381922251` est réussi.

Contrôle public le 2026-11-07T14:31:34.658470+00:00 (UTC) : **18 URLs HTTP200**, empreintes identiques au commit compilé. Index SHA256 : `91df634e529161f148c89dd0e68568765cdfba9b6358d09fa1590475c7682371`. Vérifications comprenant les cinq manuels PDF, les cinq dictionnaires de traduction, le service worker, les contenus maths/Première/GF et la nouvelle page d’exponentielles. `math-c8` est présent dans le contenu actif de Terminale ; `math-c7` en est absent. [Preuve JSON](audits/2026-11-07/corrections-public.json), [script de reproduction](audits/2026-11-07/verifier-public-corrige.py).
