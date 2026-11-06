# Économie : seconde relecture des exercices et sujets

6 novembre 2026. Source figée `51a260055f654c01d1175437e7de41fe2fe327cc`, après corrections #182 et journal #183. Worktree indépendant `audit-economie-exercices-seconde-20261106`. Lecture seule du produit ; aucune donnée réelle, mutation Supabase, correction IA, compilation ou suite générale. Les constats ci-dessous ne signifient pas que les corrections précédentes ont été annulées.

## Vérifications effectuées

- Lecture des 63 questions historiques des deux fichiers `matiere.json`, des 72 questions des neuf études documentaires et des cas pratiques économiques.
- Sonde Vite sur le contenu assemblé de 94 chapitres économiques : `chargerMatiere`, `themeChapters`, puis `jeuxDuChapitre`. Une réalisation des exercices générés par chapitre, pas une exploration exhaustive de tous les tirages. La sonde complète est conservée hors dépôt dans `/workspace/work/economie-exercices-seconde-sonde.json` ; ses extraits probants et son empreinte sont partagés dans [economie-seconde-preuves.json](economie-seconde-preuves.json).
- Vérification locale des quatre PDF du Prix : empreintes SHA256 identiques aux métadonnées et nombre d’éléments texte égal au nombre de pages annoncé. Le nouveau sujet 2025-2026 n’appartient pas à cette livraison ; son absence n’est pas comptée comme régression.
- Première invocation de sonde depuis la racine refusée par le module virtuel Vite ; invocation reprise depuis `app/`, terminée avec 94 chapitres. Aucun résultat du premier essai n’est présenté comme réussi.

## Fautes et incohérences confirmées

### E2-01. Un tri interroge des notions absentes de son chapitre, 8/10, préexistant

- `app/content/p1-economie/exercices-sections.json:13` rattache `p1-eco-t4-tri` à la section 4.
- `app/content/p1-economie/matiere.json:1210-1243` : le tri contient « Émettre des actions en Bourse » et « Émettre des obligations », classés en financement direct.
- La sonde confirme que `jeuxDuChapitre` sert effectivement ce jeu au chapitre 4, **Le financement indirect (les banques)**. Cette section décrit l’intermédiation et le crédit bancaire ; elle ne définit ni les actions ni les obligations.

Les réponses du tri sont économiquement correctes, mais son rattachement viole la règle explicite de contenu exclusif au chapitre. Ce n’est pas seulement un jeu dormant dans une banque de thème. Proposition : le rattacher à la section 7, **Exemple traité : financer une machine, interne, direct ou indirect**, qui cite explicitement émissions d’actions/obligations et crédit bancaire. Vérifier ensuite les index dérivés. Preuve locale et règle `CLAUDE.md`, aucune source externe nécessaire pour constater le périmètre.

### E2-02. Obligation toujours présentée à intérêt fixe et comme plus sûre, 7/10, préexistant

- `app/content/p1-economie/matiere.json:1028` et tableau ligne 1048, chapitre 3 **Actions et obligations**.
- Définition : « rapporte un intérêt fixé d’avance ; plus sûr ».
- La sonde retrouve cette définition comme bonne réponse dans `p1-eco-t4::3::qdef`, une proposition vraie dans `::vf`, la saisie `::sterm` et les flashcards `::cards`. Le QCM `::qtrou` demande aussi de compléter par « intérêt fixé d’avance » ou « plus sûr ».

Les obligations peuvent être à taux fixe, variable, indexées ou à coupon zéro ; risque de défaut et risque de perte lors d’une vente avant échéance existent. Une comparaison absolue de sûreté sans émetteur, durée ou type de titre ne convient pas. Proposition simple : « Titre de dette ; modalités de rémunération et de remboursement fixées à l’émission, coupon fixe ou variable selon le contrat ; risque de perte en capital et de défaut ». On peut introduire d’abord l’exemple courant à taux fixe, en le nommant comme exemple.

Référence officielle consultée par ses résultats indexés : [AMF, comprendre les obligations](https://www.amf-france.org/fr/espace-epargnants/comprendre-les-produits-financiers/actions-obligations/obligations/comprendre-les-obligations-avant-dinvestir). Les résultats donnent explicitement les différentes catégories et les risques. Les ouvertures directes de la page et de son PDF ont renvoyé 403 : ne pas annoncer une lecture intégrale réussie de ces documents.

### E2-03. La recherche active reste présentée comme condition sans exception dans l’étude BIT, 6/10, correction incomplètement propagée

- `app/content/economie/etudes-documents.json:127` (`eco-t7.documents[0].text`) et lignes 146-156 (`questions[0]` et son explication).
- Les formulations imposent toujours une recherche active, alors que le cours corrigé `cours-reels.json:92` inclut la personne disponible ayant déjà trouvé un emploi commençant dans les trois mois.
- Occurrences analogues dans `economie/pieges.json:7`, `enrichissements.json:92`, `approfondi-1.json:226` et les définitions/tableaux de `cours-complets.json`.

La réponse à la question posée manque donc l’alternative prévue par la définition complète. Proposition : « rechercher activement un emploi, ou en avoir trouvé un commençant dans moins de trois mois », avec disponibilité sous deux semaines et âge/période de référence lorsque la définition complète est donnée. L’exemple de l’étudiant indisponible six mois reste correctement conclu comme non chômeur BIT ; c’est son rappel général qu’il faut harmoniser.

Source ouverte et lue : [Insee, chômage BIT](https://www.insee.fr/fr/metadonnees/definition/c1129), définition actualisée le 5 mars 2024. Il ne s’agit pas de redéclarer le classement automatique des étudiants/retraités, qui a bien été corrigé.

### E2-04. La méthode affirme que les trois taux ont trois dénominateurs différents, 5/10, préexistant

`app/content/economie/approfondi-2.json:200`, `eco-t7[2].blocks[4].c`, sert le chapitre 9 **Méthode : taux de chômage, d’activité et d’emploi**. La dernière phrase affirme : « Les trois taux ont des dénominateurs différents. » Or les formules juste au-dessus donnent la même population en âge de travailler pour activité et emploi, contre population active pour chômage.

Proposition : « Le taux de chômage a un dénominateur différent des deux autres ; les taux d’activité et d’emploi utilisent la population de la tranche d’âge retenue. » Les chiffres de l’exemple (10,7 %, 70 %, 62,5 %) sont justes et ne doivent pas être changés. La définition générale ne doit pas imposer les 15-64 ans à toutes les publications : le périmètre d’âge doit rester indiqué.

Source ouverte et lue : [Insee, activité selon l’âge](https://www.insee.fr/fr/statistiques/2489758), qui définit le rapport à la population correspondante. La contradiction est aussi directement vérifiable dans les trois formules du fichier.

## Régression pédagogique et nuance à traiter séparément

### E2-05. Nouveau trou sur « cet exemple », 5/10, introduit par #182

`app/content/economie/cours-reels.json:92` a introduit le gras de **cet exemple** pour préciser correctement la situation BIT. L’extraction transforme ce marqueur rédactionnel en question du jeu `eco-t7::0::trou0` :

> Dans ____, seule la troisième remplit les critères : être sans emploi, disponible dans les deux semaines et avoir recherché activement un emploi au cours des quatre dernières semaines.

Réponse attendue : `cet exemple`. Ce n’est pas une connaissance économique ; la formulation seule renvoie en outre à une troisième personne qui n’est pas redonnée dans cette question. La correction de fond du paragraphe est juste. Proposition minimale : ne pas mettre « cet exemple » en gras ; garder le gras pour les critères et concepts, puis vérifier que cette réponse disparaît des jeux. Une exclusion générale des marqueurs anaphoriques peut ensuite améliorer le générateur. Preuve par le contenu assemblé, sans source externe requise.

### E2-06. Inflation et pouvoir d’achat : explication encore trop absolue, 4/10, préexistante

`app/content/economie/matiere.json:696`, jeu `eco-actu-qcm.questions[0].explain` : l’explication affirme encore que l’inflation réduit le pouvoir d’achat, sans condition sur les revenus. Le choix correct « pouvoir d’achat et politique économique » reste pertinent : aucune note de QCM fausse n’est prouvée ici. C’est une incohérence avec la nouvelle définition conditionnelle du même thème. Proposition : « À revenu nominal inchangé, l’inflation réduit le pouvoir d’achat ; l’évolution dépend aussi de celle des revenus. »

Source ouverte et lue : [Insee, revenu disponible et pouvoir d’achat](https://www.insee.fr/fr/statistiques/2830244). Les séries distinguent revenus nominaux, prix et revenus déflatés ; il n’est pas nécessaire d’ajouter des chiffres d’actualité à l’exercice.

## Contrôles sans nouvelle faute retenue

- Le double distracteur exact du revenu disponible est bien supprimé, l’identité consommation + épargne reste expliquée.
- Capacité de financement épargne-investissement et cas Novéo (350 000 € de financement externe restant) sont cohérents après correction.
- VA 190 000 €, croissance en volume de 2 %, élasticité −3 ; chômage 10 %, activité 70 %, solde commercial −70, couverture 87,27 %, déficit 3 %, dette 110 % : calculs des cas pratiques relus, valeurs correctes. Quelques explications notent le quotient directement en pourcentage en omettant typographiquement ×100 ; amélioration de notation, pas un résultat faux.
- Les PDF 2021-2022, 2022-2023, 2023-2024 et 2024-2025 conservent leurs empreintes et leurs nombres de pages. Aucun motif de réécriture des originaux.
- Pas de nouveau défaut de grille de correction du Prix démontré par cette lecture ; elle reste indicative. Aucun test réel de Gemini effectué.
- Les banques historiques de QCM et les études non explicitement rattachées ne sont pas déclarées arbitrairement présentes dans un chapitre. Le défaut E2-01 a, lui, été confirmé sur l’assemblage réellement utilisé.

## Limites

Audit documentaire et sonde locale du contenu, sans parcours navigateur ni validation exhaustive de chaque variante aléatoire. Les affirmations trop absolues sont séparées des réponses effectivement fausses et des défauts de rattachement. Aucun échange avec le second nouvel auditeur avant remise de ce rapport ; informations transmises uniquement au coordinateur. Aucune correction produit effectuée. Le module virtuel Vite a nécessité le lancement depuis `app/` ; le lien local `node_modules` est un outil non suivi, à ne pas committer.
