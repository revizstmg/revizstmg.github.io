# Audit des PDF d’examens et d’annales

Date : 7 novembre 2026. Audit en lecture seule sur origin/main après PR #200. Aucun fichier produit modifié, aucune correction IA réelle lancée, aucune donnée élève utilisée.

## Résultat

58 PDF téléchargés et ouverts : 48 sujets/corrigés préconçus, 4 dossiers officiels du Prix de l’excellence économique, 6 annales nationales de 2026. Aucun PDF interne manquant, aucune page vide, aucun total de barème erroné constaté. Un défaut certain de rendu affecte deux corrigés. Un défaut de pagination entraîne une page presque vide dans au moins un nouveau sujet. Les améliorations de diversité sont distinguées des erreurs.

## Défauts confirmés

### PDF-E1, important : calcul du chômage corrompu dans deux corrigés

- https://revizstmg.github.io/sujets-prets/terminale-economie-corrige.pdf : page 2, question 1.
- https://revizstmg.github.io/sujets-prets/terminale-droit-economie-corrige.pdf : page 4, question 7 (partie économie).
- Attendu : `8 000 / 104 000 × 100 ≈ 7,69 %`. Le calcul mathématique est juste.
- Réel : la ligne contenant `≈` est affichée avec des lettres très espacées, un symbole parasite `"H` et se prolonge au-delà du bord droit ; la fin de la phrase est rognée. Extraction PyMuPDF : 72 caractères NUL sur cette ligne ; boîte de texte jusqu’à x=597,97 points pour une page large de 595,28 points. Rendu image inspecté : `/tmp/pdf-examens-audit/overflow.png`.
- Cause : `app/src/data/examPdf.js` utilise Times standard sans police Unicode ; `clean` normalise les tirets et flèches mais pas `≈`. Les autres 46 PDF préconçus n’ont pas présenté ce défaut dans le contrôle d’extraction.
- Correction proposée : normaliser explicitement les symboles mathématiques en texte compatible, par exemple « soit environ », ou embarquer une police Unicode ; ajouter un test de rendu/extraction portant sur ce cas et sur tous les symboles acceptés pour les examens personnalisés. Ne pas changer le résultat numérique.

### PDF-E2, modéré : page presque vide dans le sujet Rivage

- https://revizstmg.github.io/sujets-prets/revision-management-premiere-terminale-1-sujet.pdf : page 3 sur 5.
- Cette page ne contient que les questions 9 et 10, puis un grand blanc ; texte extrait 354 caractères, dernier bloc du corps vers y=206 points sur 842. Le dossier commence obligatoirement sur la page 4 ; ses documents 7 et 8 occupent encore une page 5 peu remplie.
- Cause : espaces avant chaque titre/question et saut forcé avant le dossier dans `buildExamPdf`.
- Correction proposée : compacter le bloc des questions et autoriser le dossier à suivre si l’espace suffit, tout en gardant des titres et paragraphes ensemble. Viser 4 pages plutôt que 5 pour ce sujet, après mesure, sans retirer de contenu. Le cas n’est pas une perte de question : les dix sont présentes.

## Améliorations pédagogiques, non erreurs factuelles

1. Les cinq anciens sujets combinés (les quatre Droit-économie par niveau et `terminale-management-bilan`) réutilisent les documents/questions des sujets simples. Par exemple Cycléo et Nova sont repris dans le bilan management ; Emma et le ménage R sont repris dans le premier combiné de Première. Un élève ayant déjà fait les simples retrouve donc des réponses identiques. Signaler « compilation » et les sujets sources, ou à terme écrire des cas spécifiques. Les quatre nouvelles révisions transversales sont distinctes ; elles ne sont pas concernées par cette copie intégrale.
2. Plusieurs documents livrent déjà la distinction demandée presque mot pour mot. Exemple Rivage document 5 (page 4) énonce les risques du flux poussé/tiré, précisément demandés à la question 5 ; Terminale droit 2 document 2 énonce les trois éléments du contrat de travail demandés à Q2. C’est utilisable comme entraînement guidé, mais trop assisté pour une simulation diagnostique. Ajouter progressivement des annexes brutes (données, échanges, graphiques) et réserver les définitions au corrigé.
3. Les 24 sujets prêts ne couvrent pas l’intégralité des programmes et ne constituent pas des épreuves officielles complètes ; les PDF l’annoncent correctement (60/120 minutes, entraînement non officiel). Conserver cet avertissement. Les annales officielles restent les seules simulations de quatre heures à documents originaux.
4. Le Prix ne propose actuellement que les sessions 2021-2022 à 2024-2025. La session 2025-2026 sur l’épargne n’est pas référencée dans `excellence-subjects.js`. Complément de catalogue à rechercher auprès d’une source officielle, sans inventer un PDF ni relabelliser une ancienne session.

## Contrôles pédagogiques et techniques

- Lecture des dossiers/corrigés sources des 24 sujets ; comparaison des contenus et références, contrôle des 24 sommes de points =20 et des sommes des critères de chaque question. Aucun écart trouvé.
- Recalculs : patrimoine 1350−200=1150 et7000−3500=3500 ; revenu disponible2900, épargne435, taux15%, pouvoir d’achat1,04/1,05−1≈−0,95% ; financement30000/35000/40000 selon cas ; chômage8000/104000≈7,69% et12000/120000=10% ; commerce−10/90% et−30/80% ; croissance3% ; TVA4800−2800=2000 ; amortissement2400/VNC7200 ; FRNG40000/BFR25000/TN15000 ; MCV40000/seuil75000/résultat10000 ; marge90000/VA65000/CAF24000/rentabilités15% et20% ; Rivage VA250000. Aucun calcul faux trouvé sur ces dossiers.
- Droit : vérification de cohérence des distinctions acte/fait, charge de la preuve, personnalité/patrimoine, propriété, contrat, responsabilités, subordination, CDI/CDD/rupture. Les corrigés n’affirment pas une décision judiciaire certaine ni une indemnité inventée.
- Les quatre nouvelles révisions ont chacune10 questions,5 de Première/5 de Terminale, et les deux Droit-économie ont5 questions par discipline ; références et avertissements de niveau présents.
- PDF sujets et corrigés séparés ; aucune correction trouvée dans le sujet. Toutes les pages des PDF internes ont un texte extractible. Extraction et pagination contrôlées sur les52 PDF internes ; vignettes de page2 des52 et couvertures/dernières pages représentatives inspectées ; inspection agrandie du défaut E1. Il ne s’agit pas d’une lecture visuelle à fort zoom de chaque page.
- Annales : les6 téléchargements officiels réussissent avec curl et User-Agent navigateur. urllib sans User-Agent retournait403 : ce refus de client automatisé n’a pas été classé comme lien cassé.
- Les pages/codes Métropole ne sont pas incorrectement réutilisés pour les autres centres : `AnnalesBac.jsx` affiche « Annexes incluses » et un libellé PDF générique hors Métropole. Aucun défaut retenu à ce sujet.
- Prix : les4 fichiers locaux correspondent aux SHA256 épinglés côté serveur ; les originaux2021,2022,2023 ont été récupérés et sont identiques octet pour octet. Le site académique hébergeant l’original2024 a expiré après25s dans ce contrôle ; le miroir RévizSTMG répond et son empreinte est correcte. Session/titre/pages vérifiés sur les dossiers eux-mêmes. Ne pas conclure que la source2024 est définitivement cassée.

## Périmètre dynamique et limites

Les PDF d’examens personnalisés réutilisent le générateur `examPdf.js` : ils sont concernés par le risque de symboles Unicode E1. Aucune génération IA payante, copie d’élève ni correction réelle n’a été sollicitée. Le contenu arbitraire produit par le modèle ne peut pas être certifié par cet audit statique. Le sujet mathématiques interactif n’a pas de lien PDF d’examen propre dans `SujetMaths.jsx` : il ne fait pas partie des58 fichiers ; seul le lien BO PDF est une ressource de référence, à contrôler dans le périmètre des textes officiels avec l’autre agent. Les kits boutique relèvent également de l’autre agent. Les annales officielles sont consultées pour complétude, identité et lisibilité, pas réécrites ni recorrigées ici ; leurs corrigés officiels ne sont pas distribués sur la page et celle-ci le précise. Cet audit ne vaut pas certification par un professeur.

## Inventaire des sujets prêts (chaque ligne =2 PDF)

| ID | Pages sujet | Pages corrigé |
|---|---:|---:|
| `premiere-droit` | 3 | 3 |
| `premiere-droit-2` | 3 | 3 |
| `premiere-droit-economie` | 5 | 5 |
| `premiere-droit-economie-2` | 5 | 5 |
| `premiere-management` | 3 | 3 |
| `premiere-management-2` | 3 | 3 |
| `premiere-gestion` | 3 | 3 |
| `premiere-gestion-2` | 3 | 3 |
| `premiere-economie` | 3 | 3 |
| `premiere-economie-2` | 3 | 3 |
| `terminale-droit` | 3 | 3 |
| `terminale-droit-2` | 3 | 3 |
| `terminale-droit-economie` | 5 | 5 |
| `terminale-droit-economie-2` | 5 | 5 |
| `terminale-gf` | 3 | 3 |
| `terminale-gf-2` | 3 | 3 |
| `terminale-management` | 3 | 3 |
| `terminale-management-bilan` | 5 | 5 |
| `terminale-economie` | 3 | 3 |
| `terminale-economie-2` | 3 | 3 |
| `revision-management-premiere-terminale-1` | 5 | 5 |
| `revision-management-premiere-terminale-2` | 5 | 5 |
| `revision-droit-economie-premiere-terminale-1` | 5 | 5 |
| `revision-droit-economie-premiere-terminale-2` | 5 | 5 |

## Dossiers officiels contrôlés

| Ressource | Pages | Accès |
|---|---:|---|
| [excellence-2023.pdf](https://revizstmg.github.io/excellence/2023/sujet.pdf) | 11 | PDF ouvert |
| [excellence-2024.pdf](https://revizstmg.github.io/excellence/2024/sujet.pdf) | 10 | PDF ouvert |
| [excellence-2022.pdf](https://revizstmg.github.io/excellence/2022/sujet.pdf) | 13 | PDF ouvert |
| [excellence-2021.pdf](https://revizstmg.github.io/excellence/2021/sujet.pdf) | 12 | PDF ouvert |
| [annale-droit-et_1.pdf](https://www.education.gouv.fr/sites/default/files/document/baccalaureat-technologique-2026-sciences-et-technologies-du-management-et-de-la-gestion-droit-et_1.pdf) | 8 | PDF ouvert |
| [annale-droit-et_2.pdf](https://www.education.gouv.fr/sites/default/files/document/baccalaureat-technologique-2026-sciences-et-technologies-du-management-et-de-la-gestion-droit-et_2.pdf) | 8 | PDF ouvert |
| [annale-droit-et_0.pdf](https://www.education.gouv.fr/sites/default/files/document/baccalaureat-technologique-2026-sciences-et-technologies-du-management-et-de-la-gestion-droit-et.pdf) | 10 | PDF ouvert |
| [annale-management_1.pdf](https://www.education.gouv.fr/sites/default/files/document/baccalaureat-technologique-2026-sciences-et-technologies-du-management-et-de-la-gestion-management_1.pdf) | 15 | PDF ouvert |
| [annale-management_2.pdf](https://www.education.gouv.fr/sites/default/files/document/baccalaureat-technologique-2026-sciences-et-technologies-du-management-et-de-la-gestion-management_2.pdf) | 14 | PDF ouvert |
| [annale-management_0.pdf](https://www.education.gouv.fr/sites/default/files/document/baccalaureat-technologique-2026-sciences-et-technologies-du-management-et-de-la-gestion-management.pdf) | 13 | PDF ouvert |

Preuves de travail locales : `/tmp/pdf-examens-audit/inventory.json`, textes extraits et images de contrôle dans le même répertoire. Ces fichiers temporaires ne sont pas publiés.
