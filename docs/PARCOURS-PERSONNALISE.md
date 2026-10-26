# Mon parcours : un plan personnalisé, semaine par semaine

Page `/#/parcours`, accessible depuis une carte de l'accueil et, au choix de l'élève, depuis la
barre de navigation (onglet « Mon parcours »). Calcul entièrement local : aucune IA, aucun coût,
aucune donnée envoyée, aucune nouvelle table Supabase.

## Parcours de l'élève
1. **Objectifs** : note visée (8 à 18), heures de révision par semaine, matières jugées difficiles.
2. **Test de positionnement** (facultatif, par matière) : 6 questions QCM tirées de thèmes différents.
   Une erreur n'a aucune conséquence. Le résultat est gardé par thème et par matière.
3. **Plan** : « Cette semaine » avec son avancement, puis les semaines suivantes jusqu'aux épreuves.
   Si le temps manque, le plan le dit et propose un volume d'heures réaliste en un clic.

## Comment le plan est calculé (`app/src/data/parcours.js`)
- **Maîtrise estimée d'un thème** : le test de positionnement donne le point de départ ; ce que l'élève
  fait ensuite pèse de plus en plus (jusqu'à 80 %) ; une révision en retard fait perdre jusqu'à 30 %.
  Sans aucune donnée, la valeur est prudente (35 %) et l'écran dit « niveau pas encore mesuré ».
- **Cible** : la note visée donne la maîtrise à atteindre (8 → 50 %, 12 → 67 %, 16 → 84 %, 18 → 92 %).
- **Échéances** : chaque matière a la date de son épreuve (`content/commun/epreuves.json`) ; le contrôle
  continu a pour échéance la fin des écrits ; la date choisie par l'élève (compte à rebours) l'emporte.
- **Séances** : découvrir un thème pas encore abordé (2 chapitres par séance, environ 36 minutes),
  consolider l'écart avec la cible (séances de 30 minutes, plus longues pour une matière difficile),
  rappel de 8 minutes dans les deux dernières semaines avant l'épreuve.
- **Répartition** : chaque semaine alterne les matières ; on sert d'abord celle qui a le plus de travail
  par semaine restante avant son épreuve. Un thème garde l'ordre découvrir, consolider, rappel.
- **Adaptation** : rien n'est figé. Le plan est recalculé à chaque changement de progression, de
  répétition espacée, d'objectifs ou de date : ce qui est maîtrisé prend moins de place, ce qui résiste
  en prend plus. Les durées sont des estimations.

## Données et synchronisation
`state.parcours` = `{ objectifs, positionnement, semaine, maj }`, envoyé avec la progression du compte
(`PROGRESS_KEYS`). Fusion entre appareils : la version modifiée en dernier l'emporte, mais le test de
positionnement le plus récent de chaque matière est toujours conservé. `semaine` mémorise le temps prévu
au début de la semaine pour mesurer ce qui est fait.

## Limites
- Les durées par chapitre (18 minutes de découverte, 10 de consolidation) sont des hypothèses, pas des
  mesures. Elles sont regroupées en constantes en tête de `parcours.js`.
- Le test de positionnement n'évalue que les QCM du site : il ne mesure ni l'expression écrite ni l'oral.
- Pas de conseil rédigé par IA : une couche « conseil » serait possible plus tard, avec un accord sur le
  coût et sur les données transmises.

## Tests
`tests/parcours.test.js` (moteur, synchronisation), `tests/parcours/parcours-personnalise.spec.js`
(parcours complet, 320 px, mode sombre, allemand sans appel externe, accessibilité AA).
