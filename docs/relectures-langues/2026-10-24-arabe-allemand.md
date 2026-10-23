# Relecture des manuels arabe et allemand — 24 octobre 2026

Agent 2, audit de la version publiée par le commit compilé `64cb1e9` (source #96). Rapport sans modification du dépôt. Les numéros de pages et d’exercices imprimés ci-dessous désignent cette édition initiale, avant régénération corrective.

## Couverture et méthode

- Arabe : lecture des 26 leçons, des 86 énoncés/réponses/explications, lexiques et méthodes imprimées. Allemand : lecture des 25 leçons, des 100 énoncés/réponses/explications, lexiques et méthodes imprimées.
- Extraction intégrale du texte des PDF de 46 et 44 pages ; comparaison des points cités avec les sources JSON.
- Inspection visuelle des pages arabe 10, 12, 13, 14, 15, 35 et 37 ; allemand 29 et 32. Inspection de liaisons des lettres, vocalisation, bidirectionnalité, place des exemples français/arabe, questions et corrigés. Les images de contrôle sont dans `/workspace/work/audit-ar-*.png`, `/workspace/work/ar-audit-*.png` et `/workspace/work/audit-de-*.png`.
- Le parent prend en charge les contrôles exhaustifs HTTP et structure/navigation des cinq PDF : ils ne sont donc pas répétés ici. L’audit n’est pas une certification par deux enseignants natifs et ne prouve pas l’absence de toute coquille. Toutes les pages n’ont pas été inspectées visuellement une par une ; les textes des 90 pages ont été extraits et les sources intégralement relues.

## Erreurs ou ambiguïtés confirmées à corriger

### 1. Arabe : la consigne du duel ne correspond pas à la réponse

- Priorité P2 ; source `ar-ex-084`, attachée à `langues-lng-ar-gram-1`.
- PDF p. 12, exercice imprimé 24 ; corrigé p. 38.
- Consigne : « Traduis : ces deux élèves sont des garçons. Utilise une phrase simple avec “ces deux-ci” et “élèves”. »
- Réponse : `هذان طالبان`, qui signifie « Ces deux-ci sont des étudiants [masculins] », et non littéralement « ces deux élèves sont des garçons ».
- Correction recommandée : demander « Traduis : ces deux-ci sont des étudiants. Utilise le démonstratif et le nom au duel masculin. » La réponse existante devient alors adaptée.
- Complément nécessaire : le cours attaché ne donne ni `هذان` ni le nominatif duel `طالبان`. Ajouter le modèle `هذان طالبان` et expliquer que les deux formes sont au duel masculin nominatif. Éviter d’exiger une forme non enseignée dans une activité autonome.

### 2. Allemand : phrase contradictoire sur les faux amis

- Priorité P2 ; `de-lecon-23`, `paragraphs[1]`, dernière phrase ; PDF p. 27.
- Citation : « Les formes eventuell et aktuell sont des faux amis : éventuellement/peut-être et actuel, pas éventuellement et réellement. »
- Problème : « éventuellement » est à la fois donné et refusé ; en français, « éventuellement » et « actuel » sont justement des équivalents possibles de ces mots allemands. La confusion vient du passage par l’anglais, pas d’un faux ami allemand/français.
- Remplacement exact proposé : « Attention au passage par l’anglais : eventuell signifie peut-être / éventuellement et aktuell actuel ; ces mots ne correspondent pas à eventually (finalement) ni à actually (en fait). »

### 3. Allemand : plusieurs ordres corrects pour une consigne qui n’en fixe pas un

- Priorité P3 ; `de-ex-019`, champ `prompt` ; PDF p. 8 ; corrigé p. 35.
- « Réordonne : morgen / wir / arbeiten. » admet `Morgen arbeiten wir.` et `Wir arbeiten morgen.`.
- Le corrigé n’annonce que la première possibilité et explique que Morgen ouvre la phrase, alors que ce n’est pas imposé dans l’énoncé.
- Correction : « Réordonne : morgen / wir / arbeiten. Commence par Morgen. » ou citer explicitement les deux réponses possibles.

### 4. Allemand : absence d’article possible devant une profession

- Priorité P3 ; `de-ex-028`, champ `prompt` ; PDF p. 10 ; corrigé p. 36.
- « Complète : Er ist … Lehrer. » vise `ein`, mais `Er ist Lehrer.` est une formulation naturelle et correcte pour la profession.
- Le corrigé `Er ist ein Lehrer` est grammatical ; le défaut est la consigne trop générale.
- Correction : « Complète avec l’article indéfini au nominatif : Er ist … Lehrer. »

### 5. Allemand : conjugaison demandée sans modèle dans la leçon concernée

- Priorité P2 ; `de-ex-098`, rattaché à `de-lecon-25` ; PDF p. 29 ; corrigé p. 41.
- `Im Text steht, dass die Firma … (wachsen)` exige `wächst`.
- Le cours attaché traite la lecture, l’oral et quelques faux amis ; il ne contient pas `wachsen/wächst`. Les verbes à alternance vocalique ont été rencontrés plus tôt, mais une lecture autonome de cette leçon ne permet pas de deviner cette conjugaison.
- Correction : ajouter un repère lexical/contextuel dans cette leçon, par exemple « wachsen : croître ; die Firma wächst : l’entreprise se développe », puis réutiliser ce repère dans l’exercice. Une autre solution est d’employer un verbe déjà donné dans cette leçon.

### 6. Arabe : vocabulaire nécessaire absent des leçons auxquelles les activités sont attachées

- Priorité P2 pour l’autonomie pédagogique ; les réponses en elles-mêmes sont correctes.
- `ar-ex-063` : « j’étudie l’arabe » → `أدرس العربية`, PDF p. 12, exercice imprimé 27, corrigé p. 38.
- `ar-ex-064` : « nous travaillons » → `نعمل`, PDF p. 13, exercice imprimé 28, corrigé p. 38.
- `ar-ex-086` : « j’étudierai demain » → `سأدرس غدًا`, PDF p. 13, exercice imprimé 31, corrigé p. 38.
- Ces trois activités sont attachées à `langues-lng-ar-gram-2`, qui donne essentiellement les modèles de كتب. Elle n’enseigne ni أدرس, ni نعمل, ni غدًا. Certains mots existent ailleurs, mais ne doivent pas être implicitement exigés dans une activité autonome de cette leçon.
- Complément proposé dans `paragraphs` : « Autres modèles utiles : أَدْرُسُ العَرَبِيَّةَ (j’étudie l’arabe), نَعْمَلُ (nous travaillons). Demain se dit غَدًا ; سَأَدْرُسُ غَدًا signifie j’étudierai demain. »
- `ar-ex-068` : « le livre est sur la table » → `الكتاب على الطاولة`, attaché à `langues-lng-ar-gram-3`, PDF p. 14, exercice imprimé 35 ; corrigé p. 39. La leçon donne في/من/إلى/مع mais pas على ni الطاولة.
- Complément : « على signifie sur ; الطاولة, la table. الكتاب على الطاولة : le livre est sur la table. »

## Améliorations facultatives, distinctes des fautes

1. **Progression du manuel arabe** : les six axes culturels de Première précèdent la leçon d’alphabet/conjugaison ; l’alphabet détaillé n’arrive qu’à la leçon 10. Pour un débutant, proposer un itinéraire « premières lettres → phrases nominales → verbes → vie quotidienne → cultures » ou réordonner ces leçons. Les lecteurs déjà avancés peuvent garder une entrée culturelle. Ce n’est pas une erreur de langue.
2. **Part de langue cible dans les QCM** : une proportion importante des questions culturelles arabes interroge en français sur la méthode d’analyse d’un document. Ajouter progressivement des questions en arabe simple et des réponses courtes en langue cible permettrait de travailler davantage les compétences linguistiques ; conserver une consigne française claire pour les débutants.
3. **Vidéos allemandes** : les 28 ressources sélectionnées portent toutes le niveau A1. Les leçons relatives, hypothèses et argumentation vont plus loin. Ajouter ultérieurement des supports A2/B1 vérifiés et 1–2 liens thématiques par leçon renforcerait le parcours ; ne pas simplement requalifier les vidéos actuelles.
4. **Variantes des réponses courtes** : le manuel annonce déjà que plusieurs traductions peuvent être correctes. Les corrigés gagneraient à donner parfois une seconde formulation naturelle, par exemple `Ich habe Zeit` et variations de l’ordre des compléments, sans présenter le modèle comme unique. Pas de fausse réponse détectée de ce fait.
5. **Pronoms sie/Sie** : dans la leçon allemande 4, remplacer la première phrase métalinguistique « Sie peut désigner elle ou ils/elles » par « Le pronom sie peut désigner elle ou ils/elles ». Préciser que la majuscule de début de phrase ne suffit pas à distinguer politesse et troisième personne. Le contexte et la conjugaison sont déjà mentionnés ; cette précision évite une généralisation.

## Points vérifiés sans erreur confirmée

- Règles allemandes nominatif/accusatif/datif, pronoms et possessifs, verbes modaux et leur négation, prépositions de localisation/destination, Perfekt, relatifs et genitif : aucun faux corrigé grammatical identifié dans les 100 réponses relues.
- Distinction chiffre d’affaires/bénéfice, données du cas fictif NordRad, limite d’interprétation de l’action de réparation des ordinateurs : cohérents.
- Arabe standard/dialectes explicitement distingués ; lettres non liantes, signes vocaliques, article solaire/lunaire, adjectif épithète vs phrase nominale, annexion et suffixes, accompli/inaccompli, négations et accord du pluriel non humain : exemples relus cohérents.
- `مكتبة` est correctement désambiguïsé par le contexte « vend des livres ». `عندي سؤال` est acceptable en arabe standard ; ce n’est pas à écarter au motif qu’il existe aussi en dialecte.
- Pas de lettres arabes isolées ou inversées systématiquement dans les pages visuelles sélectionnées ; shadda et voyelles visibles, français et arabe séparés correctement. Une extraction PDF peut présenter des signes dans un ordre technique différent de leur rendu ; ce n’est pas un défaut de lecture observé.

## Transmission

Les six constats confirmés ont été envoyés au parent au fil de l’audit. Le parent a confirmé intégrer les premiers correctifs dans les JSON avant régénération ; ce rapport conserve les références de l’édition auditée pour tracer les problèmes. Aucun fichier du dépôt n’a été changé par cet agent.

---

## Addendum de contrôle après corrections — 24 octobre 2026

Vérification des PDF régénérés présents dans le dépôt de travail : arabe 47 pages ; allemand 44 pages. Aucun fichier du dépôt modifié par cet agent.

## Arabe

Inspection visuelle des pages 5, 7 et 8 (captures `/workspace/work/ar-final-check-{5,7,8}.png`) et vérification du texte de l’énoncé page 6 et du corrigé page 38.

- Le modèle du duel masculin `هذان طالبان` et son équivalent féminin `هاتان طالبتان` sont désormais enseignés avec la restriction explicite au nominatif. Les deux formes et leur traduction sont cohérentes.
- La consigne corrigée demande bien « ces deux-ci sont des étudiants » et correspond au corrigé. Elle ne demande plus de traduire « ces deux élèves sont des garçons ».
- Les modèles vocalisés pour étudier l’arabe, travailler à la première personne du pluriel et étudier demain sont présents et lisibles page 7. Ils apportent le vocabulaire manquant des activités signalées.
- `على`, `الطاولة` et `الكتاب على الطاولة` sont enseignés page 8 avec le bon sens et la bonne construction nominale. Les caractères liés, les points, la vocalisation et la direction des exemples sont corrects à l’écran dans les trois pages vues.
- L’alphabet et la grammaire précèdent désormais les axes culturels de Première : progression plus adaptée à une entrée débutante.

L’extraction technique de certaines lettres arabes peut être présentée dans un ordre ou sous une forme de glyphe différents du texte Unicode source ; les captures visuelles ont servi à confirmer le rendu réel, et non une recherche textuelle seule.

## Allemand

Corrections confirmées dans le texte extrait du PDF :

- sie/Sie distingués en milieu et début de phrase : page 6.
- « Commence par Morgen » : page 8.
- Article indéfini au nominatif demandé explicitement : page 10.
- Faux amis replacés dans le passage par l’anglais, sans la contradiction sur éventuellement : page 27.
- `wachsen → die Firma wächst`, sens et alternance a/ä enseignés avant l’exercice 98 : page 29 ; corrigé cohérent page 41.

Aucune régression de contenu confirmée lors de cette relecture ciblée.

## Dernière amélioration de mise en page facultative

Dans le PDF allemand inspecté, le bandeau « LEÇON 24 · VERS L’AUTONOMIE ET LA STMG » reste seul au bas de la page 27 alors que son titre commence page 28. Conseillé : empêcher une rupture juste après ce bandeau pour le garder avec son titre. Ce point a été transmis au parent ; il ne bloque pas la compréhension et ne remet pas en cause les corrections de fond.

Limite : contrôle final ciblé, pas une seconde inspection visuelle exhaustive des 91 pages.
