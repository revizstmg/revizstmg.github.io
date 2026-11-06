# Audit économique des cours, 6 novembre 2026

Lecture indépendante des fichiers JSON Première/Terminale dans `app/content/p1-economie` et `app/content/economie`, avec recherche de contradictions entre couches. Aucun changement produit, aucune exécution de service réel, aucune suite générale. Les pointeurs ci-dessous sont des chemins JSON (index à partir de zéro). Ils désignent la source lue, pas une preuve que toute la couche est affichée dans chaque fiche.

## Erreurs à corriger

### 1. L’emprunt présenté comme cause comptable du déficit, importance 8/10

Fichier `economie/approfondi-1.json`, `/eco-t6/3/blocks/0/c` : « ce dernier alimente le déficit ». Le déficit est l’excès des dépenses sur les recettes publiques non financières ; l’emprunt le finance et accroît l’endettement, il ne crée pas comptablement le déficit. Proposition : « Lorsque les dépenses publiques dépassent les recettes, les administrations publiques enregistrent un déficit. Elles le financent notamment par l’emprunt, ce qui accroît généralement leur dette. »

Source officielle : [Ministère de l’Économie, dette publique](https://www.economie.gouv.fr/decryptage-5-minutes-pour-comprendre-la-dette-publique).

### 2. Production non marchande exclue du PIB, importance 9/10

`economie/approfondi-1.json`, `/eco-t9/0/blocks/3/c/0` affirme qu’il ignore le travail non marchand et la production gratuite. Même ambiguïté `economie/cours-complets.json`, `/eco-t9/cours/0/blocks/1/c`. Les services non marchands des administrations sont inclus au PIB, valorisés au coût de production. Proposition : « Le PIB inclut la production marchande et la production non marchande évaluée à son coût. Il ne mesure pas la plupart des services domestiques non rémunérés ni la valeur du bénévolat comme s’il s’agissait d’un travail salarié. » Éviter l’affirmation inverse selon laquelle absolument toute production gratuite serait comptabilisée.

Sources : [INSEE, production et consommation intermédiaire](https://www.insee.fr/fr/statistiques/4494161), [INSEE, contribution des administrations à la production](https://blog.insee.fr/dans-quelle-mesure-les-administrations-publiques-contribuent-elles-a-la-production-nationale/).

### 3. Dette et déficit publics réduits à ceux de l’État, importance 8/10

`economie/approfondi-4.json`, `/eco-actu/3/blocks/2/c` et le tableau `/eco-actu/3/blocks/4/rows/5` et `/6` ; flashcard dette publique `economie/matiere.json`, `/chapters/0/games/2/cards/3/back`. Le périmètre est l’ensemble des administrations publiques : État et organismes centraux, administrations locales et Sécurité sociale. Corriger les formulations « dépenses de l’État » et « ses emprunts » lorsqu’elles définissent les agrégats publics. Dans `economie/definitions.json`, le total des emprunts « cumulés » doit devenir les engagements restant dus pour ne pas inclure les emprunts déjà remboursés.

Sources : [Agence France Trésor, périmètre](https://www.aft.gouv.fr/fr/definition-perimetre), [INSEE, dette Maastricht](https://www.insee.fr/fr/statistiques/5354764?sommaire=5354786).

### 4. Épargne confondue avec capacité de financement, importance 9/10

`p1-economie/matiere.json`, `/chapters/3/intro`, `/chapters/3/cours/0/blocks/1/c`, tableau voisin, `/chapters/3/essentiel/0`, `/chapters/3/games/0/questions/0`, `/chapters/3/games/2/cards/0/back`. Le simple fait d’épargner ne suffit pas à dégager une capacité de financement : l’investissement peut dépasser cette épargne. Un ménage épargnant400 et investissant1000 a un besoin de600 dans un exemple simplifié sans transferts en capital. Proposition de question : « Un agent dispose d’une épargne de1000€ et investit600€. Il dégage… » réponse capacité de400€. Cours : « Dans un exemple simplifié, épargne supérieure à l’investissement : capacité ; inférieure : besoin. » Ne pas faire passer la formule simplifiée pour l’intégralité du compte de capital.

Source : [INSEE, investissement et solde du compte de capital](https://www.insee.fr/fr/statistiques/5412397?sommaire=5354786).

### 5. Étudiant ou retraité automatiquement inactif, importance 8/10

`economie/approfondi-1.json`, `/eco-t7/0/blocks/0/c` et `/4/c` affirment que les étudiants/retraités ne sont pas dans le calcul. `economie/cours-reels.json`, `/eco-t7/0/blocks/0/c` oppose ces statuts à la recherche d’emploi sans donner leurs critères. Un étudiant peut être en emploi ou chômeur BIT. Proposition : « Les étudiants ou retraités sans emploi et ne remplissant pas les critères du chômage sont inactifs. Leur statut ne suffit pas à les classer. » Revoir les tableaux correspondants (`cours-complets.json /eco-t7/cours/1/blocks/1`). Critères BIT : sans emploi, disponible dans les deux semaines, recherche active dans les quatre dernières semaines ou emploi trouvé commençant dans les trois mois.

Source : [INSEE, mesure du chômage, cas étudiant](https://www.bnsp.insee.fr/ark%3A/12148/bc6p06xswds.pdf).

### 6. Thème9 annoncé hors épreuve écrite, importance 9/10

`economie/cours-complets.json`, `/eco-t9/intro` : « Il n’est pas évalué à l’écrit mais alimente le grand oral ». Cette restriction historique ne doit pas être présentée comme règle actuelle. Le BO11septembre2026 applicable à la session2027 indique le programme Terminale en vigueur, sans exclusion du thème9. Proposition : « Ce thème appartient au programme de Terminale et peut être mobilisé à l’épreuve écrite ainsi qu’au Grand oral. » Vérifier les autres messages d’exclusion dans tout le site lors de l’intégration.

Source primaire actuelle : [BO spécial4, note du11septembre2026, §Droit et économie](https://www.education.gouv.fr/bo/2026/Special4/MENE2622652N).

## Actualisations et nuances importantes

### 7. Objectif BCE incomplet, importance 6/10

`economie/approfondi-2.json`, `/eco-t6/0/blocks/0/c` : « inflation proche de2% ». Préciser « objectif symétrique de2% à moyen terme ». Ce n’est pas une obligation de faire exactement2% chaque année, ni une simple limite supérieure.

Source : [Déclaration BCE2025](https://www.ecb.europa.eu/mopo/strategy/strategy-review/ecb.strategyreview202506_strategy_statement.fr.html).

### 8. Dette égale exactement accumulation des déficits, importance 6/10

`economie/approfondi-2.json`, `/eco-t6/2/blocks/1/c` donne une égalité comptable exacte sans ajustements ; `approfondi-1.json` et `cours-complets.json` utilisent aussi ce raccourci. C’est un mécanisme pédagogique utile, mais les acquisitions/cessions d’actifs et autres ajustements flux-stock modifient aussi la dette. Proposition : « Les déficits successifs contribuent à accroître la dette ; son évolution dépend aussi d’autres opérations financières. » Ne pas surcharger le niveau STMG avec le détail technique.

Source : [Banque de France, bulletin168, ajustements flux-stock](https://publications.banque-france.fr/sites/default/files/medias/documents/bulletin-de-la-banque-de-france_168_2007-12.pdf).

## Points transmis par le parent à harmoniser

Le parent corrige en parallèle PIB aux prix du marché (VA + impôts nets des subventions sur produits), croissance en volume, dividende non garanti, ressources propres versus autofinancement et bien public non défini par son producteur. Ces points doivent aussi être harmonisés dans les couches approfondies et les résumés. Ce rapport ne prétend pas avoir effectué les corrections.

## Limites

Contrôle documentaire, pas validation enseignant ni examen exhaustif de tous les exercices générés. Les exemples chiffrés fictifs n’ont pas été confrontés à des statistiques réelles lorsqu’ils sont clairement des exercices. Les simplifications admissibles ne sont pas toutes qualifiées de fautes. Les PDF officiels ne doivent pas être réécrits pour leur faire appliquer une règle actuelle à leur session historique. Aucun test/build lancé, aucune donnée réelle modifiée.

### Traçabilité du BO consulté

Source réellement ouverte avec l’outil web `mcp__codex_apps__search_service_web_run`, commande `open` sur l’URL du BO2026 ci-dessus ; première référence `turn300390view0`, seconde ouverture de confirmation `turn757655view0`, document HTML193lignes. Ce n’est pas une conclusion tirée d’un seul extrait de recherche. Ligne83 : application session2027 et remplacement du texte2020. Lignes128-135 : épreuve écrite droit-économie fondée sur le programme Terminale en vigueur, notions Première mobilisables. Ligne158 : dossiers sur un ou plusieurs thèmes du cycle terminal. Le texte d’origine comporte une coquille « Elle porte s’appuie », qui n’est pas une reformulation de l’audit. L’accès par HTTP de l’environnement peut renvoyer403 alors que la lecture par cet outil réussit. Cette différence d’accès ne constitue pas une preuve d’échec de consultation.
