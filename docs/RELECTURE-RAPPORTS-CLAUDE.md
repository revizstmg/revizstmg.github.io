# Corrections des rapports Gmail de Claude

Demande du propriétaire : analyser les rapports de vérification et corriger les problèmes encore présents. Rapports lus : 14, 19 et 20 octobre 2026. Branche : `fix/rapports-claude-pedagogie`, PR #71. Aucune copie de mail, donnée d’élève ou statistique personnelle n’est publiée ici.

## Philosophie — rapport du 20 octobre

| Point | Traitement |
|---|---|
| Aristote, égalité proportionnelle | Retrait de « ou son besoin » dans le cours et les définitions. La distribution est proportionnelle au mérite (Éthique à Nicomaque, V). |
| Arendt / Eichmann / Nuremberg | Arendt suit comme journaliste le procès d’Eichmann à Jérusalem en 1961 ; elle n’est pas juge. Correction dans les deux couches de cours et donc dans les exercices générés. |
| Baudelaire | Citation exacte et attribution au projet d’épilogue de l’édition de 1861 des Fleurs du mal. |
| Trou collé à « idéal » | Les fragments se terminant par une élision ou un mot-outil ne sont plus des réponses. Les étiquettes de plan restent exclues. |
| Noms, accords, synonymes refusés | Variantes explicites pour Arendt/Hannah Arendt, Hugo/Victor Hugo, Wilde/Oscar Wilde, Camus/Albert Camus ; légale/légal ; justice corrective/commutative. Portée limitée aux thèmes concernés. |
| Platon / Aristote | L’énoncé distingue l’imitation éloignée de la vérité chez Platon de l’imitation instructive chez Aristote ; pas d’équivalence automatique entre ces auteurs. |
| Trous ambigus ou sans contexte | Phrases conservées entières ; un début anaphorique garde le contexte du paragraphe, sinon il est écarté. Pas de fenêtre coupée ni de phrase de plus de 600 caractères. Deux formes de justice particulière annoncées. Reformulations de l’idéal de justice, de Rawls et de la valeur de l’œuvre. |
| Doublons | Une notion et ses variantes acceptées ne donnent qu’un trou par section. Plusieurs modalités peuvent travailler la même notion volontairement. |
| « Rendre à chacun son dû » / Rousseau | Attribution à Aristote retirée ; Rousseau : la force seule ne crée pas d’obligation morale et ne fonde pas le droit, y compris dans la correction du QCM. |
| Sublime | Présentation du plaisir négatif chez Kant, sans attribuer indistinctement « plaisir mêlé d’effroi » à sa théorie. |

## Économie — rapport du 14 octobre

| Point | Traitement |
|---|---|
| Redistribution : vrai/faux erroné | Le moteur excluait déjà les notions liées ; ajout des libellés Répartition/Redistribution et des variantes acceptées au filtre des distracteurs et des faux. Test sur 30 tirages déterministes. |
| Saisie de termes | Variantes pour fonction de répartition/répartition/redistribution, fonction de stabilisation/stabilisation/stabiliser, allocation, chômeur/chômeurs, relance/politique de relance. « Relance » n’est pas un synonyme général de stabilisation : aucune acceptation indue. |
| Expression « grand remplacement » | Déjà absente de main lors de la relecture ; formulation sur la transformation des emplois conservée. |
| Bien public | Définition complétée : non-rivalité et non-excluabilité. Exemples de biens publics purs : défense nationale, éclairage public. Écoles/routes peuvent illustrer l’intervention publique, sans être présentées comme des biens publics purs. |
| Plusieurs choix justes | Synonymes acceptés retirés des distracteurs de la bonne réponse ; ajout des relations entre chômage et ses types et entre monnaie et politique monétaire. |
| Trous coupés | Même correction du générateur que pour la philosophie, sur toutes les matières. Les notions restent exclusivement tirées du chapitre. |
| Halo / sous-emploi | Distinction corrigée dans toutes les couches concernées : les personnes sans emploi souhaitant travailler ne sont pas toutes comptées comme chômeurs BIT. Le sous-emploi concerne des personnes en emploi. |
| Allègements de cotisations | Rattachés explicitement aux politiques actives dans le passage qui les présentait à part. |
| Répétitions | Déduplication par notion et variantes dans une section ; les répétitions entre modalités restent un entraînement intentionnel. |

## Rapports et accès — 14, 19 et 20 octobre

- Le rapport traite désormais `unknown`, l’absence de résultat et les états d’attente comme des contrôles non vérifiés, pas des échecs. Les vrais échecs restent rouges.
- Une date absente ou invalide ne produit plus `Invalid Date`.
- Le verdict et le corps ne disent plus « Rien à signaler » quand des contrôles manquent ou échouent.
- Les appels GitHub ont un délai maximal de 15 secondes. Un accès indisponible produit un diagnostic explicite sans secret. Un résultat fourni par la routine reste utilisable si la mesure du script est inconnue.
- Les commandes npm signalées comme refusées le 19 sont déjà autorisées dans `.claude/settings.json`. Elles n’ont pas été élargies.
- Limite externe : rattacher le dépôt à une routine claude.ai et ses autorisations de connexion ne se configure pas depuis le dépôt. Le code distingue désormais ce défaut d’accès d’une panne du site ; le réglage effectif dans Claude reste à vérifier par le propriétaire.

## Sources de relecture

- Aristote, Éthique à Nicomaque, livre V : https://classics.mit.edu/Aristotle/nicomachaen.5.v.html
- Arendt, reportage original Eichmann in Jerusalem : https://www.newyorker.com/magazine/1963/02/16/eichmann-in-jerusalem-i
- BnF, bibliographie Baudelaire et projet d’épilogue 1861 : https://www.bnf.fr/fr/charles-baudelaire-bibliographie
- Rousseau, Du contrat social, I, 3 : https://fr.wikisource.org/wiki/Du_contrat_social/%C3%89dition_1762/Livre_I/Chapitre_3
- Kant, Critique du jugement, plaisir négatif : https://fr.wikisource.org/wiki/Page%3AKant_-_Critique_du_jugement%2C_trad._Barni%2C_tome_premier.djvu/169
- Insee, halo autour du chômage : https://www.insee.fr/fr/metadonnees/definition/c1415
- Insee, halo et sous-emploi : https://www.insee.fr/fr/statistiques/8376850

## Validation

Résultats à compléter après exécution sur la version finale. Les empreintes et l’index léger doivent être régénérés puisque le contenu et la génération changent volontairement. Les parcours bloquent les accès extérieurs et ne touchent pas Supabase.
