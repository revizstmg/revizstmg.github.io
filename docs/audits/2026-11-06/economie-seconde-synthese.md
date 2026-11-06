# Seconde relecture économique

Deux agents indépendants ont relu la version publiée après #182 et #183, source `51a260055f654c01d1175437e7de41fe2fe327cc`. Ils ont travaillé dans deux worktrees distincts, sans échange de conclusions avant remise. Aucune correction produit dans ce lot.

## Huit points confirmés après regroupement

| Importance | Point | Références | Origine |
| --- | --- | --- | --- |
| 8/10 | Tri financement direct/indirect servi dans le chapitre consacré uniquement aux banques | E2-01 | Préexistant, rattachement réellement observé |
| 7/10 | PIB annoncé comme ignorant toute économie souterraine, alors que les comptes procèdent à des estimations | C2-01 | Préexistant, page publique vérifiée |
| 7/10 | Obligations présentées systématiquement à intérêt fixe et comme plus sûres | C2-02, E2-02 regroupés | Préexistant, exercices générés et page publique vérifiés |
| 6/10 | Exception BIT de l’emploi déjà trouvé non propagée aux études et autres rappels | E2-03 | Harmonisation incomplète après correction du cours |
| 5/10 | Taux directeurs réduits au seul refinancement des banques | C2-03 | Préexistant, page publique vérifiée |
| 5/10 | Trois dénominateurs annoncés différents alors qu’activité et emploi utilisent la même population de référence | E2-04 | Préexistant, contradiction des formules |
| 5/10 | Un trou demande « cet exemple », sans notion économique | E2-05 | Régression introduite par le gras ajouté dans #182 |
| 4/10 | Travail réduit aux salariés et capital matériel incluant pourtant les logiciels | C2-04 | Préexistant |

Ce décompte regroupe neuf constats entre les deux rapports : celui sur les obligations est commun aux deux agents. Il ne mélange pas les quatre nuances ci-dessous aux huit points confirmés.

## Quatre nuances séparées

- Investissement : ajouter renouvellement/remplacement, au lieu de le réduire à l’augmentation du stock de capital (N2-01, 5/10).
- IDH : présenter santé, éducation et revenu comme trois dimensions, sans donner leur somme comme formule (N2-02, 4/10).
- Dette : harmoniser une introduction conservant le raccourci déficits accumulés, alors que la couche approfondie explique les autres opérations financières (N2-03, 4/10).
- Inflation : conditionner l’effet sur le pouvoir d’achat à l’évolution du revenu dans une explication de QCM ; la bonne réponse de cette question n’est pas démontrée fausse (E2-06, 4/10).

## Preuves et limites

- [Rapport cours](economie-cours-seconde-relecture.md) : références et pointeurs JSON, sources effectivement consultées, trois pages publiques HTTP 200 avec empreintes.
- [Rapport exercices et sujets](economie-exercices-seconde-relecture.md) : 94 chapitres sondés, banques et études relues, quatre PDF historiques intacts, limites des tirages et accès aux sources.
- [Extraits de sonde](economie-seconde-preuves.json) : rattachement réellement servi, réponses générées et paragraphes concernés.

Les anciennes corrections PIB marchand/non marchand, croissance en volume, financement épargne-investissement, Novéo, dividende non garanti, périmètre de dette publique, statut étudiant/retraité, cible BCE et thème 9 écrit 2027 restent présentes. Aucune réécriture des PDF officiels n’est proposée. Le nouveau sujet 2025-2026 sur l’épargne reste un chantier distinct, non compté comme régression de cette livraison.

Cette campagne n’a pas relancé les suites générales ni la compilation et n’a appelé ni Supabase ni une correction IA réelle. Elle ne constitue pas une certification professorale de tout le contenu. Les défauts sont documentés, pas corrigés dans cette PR de rapports.
