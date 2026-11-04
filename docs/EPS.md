# EPS au bac

Un seul espace : `/#/sport-bac`. La vue initiale de Claude (#164) conserve les cinq champs, les critères détaillés du CCF, l’estimation et les plans par famille. Le bouton « Les 26 activités et l’examen ponctuel » ouvre le complément. Un accès est ajouté depuis Cours. La règle d’accès Premium existante est conservée.

## Références

- Programme national de 2019, toujours référencé dans les ressources Éduscol consultées le 3 novembre 2026 : 26 activités ou familles, réparties en 4/4/4/9/5 dans les cinq champs. Courses, sauts et lancers sont des familles, pas une épreuve locale unique.
- Note du 20 février 2026, BO n° 9 du 26 février : <https://www.education.gouv.fr/bo/2026/Hebdo9/MENE2531948N>.
- Annexe 1 : référentiel CCF, AFL1 /12 et AFL2+AFL3 /8, seuils médians CA1. Les 24 lignes ne constituent pas des barèmes universels sur 20. Les grilles du lycée et les activités académiques restent à demander au professeur.
- Annexe 2 : examen ponctuel, 800 m, danse et tennis de table ; composantes sur 20 et tableau du 800 m sur 10. Le calculateur lit uniquement un palier, sans interpolation ni note finale automatique. Les autres composantes restent évaluées par le jury.
- Les trois PDF officiels sont copiés sans modification dans `app/public/eps/`. URLs d’origine et empreintes SHA-256 : `app/content/eps/sources.json`. Les sources sont françaises ; les PDF officiels ne sont pas traduits.

## Entraînement complémentaire

26 fiches : conditions, deux compétences, rôle, exercice à sec et exercice encadré. Les propositions de RévizSTMG sont distinctes des référentiels officiels, sans promesse de note. Le programme de quatre semaines comprend deux séances par semaine, une récupération entre les séances et une dernière semaine allégée. Choix : reprise/régulier/à l’aise, 20/30/45 minutes, à sec ou pratique encadrée avec matériel adapté. Les blocs incluent les pauses et totalisent exactement la durée choisie.

L’eau, la hauteur, les agrès, les portés, les engins et le contact ne sont pas proposés en pratique autonome : le choix « à sec » utilise les exercices préparatoires correspondants. Niveau d’effort plafonné à 6/10 et arrêt en cas de douleur ou malaise. Impression possible ; aucun entraînement n’est envoyé à une IA ni enregistré dans le compte. Les anciens plans plus longs de Claude restent disponibles.

## Vérification et limites

Tests dédiés : couverture du catalogue, composantes distinctes, paliers exacts, invalides, durées et allègement ; parcours catalogue/filtres/plan/impression, barèmes, petit écran et contraste dans les deux thèmes. Les contrôles et noms sont traduits hors ligne dans cinq langues ; les textes pédagogiques utilisent le mécanisme de traduction publique existant avec repli français. Les données de l’élève ne sont pas transmises par ce module.

Une relecture par un professeur d’EPS reste souhaitable pour les propositions d’entraînement. Aucune académie ni aucun lycée n’a été indiqué : aucune grille locale n’est présentée comme nationale. Aucun changement Supabase.
