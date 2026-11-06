# Économie : seconde relecture des cours

6 novembre 2026. Source relue : `51a260055f654c01d1175437e7de41fe2fe327cc` (main après #182 et #183), compilation publique `2a42f9524dd9dae1af16ae6eb31708b154020fee`. Branche d’audit `audit/economie-cours-seconde-20261106`, worktree distinct. Aucun échange de conclusions avec l’autre nouvel agent avant remise de ce rapport.

Lecture des définitions et couches de cours économiques Première/Terminale, recherche de contradictions, consultation de références officielles et trois lectures HTTP publiques. Aucun code, contenu pédagogique, PDF ou service réel modifié ; aucun build ni suite générale relancé. Les tests antérieurs ne sont pas présentés comme exécutés pendant cet audit.

## Fautes confirmées encore présentes

### C2-01. Le PIB est annoncé comme ignorant l’économie souterraine, importance 7/10

- Source : `app/content/p1-economie/matiere.json:510`, `/chapters/1/cours/7/blocks/1/c/0`.
- La liste des limites associe travail non rémunéré et « économie souterraine » comme éléments ignorés. Les comptes français procèdent pourtant à des estimations et redressements de l’activité dissimulée. Difficile à mesurer ne signifie pas exclue par définition.
- Proposition : « Le PIB ne mesure généralement pas les services domestiques non rémunérés. L’activité dissimulée est estimée et intégrée aux comptes, avec une incertitude de mesure. »
- Source officielle effectivement ouverte : [Insee, fiche méthodologique base 2020, activité dissimulée, mai 2024](https://www.insee.fr/fr/metadonnees/source/fichier/fichemethodo1_B2020_activite_dissimulee.pdf), pages 1-2, lignes web 3-8 et 29-46, référence `turn807741view0`.
- Présence publique confirmée, HTTP 200 : [Les limites du PIB](https://revizstmg.github.io/cours/premiere/economie/comment-cree-t-on-des-richesses-et-comment-les-mesure-t-on/les-limites-du-pib/). SHA256 de la page : `62dbea887451aef24ce0b652c2e0f5eb13bf093cf12f404901d7ca42c633601a`.

### C2-02. Toute obligation est présentée avec un intérêt fixé d’avance, importance 6/10

- Source : `app/content/p1-economie/matiere.json:1028` et `:1048`, `/chapters/3/cours/3/blocks/2/c` et `/blocks/4/rows/1/1`.
- Le cas d’une obligation à taux fixe est généralisé. Les obligations à taux variable existent aussi. « Plus sûr » n’est pas une caractéristique absolue : risque de défaut, risque de taux et horizon de détention comptent. Le texte ne promet pas littéralement un remboursement garanti ; ne pas lui attribuer cette phrase absente.
- Proposition : titre de créance avec rémunération prévue selon les conditions d’émission, notamment fixe ou variable. Le remboursement dépend de la solvabilité de l’émetteur ; une revente avant échéance peut entraîner une perte.
- Sources effectivement ouvertes : [Ministère de l’Économie, qu’est-ce qu’une obligation ?](https://www.economie.gouv.fr/particuliers/gerer-mon-argent/gerer-mon-budget-et-mon-epargne/placements-quest-ce-quune-obligation), lignes 74-79 et 101-110 (`turn282541view0`) ; [INC, fiche réalisée avec l’AMF](https://www.inc-conso.fr/content/investir-dans-les-obligations), lignes 216-228 (`turn282541view1`). Les tentatives d’ouverture directe AMF ont renvoyé 403 ; elles ne sont pas présentées comme lectures réussies.
- Présence publique HTTP 200 : [Actions et obligations](https://revizstmg.github.io/cours/premiere/economie/comment-les-agents-economiques-se-financent-ils/actions-et-obligations/), SHA256 `3fd28e90a50f9e7bbd2591abd7a23c95dcd7ee228f19f4f8ce6a35c205f72a5a`.

### C2-03. Les taux directeurs sont réduits au taux de refinancement, importance 5/10

- Source : `app/content/p1-economie/matiere.json:1093`, `/chapters/3/cours/6/blocks/0/c`, et tableau `/blocks/4/rows/1/1`.
- Le refinancement est un exemple de taux directeur, pas la définition de l’ensemble. La facilité de dépôt en est également un et sert à piloter l’orientation monétaire.
- Proposition : « Taux fixés par la banque centrale qui encadrent la rémunération des dépôts des banques et le coût de leurs emprunts auprès d’elle. Dans l’Eurosystème : facilité de dépôt, opérations principales de refinancement et facilité de prêt marginal. » Ne pas imposer trois valeurs chiffrées rapidement périmées.
- Source ouverte : [BCE, facilité de dépôt, actualisation septembre 2024](https://www.ecb.europa.eu/ecb-and-you/explainers/tell-me/html/what-is-the-deposit-facility-rate.fr.html), lignes 38-40 (`turn807741view2`).
- Présence publique HTTP 200 : [Banque centrale et taux directeurs](https://revizstmg.github.io/cours/premiere/economie/comment-les-agents-economiques-se-financent-ils/la-banque-centrale-et-les-taux-directeurs/), SHA256 `29571380e36ee6ac069d788acf7a5ca34c4d7e44169862b5e02d28d58444e3b0`.

### C2-04. Les facteurs de production sont définis trop étroitement, importance 4/10

- Source : `app/content/p1-economie/matiere.json:375` et `:399`, `/chapters/1/cours/1/blocks/1/c` et tableau `/blocks/3/rows/2/1`.
- Le travail est assimilé aux seuls salariés : le travail des indépendants contribue aussi à la production. Le capital est qualifié de « matériel » tout en citant les logiciels, actifs incorporels.
- Proposition : travail = activité humaine mobilisée dans la production, salariée ou non salariée ; capital fixe = actifs productifs durables corporels ou incorporels, dont machines et logiciels.
- Références ouvertes : [Insee, emploi en 2023](https://www.insee.fr/fr/statistiques/8068602), distinction emploi total/salarié et revenu mixte, lignes 76-101 et 142-149 (`turn527379view0`) ; [Insee, FBCF en 2023](https://www.insee.fr/fr/statistiques/8068590), actifs corporels/incorporels et logiciels, lignes 70-75 (`turn486927view1`).

## Nuances et harmonisations, distinctes des erreurs nettes

### N2-01. Investissement et seul accroissement du stock, importance 5/10

`app/content/p1-economie/matiere.json:379` et `:407`, `/chapters/1/cours/1/blocks/2/c` et `/blocks/3/rows/4/1`, définissent investir uniquement comme augmenter le stock de capital. Le remplacement d’une machine usée est aussi un investissement, sans augmentation nécessaire du stock net. Préciser « acquérir, renouveler ou améliorer des actifs productifs durables ». La FBCF est brute de consommation de capital fixe : [Insee FBCF](https://www.insee.fr/fr/statistiques/8068590), lignes 65 et 70-75, source déjà ouverte. Il s’agit d’un raccourci à compléter, pas d’un calcul faux reproduit.

### N2-02. Le signe « + » de l’IDH peut être pris pour une formule de calcul, importance 4/10

`app/content/economie/approfondi-1.json:751`, `/eco-t9/3/blocks/5/c` : « IDH = santé + éducation + revenu ». Dans ce bloc de mémorisation, cela peut être une liste mnémotechnique, mais ce n’est pas le calcul de l’IDH. Préférer « L’IDH combine trois dimensions : santé, éducation et niveau de vie » ; ne pas exiger sa formule technique au lycée. Source ouverte : [PNUD, Human Development Index](https://hdr.undp.org/data-center/human-development-index), lignes 40-42 (`turn486927view2`) : agrégation géométrique d’indices normalisés. Aucun exercice de calcul erroné de l’IDH n’a été attesté.

### N2-03. Le raccourci dette = déficits accumulés demeure dans l’introduction, importance 4/10

`app/content/economie/cours-reels.json:67`, `/eco-t6/2/blocks/0/c`, conserve « les déficits accumulés forment la dette », alors que la couche approfondie corrigée distingue bien les autres opérations financières. Le mécanisme scolaire reste utile ; harmoniser avec « Les déficits contribuent généralement à accroître la dette, dont l’évolution dépend aussi d’autres opérations financières ». Pas de nouvelle régression : occurrence inchangée dans la version antérieure. La distinction corrigée dans la couche approfondie est bien conservée.

## Ce qui est confirmé comme corrigé

Les nouvelles formulations marchande/non marchande du PIB, croissance en volume, épargne comparée à l’investissement, dividende non garanti, dette publique incluant les administrations locales et sociales, statut étudiant/retraité insuffisant pour classer l’activité, cible BCE symétrique à moyen terme et thème 9 mobilisable à l’écrit en 2027 sont bien présentes dans leurs champs corrigés. La référence [BO du 17 septembre 2026](https://www.education.gouv.fr/bo/2026/Special4/MENE2622652N), applicable à 2027, a été rouverte (`turn868421view0`). Aucune exclusion nouvelle du thème 9 n’a été trouvée.

Les six occurrences principales du présent rapport (PIB souterrain, obligation, taux, facteurs, dette introductive, IDH) ont été comparées par leurs pointeurs JSON au commit pré-correction `6538d65d0e65cc938a9e79cc4223fa6ef58e1a38` : toutes préexistaient et sont restées inchangées. Ce rapport ne démontre donc pas une régression introduite par #182, mais des passages résiduels et nuances non couverts par les corrections précédentes.

## Limites

Audit documentaire des fichiers et contrôle ciblé de trois pages publiques, sans validation exhaustive d’enseignant ni de tous les tirages d’exercices. Pas de modification produit, de test général, de build ou d’appel IA. Les sources n’ont été présentées comme ouvertes que lorsque l’outil a fourni leur texte ; refus 403 AMF explicités. Les PDF officiels ne sont pas à réécrire pour corriger ces formulations internes.
