# Audit des PDF de cours et des ressources hors examens

Date : 8 novembre 2026. Audit en lecture seule du produit, dans le dépôt après PR #200. Aucun compte réel, donnée élève, appel IA ou paiement utilisé. Le présent rapport complète `docs/audits/2026-11-07/pdf-examens-audit.md`.

## Résultat et couverture réelle

- Les cinq guides de langues et les trois référentiels EPS sont accessibles publiquement en HTTP 200 et identiques octet par octet aux fichiers sources du dépôt.
- 277 pages contrôlées par extraction : 241 pages de langues et 36 pages de références EPS. Aucun débordement de boîte de texte hors page, aucune page vide ni destination interne invalide détectée dans ces huit documents.
- Les 504 couples énoncé/réponse des guides ont été relus. Aucun résultat manifestement faux repéré dans cette passe ; cette relecture n’équivaut pas à une certification de toutes les nuances par cinq professeurs natifs. Les 126 leçons n’ont pas toutes été relues intégralement ligne par ligne.
- Les 219 URL HTTPS distinctes intégrées aux huit PDF ont été testées. 210 ont répondu HTTP 200 au premier passage ; neuf VideoEle ont répondu 503 puis toutes 200 au second passage à concurrence réduite. Aucun lien durablement cassé confirmé. Un HTTP 200 ne certifie pas que la vidéo est lisible dans tous les pays ni sans compte.
- 21 tests existants réussis dans `guides-langues`, `cours-langues`, `eps` et `reward-kit`. Ils valident les contrats et certaines règles, pas une lecture humaine exhaustive.
- Un défaut certain de police dans les kits boutique, deux exemples précis de pagination à améliorer dans les langues. Les PDF officiels EPS conservent leur présentation d’origine.

## Défaut confirmé

### PDF-C1, important : les caractères non latins et certains symboles sont corrompus dans les kits boutique

Source : `app/src/data/rewardKit.js`, fonction `downloadRewardKit`, notamment `text(kit.name,14)` et les questions/réponses reprises du compte.

Le générateur crée `new jsPDF()` sans embarquer de police Unicode. La fonction de texte ne remplace que les tirets longs. Un prénom arabe comme « محمد » devient des caractères parasites ; le symbole `≈` provoque également une extraction corrompue. Le problème est visible page 1 du PDF témoin local `app/revizstmg-kit-bac.pdf`, déjà présent et non modifié pendant cet audit. Aucun prénom de compte réel n’a été lu.

Reproduction isolée avec la même bibliothèque et sa police par défaut : `/tmp/pdf-cours-audit/kit-unicode-reproduction.pdf`, texte synthétique `محمد` et `x² + 2x ≈ 10`. Extraction : `þªþäþ¤þã` et octets NUL autour des caractères de la formule ; le rendu du témoin est illisible. Le guide arabe n’est pas concerné : il utilise Chromium et des polices adaptées.

Correction recommandée : embarquer une police couvrant réellement les écritures et symboles autorisés, traiter le sens et la composition arabes, puis tester prénom, question et réponse multilingues. Une normalisation des seuls symboles mathématiques peut compléter cette solution, mais ne doit pas supprimer ou translittérer arbitrairement les noms.

## Améliorations de présentation, distinctes des erreurs de contenu

### PDF-C2, faible : fin de bibliothèque vidéo presque vide

- `https://revizstmg.github.io/cours/langues/guide-de.pdf`, page 33 sur 44 : seulement les liens 27 « Ist das gesund? » et 28 « Jahreszeiten », puis un grand blanc (161 caractères avec pied de page).
- `https://revizstmg.github.io/cours/langues/guide-es.pdf`, page 39 sur 52 : seulement les liens vidéo 27 à 32, puis le reste de la page vide (291 caractères avec pied de page).

La liste vidéo en deux colonnes et le saut forcé avant la partie des corrigés aggravent la pagination. Compacter la bibliothèque et ses marges, ou équilibrer ses colonnes, peut économiser une page. Garder les textes et liens intacts ; mesurer après changement, sans promettre un nombre de pages avant rendu.

### PDF-C3, modéré : les kits restent davantage des plannings que des dossiers riches

`buildRewardKit` alterne deux listes de trois actions génériques, puis ajoute les questions ratées/réussies enregistrées. Les plans sont liés aux thèmes faibles, mais les consignes quotidiennes restent répétitives. Le « pack objectif bac » n’est pas un cours supplémentaire : mieux préciser son contenu, et envisager des objectifs chiffrés adaptés aux devoirs, des liens vers chaque chapitre et une sélection de compétences. Il s’agit d’une amélioration de valeur pédagogique, pas d’un calcul faux ni d’une promesse de note présente dans le PDF.

## Inventaire public contrôlé

| PDF | Pages | Leçons | Exercices | Pages vidéo annoncées |
|---|---:|---:|---:|---:|
| `/cours/langues/guide-en.pdf` | 51 | 24 | 110 | 50 |
| `/cours/langues/guide-de.pdf` | 44 | 25 | 100 | 28 |
| `/cours/langues/guide-es.pdf` | 52 | 25 | 122 | 32 |
| `/cours/langues/guide-it.pdf` | 47 | 26 | 86 | 48 |
| `/cours/langues/guide-ar.pdf` | 47 | 26 | 86 | 46 |
| `/eps/referentiel-ccf-2026.pdf` | 19 | Référentiel officiel | — | — |
| `/eps/referentiel-ponctuel-2026.pdf` | 6 | Référentiel officiel | — | — |
| `/eps/programme-eps-2019.pdf` | 11 | Programme officiel | — | — |

Les cinq PDF de langues existent aussi sous URL de ressources compilées ; la page de cours statique propose les URL stables ci-dessus. Les bilans de leçons, lexiques et corrigés sont présents. Les exemples de production sont annoncés comme des possibilités et non des réponses uniques. Le manuel arabe distingue arabe standard et dialectes. Les références EPS portent bien les titres CCF/ponctuel et le programme lycée général et technologique.

## Méthode visuelle et limites

Couverture, page centrale et dernière page de chacun des huit PDF inspectées sur planches de rendu ; page 4 du guide arabe agrandie ; pages presque vides identifiées par extraction. Il ne s’agit pas d’une inspection à fort zoom de chacune des 277 pages. Les textes natifs restent extractibles ; aucune perte massive de caractères détectée dans les guides langues.

Les impressions locales des cours, des plans EPS et du tableau de classe sont des sorties dynamiques de `window.print()`, pas des fichiers statiques disponibles à une URL stable. Leur code et les règles de pagination ont été repérés, mais tous les cours et toutes les configurations de ces sorties n’ont pas été imprimés dans cette reprise. Il faut donc compléter l’audit si « tous les PDF » inclut chaque export possible de données et chaque navigateur. Les trois kits (`kit-semaine`, `kit-maitrise`, `kit-bac`) partagent le générateur affecté par C1 ; aucune collecte réelle de récompense n’a été effectuée.

Les ressources PDF officielles externes de mathématiques et autres documents de référence ne sont pas toutes couvertes par ces huit fichiers. L’audit examens précise son propre périmètre. Ne pas annoncer « tous les PDF du site certifiés » sur la base de ces seules passes.

Preuves temporaires : `/tmp/pdf-cours-audit/public.json`, `links-results.json`, `links-retry.json`, textes extraits, huit planches de rendu, reproduction Unicode et `tests.log`. Les preuves temporaires ne sont pas publiées et aucun fichier produit n’a été modifié.
