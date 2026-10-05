# Relecture des cours (octobre 2026)

Relecture de l'exactitude du contenu (`app/content/`), matière par matière. Ce
document dit ce qui a été vérifié, ce qui a été corrigé et ce qui reste à trancher
avec un professeur.

## Ce qui a été vérifié

| Domaine | Méthode | Résultat |
|---|---|---|
| Calculs chiffrés | Script : chaque égalité « a × b = c » du contenu est recalculée | 292 égalités, toutes justes |
| Formulaire (`commun/formules.json`) et formules des chapitres | Relecture complète | 1 erreur (EBE) |
| Définitions clés (`definitions.json`, 651 définitions) | Relecture complète | 4 imprécisions |
| Dates d'histoire (≈ 680 phrases datées, frises, chronologies) | Relecture complète | 7 erreurs |
| Articles de loi cités (Code civil, Code du travail, PCG) | Relecture | 1 référence périmée |
| Citations de philosophie (68 citations attribuées) | Relecture complète | 5 erreurs |
| Requêtes SQL (SIG) | Exécutées sur une vraie base (SQLite) | toutes valides |
| Verbes anglais et espagnols | Relecture des tables | justes |
| Règle « Terminale = notions de Terminale » | Thèmes comparés au programme officiel | 1 oubli corrigé, 1 point à trancher |

## Corrections

**Gestion et finance**
- Définition de la comptabilité : « art. 120-1 du PCG » → **art. 121-1** (numérotation du
  PCG en vigueur, règlement ANC 2014-03 ; 5 occurrences).
- Formulaire : EBE = VA **+ subventions d'exploitation** − impôts et taxes − charges de
  personnel (les subventions manquaient).
- Formulaire : le seuil de rentabilité se calcule avec le taux de MCV en décimal (note
  ajoutée, la ligne du dessus donne ce taux en %).
- Définition du bilan : le passif n'est pas « ce que l'on doit », ce sont les
  **ressources** (capitaux propres et dettes).

**Droit**
- Licenciement : le Code du travail exige une « **cause** réelle et sérieuse », pas un
  « motif réel et sérieux » (6 occurrences).
- Convention collective : pas seulement un accord de branche.

**Économie**
- Déficit public : concerne toutes les administrations publiques, pas seulement l'État.

**Histoire**
- Hitler adhère au parti en 1919 et en prend la tête en 1921 (et non « 1920 »).
- Dachau ouvre en mars 1933, pas le 30 janvier.
- 1947 : premier plan de modernisation (plan Monnet). « Début des Trente Glorieuses »
  contredisait la période 1945-1975 donnée partout ailleurs.
- Constitution civile du clergé : 12 juillet 1790 (et non le 14).
- « Droit au travail » et ateliers nationaux : février 1848 (et non le 2 mars).
- Empire allemand proclamé le 18 janvier 1871 (la capitulation de Paris est le 28).
- Coquille : « le projet de « guerre des étoiles » ».

**Philosophie**
- Descartes : « la **principale** perfection de l'homme » (Principes, I, 37), pas « la plus
  haute » (3 occurrences).
- Montesquieu : « La liberté est le droit de faire tout ce que les lois permettent »
  (citation exacte, *De l'esprit des lois*, XI, 3).
- Bergson : citation complète (« fabriquer des objets artificiels, en particulier des
  outils à faire des outils »).
- L'esthétique comme discipline : c'est Baumgarten qui forge le mot ; Kant en pose les
  fondements.
- Aristote : « la justice comme équité » est la formule de Rawls. Pour Aristote :
  justice distributive et corrective, et l'équité qui corrige la loi.

**Langues**
- Anglais, 3ᵉ personne : la règle affichée donnait « plaies » pour *play*. Elle dit
  maintenant : consonne + y → ies, mais voyelle + y → +s ; have → has.

**Management (Terminale, thème 1)**
- La section « Organiser la production » (flux poussé / tiré, juste-à-temps, qualité)
  était masquée comme prérequis de Première. C'est pourtant la question 1.3 du programme
  de Terminale (« Quels choix d'organisation de la production pour concilier
  flexibilité, qualité et maîtrise des coûts ? ») : elle est de nouveau affichée.
- Le mémo « L'essentiel » commençait par les types d'organisations et
  efficacité / efficience, notions de Première que le cours de Terminale masque. Elles
  sont remplacées par la création de valeur et l'organisation de la production.

**Accueil**
- Le message « Seconde, Première et les spécialités RH / Mercatique arriveront… » était
  faux (Première, RH et Mercatique sont en ligne). Il dit maintenant qu'on peut changer
  de niveau ou de spécialité depuis l'accueil.

## À trancher avec un professeur

- **Management stratégique / opérationnel** est affiché dans le cours de Terminale
  (thème 1) et en tête du mémo du thème 2. Le programme de Première demande déjà de
  « repérer les décisions relevant du management stratégique et celles relevant du
  management opérationnel ». S'il s'agit d'un simple rappel, on peut le masquer comme
  les autres prérequis (`PREREQ_SECTIONS` dans `app/src/data/index.js`).
- **Staline, 1928** : la frise date de 1928 la collectivisation et les plans
  quinquennaux. Le premier plan date bien de 1928, la collectivisation forcée de 1929.
  Simplification courante, laissée telle quelle.

## Essai : relecture par agents, droit de Terminale (5 octobre 2026)

### Méthode

1. **Un relecteur par thème** (thèmes 5 à 8). Chacun lit tout ce que voit l'élève :
   cours, encadrés de définitions, mémo, et environ 500 exercices générés par thème.
2. **Cinq vérificateurs par thème**, indépendants, qui jugent chaque signalement sans
   connaître l'avis du relecteur (texte actuel contre texte proposé). Profils :
   connaît tous les cours de l'app, juriste expert, professeur de STMG, niveau
   intermédiaire (étudiant en licence), meilleur niveau possible (professeur
   d'université). Trois modèles différents pour limiter les angles morts communs.
3. **Règle fixée avant les votes** : correction appliquée si au moins 4 vérificateurs
   sur 5 la confirment ; débat entre les cinq à 3 sur 5 ; rejet en dessous.

Les signalements et les votes, avec leurs justifications et leurs sources, sont dans
`docs/relecture-droit-terminale/`.

### Résultat

65 signalements : **57 corrections appliquées** (dont la force majeure après débat,
5 sur 5), **8 rejetées**. Les 8 rejets sont des simplifications acceptables (adage
« le contrat fait la loi des parties », prime de précarité, contrat de chantier,
bouteille qui explose) ou des choix éditoriaux (sections de propriété intellectuelle,
RGPD, transmission et bail commercial dans le thème 8, que 4 vérificateurs sur 5
jugent exactes même si elles débordent du programme).

**Erreurs de droit corrigées** (extraits) :
- Force majeure contractuelle : l'art. 1218 n'exige plus l'extériorité (seul le
  thème 5 cite cet article ; la responsabilité hors contrat du thème 6 garde les
  trois critères jurisprudentiels).
- La vente immobilière n'est pas un contrat solennel ; art. 1128 : « contenu licite
  et certain », pas « objet » ; pas de rétractation pour un billet de concert daté ;
  sanctions de l'inexécution selon l'art. 1217.
- Morsure de chien : art. 1243 (fait des animaux), pas le fait des choses ; la tuile
  qui tombe relève de la ruine du bâtiment ; le livreur qui percute une voiture
  relève de la loi Badinter (cas réécrit).
- Licenciement : sans cause réelle et sérieuse il est **abusif**, avec un simple vice
  de procédure il est **irrégulier** (indemnité d'au plus un mois de salaire).
- Obligation de sécurité de l'employeur : **de moyens renforcée** depuis l'arrêt Air
  France (2015) ; accidents du travail : réparation forfaitaire, faute inexcusable
  pour un complément ; ordre public social : principe de faveur et ses exceptions.
- Animal : être vivant doué de sensibilité (art. 515-14) ; résidence principale
  insaisissable depuis 2015 (pas 2022) ; responsabilité limitée seulement en
  principe (indéfinie et solidaire dans la SNC) ; corrigé du cas de Léa ;
  sous-traitance définie correctement.
- Thème 8 : le cours affiché ne traitait plus la concurrence (8.3) ni les
  partenariats (8.4) ; les quatre sections du cours complet sont de nouveau
  affichées après les cours réels (`COURS_COMPLET_AUSSI` dans `src/data/index.js`).

**Défauts du générateur d'exercices corrigés** (ils touchaient toutes les matières) :
- phrases coupées après « art. », « al. », « ex. » ;
- étiquettes (« Énoncé. », « Commentaire. », « Conclusion : ») prises pour des mots
  à trouver, et trous sans assez de contexte (moins de 5 mots) ;
- étapes de méthode et tableaux d'application (« Condition | Ici », « Forme |
  Responsabilité ») transformés en fausses définitions ;
- deux libellés de la même notion proposés comme deux réponses différentes, et
  notions liées opposées dans les vrai/faux (« Contrat de travail » / « CDI / CDD ») ;
- bonnes réponses refusées : l'article, le numéro de liste et la ponctuation ne
  comptent plus dans les exercices de cours (pas en langues), et des synonymes sont
  acceptés (`content/commun/reponses-acceptees.json`) ;
- cas pratiques du test de thème sans énoncé : l'énoncé est maintenant la question,
  et l'analyse qui le suit le corrigé.

Au total, environ 2 % des exercices générés disparaissent (37 390 → 36 503), presque
tous défectueux. Les exercices des autres matières changent aussi, puisque le
générateur est commun ; leur contenu de cours, lui, n'a pas été relu par cette méthode.

### Ce que l'essai apprend

- Le relecteur trouve beaucoup plus que la relecture par extraits : 65 signalements
  sur 4 thèmes, dont 57 confirmés.
- Les vérificateurs filtrent vraiment : 8 rejets, et ils ont amélioré de nombreuses
  corrections (tuile → ruine du bâtiment, livreur sans véhicule, « caution » impossible
  en entreprise individuelle…).
- Le vérificateur « niveau intermédiaire » (le modèle le plus léger) a voté
  « corriger » presque partout, a une fois décalé ses réponses d'une question, et
  s'est deux fois contredit ; ses votes pèsent peu dans le résultat.
- Coût : environ 30 agents pour 4 thèmes, et la limite d'utilisation a été atteinte
  une fois en cours de route. Pour les 94 thèmes, il faut étaler sur plusieurs jours.

### À trancher avec un professeur

- Thème 8 : propriété intellectuelle et RGPD (programme de Première, thème 4),
  transmission d'entreprise et bail commercial (hors programme du thème 8) restent
  dans le cours. Faut-il les signaler comme rappels ou les retirer ?
- Les autres thèmes « par l'exemple réel » cachent-ils aussi une partie du programme,
  comme le thème 8 ? À vérifier thème par thème.
