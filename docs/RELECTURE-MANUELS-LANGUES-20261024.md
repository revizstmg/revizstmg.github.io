# Relecture des cinq manuels de langues — 24 octobre 2026

Relecture demandée par le propriétaire, répartie entre deux agents : anglais/espagnol/italien et arabe/allemand. Version examinée : sources publiées par #96 (b3b5ce2, compilation 64cb1e9). Les références de pages des rapports détaillés désignent cette version, avant corrections et déplacement des leçons ; les identifiants de leçons et d’exercices restent stables.

## Périmètre

| Langue | Leçons | Exercices corrigés | Pages avant correction | Vidéos |
|---|---:|---:|---:|---:|
| Anglais | 24 | 110 | 50 | 50 |
| Espagnol | 25 | 122 | 52 | 32 |
| Italien | 26 | 86 | 46 | 48 |
| Arabe | 26 | 86 | 46 | 46 |
| Allemand | 25 | 100 | 44 | 28 |
| **Total** | **126** | **504** | **238** | **204** |

Sources JSON relues, questions comparées à leurs réponses et explications, texte des PDF extrait et pages représentatives inspectées visuellement. La vérification technique couvre toutes les pages et tous les liens. Les vidéos n’ont pas été intégralement visionnées et cette relecture ne constitue pas une certification d’absence de toute coquille par des enseignants natifs.

## Corrections confirmées intégrées

- Anglais : consignes de six exercices de participes passés, règles de temps et de modaux, vocabulaire financier, article devant STMG, classement des verbes irréguliers, règles manquantes du past continuous et questions de compréhension qui allaient au-delà de ce que disait le document. Renvoi au lexique clarifié et référence au fonctionnement d’un jeu retirée du PDF.
- Espagnol : consignes de six conjugaisons au prétérit, explications de ser/estar et de l’aspect des passés, emploi du subjonctif, exceptions de l’impératif et balisage du titre gustar. Question sur ayer précisée et référence au fonctionnement d’un jeu retirée.
- Italien : comparaison d’égalité et prérequis c’è/ci sono ajoutés à la leçon de l’exercice concerné.
- Arabe : traduction au duel corrigée ; modèles de conjugaison et vocabulaire ajoutés dans les leçons liées aux exercices.
- Allemand : faux amis via l’anglais, consignes sur Morgen et l’article de profession précisées, modèle wachsen/wächst ajouté, explication sie/Sie clarifiée.

Les anciens cours archivés, l’historique d’élève et les paramètres Supabase restent hors périmètre.

## Contrôle des fichiers et des liens

Avant correction : les 1 166 liens internes ciblent des pages existantes ; aucun mot extrait hors des limites A4 ; aucune page quasi vide selon le contrôle automatisé (moins de quinze mots de corps de page). Les 204 vidéos sont présentes dans les PDF.

Les **219 URL externes distinctes** (204 pages vidéo et 15 ressources générales) ont répondu HTTP 200 lors du contrôle. Les 204 pages vidéo contiennent un marqueur de lecteur ou de ressource vidéo. Ce constat vérifie leur accessibilité technique au moment du contrôle, pas la disponibilité future ou les conditions d’accès de chaque éditeur.

Les PDF corrigés ont été régénérés et contrôlés de nouveau : 51 pages anglais, 52 espagnol, 47 italien, 47 arabe et 44 allemand (241 pages). Les 1 166 liens internes restent résolus et les 204 vidéos sont présentes ; aucun texte hors page ni page quasi vide. Le bandeau de chaque leçon reste avec son titre. Les deux agents ont confirmé leurs principales corrections dans les PDF régénérés ; le dernier ajustement CSS garde ces mêmes contenus.

## Améliorations pédagogiques

**Intégré :** les six axes culturels de Première sont déplacés après la grammaire, le vocabulaire et les premières compréhensions dans les manuels arabe et italien. Les accès directs du sommaire et des corrigés sont régénérés.

**Pistes restantes, distinctes des fautes :** vidéos allemandes A2/B1 (les 28 actuelles sont A1), davantage de questions en langue cible dans les axes culturels, et variantes naturelles supplémentaires dans les corrigés de traduction. Les vidéos actuelles ne sont pas artificiellement requalifiées.

## Rapports détaillés

- [Arabe et allemand](relectures-langues/2026-10-24-arabe-allemand.md).
- [Anglais, espagnol et italien](relectures-langues/2026-10-24-anglais-espagnol-italien.md).

## Validation et publication

- 399 tests unitaires réussis (43 fichiers), compilation et trois parcours navigateur locaux réussis.
- Après le dernier ajustement de pagination : sept tests de guides réussis, compilation puis contrôle navigateur final avant fusion.
- La PR #97 porte les sources, les PDF et les rapports. Les résultats complets de la chaîne GitHub et la vérification du site public seront consignés dans son commentaire de publication.
