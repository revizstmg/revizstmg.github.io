# Audit pédagogique des exercices, 7 novembre 2026

Base : `edc03a2cb0daf0021e07539ff1cca06405647bbe` (origin/main récupéré et contrôlé). Audit de la source assemblée localement ; pas de nouvelle mise en ligne ni de mutation du produit. Les corrections économiques de #185 et la preuve #186 restent acquises.

## Verdict et portée

**Le corpus ne peut pas être déclaré entièrement juste.** Cet audit relève 26 constats à traiter et 4 précisions distinctes. Les cas reproduits montrent des erreurs de contenu, des réponses recevables refusées et des exercices hors des attendus actuels. Un test réussi ne certifie pas le sens des phrases.

Il ne faut pas lire ce rapport comme une validation officielle de chaque notion. Les programmes fixent notions et compétences, mais ne donnent généralement pas une définition unique à réciter ; en philosophie notamment, les concepts se travaillent dans des problèmes et des textes. Les formulations équivalentes correctes doivent rester recevables.

## Couverture effective

| Corpus | Étendue du contrôle |
| --- | --- |
| Navigation des cours | 17 ensembles matière/niveau, 81 thèmes, 751 sections assemblées |
| Définitions affichées | 1 818 couples terme/définition distincts par matière exportés et relus ; référence de programme par matière, sans prétendre une concordance officielle phrase par phrase |
| Banques de QCM sources | 736 entrées inspectées structurellement, dont banques de langues héritées ; relecture des questions accessibles et de leurs réponses, sans certificat exhaustif des distracteurs |
| Génération des exercices | Cinq graines pour chaque section ; 23 371 inspections de jeux et 79 372 inspections de questions, répétitions comprises : ce ne sont pas des exercices tous distincts |
| Langues actuelles | 504 exercices des cinq manuels : anglais 110, espagnol 122, allemand 100, italien 86, arabe 86. Relecture des consignes/réponses/corrigés ; contre-exemples de correction reproduits. Tous les documents de compréhension ne sont pas recertifiés ligne à ligne. |
| Atelier | 169 formules relues avec expression, unités, cible et hypothèses ; tests existants des plages et de génération |
| QCM numériques | Les 6 générateurs sont recalculés depuis leurs énoncés par les tests existants, à raison de 300 tirages chacun |
| Calcul express | Lecture des générateurs et reproduction des tolérances ; pas de preuve exhaustive de tous les tirages |

Les 29 thèmes / 111 sections des anciennes banques de langues sont inventoriés à part : ils ne sont pas les manuels actuels. Les 740 entrées du dictionnaire brut ne représentent pas toutes des définitions effectivement affichées. L’assemblage des couches de cours et les questions dérivées ont donc été pris en compte.

Les 15 alertes restantes de la sonde structurelle concernent ces banques héritées et la normalisation de texte ; elles sont écartées du bilan actif, pas comptées comme 15 erreurs élèves. Une première sonde recherchait quatre underscores alors que l’interface accepte au moins deux : les 18 alertes de blancs obtenues initialement étaient des faux positifs et ont été éliminées.

## Programmes et millésimes

- Mathématiques : Première 2026 applicable dès 2026-2027 ; Terminale 2019 encore applicable cette année. Le nouveau programme de Terminale démarre en 2027-2028.
- Langues étrangères : les programmes 2025 s’appliquent aux Première/Terminale depuis 2026-2027. Ne pas leur appliquer le calendrier différent des langues régionales.
- Enseignements spécifiques STMG : référentiel de 2019 publié par Éduscol, complété par les références juridiques, fiscales et comptables datées nécessaires.
- Français et philosophie : distinguer méthode proposée, définition d’épreuve et notion disciplinaire. Un modèle de plan n’est pas une obligation officielle universelle.

## Constats et corrections attendues

### EX01 · Accents ignorés dans les manuels de langues · importance 9/10

**Nature :** correcteur. **Emplacement :** app/src/data/exercicesManuel.js, verifier ; resources/langues/es.json, es-ex-117.

« Mi padre esta en casa. » est validé comme « Mi padre está en casa. ». Le manuel utilise answerMatches au lieu du correcteur de langues qui préserve les accents.

**À faire :** Conserver les distinctions orthographiques qui portent la réponse ; ne pas confondre cette erreur avec les QCM, corrigés par choix exact.

Références : [LV-es](https://www.education.gouv.fr/sites/default/files/annexe-10-programme-d-espagnol-pour-les-classes-de-lyc-e-g-n-ral-et-technologique-440376.pdf).

### EX02 · Réponses anglaises recevables refusées · importance 9/10

**Nature :** correcteur. **Emplacement :** resources/langues/en.json, en-ex-001 / 088 / 094.

has been working ; He does not work on Sundays. ; These products are sold. sont refusés. Le corrigé de 094 dit lui-même que le complément by peut être omis.

**À faire :** Accepter les variantes correctes ou restreindre explicitement la consigne au temps/à la forme souhaités.

Références : [BC](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/present-perfect-simple-continuous), [LV-en](https://www.education.gouv.fr/sites/default/files/annexe-4-programme-d-anglais-pour-les-classes-de-lyc-e-g-n-ral-et-technologique-440361.pdf).

### EX03 · Productions ouvertes notées par égalité de texte · importance 9/10

**Nature :** correcteur. **Emplacement :** resources/langues/de.json, de-ex-008 / 032 / 064 / 068 / 072 / 079 / 084 / 087 / 099 ; it.json it-ex-071.

« Morgen arbeite ich. » répond à la demande d’une phrase au présent exprimant le futur, mais est refusé ; une demande de stage dans les finances est refusée au profit du modèle marketing. Treize réponses recevables, anglais compris, sont reproduites dans contre-exemples.json.

**À faire :** Réserver le correcteur strict aux réponses fermées ; évaluer les productions comme telles ; enrichir les alternatives des transformations fermées.

Références : [LV-de](https://www.education.gouv.fr/sites/default/files/annexe-2-programme-d-allemand-pour-les-classes-de-lyc-e-g-n-ral-et-technologique-441432.pdf), [LV-it](https://www.education.gouv.fr/sites/default/files/annexe-14-programme-d-italien-pour-les-classes-de-lyc-e-g-n-ral-et-technologique-440388.pdf).

### EX04 · Tolérance numérique contraire à la précision demandée · importance 8/10

**Nature :** correcteur. **Emplacement :** app/src/calc.js ; app/src/games/Calcul.jsx.

Un résultat attendu de 4 624,70 € au centime valide 4 625,10 €. Un taux attendu de 8,3 % valide 8,4 %. Le seuil accepte un écart de 100 €.

**À faire :** Distinguer arrondi demandé, tolérance de saisie et estimation ; afficher explicitement une approximation si elle est voulue.

Références : [MAT1](https://www.education.gouv.fr/sites/default/files/document/Annexe%20%E2%80%93%20Programme%20d%E2%80%99enseignement%20de%20math%C3%A9matiques%20de%20la%20classe%20de%20premi%C3%A8re%20de%20la%20voie%20technologique-515411.pdf), [MSGN](https://eduscol.education.gouv.fr/sites/default/files/document/spe262annexe21159141pdf-84609.pdf).

### EX05 · Un résultat particulier devient une définition générale · importance 8/10

**Nature :** generation. **Emplacement :** app/src/data/index.js, sectionPairs/sectionExercises/sectionDefinitions ; math-c3 section 2.

Le QCM demande « Que signifie Dérivée ? » et impose « f’(x) = 2x − 6 » ; la saisie inverse demande le terme correspondant à cette formule. Le polynôme de départ n’est pas dans la question.

**À faire :** Conserver l’énoncé de l’exemple dans une question de calcul ; n’extraire comme définition qu’un énoncé général autonome.

Références : [MAT1](https://www.education.gouv.fr/sites/default/files/document/Annexe%20%E2%80%93%20Programme%20d%E2%80%99enseignement%20de%20math%C3%A9matiques%20de%20la%20classe%20de%20premi%C3%A8re%20de%20la%20voie%20technologique-515411.pdf).

### EX06 · L’astérisque SQL disparaît · importance 9/10

**Nature :** generation. **Emplacement :** app/src/data/index.js, stripMd ; app/content/sig/approfondi-1.json ; sig-t2::4::trou0.

Le cours écrit SELECT * = toutes ; l’exercice devient « ____ : les colonnes à afficher (____ = toutes). » avec SELECT attendu dans les deux blancs.

**À faire :** Préserver les opérateurs et le code lors du retrait du Markdown ; SELECT seul ne signifie pas toutes les colonnes.

Références : [SQL](https://www.postgresql.org/docs/current/tutorial-select.html).

### EX07 · Distracteur chronologique également juste · importance 8/10

**Nature :** generation. **Emplacement :** hg-h3 section 6, jeu hg-h3::6::qtrou.

« Les ____ voient naître la société de consommation » propose années 1950-1960 et Trente Glorieuses ; seul le premier est accepté. Les deux périodes rendent cette phrase recevable dans le contexte du cours.

**À faire :** Écarter les réponses qui se recouvrent sémantiquement ; demander un repère qui distingue réellement les périodes.

Références : [HG2](https://eduscol.education.gouv.fr/sites/default/files/document/spe243annexe21159174pdf-83019.pdf).

### EX08 · Croissante confondue avec strictement croissante · importance 8/10

**Nature :** definition. **Emplacement :** app/content/maths/approfondi-4.json, math-c2 section 5.

La définition utilise > au lieu de ≥ ; le cours ajoute « décroissante sinon ». Une suite oscillante n’est ni croissante ni décroissante.

**À faire :** Distinguer croissance large/stricte, suite constante et absence de monotonie ; corriger aussi les jeux dérivés.

Références : [MAT1](https://www.education.gouv.fr/sites/default/files/document/Annexe%20%E2%80%93%20Programme%20d%E2%80%99enseignement%20de%20math%C3%A9matiques%20de%20la%20classe%20de%20premi%C3%A8re%20de%20la%20voie%20technologique-515411.pdf), [MAT2](https://eduscol.education.gouv.fr/sites/default/files/document/spe242annexe1158914pdf-84153.pdf).

### EX09 · Comparaison de suites : dépassement annoncé trop tôt · importance 9/10

**Nature :** calcul. **Emplacement :** app/content/maths/enrichissements.json, math-c2.

A(n)=500+40n ; B(n)=500×1,06ⁿ. Le texte annonce n=9. B(9)=844,74 < 860 et B(10)=895,42 < 900 ; B(11)=949,15 > 940.

**À faire :** Le premier dépassement après n=0 a lieu à n=11.

Références : [MAT1](https://www.education.gouv.fr/sites/default/files/document/Annexe%20%E2%80%93%20Programme%20d%E2%80%99enseignement%20de%20math%C3%A9matiques%20de%20la%20classe%20de%20premi%C3%A8re%20de%20la%20voie%20technologique-515411.pdf).

### EX10 · Le discriminant est présenté comme attendu en Première · importance 9/10

**Nature :** programme. **Emplacement :** p1-math-c3 section 2 ; CALC.discriminant ; atelier x047/x048.

Le programme de Première 2026 exclut explicitement la résolution par discriminant. Le site l’enseigne et l’entraîne sans indication de complément.

**À faire :** Remplacer l’attendu par formes factorisées, racines évidentes, lecture graphique/solveur ; isoler un éventuel complément.

Références : [MAT1](https://www.education.gouv.fr/sites/default/files/document/Annexe%20%E2%80%93%20Programme%20d%E2%80%99enseignement%20de%20math%C3%A9matiques%20de%20la%20classe%20de%20premi%C3%A8re%20de%20la%20voie%20technologique-515411.pdf).

### EX11 · Loi normale et intervalle de confiance classés dans le programme · importance 9/10

**Nature :** programme. **Emplacement :** math-c7 ; CALC.amplitude_ic/borne_ic ; atelier x071 à x076 et x163.

Le programme de Terminale technologique applicable en 2026-2027 ne comporte pas ces anciens attendus.

**À faire :** Les sortir du parcours obligatoire et des calculs de maîtrise du programme ; ne pas les présenter comme nécessaires au bac STMG actuel.

Références : [MAT2](https://eduscol.education.gouv.fr/sites/default/files/document/spe242annexe1158914pdf-84153.pdf), [MAT-DATES](https://eduscol.education.gouv.fr/5817/programmes-et-ressources-en-mathematiques-voie-gt).

### EX12 · Attendus de mathématiques absents du corpus assemblé · importance 9/10

**Nature :** couverture. **Emplacement :** app/content/p1-maths et maths, corpus assemblé.

Pas de section dédiée aux séries quantitatives à deux variables/ajustement en Première 2026 ; pas de cours sur les fonctions exponentielles et le logarithme décimal dans le corpus Terminale. Le simple mot exponentielle au sujet des suites ne couvre pas ces fonctions.

**À faire :** Compléter cours et exercices selon le niveau et le millésime, sans remplacer l’ajustement actuel de Terminale avant le changement applicable en 2027.

Références : [MAT1](https://www.education.gouv.fr/sites/default/files/document/Annexe%20%E2%80%93%20Programme%20d%E2%80%99enseignement%20de%20math%C3%A9matiques%20de%20la%20classe%20de%20premi%C3%A8re%20de%20la%20voie%20technologique-515411.pdf), [MAT2](https://eduscol.education.gouv.fr/sites/default/files/document/spe242annexe1158914pdf-84153.pdf), [MAT-DATES](https://eduscol.education.gouv.fr/5817/programmes-et-ressources-en-mathematiques-voie-gt).

### EX13 · Valeur ajoutée : formule générale incohérente · importance 8/10

**Nature :** formule. **Emplacement :** app/content/gestion-finance/approfondi-1.json, gf-t2 section 8.

Le cours/exercice définit VA = production − consommations de tiers ; le QCM rédigé de la matière et l’atelier x088 ajoutent correctement la marge commerciale.

**À faire :** Dans les SIG, intégrer marge commerciale + production de l’exercice ; préciser le cas exclusivement productif si l’on simplifie.

Références : [VA](https://www.insee.fr/fr/metadonnees/definition/c2334).

### EX14 · CAF et autofinancement confondus · importance 8/10

**Nature :** definition. **Emplacement :** gf-t2 section 13 ; gestion-finance/matiere.json ; intitulé Autofinancement (CAF).

La CAF est assimilée à l’autofinancement, alors que la distribution de dividendes peut les différencier.

**À faire :** Présenter l’autofinancement comme la part conservée après distribution : CAF moins dividendes.

Références : [CAF](https://bpifrance-creation.fr/encyclopedie/previsions-financieres-business-plan/previsions-financieres/compte-resultat-dun-projet).

### EX15 · Amortissement, dépréciation et valeur résiduelle · importance 8/10

**Nature :** definition. **Emplacement :** gf-t1 sections 7 / 23 ; atelier f19/f20.

Amortissement défini comme perte de valeur définitive ; VNC nécessairement nulle en fin de plan ; annuité générale basée sur la valeur brute sans hypothèse de valeur résiduelle nulle.

**À faire :** Définir l’amortissement par l’allocation du montant amortissable selon l’utilisation ; expliciter les hypothèses simplifiées des calculs.

Références : [PCG](https://www.anc.gouv.fr/files/anc/files/1_Normes_fran%C3%A7aises/Reglements/Recueils/PCG_janvier2026/PCG--1er-janvier-2026.pdf).

### EX16 · Exemple fiscal énergétique ambigu et daté · importance 6/10

**Nature :** precision. **Emplacement :** gf-t1 section 5, taux réduit 5,5 % : énergie de base.

Cette catégorie imprécise peut faire apprendre un ancien taux pour gaz/électricité. Les abonnements de métropole sont à 20 % depuis août 2025. D’autres énergies peuvent relever de régimes distincts.

**À faire :** Nommer précisément des produits/services et le territoire ; dater les exemples fiscaux.

Références : [TVA](https://www.economie.gouv.fr/particuliers/impots-et-fiscalite/gerer-mes-autres-impots-et-taxes/tva-quels-sont-les-taux-de-votre-quotidien).

### EX17 · CA3 imposée sans préciser le régime · importance 7/10

**Nature :** precision. **Emplacement :** gf-t1-trou-tva, question 1.

« L’entreprise établit sa déclaration de TVA sur le formulaire ___ » attend exclusivement CA3. En novembre 2026, le régime simplifié dispose encore de la CA12.

**À faire :** Préciser régime réel normal dans l’énoncé ; tenir compte du changement annoncé pour 2027.

Références : [CA3](https://www.impots.gouv.fr/professionnel/les-regimes-dimposition-la-tva).

### EX18 · Responsabilité limitée généralisée à toutes les sociétés commerciales · importance 9/10

**Nature :** definition. **Emplacement :** app/content/droit/matiere.json, chapters/3/games/0/questions/4 ; test du thème droit-t8.

La réponse attendue est limitée aux apports pour « une société commerciale ». La SNC, commerciale, est un contre-exemple ; une autre question du site précise correctement SARL/SAS.

**À faire :** Restreindre à SARL/SAS et harmoniser cours, banques et tests du thème.

Références : [DE2](https://eduscol.education.gouv.fr/sites/default/files/document/spe262annexe11159139pdf-84612.pdf), [SNC](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006222461).

### EX19 · CDD : indemnité présentée comme automatique · importance 7/10

**Nature :** precision. **Emplacement :** app/content/droit/approfondi-1.json ; droit-t7 section 2.

Le chapitre cite le CDD saisonnier puis affirme sans réserve le versement de la prime à la fin du CDD.

**À faire :** Écrire en principe et présenter les exceptions utiles, notamment le contrat saisonnier.

Références : [CDD](https://www.service-public.gouv.fr/particuliers/vosdroits/F803).

### EX20 · Définition du contrat réduite à la création d’obligations · importance 7/10

**Nature :** definition. **Emplacement :** app/content/droit/matiere.json, chapters/0/games/0/questions/0 ; banque du thème.

Un accord qui éteint ou modifie des obligations est également un contrat ; l’explication actuelle le réduit à leur création.

**À faire :** Reprendre les quatre effets de l’article 1101, sans exiger sa récitation littérale.

Références : [CC1101](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032040787).

### EX21 · Diversification confondue avec tout nouveau marché · importance 8/10

**Nature :** definition. **Emplacement :** p1-mgmt-t3 section 2 ; mgmt-t2 sections 4 et 9 ; banques de QCM.

Nouveaux métiers OU marchés est présenté comme diversification. Exporter le même produit dans un nouveau pays peut rester dans le même DAS.

**À faire :** Distinguer nouveaux domaines d’activité et développement géographique/commercial au sein d’un DAS.

Références : [M1](https://eduscol.education.gouv.fr/sites/default/files/document/spe646annexe21063602pdf-84603.pdf).

### EX22 · Spinoza réduit à la négation de la liberté · importance 8/10

**Nature :** definition. **Emplacement :** philo-methode section 5 ; philo-liberte section 3.

« La liberté comme illusion » est validé en vrai/faux. Cela efface la distinction entre illusion du libre arbitre et liberté pensée à partir de la nécessité.

**À faire :** Préciser la thèse et le sens des termes ; éviter d’en faire une formule universelle sur toute liberté.

Références : [SPINOZA](https://fr.wikisource.org/wiki/%C3%89thique/Partie_I), [PHI](https://eduscol.education.gouv.fr/sites/default/files/document/spe238annexe21159161pdf-83643.pdf).

### EX23 · Génocide défini trop étroitement · importance 7/10

**Nature :** definition. **Emplacement :** hg-h1 section 5.

« Extermination volontaire et programmée d’un peuple » ne précise pas la destruction partielle et les groupes protégés ; la définition peut exclure des cas conventionnels.

**À faire :** Distinguer intention de destruction, en tout ou partie, d’un groupe protégé et les actes constitutifs.

Références : [GENOCIDE](https://www.un.org/fr/observances/genocide-prevention-day).

### EX24 · Anciennes simplifications économiques encore dans l’atelier · importance 8/10

**Nature :** formule. **Emplacement :** app/content/commun/atelier-formules.json, x128 et x140.

x128 assimile le PIB à la seule somme des VA ; x140 dit que la dette est le stock des déficits passés. Ces simplifications ont déjà été reprises ailleurs dans les cours.

**À faire :** Préciser PIB aux prix de base ou ajouter impôts/subventions sur les produits ; mentionner les autres opérations affectant la dette.

Références : [PIB](https://www.insee.fr/fr/metadonnees/definition/c1365), [DETTE](https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20260122-1).

### EX25 · Communication formelle limitée à l’écrit · importance 7/10

**Nature :** precision. **Emplacement :** rh-t3 section 3.

« Officielle, écrite, hiérarchique » oublie la communication formelle orale et transversale. Le QCM de Première considère justement une réunion officielle comme formelle.

**À faire :** Définir son cadre institutionnel/organisé sans rendre l’écrit ni la verticalité obligatoires.

Références : [SGN](https://eduscol.education.gouv.fr/sites/default/files/document/spe646annexe31063606pdf-84600.pdf), [MSGN](https://eduscol.education.gouv.fr/sites/default/files/document/spe262annexe21159141pdf-84609.pdf).

### EX26 · SQL : comparaison textuelle qui change les littéraux · importance 7/10

**Nature :** correcteur. **Emplacement :** app/src/games/SqlQuery.jsx, sqlNorm/sqlMatches ; sig-t2-sql.

La normalisation met toute la requête en minuscules, y compris Lyon dans une chaîne ; inversement une requête équivalente avec alias est refusée.

**À faire :** Préserver le contenu des littéraux et annoncer les formes admises ou vérifier une requête dans un moteur local avec schéma et jeux de données de contrôle. Aucun essai contre une base réelle.

Références : [SQL-L](https://www.postgresql.org/docs/current/sql-syntax-lexical.html).

### NU01 · BFR et BFRE à distinguer · importance 5/10

**Nature :** a_preciser. **Emplacement :** atelier f22 et gf-t2 section 3.

Une formule ne contenant que l’exploitation est appelée BFR général. Elle suppose que le hors exploitation est nul.

**À faire :** Expliciter cette hypothèse ou séparer BFRE et BFRHE.

Références : [MSGN](https://eduscol.education.gouv.fr/sites/default/files/document/spe262annexe21159141pdf-84609.pdf).

### NU02 · Seuils de ratios présentés comme obligations · importance 5/10

**Nature :** a_preciser. **Emplacement :** gf-t2 sections 6 / 14 / 18 ; atelier x099/x103.

« > 1 obligatoire » et les seuils 30 %, 4 ans ne sont pas des règles universelles de validité des comptes.

**À faire :** Présenter des repères d’analyse contextualisés, pas des normes absolues.

Références : [MSGN](https://eduscol.education.gouv.fr/sites/default/files/document/spe262annexe21159141pdf-84609.pdf).

### NU03 · Les indicateurs sociaux ne prouvent pas une cause · importance 5/10

**Nature :** a_preciser. **Emplacement :** rh-t4 sections 5 et 7.

Absentéisme et départs sont directement associés à démotivation et malaise. Maladie, saisonnalité et autres causes existent.

**À faire :** Les traiter comme signaux à interpréter avec plusieurs indicateurs.

Références : [MSGN](https://eduscol.education.gouv.fr/sites/default/files/document/spe262annexe21159141pdf-84609.pdf).

### NU04 · 1962 : mode d’élection, pas premier scrutin direct · importance 5/10

**Nature :** a_preciser. **Emplacement :** hg-h3 sections 1 / 8 / 15.

Les repères compressés disent président élu en 1962 ; il s’agit de la réforme constitutionnelle.

**À faire :** Distinguer réforme en 1962 et première élection selon cette règle en 1965.

Références : [PRESIDENT](https://www.elections.interieur.gouv.fr/comprendre-elections/pour-qui-je-vote/president-de-republique).

## Vérifications et preuves

158 tests réussis dans 9 fichiers : qcmgen, logique, formula-practice, formules-plages, exercices-manuel, exercices-chapitre, trous-exercices, dates-exercices, variete-chapitre. Les tests n’ont pas été modifiés. Aucun test navigateur supplémentaire : le produit n’a pas changé et les constats portent sur données/génération/correcteurs.

`contre-exemples.json` contient 15 divergences de correction des langues, 3 exemples de tolérances excessives et 17 jeux réellement émis illustrant plusieurs constats, trois contre-exemples SQL et le recalcul de la comparaison des suites. Le cas arabe مِن / مَن est aussi conservé comme contrôle négatif : le correcteur ne les confond pas. On ne le compte donc pas parmi les erreurs.

Les fichiers `definitions-actives.tsv` et `formules.tsv` permettent une revue par notion avec thème et section. Leur statut de relecture ne signifie pas « certifié exact par une source officielle ». Les sources et leur date d’application sont dans `sources-programmes.json`. Les fichiers JSON de preuves ne contiennent aucune donnée de compte utilisateur.

### Reproduction

```bash
cd app
REVIZ_AUDIT_DIR=/tmp/revizstmg-audit-exercices-20261107 npx --no-install vite-node ../docs/audits/2026-11-07/audit-exercices.mjs
REVIZ_AUDIT_DIR=/tmp/revizstmg-audit-exercices-20261107 npx --no-install vite-node ../docs/audits/2026-11-07/contre-exemples.mjs
npx --no-install vitest run tests/qcmgen.test.js tests/logique.test.js tests/formula-practice.test.js tests/formules-plages.test.js tests/exercices-manuel.test.js tests/exercices-chapitre.test.js tests/trous-exercices.test.js tests/dates-exercices.test.js tests/variete-chapitre.test.js
```

## Limites à conserver dans toute communication

- Aucun examen ni correction IA future n’a été validé : les productions du fournisseur sont ouvertes et ne sont pas un corpus fini. Aucun appel payant n’a été fait.
- Une concordance complète notion par notion, avec vérification de chaque document de compréhension et de chaque distracteur sémantique sur toutes les variantes, reste à établir. Le catalogue est un support pour cette relecture, pas une attestation de conformité exhaustive.
- Les fiches de langue en PDF, annales officielles externes, copies d’élèves et grilles sportives ne sont pas recertifiées par cet audit des banques/générateurs. Aucun accès aux données des élèves ni à Supabase.
- Les précisions NU01–NU04 sont séparées des constats EX01–EX26 pour ne pas transformer une convention de calcul ou une date d’entrée en vigueur en fausse erreur. La Banque de France nationalisée avec effet au 1er janvier 1946 n’est pas signalée comme erreur : le cours distingue déjà la loi du 2 décembre 1945 et son effet.

## Ordre de traitement recommandé

1. Corriger les évaluations injustes, les opérateurs effacés et les réponses sémantiquement concurrentes (EX01–EX07, EX26).
2. Réparer les erreurs calculées et les décalages de programme en mathématiques (EX08–EX12).
3. Harmoniser les définitions dans toutes les couches et dans l’atelier (EX13–EX25), puis les quatre précisions.
4. Ajouter des cas de non-régression réellement indépendants des phrases sources ; reconstruire l’inventaire et vérifier les questions effectivement affichées après corrections.
5. Faire la concordance exhaustive restante sans remplacer les variantes correctes par une récitation unique.
