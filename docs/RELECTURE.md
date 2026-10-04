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
