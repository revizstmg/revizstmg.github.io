# Corrections des exercices et programmes

Périmètre : les 26 constats EX et quatre précisions NU du [rapport initial](AUDIT-EXERCICES-PROGRAMMES-20261107.md). PR #188. Les références primaires et contre-exemples restent consultables dans ce rapport et `audits/2026-11-07/`.

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

Contrôles ciblés : 28 tests réussis dans trois fichiers, dont dix nouvelles régressions. Les cinq PDF de langues ont été régénérés et leur texte extrait vérifié (71 000 à 92 000 caractères selon la langue). Validation générale et publication à consigner après leur achèvement. Les tests supplémentaires rejouent les contre-exemples de langues, de SQL et de génération, contrôlent les programmes actifs et recomputent indépendamment les nouveaux calculs sur plusieurs graines.

Aucun changement de Supabase, aucune donnée réelle d’élève, aucun appel payant de correction. Le design et les PDF officiels des examens sont conservés. Cette correction des constats identifiés ne constitue pas une certification individuelle de toutes les sorties automatiques futures.
