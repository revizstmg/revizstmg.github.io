# RévizSTMG — vérification des cours et des exercices (19 octobre 2026)

Cinq relectures en parallèle, en lecture seule, sur la version en ligne (`main` à `e9ff462`). Aucun fichier n'a été modifié.

## Bilan

| Groupe | Bloquant | Important | Mineur | Total |
|---|---:|---:|---:|---:|
| 1. Spécialités de Terminale (gestion-finance, SIG, mercatique, RH-communication) | 2 | 18 | 22 | 42 |
| 2. Management, droit, économie (Terminale) | 5 | 17 | 21 | 43 |
| 3. Maths, philosophie, français, formules et atelier | 1 | 16 | 26 | 43 |
| 4. Histoire-géographie et langues (Première et Terminale) | 2 | 14 | 31 | 47 |
| 5. Matières de gestion de Première, fichiers communs | 2 | 14 | 26 | 42 |
| **Total** | **12** | **79** | **126** | **217** |

## Les 12 problèmes bloquants (faux pour l'élève)

1. **Gestion-finance** : écriture d'achat avec escompte déséquilibrée (607 débité de 1 881 € au lieu de 1 900 €) ; le commentaire dit à tort que l'achat se comptabilise au net financier (`approfondi-1.json`, gf-t1[16]).
2. **SIG** : les critères de sécurité changent selon les pages (CID, DIC, DICP, DICT) ; le tri `sig-t4-tri` classe la traçabilité en Intégrité alors que le cours l'appelle Preuve.
3. **Économie (T)** : l'exemple de Ricardo (vin et drap) illustre l'avantage absolu, pas l'avantage comparatif (`approfondi-1.json`, eco-t8).
4. **Économie (T)** : « fonction de répartition » et « redistribution » ont des définitions interchangeables ; QCM à deux bonnes réponses.
5. **Management (T)** : chapitre « Parties prenantes », QCM générés à deux bonnes réponses et vrai/faux mal corrigé.
6. **Management (T)** : « Compétitivité hors-prix : offrir ce que le client ne trouve pas ailleurs » corrigé Faux.
7. **Droit (T)** : « Erreur : consentement faussé qui rend le contrat annulable » corrigé Faux.
8. **Philosophie** : dans `philo-verite`, la puce « Définir » est prise pour une notion ; l'élève qui répond « Vérité » est compté faux.
9. **Histoire (T)** : hg-h3, le tableau mêle périodes et notions ; un vrai/faux « Désindustrialisation : Désindustrialisation » est corrigé Faux.
10. **Espagnol** : « être » attend *ser* dans une série et *estar* dans l'autre ; la bonne réponse est refusée.
11. **Économie (Première)** : le cours confond utilité totale et utilité marginale ; vrai/faux, QCM et flashcard faux.
12. **SGN (Première)** : « performance » et « efficacité » ont des définitions indiscernables ; QCM, association et memory à deux bonnes réponses.

## D'où viennent la plupart des erreurs

- **Exercices générés à partir des tableaux de notions** : quand deux lignes se recouvrent (une notion et son sous-type, deux synonymes, une période qui en contient une autre), le générateur produit des QCM à deux bonnes réponses ou des vrai/faux mal corrigés. Correction la plus rentable : compléter `content/commun/notions-liees.json` (4 paires aujourd’hui ; les rapports en proposent plusieurs dizaines).
- **Exercices rattachés au mauvais chapitre** : les numéros de `exercices-sections.json` suivent l'ordre de `matiere.json`, pas celui des chapitres affichés (numéros corrigés dans les rapports 1 et 2).
- **Cours jamais affichés** : `cours-reels.json` remplace le cours au lieu de s'y ajouter ; des exercices portent sur des sections invisibles (GED, HTML/CSS, Taylor, CSE…). Correction : `COURS_COMPLET_AUSSI` dans `src/data/index.js`.
- **Saisies trop strictes** : « 2 septembre 1945 » refusé quand la réponse est « 2 sept. 1945 », « wake up » sans « to », « Dégager la thèse » sans « ① ».

## Programme à revérifier (BO spécial n° 4 du 17 septembre 2026)

Les rapports 2, 3 et 5 signalent une note de service du 17 septembre 2026, applicable dès la session 2027, qui change le Grand Oral de la voie technologique et l'épreuve anticipée de français, et qui pourrait rendre le thème 9 d'économie évaluable à l'écrit. Les sites officiels étaient inaccessibles depuis la session : à confirmer sur education.gouv.fr avant de corriger.

Autres écarts de programme signalés : discriminant enseigné en Première (hors programme technologique), thème « Loi normale et estimation » en Terminale probablement hors programme, alors que les fonctions exponentielles, le logarithme décimal et la fonction inverse n'ont pas de thème ; découpage des thèmes 2 à 5 d'économie de Première différent du programme.

## Limites

- eduscol, Légifrance, education.gouv.fr et cnil.fr étaient bloqués : les points de fond ont été vérifiés par moteur de recherche, ou de mémoire pour les articles de loi. Ce qui n'a pas pu l'être est marqué « probable » ou « à vérifier ».
- Les quelque 6 000 questions générées automatiquement ont été contrôlées par échantillons et par type, pas une par une.

Les cinq rapports détaillés suivent : pour chaque problème, le fichier, l'emplacement, la citation, la correction proposée, la gravité et la certitude.



---

## Rapport — Vérification du contenu de RévizSTMG : spécialités de Terminale

Périmètre : `gestion-finance`, `sig`, `mercatique`, `rh-communication`, dans la copie figée `/var/tmp/verif-contenu/app/content/`. J'ai tout lu en lecture seule et je n'ai modifié aucun fichier du dépôt.

## Récapitulatif

| Matière | Bloquant | Important | Mineur | Total |
|---|---:|---:|---:|---:|
| Défauts transversaux (G-1 à G-3, les 4 matières) | 0 | 2 | 1 | 3 |
| Gestion et finance (GF-1 à GF-16) | 1 | 6 | 9 | 16 |
| Systèmes d'information de gestion (SIG-1 à SIG-8) | 1 | 3 | 4 | 8 |
| Mercatique (MKG-1 à MKG-8) | 0 | 3 | 5 | 8 |
| RH et communication (RH-1 à RH-7) | 0 | 4 | 3 | 7 |
| **Total** | **2** | **18** | **22** | **42** |

Échelle de gravité :
- **bloquant** : un élève qui applique le cours reçoit une correction fausse, ou apprend une écriture ou un calcul faux ;
- **important** : erreur de fond, contradiction entre deux passages, ou notion interrogée sans être enseignée ;
- **mineur** : imprécision, mauvais rangement ou terme périmé.

Les problèmes regroupés (G-1, GF-4, MKG-2, RH-2…) comptent pour un seul, mais touchent souvent une dizaine d'exercices chacun.

**À corriger en priorité :**
- GF-1 : l'écriture du cycle d'achat est déséquilibrée ;
- SIG-1 : les critères de sécurité changent d'une page à l'autre, et le tri compte faux la réponse du cours ;
- G-1 : une partie du cours n'est jamais affichée, alors que de nombreux exercices portent dessus ;
- G-2 : beaucoup d'exercices sont placés sur le mauvais chapitre ;
- GF-2 : la règle sur le calcul du seuil de rentabilité est fausse ;
- GF-3 : la TVA du café est à 10 %, pas 20 % ;
- GF-5 : l'affectation du résultat a disparu du cours ;
- GF-7 : la formule de la valeur ajoutée est incomplète ;
- SIG-2 et MKG-1 : le RGPD ne se limite pas au consentement ;
- RH-1 : l'ordre des modes de résolution des conflits est illogique.

Contenus **masqués** : les sections `cours` de `matiere.json` (les quatre matières) et de `cours-complets.json` (gestion-finance) ne sont pas affichées aujourd'hui (voir G-1). Je les ai relues quand même, car leur correction devient nécessaire si on les réaffiche. Les erreurs qui s'y trouvent sont marquées « (masqué) ».

## Ce qui a été couvert et comment

- **Lecture intégrale**, thème par thème, de tous les fichiers JSON des quatre matières : `matiere.json` (cours, formules, QCM, vrai/faux, flashcards, associations, tris, remises en ordre, textes à trous, requêtes SQL), `cours-complets.json`, `cours-reels.json`, `approfondi-1.json`, `approfondi-4.json`, `sic-si.json`, `enrichissements.json`, `definitions.json`, `pieges.json`, `cas-pratiques.json` et `exercices-sections.json`.
- **Générateurs « Calcul express »** de `src/calc.js` (tva, amortissement, caf, frng, seuil) : formules et bornes relues. Aucune erreur.
- **Contenu assemblé tel que l'élève le voit**, obtenu avec `chargerMatieres`, `themeChapters` et `buildThemeTest` dans le script lecture seule `scratchpad/verif/assemble.mjs`. Le texte affiché de chaque thème est dans `scratchpad/verif/affiche/<thème>.txt`. Cette étape a montré deux défauts structurels (G-1 et G-2 ci-dessous), qui touchent les quatre matières.
- **Calculs** : tous les exemples chiffrés et tous les corrigés ont été refaits.
- **Sources officielles** : eduscol.education.fr, legifrance.gouv.fr, education.gouv.fr et cnil.fr sont **bloqués** par le proxy de cette session (refus 403). Les vérifications de fond sont donc passées par un moteur de recherche. Quand je n'ai pas pu confirmer un point sur une source officielle, il est classé « à vérifier ».
- **Pas relu ligne à ligne** : les exercices **générés automatiquement** à partir du texte du cours (« QCM — les notions du chapitre », « Texte à trous — série n », « Écris le terme », « Memory »…), soit environ 6 000 questions tirées au hasard. J'en ai seulement échantillonné (gf-t2 en entier). Leurs défauts viennent du texte du cours relu ici, ou du moteur (voir G-3).

## Défauts transversaux (les quatre matières)

### G-1 — Une partie du cours n'est jamais affichée, alors que les exercices écrits à la main portent dessus — **important**, sûr
- **Mécanisme** (`src/data/index.js`, `assemblerTheme`) : quand un thème a une entrée dans `cours-reels.json`, celle-ci **remplace** le cours, et non l'enrichit. Résultat :
  - pour `sig`, `mercatique` et `rh-communication`, les sections `cours` de `matiere.json` ne sont jamais montrées ;
  - pour `gestion-finance`, ce sont les sections `cours` de `cours-complets.json` (et celles de `matiere.json`) qui disparaissent. Seuls `intro`, `essentiel` et `resources` restent affichés.
- **Conséquence** : les QCM, vrai/faux, tris, textes à trous et associations de `matiere.json` ont été écrits pour ces sections cachées. Beaucoup interrogent des notions que l'élève ne trouve nulle part dans le cours affiché, sinon dans une ligne du mémo « L'essentiel ». Le détail par thème est dans chaque section matière (GF-5, SIG-3 à SIG-5, MKG-2, RH-2).
- **Correction proposée** : le code prévoit déjà ce cas pour `droit-t8` avec `COURS_COMPLET_AUSSI`. Il suffit d'y ajouter les thèmes concernés, au minimum `gf-t3`, `sig-t1`, `sig-t3`, `sig-t4`, `mkg-t1` à `mkg-t4`, `rh-t1` à `rh-t4`. Le cours d'origine s'affiche alors après le cours réel, et `dedupeCourse` retire les doublons. Autre solution, sans toucher au code : recopier les sections manquantes dans `enrichissements.json`.
- **Prudence** : avant de réafficher ces sections, corrigez les erreurs relevées dans les parties aujourd'hui masquées. Elles sont signalées « (masqué) » dans ce rapport.

### G-2 — `exercices-sections.json` place les exercices sur le mauvais chapitre — **important**, sûr
- **Constat** : les numéros de `exercices-sections.json` correspondent à l'ordre des sections de `matiere.json`, et non à l'ordre des chapitres réellement affichés (cours réel, puis exemples, approfondis…). Beaucoup d'exercices écrits à la main se retrouvent donc sous un chapitre sans rapport. Exemple : « Tri — TVA collectée ou déductible ? » et « Calcul express — TVA » apparaissent sous « Immobilisations, amortissement et VNC ».
- **Détail** : la liste complète, avec le numéro de chapitre à mettre, figure dans chaque section matière (GF-4, SIG-3 à SIG-5, MKG-3, RH-4).
- **Attention** : ces numéros dépendent de l'assemblage. Si G-1 est corrigé, il faut les recalculer avec `scratchpad/verif/assemble.mjs`.

### G-3 — Textes à trous et « Complète — à écrire » générés sur des fragments qui ne sont pas des notions — **mineur**, sûr
- **Constat** : le moteur masque le mot en **gras** de chaque phrase du cours. Quand le gras souligne une expression et non une notion, l'élève doit retrouver, puis écrire au mot près, une expression impossible à deviner.
- **Exemples** (`gestion-finance/cours-reels.json`, gf-t2[0]) : « On peut être rentable ____ et à sec en caisse » (attendu : « sur le papier ») ; « plus son BFR ____ » (« gonfle ») ; « ____ : relancer les clients… » (« Réduire le BFR »). Autres exemples dans approfondi-1 gf-t2[0] : « Pour ____, on le réorganise… » (« analyser la santé financière »).
- **Correction proposée** : dans les paragraphes `p` et les listes, ne mettre en gras que les notions. Ou bien exclure du générateur les fragments verbaux.

---

## 1. Gestion et finance (`gestion-finance`)

Thèmes : gf-t1 « Appliquer les règles comptables », gf-t2 « Analyser la situation de l'entreprise », gf-t3 « Accompagner la prise de décision ».

### GF-1 — Écriture comptable déséquilibrée et commentaire faux (cycle d'achat avec escompte) — **bloquant**, sûr
- **Où** : gf-t1, `approfondi-1.json` → `gf-t1[16]` « 🧮 Étude de cas guidée — un cycle d'achat complet », `blocks[2]` (example « Étape 2 — À la réception de la facture ») et `blocks[4]` (commentaire).
- **Citation** : « • 607 Achats …… 1 881 (débit) • 44566 TVA déductible …… 376,20 (débit) • 765 Escompte obtenu …… 19 (crédit) • 401 Fournisseurs …… 2 257,20 (crédit) » ; « L'achat (charge) est enregistré pour le **net financier** ».
- **Problème** : l'écriture ne s'équilibre pas. Débit 1 881 + 376,20 = 2 257,20 ; crédit 19 + 2 257,20 = 2 276,20. Quand l'escompte est enregistré à part en 765, l'achat se comptabilise au **net commercial** (1 900 €). C'est d'ailleurs la règle donnée dans gf-t1[6], blocks[1] et blocks[7] (« c'est le net commercial qui est comptabilisé. La réduction financière, elle, s'enregistre à part »). Le cas contredit donc le cours et enseigne une écriture fausse.
- **Correction** :
  - `blocks[2]` : « • 607 Achats …… 1 900 (débit)\n• 44566 TVA déductible …… 376,20 (débit)\n• 765 Escomptes obtenus …… 19 (crédit — produit financier)\n• 401 Fournisseurs …… 2 257,20 (crédit) ». Vérification : 1 900 + 376,20 = 2 276,20 = 19 + 2 257,20.
  - `blocks[4]` : « **Commentaire.** L'achat (charge) est enregistré pour le **net commercial** (1 900 €) ; l'escompte obtenu (19 €) est un **produit financier** enregistré à part ; la TVA déductible est une **créance** sur l'État ; le règlement solde simplement la dette fournisseur sans créer de charge. »

### GF-2 — « Diviser les charges fixes par la marge en euros donne un nombre d'unités » — **important**, sûr
- **Où** : gf-t3, `approfondi-1.json` → `gf-t3[2]` « 🎯 Le seuil de rentabilité et le point mort », `blocks[7]` (warning « Piège »).
- **Citation** : « Diviser les charges fixes par la marge en euros donne un **nombre d'unités**, pas un chiffre d'affaires ».
- **Problème** : c'est faux. Charges fixes ÷ MCV **totale** donne un simple rapport, par exemple 60 000 ÷ 80 000 = 0,75, qui n'est ni un CA ni une quantité. Le seuil en quantité s'obtient avec la MCV **unitaire**, comme le dit justement gf-t3[13], blocks[6].
- **Correction** : « Le seuil se calcule avec le **taux** de MCV (seuil en euros) ou avec la **MCV unitaire** (seuil en quantités). Diviser les charges fixes par la MCV **totale** en euros ne donne ni un chiffre d'affaires ni un nombre d'unités. »

### GF-3 — Café au comptoir taxé à 20 % alors que le taux est de 10 % — **important**, sûr
- **Où** : gf-t1, `cours-reels.json` → `gf-t1[0]` « La TVA : collectée, déductible, à décaisser ». C'est le **premier chapitre affiché** du thème. Passages concernés : `blocks[0]` (« Tu paies ton café 2,40 € au comptoir… 0,40 € … c'est de la TVA »), `blocks[1]` (« soit 20 % de 2,00 € ») et `blocks[7]` (« 2,40 ÷ 1,20 = 2,00 € »).
- **Problème** : une boisson sans alcool servie pour être consommée sur place relève du **taux intermédiaire de 10 %**, pas de 20 %. Le cours le dit lui-même dans approfondi-1 gf-t1[1], blocks[4] : « 10 % … la restauration ».
- **Source** : BOFiP BOI-TVA-LIQ-30-10-10-20 (cité par justice.fr) et fiches WebLex : « le café servi dans une tasse relève du taux de 10 % ». La consultation directe d'impots.gouv.fr n'a pas été possible.
- **Correction** (on garde le café, au bon taux) :
  - `blocks[0]` : « Tu paies ton café 2,20 € au comptoir. Sur ce montant, 0,20 € ne revient pas au commerçant : c'est de la TVA. »
  - `blocks[1]` : « …est de **2,00 €**. On y ajoute la **TVA** (ici 0,20 €, soit 10 % de 2,00 € : une boisson sans alcool servie sur place relève du taux intermédiaire) pour obtenir le prix TTC de **2,20 €**… »
  - `blocks[7]` : « Pour retrouver le HT à partir du TTC, on **divise par (1 + taux)**, ici 1,10 : on ne « retire pas 10 % ». 2,20 ÷ 1,10 = 2,00 € (juste) ; 2,20 − 10 % = 1,98 € (faux). »

### GF-4 — Exercices placés sur le mauvais chapitre (`exercices-sections.json`) — **important**, sûr
Chaque ligne donne : l'exercice, son numéro actuel et le chapitre affiché, puis le numéro proposé et le chapitre visé.
- `gf-t1-tri` « TVA collectée ou déductible ? » : **2** (« Immobilisations, amortissement et VNC ») → **0** (« La TVA : collectée, déductible, à décaisser »).
- `gf-t1-calc-tva` : **2** → **0**.
- `gf-t1-calc-amo` : **3** (« Exemple traité — TVA et enregistrement ») → **2** (« Immobilisations, amortissement et VNC »).
- `gf-t1-trou` « Formules & principes » (TVA déductible, VNC, taux linéaire, prudence) : **3** → **2**, qui couvre 2 questions sur 4. L'idéal est de scinder l'exercice.
- `gf-t2-ordre` « La cascade des SIG » : **0** (« Résultat et trésorerie : le BFR ») → **8** (« Les soldes intermédiaires de gestion »).
- `gf-t2-calc-caf` : **1** (« L'équilibre financier : FRNG, BFR… ») → **10** (« La capacité d'autofinancement »).
- `gf-t3-calc-seuil` : **3** (« Charges fixes et charges variables ») → **5** (« Le seuil de rentabilité et le point mort »).
- `gf-t3-trou` « Coûts & seuil » (seuil, marge de sécurité, réserve légale) : **3** → **5**. La question sur la réserve légale reste hors sujet tant que GF-5 n'est pas corrigé.
- Bien placés : `gf-t1-ordre` (1), `gf-t2-tri` et `gf-t2-calc-frng` (3), `gf-t3-tri` (3).

### GF-5 — Thème 3 : l'affectation du résultat et le choix des financements ne sont plus dans le cours affiché, mais sont interrogés — **important**, sûr
- **Où** : gf-t3. Le cours affiché est construit à partir de `cours-reels.json` gf-t3, qui contient deux sections (MCV et seuil, classement des charges), puis des approfondis consacrés aux coûts.
- **Sections non affichées** (`cours-complets.json` gf-t3.cours[0] à [2]) : « Financer l'activité et les investissements », « Optimiser la trésorerie », « Affecter le résultat ».
- **Termes introuvables dans le cours affiché** : réserve légale, dividendes, report à nouveau, financement interne ou externe, augmentation de capital, compte courant d'associés, crowdfunding, marge de sécurité.
- **Exercices concernés** : `gf-t3-qcm` Q0 (financement interne) et Q3 (réserve légale) ; `gf-t3-trou` T1 (marge de sécurité) et T2 (réserve légale) ; `gf-t3-assoc` pair0, pair1, pair3 et pair5 (report à nouveau) ; `gf-t3-flash` card5 (dividendes) ; `gf-t3-vf` VF0 ; formule `formulas[3]` « Marge de sécurité ».
- **Correction** : réafficher ces trois sections (voir G-1), ou les recopier dans `enrichissements.json` gf-t3. Leur contenu est juste : « réserve légale : 5 % du bénéfice jusqu'à 10 % du capital », conforme à l'article L232-10 du Code de commerce.

### GF-6 — Même formule, deux noms : « indépendance financière » contre « taux d'endettement » — **important**, sûr
- **Où** :
  - gf-t2, `matiere.json` → `chapters[1].games[3]` (`gf-t2-flash`) `cards[5]` : « Indépendance financière :: Ratio = dettes financières / capitaux propres ». Cette carte est affichée dans le test du thème.
  - Même formule dans `matiere.json` chapters[1].cours[4].points[3] et `cours-complets.json` gf-t2.cours[4].blocks[0] (masqués).
- **Problème** : le cours affiché (approfondi-1 gf-t2[3], gf-t2[11] et gf-t2[15]) appelle ce rapport **taux d'endettement** (idéal < 1). Il dit aussi que l'**autonomie financière** (capitaux propres ÷ total du passif) mesure l'« indépendance » de l'entreprise. L'élève reçoit donc deux formules différentes pour « l'indépendance ».
- **Correction de la carte** : « Taux d'endettement :: Dettes financières / capitaux propres (idéalement < 1) ». Harmoniser les passages masqués de la même façon.

### GF-7 — Formule de la valeur ajoutée incomplète (la marge commerciale manque) — **important**, sûr
- **Où** :
  - `approfondi-1.json` → `gf-t2[5]` `blocks[1]` (« La valeur ajoutée est égale à la production moins les consommations en provenance de tiers ») et `blocks[5]` (tableau) ;
  - `gf-t2[6]` `blocks[1]` (formula) ;
  - `gf-t2[14]` `blocks[1]` (formula) ;
  - `definitions.json` → `gf-t2[0]`.
- **Problème** : la formule du programme est VA = **marge commerciale** + production de l'exercice − consommations en provenance de tiers. Elle figure dans `matiere.json`, le QCM `gf-t2-qcm` Q0 et `cours-complets.json`. La version courte n'est juste que pour une entreprise sans activité de négoce. Elle contredit le QCM et rend faux tout calcul d'une entreprise commerciale.
- **Correction** : « Valeur ajoutée = Marge commerciale + Production de l'exercice − Consommations en provenance de tiers ». Dans `definitions.json` : « Richesse créée par l'entreprise = marge commerciale + production − consommations en provenance de tiers. »

### GF-8 — Taux réduit de 5,5 % sur « certaines dépenses d'énergie de base » : formulation périmée — **mineur**, probable
- **Où** : gf-t1, `approfondi-1.json` → `gf-t1[1]` `blocks[5]` (« et certaines **dépenses d'énergie de base** ») et `blocks[8]` (tableau : « Produits alimentaires, livres, énergie de base »).
- **Problème** : le principal exemple de ce cas, l'abonnement d'électricité et de gaz, est passé de 5,5 % à **20 % au 1er août 2025** (loi de finances pour 2025). La formulation laisse croire que l'énergie courante est à 5,5 %.
- **Source** : CCI Paris Île-de-France, « TVA électricité et gaz : passage de 5,5 % à 20 % au 1er août 2025 ». Non vérifié sur legifrance (bloqué).
- **Correction** : remplacer par « …la plupart des **produits alimentaires**, les **livres** et les **travaux de rénovation énergétique** des logements ». Dans le tableau : « Produits alimentaires, livres, rénovation énergétique ».

### GF-9 — « 4 principes comptables » contre « six principes » — **mineur**, sûr
- **Où** : `cours-complets.json` → `gf-t1.essentiel[3]` (affiché : « Les **4 principes** comptables : prudence · indépendance des exercices · continuité · permanence des méthodes »), et `matiere.json` chapters[0].cours[4].formula (masqué).
- **Contradiction** : `approfondi-1.json` gf-t1[15] dit « Six principes comptables sont à connaître » et ajoute le coût historique et la non-compensation.
- **Correction** : « Les **principes** comptables : prudence · indépendance des exercices · continuité d'exploitation · permanence des méthodes · coût historique · non-compensation. »

### GF-10 — Rotation des stocks calculée sur les « achats » — **mineur**, sûr
- **Où** : `approfondi-1.json` → `gf-t2[3]` `blocks[2]` et `blocks[6]` (« stock moyen divisé par les achats, multiplié par 360 »).
- **Problème** : le dénominateur est le **coût d'achat des marchandises vendues** (achats ± variation de stock), comme dans `matiere.json` et `cours-complets.json`. Deux formules différentes coexistent dans le même thème.
- **Correction** : « …égale au **stock moyen divisé par le coût d'achat des marchandises vendues, multiplié par 360**… ». Dans le tableau : « Stock moyen ÷ coût d'achat des marchandises vendues × 360 (durée de stockage en jours) ».

### GF-11 — « L'EBE ne dépend … ni des impôts » — **mineur**, sûr
- **Où** : `approfondi-1.json` → `gf-t2[5]` `blocks[4]` (tip « À retenir »).
- **Problème** : l'EBE se calcule en retirant les **impôts et taxes**. Ce qu'il ignore, c'est l'**impôt sur les bénéfices**.
- **Correction** : « …il ne dépend ni de la politique d'amortissement, ni des dettes, ni de l'**impôt sur les bénéfices**. »

### GF-12 — « Environ 27 burgers par jour ouvré » — **mineur**, sûr
- **Où** : `approfondi-1.json` → `gf-t3[4]` `blocks[2]`.
- **Problème** : 800 ÷ 27 ≈ 30, ce qui suppose 30 jours travaillés. Sur environ 22 jours ouvrés, on obtient environ 36 burgers par jour. `cours-reels.json` gf-t3[0], blocks[4], utilise bien 22 jours (575 ÷ 22 ≈ 26).
- **Correction** : « Soit environ 36 burgers par jour ouvré (22 jours par mois). »

### GF-13 — Seuil de rentabilité rangé dans le thème 2 — **mineur**, sûr
- **Où** : `cas-pratiques.json` → `gf-t2[2]` « Le seuil de rentabilité » ; `definitions.json` → `gf-t2[6]` « Seuil de rentabilité » ; `pieges.json` → `gf-t2[3]` (« Au seuil de rentabilité, le résultat est nul… »).
- **Problème** : cette notion relève du thème 3. Dans le thème 2, elle n'est pas enseignée, mais elle sort dans le test du thème et dans les « Définitions clés ».
- **Correction** : déplacer ces trois entrées sous `gf-t3`.

### GF-14 — « Quatre acteurs encadrent la comptabilité », suivis de cinq éléments — **mineur**, sûr
- **Où** : `sic-si.json` → `gf-t1[0]` `blocks[8]`.
- **Problème** : la phrase annonce quatre acteurs, puis cite le PCG, l'ANC, le Code de commerce, l'expert-comptable et le commissaire aux comptes. Le PCG et le Code de commerce sont des textes, pas des acteurs.
- **Correction** : « Plusieurs textes et acteurs encadrent la comptabilité. »

### GF-15 — Facture d'avoir : définition confuse, et notion absente du cours affiché — **mineur**, sûr
- **Où** : `matiere.json` → `chapters[0].games[2]` (`gf-t1-assoc`) `pairs[5]` : « Facture qui corrige/annule un doit (retour, avoir) ».
- **Problème** : la définition est circulaire (« avoir ») et la formule « un doit » est incorrecte. La facture d'avoir n'apparaît nulle part dans le cours affiché (voir G-1).
- **Correction** : « Facture qui annule ou réduit une facture déjà émise (retour de marchandises, rabais accordé après coup) ».

### GF-16 — Cas « ATELIER75 » : le chiffre d'affaires est traité comme la production — **mineur**, sûr
- **Où** : `cas-pratiques.json` → `gf-t2[0]`, champ `context` (« réalise 500 000 € de chiffre d'affaires »), et `q0.e` (« VA = production − consommations intermédiaires = 500 000 − 300 000 »).
- **Problème** : un chiffre d'affaires peut comprendre des ventes de marchandises, qui passent par la marge commerciale. L'énoncé doit lever l'ambiguïté.
- **Correction** du contexte : « …réalise une production vendue de 500 000 € (aucune vente de marchandises, aucun stock)… »

Calculs vérifiés et justes : tous les autres exemples et corrigés de la matière. Notamment Q2 TVA (7 000 €), Q1 EBE (117 000 €), factures (1 058,40 € et 2 257,20 €), prorata temporis (2 250 €), créance douteuse (400 €), Delta (VA 350 000, EBE 120 000, CAF 80 000), seuils (150 000 €, 240 000 €, 125 000 €, 800 et 1 200 burgers), point mort (270 jours, fin septembre), coût complet (31,50 € et 39,38 €), « faire ou faire faire » (13 € < 15 €) et levier d'exploitation.

---

## 2. Systèmes d'information de gestion (`sig`)

Thèmes : sig-t1 « Le système d'information dans l'organisation », sig-t2 « Les bases de données et le langage SQL », sig-t3 « Travail collaboratif et intelligence collective », sig-t4 « Réseaux, sécurité et applications ».

### SIG-1 — Critères de sécurité : trois, quatre, avec « preuve » ou « traçabilité » selon la page ; un tri en devient faux — **bloquant** (pour l'exercice de tri), sûr
- **Contradictions dans le thème sig-t4** :
  - `matiere.json` → `chapters[3].essentiel[1]` (affiché) : « Sécurité = CID : Confidentialité, Intégrité, Disponibilité » (3 critères) ;
  - `approfondi-1.json` → `sig-t4[1]` : « triangle **DIC** (ou CIA) » (3 critères) ;
  - `cours-reels.json` → `sig-t4[0]`, `approfondi-4.json` → `sig-t4[1]` et `enrichissements.json` sig-t4 : « **DICP** » (4 critères, le P désignant la preuve, ou traçabilité) ;
  - `pieges.json` → `sig-t4[0]` : « **DICT** » (traçabilité) ;
  - `gestion-finance/sic-si.json` : D.I.C.T.
- **Exercice faux** : `matiere.json` → `chapters[3].games[2]` (`sig-t4-tri`), `items[3]` « Tracer les modifications (qui a changé quoi) » est classé **Intégrité**. Or le cours affiché définit « Preuve (traçabilité) : on sait qui a fait quoi » (cours-reels sig-t4[0], blocks[3] et [5]). Un élève qui a appris le cours répondrait « preuve » ; le tri ne propose que C, I ou D.
- **Correction** :
  - harmoniser partout en **DICP** (disponibilité, intégrité, confidentialité, preuve, aussi appelée traçabilité) ;
  - essentiel[1] : « Sécurité = DICP : Disponibilité, Intégrité, Confidentialité, Preuve (traçabilité). » ;
  - pieges sig-t4[0] : « …disponibilité, intégrité, confidentialité, preuve/traçabilité (DICP) » ;
  - tri : ajouter la catégorie `{"id":"preuve","label":"Preuve (traçabilité)"}` et classer items[3] dedans, ou remplacer items[3] par « Vérifier par une empreinte (somme de contrôle) qu'un fichier n'a pas été modifié » → integ.

### SIG-2 — « Le RGPD impose le consentement » : c'est faux en général — **important**, sûr
- **Où** (sig-t4) :
  - `cours-reels.json` → `sig-t4[1]` `blocks[2]` (affiché) : « le **RGPD** impose consentement, finalité, minimisation, sécurité et droits des personnes » ;
  - `approfondi-1.json` → `sig-t4[2]` `blocks[2]` (« Il impose : le **consentement**, la **finalité**… ») et `blocks[3]` ;
  - `approfondi-4.json` → `sig-t4[2]` `blocks[1]`.
- **Problème** : un traitement doit reposer sur **une des six bases légales** de l'article 6 du RGPD (consentement, contrat, obligation légale, sauvegarde des intérêts vitaux, mission d'intérêt public, intérêt légitime). Le consentement n'est pas exigé pour tout traitement : la paie des salariés repose par exemple sur l'obligation légale et le contrat.
- **Source** : CNIL, « La licéité du traitement : l'essentiel sur les bases légales prévues par le RGPD » (cnil.fr, connue par moteur de recherche, page non consultable ici) ; RGPD, art. 6.
- **Correction** (cours-reels sig-t4[1], blocks[2]) : « …le **RGPD** impose que chaque traitement repose sur une **base légale** (le consentement de la personne, un contrat, une obligation légale, l'intérêt légitime…), une **finalité** précise, la **minimisation**, la **sécurité** et le respect des **droits** des personnes (accès, rectification, effacement). » Même reformulation dans les deux autres passages.

### SIG-3 — sig-t4 : une grande partie des exercices porte sur des notions absentes du cours affiché — **important**, sûr
- **Cause** : G-1. La section « Les réseaux et l'architecture client-serveur » et la section « Les applications qui exploitent l'information » de `matiere.json` chapters[3].cours ne sont pas affichées.
- **Notions introuvables dans le cours affiché**, sauf dans une ligne de l'« essentiel » :
  - HTML, CSS, application responsive : `sig-t4-qcm` Q3 et Q4, `sig-t4-vf` VF2, `sig-t4-trou` T0 et T1, `sig-t4-assoc` pair3 ;
  - adresse IP : `sig-t4-vf` VF0, `sig-t4-trou` T2 ;
  - DNS, URL, requête HTTP : tout l'exercice `sig-t4-ordre` ;
  - HTTPS : `sig-t4-qcm` Q1 ;
  - redondance : `sig-t4-tri` items[5].
- **Placement** (`exercices-sections.json`) :
  - `sig-t4-ordre` « L'affichage d'une page web » : **0** (« Rançongiciels et sécurité du SI ») → **3** (« Les réseaux… client-serveur ») ;
  - `sig-t4-tri` (C, I ou D) : **1** (« Le phishing et le RGPD ») → **0** ;
  - `sig-t4-trou` (HTML, CSS, IP, chiffrement) : **2** (« Exemple — un mail urgent ») → **3**.
- **Correction** : réafficher les deux sections (voir G-1) avant de garder ces exercices.

### SIG-4 — sig-t3 : GED, workflow, dématérialisation, synchrone et asynchrone ne sont pas enseignés dans le cours affiché — **important**, sûr
- **Cause** : G-1. La section « Dématérialisation et gestion des documents » et le tableau synchrone/asynchrone de `matiere.json` chapters[2].cours sont masqués. Le cours affiché ne cite ces notions que dans l'« essentiel ».
- **Exercices concernés** :
  - `sig-t3-qcm` Q1 (GED) et Q2 (workflow) ;
  - `sig-t3-vf` VF0 (dématérialiser) et VF1 (asynchrone) ;
  - tout l'exercice `sig-t3-tri` « Synchrone ou asynchrone ? » ;
  - `sig-t3-trou` T1 (GED), T2 (workflow) et T3 (asynchrone) ;
  - `sig-t3-assoc` pair1 (GED) et pair2 (workflow).
- **Placement** : `sig-t3-trou` (cloud, GED, workflow, asynchrone) est en **1** (« Le numérique transforme le travail : télétravail… ») → **0** (« Outils collaboratifs et intelligence collective »).
- **Correction** : réafficher la section masquée (G-1).

### SIG-5 — sig-t1 : « système informatique », qualités de l'information et « mémoriser » absents du cours affiché — **mineur**, sûr
- **Constats** :
  - « Système informatique » (support technique du SI) n'apparaît pas dans le cours affiché. Exercices : `sig-t1-qcm` Q3, `sig-t1-trou` T3, `sig-t1-assoc` pair3.
  - Les qualités de l'information (fiable, pertinente, disponible, **actuelle**) ne sont pas enseignées. Exercice : `sig-t1-qcm` Q4, qui attend « actuelle ».
  - Le cours affiché parle de « **stocker** », les exercices de « **Mémoriser** » : `sig-t1-qcm` Q1 (réponse), catégorie du `sig-t1-tri`, `sig-t1-ordre` step1.
- **Placement** : `sig-t1-tri` « Les 4 fonctions du SI » est en **1** (« Donnée, information, connaissance ») → **3** (« Le système d'information : collecter, stocker, traiter, diffuser »).
- **Correction** :
  - écrire « Mémoriser (stocker) » dans les exercices, ou « stocker (mémoriser) » dans le cours ;
  - réafficher `matiere.json` chapters[0].cours[0] et cours[1] (G-1).

### SIG-6 — SQL : texte entre « guillemets » doubles, alors que la norme utilise des apostrophes — **mineur**, sûr
- **Où** :
  - `matiere.json` → `chapters[1].games[1]` (`sig-t2-vf`) VF3 : « Le texte doit être entouré de guillemets… ex. WHERE ville = "Lyon" » ;
  - `chapters[1].games[3]` (`sig-t2-sql`) T1 : explain « Le texte est entre guillemets » ;
  - `cours-reels.json` sig-t2[1] blocks[3] et `approfondi-1.json` sig-t2[1] blocks[4] : « les **guillemets** autour du texte ».
- **Problème** :
  - en SQL standard, une chaîne de caractères s'écrit entre **apostrophes** ('Lyon') ; les guillemets doubles désignent un nom de colonne. PostgreSQL, cité dans le cours comme SGBD, rejetterait `WHERE ville = "Lyon"` ;
  - tous les exemples affichés utilisent d'ailleurs 'Lyon' et 'Paris'.
- **Correction** :
  - « Le texte doit être entouré d'apostrophes (guillemets simples) dans une condition SQL. → ex. WHERE ville = 'Lyon'. » ;
  - même remplacement de « guillemets » par « apostrophes » dans les deux passages du cours.

### SIG-7 — « Quatre fonctions d'agrégation », suivies de cinq — **mineur**, sûr
- **Où** : `approfondi-1.json` → `sig-t2[2]` `blocks[1]` (« Quatre fonctions d'agrégation sont à connaître »), puis COUNT, SUM, AVG, MAX et MIN.
- **Correction** : « Cinq fonctions d'agrégation sont à connaître. »

### SIG-8 — Jointure : la clé change de nom d'un exemple à l'autre — **mineur**, sûr
- **Où** : `approfondi-4.json` → `sig-t2[2]` `blocks[2]` : `WHERE CLIENTS.id = COMMANDES.id_client`.
- **Problème** : partout ailleurs dans le thème, la clé primaire de CLIENTS s'appelle `id_client` (approfondi-1 sig-t2[0] et [2]). L'élève peut croire que la jointure relie deux champs de noms différents par principe.
- **Correction** : `SELECT CLIENTS.nom, COMMANDES.montant FROM CLIENTS, COMMANDES WHERE CLIENTS.id_client = COMMANDES.id_client ;`

À noter (manque, pas une erreur) :
- la matière `sig` n'a pas de `cas-pratiques.json`. Le sujet blanc « Management, sciences de gestion et numérique » (`src/data/sujetBac.js`, `partieCas(track.specialty)`) n'a donc pas de partie 2 pour un élève de SIG.

Bien construits : les requêtes SQL des exemples et de l'exercice `sig-t2-sql`, le vocabulaire relationnel, les explications WHERE / HAVING et sur le produit cartésien.

---

## 3. Mercatique (`mercatique`)

Thèmes : mkg-t1 « Mercatique et consommateurs », mkg-t2 « Mercatique et marchés », mkg-t3 « La mercatique opérationnelle (le mix) », mkg-t4 « Mercatique et société ».

### MKG-1 — « Le consentement du consommateur est obligatoire » : affirmation trop générale — **important**, sûr
- **Où** (mkg-t4) :
  - `approfondi-1.json` → `mkg-t4[0]` `blocks[3]` (tip « À retenir ») : « Le consentement du consommateur est obligatoire. » ;
  - `cours-reels.json` → `mkg-t4[0]` `blocks[1]` (affiché en premier) : « le **RGPD** impose le **consentement**, une base légale, et le droit de faire **effacer** ses données » ;
  - `enrichissements.json` → mkg-t4.sections[0].blocks[1] : « consentement, base légale, droit à l'effacement » ;
  - `approfondi-4.json` → mkg-t4[1] blocks[1] : « Consentement : la personne a-t-elle accepté ? », présenté comme une étape toujours obligatoire.
- **Problème** :
  - le consentement est **une des six bases légales** du RGPD, pas une condition de tout traitement. Les formulations « le consentement, une base légale » le présentent même comme une exigence distincte de la base légale ;
  - `pieges.json` mkg-t4[1] est juste : « on ne les collecte pas sans base légale ».
  - Le consentement est en revanche bien obligatoire pour deux usages : les traceurs (cookies) publicitaires, et la prospection commerciale par e-mail auprès de particuliers.
- **Source** : CNIL, page « La licéité du traitement… » ; RGPD, art. 6 (connus par moteur de recherche, sites officiels bloqués ici).
- **Correction** :
  - approfondi-1 mkg-t4[0] blocks[3] : « …impose le respect du **RGPD** et de l'éthique : toute collecte repose sur une base légale, et le **consentement** est obligatoire pour les cookies publicitaires et la prospection par e-mail. » ;
  - cours-reels mkg-t4[0] blocks[1] : « …le **RGPD** impose une **base légale** (souvent le **consentement** pour le ciblage publicitaire), une finalité précise et le respect des droits, dont celui de faire **effacer** ses données. »

### MKG-2 — Beaucoup d'exercices écrits à la main interrogent des notions absentes du cours affiché — **important**, sûr
Cause : voir G-1. Les sections `cours` de `matiere.json` sont masquées pour les quatre thèmes. Notions introuvables dans le cours affiché, hors « essentiel » :
- **mkg-t1** :
  - **CSP** : `mkg-t1-qcm` Q3, `mkg-t1-assoc` pair1 ;
  - **attitude** : `mkg-t1-qcm` Q6, `mkg-t1-trou` T1 ;
  - **implication** : `mkg-t1-vf` VF3.
- **mkg-t2** :
  - **prospect** : `mkg-t2-trou` T0, `mkg-t2-assoc` pair0 ;
  - **demande en valeur / en volume** : `mkg-t2-vf` VF4, `mkg-t2-trou` T3 ;
  - **macro-environnement** : `mkg-t2-qcm` Q6 ;
  - **études quantitatives / qualitatives, sondage, focus group, panel, sources primaires / secondaires, INSEE** : `mkg-t2-qcm` Q1, Q4, Q5 et tout `mkg-t2-tri`. Ces notions sont enseignées dans le **thème 1** (approfondi-1 mkg-t1[2]), pas dans le thème 2.
- **mkg-t3** :
  - **objectifs cognitif / affectif / conatif** : `mkg-t3-qcm` Q6 ;
  - **prix psychologique** : `mkg-t3-assoc` pair2, `pieges.json` mkg-t3[2] ;
  - **e-commerce / omnicanal** : `mkg-t3-vf` VF2 (l'omnicanal n'est traité qu'en mkg-t4) ;
  - **fonctions du packaging** : `mkg-t3-vf` VF3.
- **mkg-t4** :
  - **obsolescence programmée, surconsommation, publicité mensongère** : `mkg-t4-vf` VF1, `mkg-t4-tri` items[0], essentiel[0].
- **Correction** :
  - réafficher les sections masquées (G-1) ;
  - pour `mkg-t2-tri` et les questions Q1, Q4 et Q5 de `mkg-t2-qcm`, les déplacer dans le thème 1, ou réafficher la section « Les études de marché » de `matiere.json` chapters[1].cours[1].

### MKG-3 — Exercices placés sur le mauvais chapitre (`exercices-sections.json`) — **important**, sûr
- `mkg-t1-tri` « Motivation ou frein ? » : **0** (« La mercatique : satisfaire les besoins (Maslow)… ») → **1** (« Motivations et freins : le processus d'achat »).
- `mkg-t1-ordre` « Le processus d'achat » : **2** (« Facteurs et types d'achat, études de marché… ») → **1**.
- `mkg-t2-trou` « Le marché » (prospect, NCR, PESTEL, valeur) : **0** (« Segmentation, ciblage, positionnement ») → **3** (« Le marché : offre, demande, environnement »).
- `mkg-t2-tri` « Étude quali ou quanti ? » : **1** (« Connaître son marché… ») ; voir MKG-2. Si l'exercice reste en mkg-t2, le mettre en **5** (« La veille et l'étude de marché »).
- `mkg-t3-ordre` « Cycle de vie du produit » : **0** (« La cohérence des 4P ») → **7** (« La politique de produit : gamme, marque, cycle de vie »).
- `mkg-t3-tri` « Communication média ou hors-média ? » : **2** (« Exemple — des montres de luxe ») → **9** (« La politique de communication : média et hors-média »).
- `mkg-t4-tri` « Dérive ou pratique responsable ? » : **0** (« Personnaliser grâce aux données ») → **1** (« La mercatique responsable face au greenwashing »).
- Bien placés : `mkg-t1-trou` (1), `mkg-t2-ordre` (2).

### MKG-4 — Le RGPD présenté comme une « loi » — **mineur**, sûr
- **Où** : `matiere.json` → `chapters[3].games[3]` (`mkg-t4-assoc`) `pairs[3]` : « RGPD <-> Loi qui protège les données personnelles ».
- **Problème** : c'est un **règlement européen**. `sig/definitions.json` le dit correctement.
- **Correction** : « Règlement européen qui protège les données personnelles ».

### MKG-5 — Élasticité-prix rangée dans le thème « consommateurs » — **mineur**, sûr
- **Où** : `cas-pratiques.json` → `mkg-t1[0]` « Élasticité-prix de la demande » ; `pieges.json` → `mkg-t1[2]` (élasticité-prix).
- **Problème** : la notion est enseignée dans mkg-t3, avec la politique de prix. Le calcul, lui, est juste : −20 / +10 = −2, demande élastique.
- **Correction** : déplacer le cas et le piège sous `mkg-t3`.

### MKG-6 — Part de marché relative : la réponse « 50 » est acceptée pour 0,5 — **mineur**, sûr
- **Où** : `cas-pratiques.json` → `mkg-t2[0]` `questions[1]`, `alt` : `["0,5", "50%", "50"]`.
- **Problème** : la part de marché relative est un coefficient (15 / 30 = 0,5). Accepter « 50 » valide une réponse qui signifierait 50 fois le leader.
- **Correction** : `"alt": ["0,5", "0.5"]`. On peut garder « 50 % » si l'on accepte l'écriture en pourcentage.

### MKG-7 — Facteurs d'influence : deux ou trois familles selon la page — **mineur**, sûr
- **Contradiction** :
  - `cours-reels.json` mkg-t1[2] : deux familles, « personnels » et « socioculturels » ;
  - `approfondi-1.json` mkg-t1[1] : trois familles, « individuels », « psychologiques » et « socioculturels » ;
  - exercices (`mkg-t1-qcm` Q3, `mkg-t1-assoc`) : « individuels » et « sociologiques ».
- **Correction** : retenir une seule typologie, par exemple « facteurs individuels (dont psychologiques : perception, attitude, apprentissage) et facteurs sociologiques (culture, groupes, famille, CSP) », et l'employer partout.

### MKG-8 (masqué) — « 9,99 € … c'est un prix psychologique » — **mineur**, probable
- **Où** : `matiere.json` → `chapters[2].cours[1].blocks[4]` (example « Astuce du prix magique »). Section aujourd'hui non affichée.
- **Problème** : au sens du programme, le **prix psychologique** est le prix accepté par le plus grand nombre. Ce sens est donné juste au-dessus, ainsi que dans `pieges.json` mkg-t3[2] et `mkg-t3-assoc`. Le 9,99 € est un **prix magique** (prix rompu). L'exemple mélange les deux notions.
- **Correction** : « …C'est un **prix magique** : il joue sur la perception sans presque changer le prix réel (à ne pas confondre avec le prix psychologique, accepté par le plus grand nombre). »

Calculs vérifiés et justes : notoriété (75 %), parts de marché (12 %, 15 %, relative 0,5), pénétration (20 %), taux de marge et taux de marque (50 % et 33,3 %), prix soldé (60 €), conversion (3 %), panier moyen (40 €), ROI (60 %).

---

## 4. Ressources humaines et communication (`rh-communication`)

Thèmes : rh-t1 « Mobiliser les ressources humaines », rh-t2 « Cohésion et conflits », rh-t3 « La communication », rh-t4 « Coordination et conditions de travail ».

### RH-1 — Modes de résolution des conflits classés « du plus subi au plus constructif » avec l'arbitrage en dernier — **important**, sûr
- **Où** (rh-t2) :
  - `cours-reels.json` → `rh-t2[1]` `blocks[2]` (affiché) : « Quatre modes de résolution existent, du plus subi au plus constructif. Avec le recours hiérarchique… Avec la négociation… », puis blocks[3] : médiation, arbitrage ;
  - `approfondi-1.json` → `rh-t2[1]` `blocks[3]` : « du plus subi au plus constructif : le recours hiérarchique, la négociation, la médiation, l'arbitrage » ;
  - `approfondi-4.json` → `rh-t2[1]` `blocks[1]` : même phrase.
- **Problème** :
  - l'ordre fait de l'**arbitrage**, où un tiers impose la solution, le mode « le plus constructif », plus que la négociation et la médiation ;
  - c'est illogique, et contredit la phrase suivante (« la négociation gagnant-gagnant est souvent la plus durable ») ainsi que `matiere.json` chapters[1].cours[2] (« du plus autonome … au plus imposé »).
- **Correction** :
  - cours-reels blocks[2] : « Quatre modes de résolution existent, du plus autonome au plus imposé. Avec la **négociation**, **les parties cherchent elles-mêmes un accord**. Avec la **médiation**, un **tiers neutre aide au dialogue**, sans décider à leur place. » ;
  - blocks[3] : « Avec l'**arbitrage**, un **tiers impose la solution**, que les parties s'engagent à respecter. Avec le **recours hiérarchique**, **le chef tranche** : c'est rapide, mais la décision est imposée. » ;
  - approfondi-1 et approfondi-4 : « du plus autonome au plus imposé : la **négociation**, la **médiation**, l'**arbitrage**, le **recours hiérarchique** ».

### RH-2 — Une grande partie des exercices écrits à la main porte sur des notions absentes du cours affiché — **important**, sûr
Cause : voir G-1. Les sections de `matiere.json` sont masquées pour les quatre thèmes. Notions introuvables dans le cours affiché, hors « essentiel » et « intro » :
- **rh-t1** :
  - **qualification** : `rh-t1-qcm` Q0, `rh-t1-trou` T0, `rh-t1-assoc` pair1, `rh-t1-vf` VF0 ;
  - **implication** : `rh-t1-trou` T3, `rh-t1-assoc` pair3, `rh-t1-vf` VF1 ;
  - relations avec la hiérarchie classées en hygiène par Herzberg : `rh-t1-tri` items[3].
- **rh-t2** :
  - **statut / rôle** : tout `rh-t2-tri`, `rh-t2-qcm` Q0, `rh-t2-vf` VF0 ;
  - **leadership** : `rh-t2-qcm` Q6 ;
  - **conflit latent / ouvert** : `rh-t2-qcm` Q1, `rh-t2-trou` T0.
- **rh-t3** (le plus touché) :
  - **verbal / non verbal** : tout `rh-t3-tri`, `rh-t3-qcm` Q1, `rh-t3-vf` VF1 ;
  - **para-langage** : `rh-t3-qcm` Q5 ;
  - **bruit sémantique / matériel** : `rh-t3-qcm` Q6, `rh-t3-vf` VF4 ;
  - **écoute active, empathie, reformulation** : `rh-t3-qcm` Q2, `rh-t3-vf` VF3, `rh-t3-trou` T2 ;
  - **convaincre / persuader** : `rh-t3-qcm` Q4, `rh-t3-vf` VF2, `rh-t3-trou` T3.
- **rh-t4** :
  - **OST, Taylor, parcellisation** : `rh-t4-qcm` Q0, `rh-t4-trou` T0, `rh-t4-assoc` pair0, `rh-t4-vf` VF2 ;
  - **élargissement / enrichissement des tâches** : `rh-t4-qcm` Q4 et Q5, `rh-t4-vf` VF3 ;
  - **dialogue social, CSE, représentants du personnel** : `rh-t4-qcm` Q3, `rh-t4-vf` VF4, `rh-t4-trou` T3, `rh-t4-assoc` pair3 ;
  - **conditions psychologiques** : `rh-t4-tri`.
- **Correction** : réafficher les sections masquées (G-1). Elles sont justes, sous réserve de RH-3.

### RH-3 — Tri « Verbal ou non verbal ? » : « Le ton de la voix » n'est ni l'un ni l'autre selon le cours — **important**, probable
- **Où** : `matiere.json` → `chapters[2].games[3]` (`rh-t3-tri`) `items[1]` « Le ton de la voix » → `nv`.
- **Problème** : le cours du thème distingue trois registres, dans l'essentiel[1] (affiché) et dans cours[0] (masqué) : verbal, non verbal et **para-langage** (ton, débit). Le QCM Q5 attend d'ailleurs « para-langage » pour « le ton et le débit de la voix ». Classer le ton en « non verbal » contredit ce QCM.
- **Correction** : remplacer items[1] par « Un hochement de tête » → `nv`, ou ajouter la catégorie « Para-langage (ton, débit) ».

### RH-4 — Exercices placés sur le mauvais chapitre (`exercices-sections.json`) — **important**, sûr
- `rh-t1-tri` « Herzberg : hygiène ou motivation ? » : **2** (« Exemple — impliquer une équipe ») → **0** (« La motivation selon Herzberg »).
- `rh-t1-ordre` « La pyramide de Maslow » : **2** → **7** (« Les théories de la motivation »). Les cinq niveaux ne sont listés nulle part dans le cours affiché de rh-t1 ; ils le sont en mercatique.
- `rh-t1-trou` (qualification, GPEC, hygiène, implication) : **0** → **1** (« La compétence : savoir, savoir-faire, savoir-être et GPEC »).
- `rh-t2-trou` (latent, médiation, arbitrage, conformisme) : **2** (« Cas — la répartition des tâches ») → **1** (« Les conflits : sources et modes de résolution »).
- `rh-t3-trou` (feedback, bruit, écoute active, convaincre) : **1** (« Communication interne et externe ») → **0** (« Le schéma de communication… »).
- `rh-t4-trou` (Taylor, QVT, turnover, dialogue social) : **2** (« Exemple — 1 800 € net : le coût employeur ») → **1** (« Le climat social et les conditions de travail »).
- `rh-t4-tri` « Condition physique ou psychologique ? » : **1** → **4** (« Conditions de travail et QVT »). Le chapitre 1 reste acceptable.
- Bien placés : `rh-t3-ordre` (0), `rh-t2-tri` (0).

### RH-5 — « Être délégué du personnel » : institution supprimée — **mineur**, sûr
- **Où** : `matiere.json` → `chapters[1].games[2]` (`rh-t2-tri`) `items[2]`.
- **Problème** : les délégués du personnel ont été remplacés par le **comité social et économique (CSE)** (ordonnances de septembre 2017, CSE obligatoire depuis le 1er janvier 2020). Le thème rh-t4 parle d'ailleurs bien du CSE.
- **Correction** : « Être élu au CSE (comité social et économique) » → `stat`.

### RH-6 — Coût du travail : 42 % de cotisations patronales appliqués à un salaire proche du SMIC — **mineur**, à vérifier
- **Où** :
  - `cours-reels.json` → `rh-t4[0]` `blocks[1]` et `blocks[3]` (« Pour un net de 1 800 € (brut ≈ 2 300 €), le coût réel pour l'employeur avoisine **3 260 €** ») ;
  - `approfondi-1.json` → `rh-t4[2]` `blocks[5]` ;
  - même taux dans `gestion-finance/approfondi-1.json` gf-t1[8] et `cas-pratiques.json` rh-t4[0].
- **Problème** :
  - « environ 42 % » est un taux **avant allègements**. Pour un brut d'environ 2 300 €, à peu près 1,3 SMIC, la réduction générale des cotisations patronales abaisse fortement le taux réel. L'exemple « réel » surestime donc le coût. Je n'ai pas pu vérifier le barème 2026 sur urssaf.fr ou legifrance (bloqués).
  - Arrondi : 1 800 ÷ 0,78 ≈ 2 308 € brut, et 2 308 × 1,42 ≈ 3 277 €, soit environ 3 280 € plutôt que 3 260 €.
- **Correction** : garder l'ordre de grandeur pédagogique, mais préciser « (~42 % du brut **avant allègements** ; pour les salaires proches du SMIC, les allègements généraux réduisent nettement ce taux) ».

### RH-7 — Piège « qualification ≠ qualité du poste » : formulation confuse — **mineur**, sûr
- **Où** : `pieges.json` → `rh-t1[0]` : « Ne confonds pas **qualification** (diplômes/compétences de la personne) et **qualité du poste**. »
- **Problème** : la « qualité du poste » n'est pas une notion du programme. La distinction classique oppose la qualification de la **personne** à celle de l'**emploi**.
- **Correction** : « Ne confonds pas la **qualification de la personne** (diplômes, compétences reconnues) et la **qualification de l'emploi** (exigences du poste, fixées par la convention collective). »

Calculs vérifiés et justes : absentéisme (4 %), turnover (5 %), coût employeur 2 000 × 1,42 = 2 840 €, productivité (8 pièces par heure), net 2 000 − 22 % = 1 560 €.

---

## Sources consultées

eduscol.education.fr, legifrance.gouv.fr, education.gouv.fr et cnil.fr étaient inaccessibles depuis cette session (refus du proxy). Les points de fond ont été confirmés par moteur de recherche :
- **TVA sur le café servi sur place (10 %)** : [justice.fr — taux TVA produits alimentaires et boissons](https://www.justice.fr/fiche/taux-tva-produits-alimentaires-boissons), qui renvoie au BOFiP BOI-TVA-LIQ-30-10-10-20 ; [WebLex — taux de TVA restauration](https://www.weblex.fr/fiches-conseils/taux-tva-restauration).
- **Abonnements d'électricité et de gaz passés à 20 % au 1er août 2025** : [CCI Paris Île-de-France](https://www.entreprises.cci-paris-idf.fr/actualites/tva-electricite-et-gaz-passage-de-55-20-au-1er-aout-2025).
- **Six bases légales du RGPD, le consentement n'en étant qu'une** : [CNIL — La licéité du traitement](https://www.cnil.fr/la-liceite-du-traitement-lessentiel-sur-les-bases-legales-prevues-par-le-rgpd), page vue en extrait seulement ; RGPD, article 6.
- **Apports en compte courant d'associés classés en financement interne** dans le programme de gestion et finance : [académie de Besançon — évolution du programme CFE vers GF](https://ecogestion.ac-besancon.fr/wp-content/uploads/sites/44/2013/06/Evolution-du-programme-CFE-vers-GF.pdf). Le classement retenu par le site est donc conforme, et ce point n'est **pas** signalé comme une erreur.
- **Réserve légale (5 % du bénéfice jusqu'à 10 % du capital)** : Code de commerce, article L232-10, de mémoire, non consulté ; le contenu est juste.
- **CSE remplaçant les délégués du personnel** : ordonnances de septembre 2017, de mémoire, non consultées.

## Fichiers de travail (lecture seule)

- `scratchpad/verif/dump.py` et `dump-<matière>.txt` : contenu JSON brut, avec l'emplacement de chaque passage.
- `scratchpad/verif/assemble.mjs`, `assemble.txt` et `assemble-full.txt` : chapitres et exercices tels qu'affichés.
- `scratchpad/verif/affiche.mjs` et `affiche/<thème>.txt` : texte du cours réellement affiché, thème par thème.


---

## Rapport — Vérification du contenu de RévizSTMG : tronc commun de Terminale (management, droit, économie)

Relecture faite en lecture seule le 19 octobre 2026, sur la copie figée `/var/tmp/verif-contenu/app/content/`.

## Récapitulatif

| Matière | Thèmes relus | Bloquant | Important | Mineur | Total |
|---|---|---:|---:|---:|---:|
| Management | mgmt-t1, mgmt-t2, mgmt-t3 (42 chapitres affichés) | 2 | 5 | 5 | 12 |
| Droit | droit-t5, droit-t6, droit-t7, droit-t8 (53 chapitres) | 1 | 5 | 10 | 16 |
| Économie | eco-t6, eco-t7, eco-t8, eco-t9, eco-actu (53 chapitres) | 2 | 7 | 6 | 15 |
| **Total** | 12 thèmes, 148 chapitres | **5** | **17** | **21** | **43** |

Certitude : 36 « sûr », 5 « probable » (M6, M9, D7, E14, E15) et 2 « à vérifier » (D16, E5). Pour M6, le remplacement de la DPEF est sûr ; seul le champ actuel de l'obligation reste à vérifier.

### Les 10 problèmes les plus graves

1. **E1 (bloquant)** : l'exemple « Portugal bon pour le vin, Angleterre bon pour le drap » illustre l'**avantage absolu** et non l'avantage comparatif de Ricardo (`economie/approfondi-1.json`, `eco-t8/0/blocks/2`).
2. **M2 (bloquant)** : chapitre « Parties prenantes ». Les QCM générés ont deux bonnes réponses, et « Actionnaires (ou clients, fournisseurs) : acteur concerné… qui peut l'influencer » est corrigé Faux.
3. **M3 (bloquant)** : « Compétitivité hors-prix : offrir ce que le client valorise et ne trouve pas ailleurs » est corrigé Faux, alors que le cours dit exactement cela.
4. **D5 (bloquant)** : « Erreur : consentement faussé qui rend le contrat annulable » est corrigé Faux. Le même texte sert de distracteur dans un QCM.
5. **E6 (bloquant)** : « Fonction de répartition » et « Redistribution » ont des définitions interchangeables, d'où des QCM à deux bonnes réponses.
6. **E5 (important, à vérifier)** : « le thème 9 n'est pas évalué à l'écrit » vient de la note de 2020 ; la note du 17 septembre 2026 (session 2027) semble couvrir tout le programme de Terminale.
7. **E3 (important)** : l'exemple d'actualité « l'inflation ralentit à 2 % » conclut à une « hausse des taux ». Il faudrait une baisse.
8. **E4 (important)** : l'expression « grand remplacement » est employée pour l'automatisation.
9. **E2 (important)** : les écoles sont présentées comme des biens publics « dont on ne peut exclure personne », ce qui contredit la définition (non rival, non excluable).
10. **M6 (important)** : la « déclaration de performance extra-financière » a été remplacée par le rapport de durabilité (CSRD, ordonnance du 6 décembre 2023).

Viennent ensuite :
- les 6 exercices rattachés au mauvais chapitre (M1, D1, D2, E8, E9, et D3, moins grave) ;
- la contradiction « trois formes / quatre régimes » de responsabilité (D4) ;
- les notions « I », « M », « C » générées pour le processus de Simon (M5) ;
- l'explication fausse du vrai/faux sur la finalité lucrative (M9).

## Ce qui a été relu, et comment

- **Contenu assemblé tel que l'élève le voit.** Chaque thème a été extrait avec `chargerMatieres`, `ALL_CHAPTERS` et `themeChapters` de `src/data/index.js` (script : `scratchpad/verif/work/dump.mjs`). Le texte relu intègre donc la fusion des couches, les sections masquées (prérequis de Première), le dédoublonnage et l'ordre d'affichage. Les indices de chapitre `[n]` cités ci-dessous sont ceux de `themeChapters` (0 = premier chapitre affiché).
- **Fichiers relus en entier** pour chaque matière : `matiere.json` (QCM, vrai/faux, associations, flashcards, tris, remises en ordre), `definitions.json`, `pieges.json`, `etudes-documents.json`, `cas-pratiques.json` et `exercices-sections.json` (rattachement des exercices aux chapitres). Pour les cours (`cours-complets`, `cours-reels`, `approfondi-*`, `enrichissements`, `management-approfondi`), seules les sections réellement affichées ont été relues en détail.
- **Exercices générés automatiquement** à partir des tableaux « Notions et définitions » (QCM, « cas concret », vrai/faux, « écris le terme »). Ils ont été extraits dans `scratchpad/verif/work/generes.txt` et contrôlés surtout quand deux définitions d'un même tableau se recoupent.
- **Calculs refaits** : tous les exemples chiffrés et tous les cas pratiques.
- **Sources** : eduscol.education.fr, legifrance.gouv.fr et education.gouv.fr étaient bloqués par le proxy. Seule la recherche web renvoyait des extraits. Le texte officiel n'a donc pas pu être relu en ligne : les points de droit ont été contrôlés d'après le texte connu des articles cités (Code civil après la réforme de 2016, Code du travail, Code de la consommation, Code de commerce). Un point est classé « à vérifier » quand aucune source n'a pu le confirmer.

### Ce qui n'a pas été relu en détail

- Les sections de cours **non affichées**, parce que masquées comme prérequis de Première (`PREREQ_SECTIONS`) ou éliminées par le dédoublonnage. Elles existent dans les fichiers mais l'élève ne les voit pas. Seule exception : le cas Vél'Oc, signalé parce qu'un exercice y renvoie.
- Les exercices générés n'ont pas été relus un par un : ils sont tirés au hasard à chaque visite, ce qui donne environ 1 Mo de texte. Les problèmes signalés sont ceux qui viennent de la **structure** des tableaux : ils peuvent réapparaître à n'importe quel tirage.
- Les liens vidéo (`resources`) ne sont que des recherches YouTube ; ils n'ont été contrôlés que sur leur intitulé.
- La **conformité au programme officiel**, notion par notion, n'a pu être vérifiée que partiellement, faute d'accès à eduscol : je n'ai pas eu la liste officielle des notions de Terminale. Je n'ai donc pas classé de notion « hors programme », sauf le cas des prérequis de Première (M1, M12).

---

## 1. Management (`content/management/`)

Thèmes relus : `mgmt-t1` « Les organisations et l'activité de production » (8 chapitres affichés), `mgmt-t2` « Les organisations et les acteurs » (17 chapitres), `mgmt-t3` « Les organisations et la société » (17 chapitres).

Dans l'ensemble, le cours est juste. Les auteurs sont bien attribués : Porter, Simon, Ansoff, Likert, Maslow, Herzberg, McGregor, Mintzberg, Chandler, Barney (VRIN), Porter et Kramer. Les définitions de base (valeur ajoutée, DAS, SWOT, PESTEL, RSE, ESS, gouvernance) sont correctes, et l'étude de cas Netflix-Blockbuster est exacte (offre de rachat en 2000, faillite de Blockbuster en 2010). Les problèmes viennent surtout des **exercices générés** et du **rattachement** des exercices aux chapitres.

### M1. Le tri « Type d'organisation » est rattaché au chapitre « La création de valeur »
- **Thème** : `mgmt-t1`, Les organisations et l'activité de production.
- **Fichier** : `management/exercices-sections.json`, clé `"mgmt-t1-tri": 0`. L'exercice lui-même est dans `management/matiere.json`, `chapters/0/games/1`.
- **Citation** : « Classe chaque organisation dans la bonne catégorie » (PME de meubles, mairie, ONG… → entreprise privée, organisation publique, société civile).
- **Problème** : l'exercice s'affiche sous le chapitre [0] « 🎯 La création de valeur : valeur ajoutée, chaîne de valeur et performance globale », qui ne parle pas du tout des types d'organisations. Cette notion relève de la Première, et le moteur la masque volontairement dans le cours de Terminale (`PREREQ_SECTIONS`, motif « Qu'est-ce qu'une organisation… trois types »). L'élève fait donc, dans ce chapitre, un exercice sans aucun lien avec ce qu'il vient de lire.
- **Correction proposée** : retirer la clé `"mgmt-t1-tri"` de `exercices-sections.json` pour que le tri ne soit plus placé sur un chapitre (il resterait dans la banque). Sinon, le réécrire sur le chapitre 0, par exemple « Classe chaque indicateur dans la bonne dimension de la performance globale » : taux de marge → économique ; turnover → sociale ; consommation d'énergie → environnementale…
- **Gravité** : important. **Certitude** : sûr.

### M2. Chapitre « Les parties prenantes » : des QCM à deux bonnes réponses et des « faux » qui sont vrais (exercices générés)
- **Thème** : `mgmt-t3`, chapitre [9] « 🤝 Les parties prenantes : internes, externes et attentes divergentes ».
- **Fichier** : `management/approfondi-1.json`, `mgmt-t3/1/blocks/6` (tableau « Notions et définitions »).
- **Citation** : le tableau mélange la notion générique « Partie prenante | Acteur concerné par l'activité de l'organisation et qui peut l'influencer » et ses cas particuliers « Actionnaires | Rentabilité, dividendes, valeur », « Clients | … », « Fournisseurs | … ».
- **Problème** : le générateur prend la définition d'une ligne comme distracteur pour une autre ligne. Exemples relevés dans le tirage :
  - QCM « « Actionnaires » : quelle proposition est correcte ? » : la bonne réponse attendue est « Rentabilité, dividendes, valeur », mais le distracteur « Acteur concerné par l'activité de l'organisation et qui peut l'influencer » est **aussi juste**.
  - Vrai/faux « « Actionnaires » : Acteur concerné par l'activité de l'organisation et qui peut l'influencer » est corrigé **Faux** alors que c'est vrai. Même chose pour « Clients » et « Fournisseurs ».
  
  L'élève qui a compris le cours est sanctionné. Le même défaut existe dans le chapitre [3] « ⚖️ Performance globale » (`management/management-approfondi.json`, `mgmt-t3/1/blocks/11`, tableau) : « Performance économique | Rentabilité, profit, pérennité » côtoie « Actionnaires | Rentabilité, dividendes ».
- **Correction proposée** : dans la colonne de gauche, renommer « Actionnaires » en « Attentes des actionnaires », « Salariés » en « Attentes des salariés », et ainsi de suite, puis **supprimer la ligne générique « Partie prenante »** de ce tableau (elle est déjà définie dans `definitions.json`). Autre solution : ajouter dans `content/commun/notions-liees.json` les paires `["Partie prenante","Actionnaires"]`, `["Partie prenante","Salariés"]`, `["Partie prenante","Clients"]`, `["Partie prenante","Fournisseurs"]`, `["Partie prenante","État / collectivités"]`, `["Partie prenante","Riverains / ONG"]`.
- **Gravité** : bloquant (faux pour l'élève). **Certitude** : sûr.

### M3. Compétitivité hors-prix et différenciation : deux bonnes réponses (exercices générés)
- **Thème** : `mgmt-t1`, chapitre [3] « ⚔️ La compétitivité : prix ou hors-prix, coûts ou différenciation ».
- **Fichier** : `management/management-approfondi.json`, `mgmt-t1/3/blocks/11` (tableau).
- **Citation** : « Compétitivité hors-prix | Qualité, innovation, image, délais, service, design » et « Différenciation | Offrir ce que le client valorise et ne trouve pas ailleurs ».
- **Problème** : le cours dit lui-même que la compétitivité hors-prix « repose sur la différenciation : offrir quelque chose que le client valorise et qu'il ne trouve pas ailleurs ». Pourtant, le QCM généré « Que signifie « Compétitivité hors-prix » ? » propose ce texte comme distracteur, et le vrai/faux « « Compétitivité hors-prix » : Offrir ce que le client valorise et ne trouve pas ailleurs » est corrigé **Faux**.
- **Correction proposée** : ajouter `["Compétitivité hors-prix","Différenciation"]` et `["Compétitivité","Compétitivité-prix"]` à `content/commun/notions-liees.json`. Sinon, retirer la ligne « Différenciation » de ce tableau : elle est traitée en `mgmt-t2` avec Porter.
- **Gravité** : bloquant. **Certitude** : sûr.

### M4. Ressources et compétences : définitions qui se recoupent (exercices générés)
- **Thème** : `mgmt-t1`, chapitre [1] « 🧩 Ressources, compétences distinctives et avantage concurrentiel ».
- **Fichier** : `management/management-approfondi.json`, `mgmt-t1/1/blocks/10` (tableau).
- **Citation** : « Ressources | Moyens dont dispose l'organisation », « Ressources immatérielles | Marque, image, brevets, savoir-faire… », « Compétence distinctive | Savoir-faire que l'organisation maîtrise mieux que ses concurrents ».
- **Problème** :
  - Le vrai/faux généré « « Ressources immatérielles » : Savoir-faire que l'organisation maîtrise mieux que ses concurrents » est corrigé Faux, alors que le cours range le savoir-faire parmi les ressources immatérielles.
  - Dans les QCM, le distracteur « Moyens dont dispose l'organisation » est juste pour toutes les catégories de ressources.
- **Correction proposée** : supprimer la ligne générique « Ressources » du tableau, ou ajouter à `notions-liees.json` les paires `["Ressources","Ressources humaines"]` (et de même pour financières, matérielles, immatérielles et technologiques) ainsi que `["Ressources immatérielles","Compétence distinctive"]`.
- **Gravité** : important. **Certitude** : sûr.

### M5. Processus de décision de Simon : le générateur crée des « notions » appelées I, M et C
- **Thème** : `mgmt-t2`, chapitre [2] « 🧭 La décision : niveaux, processus IMC et rationalité limitée (Simon) ».
- **Fichier** : `management/management-approfondi.json`, `mgmt-t2/0/blocks/6/c/0`, `…/c/1` et `…/c/2`.
- **Citation** : « **I — Intelligence** : identifier et comprendre le problème… », « **M — Modélisation** : … », « **C — Choix** : … ».
- **Problème** : le générateur prend le texte en gras comme nom de la notion. Il produit donc :
  - « Écris le terme : « Intelligence : identifier et comprendre le problème… » → réponse attendue **I** ». L'élève qui écrit « Intelligence » risque d'être compté faux.
  - « « M » : quelle proposition est correcte ? »
  - « Cas concret… De quelle notion s'agit-il ? → I » (avec M et C en distracteurs).
  
  Ce sont des questions absurdes, qui font mauvaise impression.
- **Correction proposée** : réécrire les trois puces ainsi : « **Intelligence (I)** : identifier et comprendre le problème, recueillir l'information. » / « **Modélisation (M)** : imaginer les solutions possibles et évaluer leurs conséquences. » / « **Choix (C)** : sélectionner la solution retenue, puis la mettre en œuvre et la contrôler. »
- **Gravité** : important. **Certitude** : sûr.

### M6. La « déclaration de performance extra-financière » est remplacée par le rapport de durabilité (CSRD)
- **Thème** : `mgmt-t3`, chapitre [2] « 🌍 RSE et développement durable : trois piliers, ISO 26000 et rapport RSE ».
- **Fichier** : `management/management-approfondi.json`, `mgmt-t3/0/blocks/8/c`.
- **Citation** : « les grandes entreprises doivent publier une **déclaration de performance extra-financière** (leurs impacts sociaux et environnementaux) ».
- **Problème** : l'ordonnance n° 2023-1142 du 6 décembre 2023, qui transpose la directive CSRD, a remplacé la DPEF par la publication d'informations en matière de durabilité (le « rapport de durabilité »). C'est le cas dès les exercices ouverts en 2024 pour les plus grandes entreprises. En 2025, le paquet européen « Omnibus » a ensuite reporté l'obligation et réduit son champ. Le terme « DPEF » est donc périmé.
- **Correction proposée** : « La RSE est de plus en plus **encadrée par la loi** : les plus grandes entreprises doivent publier un **rapport de durabilité** (directive européenne CSRD), qui a remplacé en 2024 la déclaration de performance extra-financière (DPEF) et présente leurs impacts sociaux et environnementaux. Elle n'est donc plus seulement volontaire. »
- **Gravité** : important. **Certitude** : probable. Le remplacement de la DPEF est sûr ; le champ exact après l'Omnibus est à vérifier.
- **Source** : ordonnance n° 2023-1142 du 6 décembre 2023 (Légifrance, non joignable ici) ; extraits de recherche web (Lefebvre Dalloz, cabinets d'expertise).

### M7. Le RGPD n'impose pas toujours le consentement
- **Thème** : `mgmt-t3`, chapitre [6] « 🔐 Les risques du numérique : cybersécurité, RGPD et intelligence artificielle ».
- **Fichiers et emplacements** :
  - `management/management-approfondi.json`, `mgmt-t3/4/blocks/2/c` : « Le RGPD … impose aux organisations de collecter les données de façon loyale, avec le consentement des personnes, pour une finalité précise » ;
  - même fichier, `mgmt-t3/4/blocks/3/c` : « elle doit respecter le RGPD : recueillir le consentement, définir une finalité précise… » ;
  - `management/matiere.json`, `chapters/2/games/0/questions/6/explain` : « Le RGPD impose consentement, finalité précise et sécurité des données » ;
  - même fichier, `chapters/2/games/1/cards/7/back` : « consentement, finalité, sécurité (CNIL) ».
- **Problème** : l'article 6 du RGPD prévoit six bases légales (consentement, contrat, obligation légale, intérêts vitaux, mission d'intérêt public, intérêt légitime). Le consentement n'en est qu'une : une paie ou une commande se traitent sans consentement. Le cours de droit le dit correctement (`droit-t8`, chapitre [14] : « obtenir l'accord de la personne (sauf autre base légale) »), d'où une **contradiction** entre les deux matières.
- **Correction proposée** : « … de collecter les données de façon loyale, sur une **base légale** (souvent le **consentement** des personnes), pour une finalité précise, et de les sécuriser. » Dans l'explication du QCM et la flashcard : « base légale (souvent le consentement), finalité, minimisation, sécurité ».
- **Gravité** : mineur. **Certitude** : sûr. **Source** : règlement (UE) 2016/679, art. 6.

### M8. Porter : « deux » avantages ou « trois » ? Le cours se contredit
- **Thème** : `mgmt-t1`, chapitre [3].
- **Fichier** : `management/management-approfondi.json`, `mgmt-t1/3/blocks/5/c` et `mgmt-t1/3/blocks/10/c` (encadré « À retenir »).
- **Citation** :
  - bloc 5 : « Selon Porter, il vient soit des **coûts** (être moins cher), soit de la **différenciation** (être unique) » ;
  - bloc 10 : « L'avantage concurrentiel (Porter) vient des **coûts**, de la **différenciation** ou de la **focalisation** (niche) ».
- **Problème** : chez Porter, il y a deux sources d'avantage concurrentiel (coûts ou différenciation) et trois stratégies génériques. La focalisation est un choix de cible étroite, poursuivie par les coûts ou par la différenciation ; ce n'est pas une troisième source d'avantage. `mgmt-t2` ne présente d'ailleurs que deux stratégies.
- **Correction proposée** (bloc 10) : « L'**avantage concurrentiel** (Porter) vient des **coûts** ou de la **différenciation**, recherché sur tout le marché ou sur un segment précis (stratégie de **focalisation**, ou niche) ; il faut l'entretenir par l'innovation. »
- **Gravité** : mineur. **Certitude** : sûr.

### M9. Vrai/faux « Une entreprise privée a toujours une finalité lucrative » : explication fausse
- **Thème** : `mgmt-t1`.
- **Fichier** : `management/matiere.json`, `chapters/0/games/4/questions/0`.
- **Citation** : réponse « Faux », expliquée par « Souvent, mais elle peut aussi intégrer une dimension sociétale (RSE). »
- **Problème** : intégrer la RSE ne retire pas la finalité lucrative. Une entreprise engagée dans la RSE reste à but lucratif. L'explication enseigne donc un raisonnement faux. Elle contredit aussi `management/definitions.json` (« Entreprise privée : Organisation à finalité lucrative ») et `management/pieges.json` (« Une **entreprise** cherche le profit »).
- **Correction proposée** : garder « Faux » avec l'explication « Faux : la plupart des entreprises privées ont une finalité lucrative, mais certaines entreprises de l'économie sociale et solidaire (coopératives, entreprises solidaires d'utilité sociale) ont une lucrativité limitée et une finalité sociale prioritaire. Intégrer la RSE, en revanche, ne supprime pas la finalité lucrative. » On peut aussi remplacer l'affirmation par une question moins discutable.
- **Gravité** : important. **Certitude** : probable.

### M10. Des exercices renvoient au cas Vél'Oc, que l'élève ne voit plus
- **Thème** : `mgmt-t2`, puis `mgmt-t3`.
- **Fichier** : `management/matiere.json` :
  - `chapters/1/games/1/instruction` : « Classe ces éléments de Vél'Oc dans la bonne case du SWOT » ;
  - `chapters/2/games/0/questions/1` : « La critique sur l'empreinte carbone des batteries relève de la dimension… » ;
  - `chapters/2/games/0/questions/3` : « Une réponse RSE à la critique environnementale pourrait être… le recyclage/réemploi des batteries ».
- **Problème** : le cas Vél'Oc n'existe que dans `cours-complets.json` (sections « SWOT de Vél'Oc », « Le cas des batteries de Vél'Oc »). Ces sections ne sont plus affichées : elles ont été remplacées par les cours réels et par `management-approfondi`. L'élève ne sait pas ce qu'est Vél'Oc, et « la critique sur l'empreinte carbone des batteries » arrive sans contexte dans le test du thème.
- **Correction proposée** :
  - instruction du tri : « Classe ces éléments du diagnostic d'un fabricant de vélos électriques haut de gamme dans la bonne case du SWOT. » ;
  - question 1 : « Un fabricant de vélos électriques est critiqué pour l'empreinte carbone de ses batteries. Cette critique relève de la dimension… » ;
  - question 3 : reprendre le même contexte.
- **Gravité** : mineur. **Certitude** : sûr.

### M11. Définition d'« externalité » limitée aux effets négatifs
- **Thème** : `mgmt-t3`.
- **Fichier** : `management/definitions.json`, `mgmt-t3/5/1`.
- **Citation** : « Conséquence de l'activité subie par un tiers sans compensation (pollution, nuisances). »
- **Problème** : le cours (chapitre [3]) et la flashcard C8 définissent l'externalité comme un effet **positif ou négatif**. Cette définition ne retient que le négatif ; elle sert aussi d'encadré « Définitions clés » et d'« essentiel ».
- **Correction proposée** : « Effet, positif ou négatif, de l'activité d'un agent sur des tiers, sans compensation par le marché (ex. pollution ; formation de jeunes). »
- **Gravité** : mineur. **Certitude** : sûr.

### M12. Ressources vidéo de `mgmt-t1` consacrées à des notions de Première masquées
- **Thème** : `mgmt-t1`.
- **Fichier** : `management/cours-complets.json`, `mgmt-t1/resources/0` et `mgmt-t1/resources/1`.
- **Citation** : « Organisation, finalités et types », « Efficacité et efficience ».
- **Problème** : le moteur masque ces notions du cours de Terminale (`PREREQ_SECTIONS`), mais ce sont les deux seules vidéos proposées pour le thème. Rien n'est proposé sur la création de valeur, la chaîne de valeur, la compétitivité ou l'organisation de la production (flux, qualité).
- **Correction proposée** : remplacer par « Création de valeur et chaîne de valeur » et « Organiser la production : flux tiré, juste-à-temps, qualité ».
- **Gravité** : mineur. **Certitude** : sûr.

### Remarque hors erreur (management)
- `management/cas-pratiques.json`, `mgmt-t2` : deux calculs de taux de croissance (CA de 800 000 € à 920 000 € → 15 % ; marché de 500 000 à 560 000 unités → 12 %). Les calculs sont justes, mais ces cas ne sont **jamais affichés** : il n'existe pas de clé `"mgmt-t2::cas"` dans `exercices-sections.json`.

---

## 2. Droit (`content/droit/`)

Thèmes relus : `droit-t5` « Quel est le rôle du contrat ? » (14 chapitres affichés), `droit-t6` « Qu'est-ce qu'être responsable ? » (11), `droit-t7` « Comment le droit encadre-t-il le travail salarié ? » (12), `droit-t8` « Dans quel cadre et comment entreprendre ? » (16).

Les règles de fond sont à jour et exactes. Points vérifiés et justes :
- **Contrats (réforme de 2016)** : art. 1101, 1103, 1104, 1128, 1130 et suivants, 1137, 1143 (violence économique), 1179 (nullités), 1199 (effet relatif), 1217 (sanctions de l'inexécution), 1218 (force majeure), 1231-5 (révision de la clause pénale), 1127-2 (double clic) ;
- **Consommation** : 14 jours de rétractation, exception des loisirs datés (art. L221-28) ;
- **Responsabilité** : art. 1240, 1242 al. 1, 4 et 5, 1243, 1245 et suivants ;
- **Travail** : arrêt Uber de la Cour de cassation (chambre sociale, 4 mars 2020), cause réelle et sérieuse, indemnité d'au plus un mois de salaire pour un licenciement irrégulier, barème des dommages-intérêts, requalification des CDD, 35 h, majorations de 25 % puis 50 % (au moins 10 % par accord), 10 h par jour, 48 h par semaine, 11 h de repos, obligation de sécurité « de moyens renforcée » ;
- **Entreprise** : loi du 14 février 2022 (en vigueur le 15 mai 2022), résidence principale insaisissable depuis 2015, art. 1832, art. 101 et 102 du TFUE, durées de protection (brevet 20 ans, marque 10 ans renouvelables, droit d'auteur vie + 70 ans, dessins et modèles 5 à 25 ans), SA à 2 actionnaires (7 si cotée), bail commercial de 9 ans.

Les problèmes viennent surtout du **rattachement** des exercices aux chapitres, de quelques contradictions, et des **exercices générés** à partir de tableaux dont les définitions se recoupent.

### D1. La remise en ordre « Le syllogisme juridique » est rattachée au chapitre sur les vices du consentement
- **Thème** : `droit-t5`.
- **Fichier** : `droit/exercices-sections.json`, `"droit-t5-ordre": 6`. L'exercice est dans `droit/matiere.json`, `chapters/0/games/1`.
- **Problème** : l'exercice (majeure → mineure → conclusion) s'affiche sous le chapitre [6] « ⚠️ Les vices du consentement : erreur, dol, violence ». Le syllogisme est expliqué aux chapitres [8] « Cas pratique guidé — la méthode du syllogisme » et [12] « MÉTHODE — Résoudre un cas pratique ».
- **Correction proposée** : `"droit-t5-ordre": 8`.
- **Gravité** : important. **Certitude** : sûr.

### D2. L'étude de documents « Choisir sa structure et respecter la concurrence » est rattachée au chapitre sur la propriété intellectuelle
- **Thème** : `droit-t8`.
- **Fichier** : `droit/exercices-sections.json`, `"droit-t8-doc": 2`. L'étude est dans `droit/etudes-documents.json`, `droit-t8`.
- **Problème** : l'étude (EI ou EURL, art. 1832, concurrence déloyale) s'affiche sous le chapitre [2] « La propriété intellectuelle : marque, droit d'auteur et contrefaçon ». L'index semble avoir été fixé avant l'ajout des cours réels devant le cours complet (`COURS_COMPLET_AUSSI` dans `src/data/index.js`), ce qui a décalé les chapitres.
- **Correction proposée** : `"droit-t8-doc": 1` (« Forme juridique et patrimoine personnel ») ou `3` (« La liberté d'entreprendre et l'entreprise individuelle »).
- **Gravité** : important. **Certitude** : sûr.

### D3. Le tri « Responsabilité civile ou pénale ? » est placé sur le chapitre qui ne traite que du civil
- **Thème** : `droit-t6`.
- **Fichier** : `droit/exercices-sections.json`, `"droit-t6-tri": 0`.
- **Problème** : le chapitre [0] « La responsabilité civile : réparer le dommage causé à autrui » ne parle pas du pénal. C'est le chapitre [1] « Indemniser la victime ou punir l'auteur : civil ou pénal » qui fait la distinction.
- **Correction proposée** : `"droit-t6-tri": 1`.
- **Gravité** : mineur. **Certitude** : sûr.

### D4. « Trois formes » de fait générateur, puis quatre régimes énumérés
- **Thème** : `droit-t6`, chapitre [5] « 🚗 Les régimes de responsabilité : fait personnel, fait des choses, fait d'autrui ».
- **Fichier** : `droit/approfondi-1.json`, `droit-t6/2/blocks/0/c` (puis `blocks/1` et `blocks/2`).
- **Citation** : « Le fait générateur prend trois formes, correspondant à trois **régimes** de responsabilité civile. » Le paragraphe suivant énumère : « Le premier… Le deuxième… Le troisième vise le **fait des animaux**… Le quatrième est la responsabilité du **fait d'autrui** ».
- **Problème** : contradiction dans le même chapitre. L'élève ne sait plus combien de régimes retenir. Le chapitre [4] parle aussi de « trois » formes : faute, chose, autrui.
- **Correction proposée** : « Le fait générateur prend plusieurs formes, qui correspondent aux grands **régimes** de responsabilité extracontractuelle : le fait personnel, le fait des choses (et, tout proche, le fait des animaux) et le fait d'autrui. »
- **Gravité** : important. **Certitude** : sûr.

### D5. Vices du consentement : le vrai/faux généré corrige « Faux » une affirmation vraie
- **Thème** : `droit-t5`, chapitre [6] « ⚠️ Les vices du consentement : erreur, dol, violence ».
- **Fichier** : `droit/approfondi-1.json`, `droit-t5/2/blocks/6` (tableau).
- **Citation** : « Vice du consentement | Consentement faussé qui rend le contrat annulable à la demande de la victime », dans le même tableau que « Erreur », « Dol », « Violence » et « Vice déterminant ».
- **Problème** : l'erreur, le dol et la violence **sont** des vices du consentement. Pourtant :
  - le vrai/faux généré « « Erreur » : Consentement faussé qui rend le contrat annulable à la demande de la victime » est corrigé **Faux** ;
  - le QCM « À quoi correspond « Erreur » ? » propose cette définition comme distracteur alors qu'elle est juste.
- **Correction proposée** : ajouter à `content/commun/notions-liees.json` les paires `["Vice du consentement","Erreur"]`, `["Vice du consentement","Dol"]`, `["Vice du consentement","Violence"]` et `["Vice du consentement","Vice déterminant"]`. Sinon, retirer la ligne générique du tableau.
- **Gravité** : bloquant. **Certitude** : sûr.

### D6. Classification des contrats : synallagmatique et onéreux, unilatéral et gratuit (exercices générés)
- **Thème** : `droit-t5`, chapitres [0] et [4].
- **Fichiers** : `droit/approfondi-1.json`, `droit-t5/0/blocks/5` (tableau du chapitre [4]) ; `droit/cours-reels.json`, `droit-t5/0/blocks/6` (tableau du chapitre [0]).
- **Problème** : le générateur a produit :
  - « « Contrat synallagmatique » : Chacun reçoit une contrepartie » corrigé **Faux**. Or un contrat synallagmatique fait naître des obligations réciproques : chacun reçoit nécessairement une contrepartie, et il est toujours à titre onéreux.
  - « « Contrat unilatéral » : Sans contrepartie » corrigé **Faux**. C'est discutable, puisque l'exemple du cours (la donation) est à la fois unilatéral et gratuit.
- **Correction proposée** : ajouter à `notions-liees.json` les paires `["Contrat synallagmatique","Contrat à titre onéreux"]` et `["Contrat unilatéral","Contrat à titre gratuit"]`.
- **Gravité** : important. **Certitude** : sûr.

### D7. Autres tableaux de droit dont les définitions se recoupent (exercices générés)
Même mécanisme que D5 : la définition d'une notion générique est vraie aussi pour ses cas particuliers. Selon le tirage, une affirmation vraie peut donc être corrigée « Faux », ou un QCM avoir deux bonnes réponses.

| Chapitre | Tableau source | Lignes qui se recoupent | Exemple de mauvaise correction possible | Paires à ajouter à `notions-liees.json` |
|---|---|---|---|---|
| `droit-t6` [5] Régimes de responsabilité | `droit/approfondi-1.json`, `droit-t6/2/blocks/6` | « Responsabilité sans faute (objective) » et « Fait des choses », « Fait d'autrui », « Fait des animaux » | « « Fait des choses (art. 1242 al. 1) » : La victime n'a pas à prouver une faute, seulement la garde ou le lien » → Faux. Relevé dans le tirage : « « Responsabilité sans faute (objective) » : Responsabilité pour une personne dont on répond » → Faux, discutable. | `["Responsabilité sans faute (objective)","Fait des choses (art. 1242 al. 1)"]`, idem avec « Fait d'autrui » et « Fait des animaux (art. 1243) » |
| `droit-t6` [3] Civil ou pénal | `droit/approfondi-1.json`, `droit-t6/0/blocks/5` | « Responsabilité civile » et « Dommages-intérêts » | « « Responsabilité civile » : Somme d'argent versée à la victime pour réparer son préjudice » → Faux (relevé). Discutable. | `["Responsabilité civile","Dommages-intérêts"]` |
| `droit-t7` [5] Rupture du CDI | `droit/approfondi-1.json`, `droit-t7/2/blocks/6` | « Licenciement » et « Licenciement pour motif personnel / économique ». `memeNotion` ne les rapproche pas : « licenciement **pour** » n'est pas dans sa liste de liaisons. | « « Licenciement pour motif personnel / économique » : Rupture à l'initiative de l'employeur (cause réelle et sérieuse + procédure) » → Faux | `["Licenciement","Licenciement pour motif personnel / économique"]` |
| `droit-t8` [8] Formes juridiques | `droit/approfondi-1.json`, `droit-t8/0/blocks/5` | « Responsabilité limitée aux apports » et « EURL », « SARL », « SA » | « « SARL » : L'associé ne peut perdre que ce qu'il a apporté à la société » → Faux | `["Responsabilité limitée aux apports","EURL"]`, idem avec « SARL » et « SA » |
| `droit-t8` [10] Propriété intellectuelle | `droit/approfondi-1.json`, `droit-t8/2/blocks/6` | « Propriété intellectuelle » et « Brevet », « Marque », « Droit d'auteur », « Dessins et modèles » | « « Brevet » : Droits qui donnent un monopole d'exploitation temporaire sur une création » → Faux | `["Propriété intellectuelle","Brevet"]`, idem avec les trois autres |
| `droit-t8` [12] Personnalité juridique | `droit/approfondi-2.json`, `droit-t8/0/blocks/6` | « Personnalité juridique » et « Personne morale » | « « Personne morale » : Aptitude à être titulaire de droits et d'obligations » → Faux (relevé). Discutable. | `["Personnalité juridique","Personne morale"]`, `["Personnalité juridique","Personne physique"]` |

- **Gravité** : important. **Certitude** : probable (l'erreur n'apparaît que si le tirage associe ces deux lignes).

### D8. SARL « de 2 à 100 associés »
- **Thème** : `droit-t8`, chapitre [8] « 🏗️ Choisir une forme juridique : entreprise individuelle ou société ».
- **Fichier** : `droit/approfondi-1.json`, `droit-t8/0/blocks/2/c` et tableau `droit-t8/0/blocks/5/rows/2/1`.
- **Citation** : « La **SARL** réunit **de 2 à 100 associés** ».
- **Problème** : une SARL peut être créée par **une** personne (art. L223-1 du Code de commerce : « instituée par une ou plusieurs personnes ») ; l'EURL n'est qu'une SARL à associé unique. Le même chapitre présente pourtant l'EURL comme une société.
- **Correction proposée** : « La **SARL** réunit **de 1 à 100 associés** (avec un seul associé, on parle d'**EURL**) » et, dans le tableau : « 1 à 100 associés (EURL si associé unique), responsabilité limitée aux apports (PME familiale) ».
- **Gravité** : mineur. **Certitude** : sûr. **Source** : Code de commerce, art. L223-1 et L223-3.

### D9. « Le contrat fait la loi des parties » présenté entre guillemets comme l'article 1103
- **Thème** : `droit-t5`.
- **Fichier** : `droit/matiere.json`, à trois endroits : `chapters/0/games/0/questions/3/explain` ; `chapters/0/games/2/cards/5/back` ; `chapters/0/games/3/pairs/3/right`.
- **Citation** : « « Le contrat fait la loi des parties » (art. 1103) ».
- **Problème** : ce n'est pas le texte de l'article, mais un adage. L'article 1103 dit : « Les contrats légalement formés tiennent lieu de loi à ceux qui les ont faits. » Le cours et l'étude de documents citent correctement le texte, donc l'élève voit deux citations différentes pour le même article.
- **Correction proposée** : « « Les contrats légalement formés tiennent lieu de loi à ceux qui les ont faits » (art. 1103) : c'est la force obligatoire. » Pour la flashcard et l'association : « Le contrat légalement formé tient lieu de loi aux parties (art. 1103) ».
- **Gravité** : mineur. **Certitude** : sûr.

### D10. Explication du QCM : « (le contracter, payer, livrer…) »
- **Thème** : `droit-t5`.
- **Fichier** : `droit/matiere.json`, `chapters/0/games/0/questions/0/explain`.
- **Citation** : « Le contrat crée des obligations entre les parties (le contracter, payer, livrer…). »
- **Problème** : « le contracter » n'a pas de sens ici ; c'est une faute qui fait mauvaise impression.
- **Correction proposée** : « Le contrat crée des obligations entre les parties (payer, livrer, fournir un service…). »
- **Gravité** : mineur. **Certitude** : sûr.

### D11. Définition d'« obligation » selon l'ancienne formule du Code civil
- **Thème** : `droit-t5`.
- **Fichier** : `droit/definitions.json`, `droit-t5/3/1`.
- **Citation** : « Lien de droit contraignant une personne à donner, faire ou ne pas faire. »
- **Problème** : la trilogie « donner, faire, ne pas faire » vient de l'ancien article 1101, réécrit par la réforme de 2016. Le reste du cours s'appuie sur le Code réformé.
- **Correction proposée** : « Lien de droit par lequel une personne (le débiteur) est tenue envers une autre (le créancier) d'exécuter une prestation : payer, livrer, faire ou ne pas faire quelque chose. »
- **Gravité** : mineur. **Certitude** : sûr.

### D12. Vrai/faux « Un contrat peut être rompu librement par une seule partie, à tout moment » : explication incomplète
- **Thème** : `droit-t5`.
- **Fichier** : `droit/matiere.json`, `chapters/0/games/4/questions/3`.
- **Problème** : la réponse « Faux » est acceptable, mais l'explication ignore une exception au programme : un contrat **à durée indéterminée** peut être résilié unilatéralement à tout moment, avec un préavis raisonnable (art. 1211).
- **Correction proposée** (explication) : « Faux : la force obligatoire impose de respecter ses engagements. Seul un contrat à durée indéterminée peut être résilié par une partie, en respectant un préavis (art. 1211). »
- **Gravité** : mineur. **Certitude** : sûr.

### D13. Le cas Rolex qualifie le dol sans que les faits établissent l'intention de tromper
- **Thème** : `droit-t5`, chapitre [1] « Le consentement vicié : le dol et la nullité du contrat ».
- **Fichier** : `droit/cours-reels.json`, `droit-t5/1/blocks/0/c` (cas) et `droit-t5/1/blocks/3/c` (analyse).
- **Citation** : « une montre présentée comme une « Rolex authentique »… tu découvres que c'est une contrefaçon », puis « Ici, le vendeur a menti volontairement : c'est un dol ».
- **Problème** : les faits ne disent pas que le vendeur savait que la montre était fausse. Or c'est justement ce qui sépare le dol de l'erreur, et ce que le chapitre veut apprendre à qualifier. Le cas ne sert donc pas bien la méthode.
- **Correction proposée** (cas) : « … présentée comme une « Rolex authentique » par un vendeur qui savait qu'il s'agissait d'une copie. »
- **Gravité** : mineur. **Certitude** : sûr.

### D14. QCM « Un licenciement n'est régulier que s'il repose sur une cause réelle et sérieuse… » : vocabulaire contraire au cours
- **Thème** : `droit-t7`.
- **Fichier** : `droit/matiere.json`, `chapters/2/games/0/questions/4/q`.
- **Problème** : le cours réserve « irrégulier » au vice de **procédure** et « abusif » ou « sans cause réelle et sérieuse » à l'absence de motif. Dire « régulier » pour « justifié et régulier » brouille cette distinction, sur laquelle porte un cas pratique du chapitre.
- **Correction proposée** : « Un licenciement n'est valable (justifié et régulier) que s'il repose sur… »
- **Gravité** : mineur. **Certitude** : sûr.

### D15. QCM sur l'EURL : « protège le patrimoine du gérant »
- **Thème** : `droit-t8`.
- **Fichier** : `droit/matiere.json`, `chapters/3/games/0/questions/2/choices/0`.
- **Problème** : la personne morale protège le patrimoine de l'**associé unique**. Le gérant peut être un tiers, et il reste responsable de ses fautes de gestion. Le cours parle bien de l'associé.
- **Correction proposée** : « créer une personne morale qui protège le patrimoine de l'associé unique ».
- **Gravité** : mineur. **Certitude** : sûr.

### D16. Cas de la bouteille qui explose : le supermarché est-il bien le gardien ?
- **Thème** : `droit-t6`, chapitre [2] « ⚖️ Cas pratique guidé — responsabilité du fait des choses et garde ».
- **Fichier** : `droit/approfondi-1.json`, `droit-t6/4/blocks/0/c` (énoncé) et `droit-t6/4/blocks/3/c` (conclusion).
- **Citation** : « une bouteille explose sur le rayon et blesse un client… Le supermarché, **gardien**, est **civilement responsable** ».
- **Problème** : pour une chose dotée d'un dynamisme propre, comme une bouteille sous pression, la jurisprudence peut laisser la « garde de la structure » au fabricant (arrêt « Oxygène liquide », Cass. 2e civ., 5 janvier 1956). Aujourd'hui, l'explosion relève aussi du régime des **produits défectueux** (art. 1245 et suivants), qui vise le producteur. La conclusion sans nuance risque d'induire en erreur sur un cas d'école connu.
- **Correction proposée** : prendre un exemple sans ambiguïté, par exemple « un carton mal rangé tombe d'une étagère du supermarché et blesse un client ». Autre solution : garder le cas en ajoutant « Nuance : si l'explosion vient d'un défaut de fabrication, la victime peut aussi agir contre le fabricant (produits défectueux, art. 1245). »
- **Gravité** : mineur. **Certitude** : à vérifier (application de la garde de la structure à ce cas précis).

### Remarques hors erreur (droit)
- `droit-t5` : aucune section affichée ne traite de l'**imprévision** (art. 1195), ni de l'**obligation précontractuelle d'information** (art. 1112-1, citée seulement pour le consommateur). Je n'ai pas pu vérifier sur eduscol si ces notions figurent dans le programme de Terminale. À contrôler.

---

## 3. Économie (`content/economie/`)

Thèmes relus : `eco-t6` « Le rôle de l'État » (12 chapitres affichés), `eco-t7` « Emploi et chômage » (10), `eco-t8` « Le commerce international » (11), `eco-t9` « Croissance et développement durable » (11), `eco-actu` « Actualité économique » (9).

**Calculs refaits** (tous justes) :
- déficit de 100 Md€, soit 4 % du PIB ;
- taux de chômage de 9,1 % (2,5 / 27,5) et de 10,7 % (3 / 28) ; taux d'activité de 70 % ; taux d'emploi de 62,5 % ;
- QCM : 3 / 27 ≈ 11,1 % ;
- soldes commerciaux de −60 Md€ et −70 Md€ ; taux de couverture de 89 % et 87,3 % ; taux d'ouverture de 21,2 % ;
- taux de croissance de +4 % et +3 % ; PIB par habitant de 51 500 € ;
- cas pratiques : 3 % et 110 % ; 10 % et 70 % ; −70 et 87,27 %.

Le cours donne très peu de chiffres d'actualité datés, et c'est voulu (« vérifie sur l'INSEE »). Aucun chiffre périmé n'a donc été relevé. Les définitions sont justes : BIT (avec la disponibilité sous deux semaines), Musgrave, défaillances du marché, Brundtland, IDH, soutenabilité faible et forte, BCE (cible de 2 %). Les problèmes de fond portent sur l'exemple de Ricardo, sur les « écoles » présentées comme biens publics, sur un exemple d'actualité incohérent et sur le périmètre de l'épreuve écrite.

### E1. L'exemple « Portugal et Angleterre » illustre l'avantage absolu, pas l'avantage comparatif
- **Thème** : `eco-t8`, chapitre [4] « 🌍 L'avantage comparatif de Ricardo : se spécialiser pour échanger ».
- **Fichier** : `economie/approfondi-1.json`, `eco-t8/0/blocks/2/c` (encadré « Illustration simplifiée »).
- **Citation** : « Si le Portugal est très bon pour le vin et l'Angleterre pour le drap, chacun a intérêt à se spécialiser et à échanger ».
- **Problème** : si chaque pays est le meilleur dans un bien, c'est l'**avantage absolu** d'Adam Smith. Le paragraphe juste au-dessus annonce pourtant l'idée « contre-intuitive » de Ricardo (« même un pays **plus performant en tout** a intérêt à se spécialiser »), et l'encadré « À retenir » oppose les deux notions. L'exemple enseigne donc la mauvaise notion. Dans l'exemple original de Ricardo, le Portugal est plus efficace dans **les deux** productions.
- **Correction proposée** : « Dans l'exemple de Ricardo, l'Angleterre a besoin de 100 heures de travail pour produire une unité de drap et de 120 heures pour une unité de vin ; le Portugal, de 90 heures pour le drap et de 80 heures pour le vin. Le Portugal est meilleur dans les deux (avantage absolu), mais son avance est plus forte pour le vin (80/120 ≈ 0,67 contre 90/100 = 0,9). Il a donc un avantage comparatif dans le vin, et l'Angleterre dans le drap, où son désavantage est le plus faible. En se spécialisant ainsi puis en échangeant, les deux pays obtiennent plus des deux biens. »
- **Gravité** : bloquant (notion centrale du thème, confondue avec son contraire). **Certitude** : sûr. **Source** : D. Ricardo, *Des principes de l'économie politique et de l'impôt* (1817), chapitre 7.

### E2. Les écoles présentées comme des biens publics « dont on ne peut exclure personne »
- **Thème** : `eco-t6`, chapitre [4] « 🏛️ Les fonctions de l'État selon Musgrave ».
- **Fichier** : `economie/approfondi-1.json`, `eco-t6/0/blocks/1/c`, et tableau `eco-t6/0/blocks/5/rows/0/1`.
- **Citation** : « les **biens publics** comme les écoles, les routes, la défense ou la justice. Personne ne pourrait les financer en les vendant, car on ne peut empêcher personne d'en profiter. » Le tableau dit : « (biens publics : écoles, routes, défense, justice) ».
- **Problème** : l'enseignement n'est ni non excluable ni non rival : des écoles privées le vendent, et une classe a un nombre de places limité. Le chapitre [5] et la flashcard définissent pourtant le bien public comme « non rival et non excluable » (éclairage public, défense). L'élève reçoit deux définitions incompatibles, et le contre-exemple de l'école est classique au bac.
- **Correction proposée** : « les **biens publics** comme la défense, l'éclairage public ou la justice : personne ne pourrait les financer en les vendant, car on ne peut empêcher personne d'en profiter. L'État produit aussi des services comme l'**école** ou la santé, qu'il juge utiles à tous et rend gratuits ou bon marché, même s'ils pourraient être vendus. » Dans le tableau : « (biens publics : défense, éclairage public, justice ; services publics : école, routes) ».
- **Gravité** : important. **Certitude** : sûr.

### E3. Exemple d'actualité : « l'inflation ralentit à 2 % », donc… « hausse des taux » ?
- **Thème** : `eco-actu`, chapitre [3] « 🗞️ Exemple — l'inflation ralentit : nommer, relier, analyser ».
- **Fichier** : `economie/enrichissements.json`, `eco-actu/sections/0/blocks/1/c/2`.
- **Citation** : situation « l'inflation ralentit à 2 % et la Banque centrale ajuste ses taux », puis analyse « réponse (hausse des taux pour freiner l'inflation) ».
- **Problème** : c'est incohérent. Quand l'inflation retombe vers la cible de 2 %, la banque centrale **baisse** ses taux. C'est ce qu'a fait la BCE à partir de juin 2024, après les hausses de 2022-2023. L'exemple, présenté comme un modèle de copie, applique mécaniquement le schéma « inflation → hausse des taux ».
- **Correction proposée** : « **Analyser** : cause (baisse des prix de l'énergie, effet des hausses de taux passées) → conséquence (le pouvoir d'achat se redresse) → réponse (l'inflation revenant vers sa cible de 2 %, la BCE peut **baisser** ses taux pour soutenir le crédit et l'activité). »
- **Gravité** : important. **Certitude** : sûr.

### E4. « Le grand remplacement par les machines »
- **Thème** : `eco-t7`, chapitre [8] « 🤖 Automatisation, progrès technique et avenir de l'emploi ».
- **Fichier** : `economie/approfondi-2.json`, `eco-t7/1/blocks/0/c`.
- **Citation** : « ceux qui craignent un chômage de masse (le « grand remplacement » par les machines) ».
- **Problème** : « grand remplacement » est le nom d'une théorie complotiste d'extrême droite. L'employer dans un cours d'économie pour lycéens est très malvenu, même entre guillemets.
- **Correction proposée** : « ceux qui craignent un chômage de masse (la « fin du travail », remplacé par les machines) ».
- **Gravité** : important (fait très mauvaise impression). **Certitude** : sûr.

### E5. Thème 9 « non évalué à l'écrit » : sans doute faux à partir de la session 2027
- **Thème** : `eco-t9`, Croissance et développement durable.
- **Fichiers et emplacements** :
  - `economie/cours-complets.json`, `eco-t9/intro` : « Il n'est pas évalué à l'écrit mais alimente le **grand oral**. » ;
  - même fichier, `eco-t9/essentiel/2` : « (Thème surtout utile au **grand oral**.) » ;
  - `economie/matiere.json`, `chapters/3/games/2/questions/2` : vrai/faux « Le thème 9 est surtout utile pour le grand oral. » → Vrai, « il n'est pas évalué à l'écrit ».
- **Problème** : l'ancienne note de service (BO spécial n° 2 du 13 février 2020) limitait l'écrit de droit et économie au programme de Première et aux **trois premiers thèmes** de droit et d'économie de Terminale. Les thèmes 8 de droit et 9 d'économie étaient donc exclus. La note qui la remplace (BO spécial n° 4 du 17 septembre 2026, NOR MENE2622652N), applicable **dès la session 2027**, indique selon les extraits consultés que l'épreuve « s'appuie sur le programme de droit et économie de la classe de terminale en vigueur ». Les élèves de Terminale de 2026-2027 risquent donc de faire l'impasse sur un thème évaluable. Si le thème est désormais évalué, le vrai/faux devient faux.
- **Correction proposée** : vérifier le texte intégral de la note de 2026. S'il ne limite plus le périmètre, supprimer la phrase de l'intro, retirer « (Thème surtout utile au grand oral.) » de l'essentiel et supprimer ou réécrire le vrai/faux. Par exemple : « Le thème 9 peut être évalué à l'écrit du bac. » → Vrai, « Depuis la session 2027, l'épreuve écrite porte sur tout le programme de Terminale ». Vérifier aussi que rien n'indique ailleurs que le thème 8 de droit serait exclu.
- **Gravité** : important. **Certitude** : à vérifier (texte de 2026 lu seulement par extraits de recherche ; education.gouv.fr bloqué ici).
- **Sources** : BO spécial n° 2 du 13 février 2020 (MENE2001095N) ; BO spécial n° 4 du 17 septembre 2026 (MENE2622652N).

### E6. Fonction de répartition et redistribution : des QCM à deux bonnes réponses (exercices générés)
- **Thème** : `eco-t6`, chapitre [4].
- **Fichier** : `economie/approfondi-1.json`, `eco-t6/0/blocks/5` (tableau).
- **Citation** : « Fonction de répartition | Réduire les inégalités (impôts progressifs, prestations sociales) » et « Redistribution | Prélèvements et prestations qui réduisent les écarts de revenus ».
- **Problème** : relevé dans le tirage :
  - « À quoi correspond « Redistribution » ? » : bonne réponse attendue « Prélèvements et prestations… », mais le distracteur « Réduire les inégalités (impôts progressifs, prestations sociales) » est **aussi juste** ;
  - à l'inverse, « Que signifie « Fonction de répartition » ? ».
  
  Même risque entre « Fonction d'allocation » et « Bien public ».
- **Correction proposée** : ajouter à `content/commun/notions-liees.json` les paires `["Fonction de répartition","Redistribution"]` et `["Fonction d'allocation","Bien public"]`. Sinon, retirer la ligne « Redistribution » du tableau.
- **Gravité** : bloquant. **Certitude** : sûr.

### E7. Politiques conjoncturelle, budgétaire, de relance : définitions qui se recoupent (exercices générés)
- **Thème** : `eco-t6`, chapitre [6] « 💶 Les politiques économiques ».
- **Fichier** : `economie/approfondi-1.json`, `eco-t6/2/blocks/6` (tableau).
- **Problème** : le tableau mêle « Politique conjoncturelle | Agit vite sur la situation présente (budgétaire, monétaire) », « Politique budgétaire », « Politique monétaire », « Politique de relance » et « Politique de rigueur ». Relevé dans le tirage : « « Politique budgétaire » : Agit vite sur la situation présente (budgétaire, monétaire) » corrigé **Faux** ; la même chose pour « Politique monétaire ». Le cours dit pourtant : « Ces deux politiques sont conjoncturelles ». Dans le QCM « Que signifie « Politique de relance » ? », le distracteur « Utilise dépenses publiques et impôts pour relancer ou freiner l'activité » est en partie juste.
- **Correction proposée** : ajouter à `notions-liees.json` les paires `["Politique conjoncturelle","Politique budgétaire"]`, `["Politique conjoncturelle","Politique monétaire"]`, `["Politique budgétaire","Politique de relance"]` et `["Politique budgétaire","Politique de rigueur"]`.
- **Gravité** : important. **Certitude** : sûr.

### E8. L'étude de documents sur l'intervention de l'État est rattachée au chapitre « Déficit et dette publics »
- **Thème** : `eco-t6`.
- **Fichier** : `economie/exercices-sections.json`, `"eco-t6-doc": 2`.
- **Problème** : l'étude porte sur les fonctions de Musgrave, les défaillances du marché et les politiques conjoncturelles et structurelles. Elle ne dit rien du déficit ni de la dette, mais s'affiche sous le chapitre [2] « Déficit et dette publics : le coût de l'intervention ».
- **Correction proposée** : `"eco-t6-doc": 1` (« Les trois fonctions de l'État ») ou `4` (« Les fonctions de l'État selon Musgrave »).
- **Gravité** : important. **Certitude** : sûr.

### E9. Le tri « Libre-échange ou protectionnisme ? » est rattaché au chapitre sur le solde commercial
- **Thème** : `eco-t8`.
- **Fichier** : `economie/exercices-sections.json`, `"eco-t8-tri": 1`.
- **Problème** : le chapitre [1] « Le solde de la balance commerciale : déficit ou excédent » ne traite pas de ce débat. Ce sont les chapitres [2] « Les effets du libre-échange » et [6] « Libre-échange ou protectionnisme » qui le font.
- **Correction proposée** : `"eco-t8-tri": 2`.
- **Gravité** : important. **Certitude** : sûr.

### E10. « Calcul express — Taux d'évolution » placé dans le chapitre sur les types de chômage
- **Thème** : `eco-t7`.
- **Fichiers** : `economie/exercices-sections.json`, `"eco-t7-calc": 1` ; l'exercice est dans `economie/matiere.json`, `chapters/1/games/4` (générateur `taux_evolution` de `src/calc.js`).
- **Problème** : le générateur pose une question abstraite, du type « Une valeur passe de 12 300 à 27 800 »,, sans lien avec le chapitre [1] « Types de chômage et politiques de l'emploi ». Le cours d'emploi ne présente même pas le taux d'évolution. Les calculs propres au thème (taux de chômage, d'activité, d'emploi) n'ont pas de générateur.
- **Correction proposée** : rattacher l'exercice au chapitre [9] « MÉTHODE — Taux de chômage, taux d'activité et taux d'emploi », ou mieux, le remplacer par un générateur de taux de chômage et d'activité.
- **Gravité** : mineur. **Certitude** : sûr.

### E11. Rapport interdécile : définition approximative
- **Thème** : `eco-t9`, chapitre [8] « 📊 Mesurer les inégalités ».
- **Fichier** : `economie/approfondi-2.json`, `eco-t9/1/blocks/1/c/0`.
- **Citation** : « **Le rapport interdécile** (D9/D1) : compare les 10 % les plus riches aux 10 % les plus pauvres. »
- **Problème** : D9/D1 rapporte deux **seuils**. D9 est le revenu au-dessus duquel se trouvent les 10 % les plus aisés ; D1, celui en dessous duquel se trouvent les 10 % les plus modestes. Comparer les revenus des deux groupes, c'est un autre indicateur (S90/S10, ou rapport des masses), qu'on confond souvent avec celui-ci.
- **Correction proposée** : « **Le rapport interdécile** (D9/D1) : rapport entre le revenu au-dessus duquel se situent les 10 % les plus aisés (D9) et le revenu en dessous duquel se situent les 10 % les plus modestes (D1). »
- **Gravité** : mineur. **Certitude** : sûr. **Source** : définitions de l'INSEE (décile, rapport interdécile).

### E12. Flashcard « Dette publique : emprunts accumulés par l'État »
- **Thème** : `eco-t6`.
- **Fichier** : `economie/matiere.json`, `chapters/0/games/2/cards/3/back`.
- **Problème** : la dette publique (au sens de Maastricht, celle que publie l'INSEE) est celle de **toutes** les administrations publiques : État, collectivités locales, Sécurité sociale. `economie/definitions.json` le dit d'ailleurs correctement pour le déficit public.
- **Correction proposée** : « Ensemble des dettes accumulées par les administrations publiques (État, collectivités locales, Sécurité sociale). »
- **Gravité** : mineur. **Certitude** : sûr.

### E13. QCM « Instaurer des droits de douane relève du… » : propositions mal accordées
- **Thème** : `eco-t8`.
- **Fichier** : `economie/matiere.json`, `chapters/2/games/0/questions/1`.
- **Citation** : « relève du… » avec les propositions « protectionnisme », « libre-échange », « de la redistribution », « du crédit de TVA ».
- **Problème** : on obtient à la lecture « relève du de la redistribution » et « relève du du crédit de TVA ».
- **Correction proposée** : question « Instaurer des droits de douane relève… » ; propositions « du protectionnisme », « du libre-échange », « de la redistribution », « du crédit de TVA ».
- **Gravité** : mineur. **Certitude** : sûr.

### E14. Association « Sujet d'actu ↔ chapitre » : deux appariements possibles
- **Thème** : `eco-actu`.
- **Fichier** : `economie/matiere.json`, `chapters/4/games/1/pairs/0` et `chapters/4/games/1/pairs/4`.
- **Citation** : « Inflation, pouvoir d'achat ↔ Rôle de l'État » et « Taux d'intérêt de la BCE ↔ Financement / politique monétaire ».
- **Problème** : dans le cours de Terminale, la politique monétaire de la BCE est enseignée **dans le thème « Rôle de l'État »** (chapitre [9]), et l'inflation se relie aussi directement à la politique monétaire. Les deux appariements croisés sont défendables ; l'élève qui les inverse est compté faux.
- **Correction proposée** : remplacer la paire 0 par « Bouclier tarifaire, dépenses publiques ↔ Rôle de l'État (politique budgétaire) » et la paire 4 par « Taux d'intérêt de la BCE ↔ Politique monétaire ».
- **Gravité** : mineur. **Certitude** : probable.

### E15. Vrai/faux généré sur les sources : « Eurostat : monnaie, taux, inflation » corrigé Faux
- **Thème** : `eco-actu`, chapitre [5] « 🔎 Les sources fiables ».
- **Fichier** : `economie/approfondi-4.json`, `eco-actu/1/blocks/0/c` (liste « **INSEE** : … », « **Eurostat** : … », « **Banque de France / BCE** : monnaie, taux, inflation »).
- **Problème** : Eurostat publie l'indice des prix harmonisé (l'inflation de la zone euro). L'affirmation générée « « Eurostat » : monnaie, taux, inflation », corrigée Faux, est donc discutable.
- **Correction proposée** : préciser « **Banque de France / BCE** : monnaie, crédit, taux d'intérêt » et « **Eurostat** : données de l'Union européenne (dont l'inflation de la zone euro) ».
- **Gravité** : mineur. **Certitude** : probable.

### Remarque hors erreur (économie)
- `economie/cas-pratiques.json` (`eco-t6`, `eco-t7`, `eco-t8`) : les calculs sont justes, mais aucun de ces cas n'est affiché, faute de clé `"<thème>::cas"` dans `exercices-sections.json`.

---

## 4. Problème transversal : les exercices générés à partir des tableaux « Notions et définitions »

Les problèmes M2, M3, M4, D5, D6, D7, E6 et E7 ont la même origine. Le générateur de `src/data/index.js` (`qcmFromPairs`, `vraiFauxFromDefs`, « cas concret ») prend la définition d'une ligne d'un tableau comme **distracteur** ou comme **fausse affirmation** pour une autre ligne. Il n'évite que les paires reconnues par `memeNotion`, qui compare les libellés, ou listées dans `content/commun/notions-liees.json`. Or ce fichier ne contient que **4 paires**, toutes hors de mon périmètre ou presque : contrat de travail et CDI/CDD, statut juridique et EI/société/SARL-SAS.

Dès qu'un tableau mêle une **notion générique** et ses **cas particuliers** (partie prenante et actionnaires ; vice du consentement et erreur ; fonction de répartition et redistribution ; politique conjoncturelle et politique budgétaire…), certains tirages produisent :
- des QCM à deux bonnes réponses ;
- des vrai/faux corrigés « Faux » alors que l'affirmation est juste.

Le tirage change à chaque visite : l'élève tombe sur ces erreurs au hasard, ce qui les rend difficiles à repérer.

**Correction la plus simple, sans toucher au code** : ajouter à `content/commun/notions-liees.json` toutes les paires listées dans M2, M3, M4, D5, D6, D7, E6 et E7, soit une quarantaine de paires.

**Correction plus durable, côté contenu** : dans les tableaux, ne pas mettre la notion générique dans la même liste que ses sous-catégories, ou renommer les sous-catégories (« Attentes des actionnaires » plutôt que « Actionnaires »).

**À noter aussi (M5)** : une puce de liste rédigée « **Lettre — Mot** : définition » devient une notion qui porte le nom de la lettre. Il faut écrire « **Mot (lettre)** : définition ».

## 5. Rattachement des exercices aux chapitres (`exercices-sections.json`)

Six exercices écrits à la main sont affichés sous un chapitre qui n'a pas de rapport avec eux :
- `mgmt-t1-tri` → 0 (M1) ;
- `droit-t5-ordre` → 6 (D1) ;
- `droit-t6-tri` → 0 (D3) ;
- `droit-t8-doc` → 2 (D2) ;
- `eco-t6-doc` → 2 (E8) ;
- `eco-t8-tri` → 1 (E9).

`eco-t7-calc` → 1 (E10) est un cas voisin. Les index semblent avoir été fixés sur une version antérieure de l'assemblage des cours. Un contrôle automatique simple éviterait que cela se reproduise : vérifier qu'au moins un mot-clé du titre de l'exercice figure dans le titre ou le texte du chapitre visé.

Par ailleurs, les cas pratiques chiffrés de `management/cas-pratiques.json` (`mgmt-t2`) et de `economie/cas-pratiques.json` (`eco-t6`, `eco-t7`, `eco-t8`) ne sont jamais affichés : il n'existe aucune clé `"<thème>::cas"`. Leurs calculs sont justes.

---

## Sources consultées (extraits de recherche web ; pages officielles non joignables depuis la session)

- [BO spécial n° 4 du 17 septembre 2026 — Épreuves terminales de la série STMG (MENE2622652N)](https://www.education.gouv.fr/bo/2026/Special4/MENE2622652N), pour E5.
- [BO spécial n° 2 du 13 février 2020 — note de service précédente (MENE2001095N)](https://www.education.gouv.fr/bo/20/Special2/MENE2001095N.htm), pour E5.
- [Académie de Limoges — L'épreuve écrite terminale de droit et économie](https://pedagogie.ac-limoges.fr/eco-gest/spip.php?article1039=), pour E5 (ancien périmètre : thèmes 8 de droit et 9 d'économie exclus).
- [Lefebvre Dalloz — DPEF et nouvelles exigences de durabilité](https://formation.lefebvre-dalloz.fr/actualite/les-obligations-de-reporting-non-financier-pour-les-sa-transformees-et-les-nouvelles-exigences-de-durabilite-dpef-vs) et [Hayot Expertise — la DPEF après la CSRD](https://hayot-expertise.fr/blog/dpef-apres-csrd-qui-encore-concerne), pour M6.
- Textes cités de mémoire, faute d'accès à Légifrance : Code civil (art. 1101, 1103, 1128, 1131, 1137, 1199, 1211, 1217, 1218, 1242, 1243, 1245) ; Code de commerce (art. L223-1) ; règlement (UE) 2016/679 (art. 6) ; D. Ricardo, *Principes de l'économie politique et de l'impôt* (1817), chapitre 7.


---

## Rapport — Vérification du contenu — Maths (Tle et 1re), Philosophie, Français (EAF), formules communes

Relecture en **lecture seule** de la copie figée `/var/tmp/verif-contenu/app/` (aucun fichier du dépôt modifié, aucune base touchée).
Date : 19 octobre 2026. Contenu relu **après assemblage** par le moteur (`chargerMatieres` + `themeChapters`), c'est-à-dire tel que l'élève le voit, puis rapproché des fichiers JSON sources.

Scripts (tous dans `/tmp/claude-0/-home-user-NAH/b00c6cf6-33b6-5d76-a12d-45338d0a337c/scratchpad/verif/`) :
`dump3.mjs` (contenu assemblé → `dump/*.txt`), `gens3.mjs` et `stats-gen.mjs` (3 000 à 20 000 tirages par générateur de calcul et de QCM chiffré), `atelier3.py` (énumération exhaustive de toutes les entrées possibles des 40 formules de l'atelier, arithmétique exacte), `gen-chap3.mjs` (exercices générés automatiquement à partir des sections de cours → `dump/generes.txt`), `saisie-check.mjs` (réponses acceptées par la vraie fonction de correction).

Sources officielles : `eduscol.education.fr` et `education.gouv.fr` ne sont **pas joignables directement** depuis cet environnement (refus du proxy). Les points de programme ont été vérifiés par le moteur de recherche (extraits des textes officiels) ; quand l'extrait ne suffisait pas, le point est classé « à vérifier ».

## Récapitulatif

| Matière | Bloquant | Important | Mineur | Total |
|---|---|---|---|---|
| Maths Terminale (`maths`) | 0 | 2 | 4 | 6 |
| Maths Première (`p1-maths`) | 0 | 1 | 3 | 4 |
| Générateurs de calcul communs aux deux (`src/calc.js`) | 0 | 2 | 3 | 5 |
| Formules communes + atelier (`commun/formules.json`, `commun/atelier-formules.json`, `formulaPractice.js`) | 0 | 1 | 5 | 6 |
| Philosophie (`philosophie`) | 0 | 6 | 6 | 12 |
| Français EAF (`p1-francais`) | 0 | 1 | 3 | 4 |
| Exercices générés à partir des cours (les 4 matières) | 1 | 3 | 2 | 6 |
| **Total** | **1** | **16** | **26** | **43** |

Aucun **calcul faux** n'a été trouvé dans les cours ni dans les réponses des exercices écrits à la main : tous les exemples chiffrés ont été refaits (liste en annexe A). Les générateurs donnent toujours la bonne valeur numérique ; leurs défauts sont d'écriture (énoncés mal formés, nombres à l'anglaise) et, dans l'atelier, un cas rare de bonne réponse refusée. Le seul point **bloquant** vient des exercices fabriqués automatiquement à partir du cours de philosophie (E1 : la notion « vérité » remplacée par l'étiquette « Définir »).

### Ce qui a été couvert

- **maths** (7 thèmes `math-c1` à `math-c7`) : intro, essentiel, formules, toutes les sections affichées (cours, approfondis, méthodes), QCM, flashcards, définitions clés (`definitions.json`), 25 générateurs (calcul + QCM chiffrés).
- **p1-maths** (7 thèmes `p1-math-c1` à `p1-math-c7`) : idem, 23 générateurs.
- **philosophie** (8 thèmes : art, justice, liberté, nature, religion, technique, vérité, méthode) : toutes les sections (`matiere.json`, `enrichissements.json`, `philo-longue-duree.json`), QCM, vrai/faux, associations, flashcards, tri, remises en ordre, définitions.
- **p1-francais** (4 thèmes `p1-fr-1` à `p1-fr-4`) : tout.
- **commun/formules.json** (8 rubriques, toutes matières) et **commun/atelier-formules.json** (40 formules, toutes les combinaisons d'entrées), plus `formulaPractice.js`.
- Exercices **générés automatiquement** à partir des sections (QCM notions, cas concrets, vrai/faux, textes à trous, association) : voir la section dédiée en fin de rapport.
- Il n'existe ni `pieges.json`, ni `cas-pratiques.json`, ni `etudes-documents.json` pour ces quatre matières.

---

## 1. Maths Terminale (`maths`)

### M1 — Thème 7 « Loi normale et estimation » : probablement hors programme
- **Thème** : `math-c7` — Chapitre 7 — Loi normale et estimation (tout le thème : cours, QCM `math-c7-qcm`, flashcards `math-c7-flash`, calculs `math-c7-calc-amp` et `math-c7-calc-borne`, définitions « Intervalle de fluctuation », « Loi normale centrée réduite » ; aussi la rubrique « Loi binomiale, loi normale et estimation » de `commun/formules.json`).
- **Problème** : la loi normale, l'intervalle de fluctuation et l'intervalle de confiance [f − 1/√n ; f + 1/√n] appartenaient à l'**ancien** programme de Terminale STMG (bac 2014 à 2020). Le programme de mathématiques de **Terminale technologique** (tronc commun, BO spécial n° 8 du 25 juillet 2019, en vigueur depuis 2020) organise la partie « Statistique et probabilités » autour des probabilités conditionnelles, des **variables aléatoires discrètes finies** (espérance, loi binomiale, coefficients binomiaux) et de la statistique à deux variables ; aucun des extraits consultés ne mentionne la loi normale ni l'intervalle de confiance. Le thème est présenté comme un chapitre exigible (« Chapitre 7 », QCM, calculs notés).
- **Correction proposée** : retirer le thème du parcours exigible, ou le marquer clairement « Pour aller plus loin — hors programme du bac STMG ». Retirer de la définition clé « Intervalle de fluctuation ».
- **Gravité** : important · **Certitude** : probable · **Source** : programme de mathématiques de la classe terminale de la voie technologique (annexe, education.gouv.fr, document 515420) ; liste des chapitres « Enseignement commun » de maths-et-tiques.fr (Tle technologique).

### M2 — Notation N(μ ; σ) ambiguë
- **Thème** : `math-c7`, sections « La loi normale : la courbe en cloche » (« On note **X ~ N(μ ; σ)** »), « Exercice type guidé — loi normale… » (« X ~ N(250 ; 4) (en grammes) … μ = 250, σ = 4 »), « Les plages 68 / 95 / 99,7 % » ; `commun/formules.json` (« Loi normale N(μ ; σ) : à 1 σ » etc.).
- **Problème** : dans les manuels et sujets français, la notation usuelle est **N(μ ; σ²)** (le second paramètre est la variance). Un élève qui lit « N(250 ; 4) » comprend σ = 2, et l'exemple donne alors une mauvaise plage.
- **Correction** : écrire « X suit la loi normale d'espérance μ = 250 et d'écart type σ = 4 » ; si une notation est gardée, « N(250 ; 4²) ».
- **Gravité** : mineur (important si le chapitre est maintenu) · **Certitude** : probable.

### M3 — Variance et écart type de la loi binomiale : à vérifier
- **Thème** : `math-c6` — Loi binomiale : QCM `math-c6-qcm` (« La variance de X suivant B(n ; p) est… »), flashcard « Variance V(X) », calcul `math-c6-calc-var` (générateur `variance_binomiale`), sections « La loi binomiale B(n ; p) » et « Espérance E(X) = np et écart-type ».
- **Problème** : les extraits du programme de Terminale technologique citent l'**espérance** de la loi binomiale (E = np), les coefficients binomiaux et le triangle de Pascal, pas la variance ni l'écart type. Si c'est confirmé, la variance est présentée comme exigible (QCM noté, exercice de calcul dédié) sans l'être.
- **Correction** : vérifier sur le texte officiel ; si absent, marquer « pour aller plus loin » et retirer l'exercice `math-c6-calc-var` du parcours noté.
- **Gravité** : mineur · **Certitude** : à vérifier.

### M4 — Coefficients binomiaux : notation et triangle de Pascal absents
- **Thème** : `math-c6`, section « La loi binomiale B(n ; p) » : « Le coefficient **C(n, k)** (« combinaison de k parmi n ») … En STMG, on calcule P(X = k) … à la calculatrice ».
- **Problème** : le programme parle de **coefficients binomiaux**, notés (n k) et lus « k parmi n », et demande de les **calculer avec le triangle de Pascal pour n ≤ 10** (capacité attendue). Le cours n'en dit rien et renvoie tout à la calculatrice ; « combinaison » et « C(n, k) » sont des notations anciennes.
- **Correction** : « Le coefficient binomial, noté (n k) et lu « k parmi n », compte les chemins de l'arbre qui mènent à k succès. Pour n ≤ 10, on le lit dans le **triangle de Pascal** ; au-delà, on utilise la calculatrice. » Ajouter un petit triangle de Pascal.
- **Gravité** : mineur · **Certitude** : probable · **Source** : programme de Tle technologique (extrait consulté, paraphrasé : calcul des coefficients binomiaux à l'aide du triangle de Pascal pour n ≤ 10 ; reconnaître une situation binomiale et ses paramètres).

### M5 — Arrondi inexact dans l'exercice « deux placements »
- **Thème** : `math-c2` — Suites numériques, section « 🧮 Exercice type guidé — deux placements » : « B : b₁₀ = 1000 × 1,05¹⁰ ≈ 1000 × 1,6289 ≈ **1 628,90 €** ».
- **Problème** : 1 000 × 1,05¹⁰ = 1 628,894… soit **1 628,89 €** ; 1 628,90 vient d'un arrondi intermédiaire.
- **Correction** : « b₁₀ = 1000 × 1,05¹⁰ ≈ **1 628,89 €** ».
- **Gravité** : mineur · **Certitude** : sûr.

### M6 — Parties du programme de Terminale sans aucun contenu
- **Thème** : matière `maths` (liste des thèmes).
- **Problème** : le programme de Terminale technologique comprend les **fonctions exponentielles** x ↦ aˣ (avec la racine n-ième, utilisée ici seulement pour le taux moyen), la **fonction logarithme décimal** et la **fonction inverse**. Aucun thème ne les traite (seule « la dérivée de 1/x » apparaît dans `math-c3`). L'élève qui révise avec l'application ne voit pas ces chapitres.
- **Correction** : ajouter un thème « Fonctions exponentielles et logarithme décimal » et la fonction inverse (variations, représentation) au thème fonctions.
- **Gravité** : important (manque) · **Certitude** : probable · **Source** : liste « Enseignement commun » Tle technologique (maths-et-tiques) et extrait officiel sur la définition du logarithme décimal (« l'unique solution de 10ˣ = b »).

### M7 — Thème 4 : le point moyen et la droite d'ajustement présentés sans réserve
Rien à corriger sur le fond (G(x̄ ; ȳ), moindres carrés, interpolation/extrapolation sont justes). Noté seulement : la définition clé « Corrélation : intensité de la liaison » n'est pas reliée au coefficient de corrélation, qui n'est pas au programme — pas d'action nécessaire.
*(Point informatif, non compté.)*

---

## 2. Maths Première (`p1-maths`)

### P1 — Discriminant et forme canonique : hors programme de 1re technologique
- **Thème** : `p1-math-c3` — Second degré et fonctions : section « 🧮 Exemple traité — discriminant, racines et signe d'un trinôme », exercice `p1-math-c3-calc-delta` (générateur `discriminant`), flashcard « Discriminant : Δ = b² − 4ac », définitions clés « Discriminant » et « Forme canonique » ; `commun/formules.json`, rubrique Maths « Second degré et dérivation » : « Discriminant », « Racines (Δ > 0) : x = (−b ± √Δ) ÷ (2a) ».
- **Problème** : en Première **technologique**, le second degré se traite à partir de la **forme factorisée** a(x − x₁)(x − x₂) (racines, signe, axe de symétrie x = (x₁ + x₂)/2). Le calcul des racines par le discriminant n'est **pas** au programme. Le présenter comme méthode de référence (exercice noté, flashcard) détourne l'élève de ce qui est attendu à l'épreuve.
- **Correction** : remplacer l'exemple traité par : « f(x) = (x − 2)(x − 3). Racines : 2 et 3 (un produit est nul si l'un des facteurs l'est). a = 1 > 0 : f est positive à l'extérieur des racines, négative entre 2 et 3. Axe de symétrie : x = (2 + 3)/2 = 2,5. » Remplacer le générateur `discriminant` par un exercice « racines et signe d'une forme factorisée ». Marquer « hors programme » le discriminant et la forme canonique dans les formules.
- **Gravité** : important · **Certitude** : probable · **Source** : projet d'aménagement du programme de mathématiques de première technologique (education.gouv.fr, juin 2025), qui rappelle que le calcul des racines à l'aide du discriminant ne figure pas au programme.

### P2 — Effectif non entier dans l'exemple traité
- **Thème** : `p1-math-c1` — Information chiffrée, section « 🧮 Exemple traité — proportion d'un sous-ensemble… » : « Filles en STMG : 450 × 0,25 = **112,5** → on arrondit à **112 ou 113** ».
- **Problème** : un nombre d'élèves ne peut pas valoir 112,5 ; la réponse « 112 ou 113 » est déroutante pour un exemple modèle.
- **Correction** : « Dans un lycée de **800** élèves, 60 % sont des filles… Filles : 800 × 0,60 = **480**. Filles en STMG : 480 × 0,25 = **120**. »
- **Gravité** : mineur · **Certitude** : sûr.

### P3 — Définition des quartiles imprécise
- **Thème** : `p1-math-c5` — Statistiques à une variable, définition clé « Quartiles : Valeurs partageant la série en quatre parts égales (Q1, Q2, Q3) ».
- **Problème** : au lycée, Q1 est la plus petite valeur de la série telle qu'**au moins 25 %** des valeurs lui soient inférieures ou égales (idem Q3 avec 75 %). « Quatre parts égales » est faux en général et contredit la méthode du générateur `ecart_interquartile` (qui, lui, applique correctement la définition du lycée : rangs ⌈n/4⌉ et ⌈3n/4⌉).
- **Correction** : « Q1 : plus petite valeur de la série ordonnée telle qu'au moins 25 % des valeurs lui soient inférieures ou égales ; Q3 : idem avec 75 %. »
- **Gravité** : mineur · **Certitude** : sûr.

### P4 — Probabilité conditionnelle cachée aux élèves de Première dans l'atelier
- **Fichier** : `commun/atelier-formules.json`, `f13` « Probabilité conditionnelle », `"terminale": true`.
- **Problème** : la formule n'est proposée qu'aux élèves de Terminale (`formulasForTrack`), alors que le thème `p1-math-c6` l'enseigne en Première (P_A(B) = P(A ∩ B) / P(A)).
- **Correction** : `"terminale": false`.
- **Gravité** : mineur · **Certitude** : sûr.

---

## 3. Générateurs de calcul communs (`src/calc.js`, utilisés par `maths` et `p1-maths`)

Tous les générateurs ont été tirés 3 000 fois (20 000 pour les mesures ci-dessous). **La réponse attendue est toujours juste** et cohérente avec la tolérance ; les défauts sont dans l'écriture des énoncés et des corrections.

### G1 — `derivee_affine` : polynômes mal écrits
- **Exercices** : `math-c3-calc-der` et `p1-math-c4-calc-der` (« Exercices — Nombre dérivé f'(x) »).
- **Citation** (tirages réels) : « Soit f(x) = 5x² + 11x + **-2**. Calcule f'(-6). » ; « f(x) = **1x²** + 7x + -1 » ; « f(x) = -3x² **+ 0x** + 6 » ; « f(x) = 3x² + 30x **+ 0** » ; correction « f'(x) = **2×-2x** − 10 », « f'(-6) = **10×-6** + 11 ».
- **Problème** : **67 % des énoncés** et **92 % des couples énoncé + correction** contiennent au moins une écriture incorrecte (« + -2 », « 1x² », « 0x », « × -6 » sans parenthèses, tiret à la place du signe moins). Le générateur voisin `image_fonction` utilise pourtant les fonctions `poly()` et `signc()` qui écrivent correctement.
- **Correction** : construire l'énoncé avec `poly(a, b, c)` (le terme constant tiré une seule fois et gardé dans une variable), et écrire la correction avec des parenthèses autour des négatifs : « f'(−6) = 10 × (−6) + 11 = −49 ».
- **Gravité** : important (mauvaise impression systématique dans un exercice de maths) · **Certitude** : sûr.

### G2 — `suite_geo` : raison affichée 0.9299999999999999
- **Exercices** : `math-c2-calc-baisse` (« Exercices — Évolution en % ») et `p1-math-c2-calc-baisse` (« Placement / évolution en % »).
- **Citation** : « q = 1 − 7/100 = **0.9299999999999999**. u_4 = 37 000 × 0.9299999999999999^4 = 27 677,92 ≈ 27 678 € ».
- **Problème** : erreur d'arrondi flottant affichée telle quelle dans **9 % des tirages** (baisse de 7 %).
- **Correction** : `const q = round(1 - baisse / 100, 2)` et affichage à la française (« q = 0,93 »).
- **Gravité** : important · **Certitude** : sûr.

### G3 — Nombres décimaux écrits avec un point dans presque tous les générateurs
- **Exercices** : tous les calculs de maths sauf ceux qui ne manipulent que des entiers (`suite_arith`, `image_fonction`, `derivee_affine`, `optimisation`, `discriminant`, `etendue_serie`, `mediane_serie`, `ecart_interquartile`, `lecture_graphique_affine`, `trace_*`).
- **Citation** : « X suit la loi binomiale B(18 ; **0.29**) » ; « P(A) = **0.54** et P(A∩B) = **0.15** » ; « raison q = **1.11** » ; « 4 720 × **1.33** = 6 277,6 € » (point et virgule dans la même ligne) ; « t = … = **-0.6078 = -60.8 %** ».
- **Problème** : notation anglo-saxonne dans une application française (le bac et les manuels écrivent 0,29) ; mélange des deux notations dans la même correction. La saisie de l'élève accepte la virgule, ce n'est donc qu'un défaut d'affichage.
- **Correction** : formater tous les nombres avec `toLocaleString('fr-FR')` (la fonction `fr()` de `src/qcmgen.js` le fait déjà, signe « − » compris).
- **Gravité** : mineur (mais systématique) · **Certitude** : sûr.

### G4 — `discriminant` : « 25 − -20 »
- **Exercice** : `p1-math-c3-calc-delta`. Citation : « Δ = b² − 4ac = (-5)² − 4×1×(-5) = 25 **− -20** = 45 ». Dans **45 % des tirages**.
- **Correction** : écrire « 25 − (−20) = 45 » ou « 25 + 20 = 45 ». (Voir aussi P1 : exercice hors programme.)
- **Gravité** : mineur · **Certitude** : sûr.

### G5 — `cm_successif` : « évolue de 0 % » ; `ecart_type` : σ ou s ?
- `math-c1-calc-succ`, `p1-math-c1-calc2` : « Une grandeur augmente de 9 % puis **évolue de 0 %** » (3 % des tirages) — énoncé sans intérêt ; « évolue de -8 % » avec un tiret. Correction : tirer t2 ≠ 0 et écrire « baisse de 8 % ».
- `p1-math-c5-calc-ecart` : « Calcule l'écart-type σ (à la calculatrice, arrondi 0,01) » — la calculatrice affiche σx et Sx ; la tolérance (0,05) refuse Sx (environ 12 % plus grand pour 5 valeurs). Correction : « (à la calculatrice : valeur σx) ».
- **Gravité** : mineur · **Certitude** : sûr.

**QCM chiffrés (`src/qcmgen.js`)** : `taux_evolution`, `coef_multiplicateur`, `evolutions_successives`, `indice_base100`, `raison_hausse`, `raison_baisse` — 3 000 tirages chacun : aucune réponse fausse, aucun doublon de choix, nombres bien écrits à la française. Rien à signaler.

---

## 4. Formules communes et atelier de formules

### F1 — Atelier : une bonne réponse arrondie peut être refusée
- **Fichiers** : `src/data/formulaPractice.js` (`generateFormulaExercise`, `checkFormulaAnswer`) ; formules `f03` « Taux d'évolution » et `f30` « Part de marché » de `commun/atelier-formules.json`.
- **Problème** : la page demande « Arrondis au centième si nécessaire ». Quand la valeur exacte se termine par un 5 au millième, l'application arrondit mal et refuse l'arrondi usuel :
  - `f30`, ventes 2 300 / marché 16 000 : valeur exacte 14,375 % → l'application attend **14,37** (erreur flottante : 14,374999…) ; l'élève qui écrit **14,38** est compté faux (7 combinaisons sur 3 321) ;
  - `f03`, de 640 à 100 : −84,375 % → l'application attend **−84,37** (`Math.round` arrondit −…,5 vers le haut) ; −84,38 est refusé (14 combinaisons sur 3 266).
  Les 38 autres formules n'ont aucun cas de ce type (énumération exhaustive).
- **Correction** : comparer la saisie à la **valeur exacte** avec une tolérance de 0,005 incluse : `Math.abs(n − valeurExacte) <= 0.005 + 1e-9`, et afficher l'arrondi avec `toFixed(2)` sur la valeur absolue puis le signe.
- **Gravité** : important (bonne réponse comptée fausse, mais rare : ≈ 0,3 % des tirages de ces deux formules) · **Certitude** : sûr.

### F2 — « Solvabilité générale … supérieur à 1 obligatoire »
- **Fichier** : `commun/formules.json`, Gestion & Finance › Rentabilité et ratios, « Solvabilité générale : Total actif ÷ Total des dettes », note « supérieur à 1 **obligatoire** ».
- **Problème** : aucune obligation légale ; un ratio inférieur à 1 signifie des capitaux propres négatifs (situation très grave), pas une infraction.
- **Correction** : « doit dépasser 1 : sinon les capitaux propres sont négatifs ».
- **Gravité** : mineur · **Certitude** : probable.

### F3 — « Résultat d'exploitation » sans les reprises
- **Fichier** : `commun/formules.json`, « Résultat d'exploitation : EBE + Autres produits − Dotations − Autres charges ».
- **Problème** : il manque les **reprises** sur amortissements, dépréciations et provisions (et transferts de charges), qui s'ajoutent.
- **Correction** : « EBE + Reprises et transferts de charges + Autres produits − Dotations − Autres charges ».
- **Gravité** : mineur · **Certitude** : probable.

### F4 — Taux de conversion : visites ou visiteurs ?
- **Fichiers** : `commun/formules.json` (« Commandes ÷ Visiteurs × 100 ») et `commun/atelier-formules.json` `f37` (entrées « Nombre d'achats », « Nombre de visites », formule affichée « Commandes ÷ Visiteurs × 100 »).
- **Problème** : l'énoncé fournit des **visites**, la formule parle de **visiteurs** (deux indicateurs différents).
- **Correction** : harmoniser : « Nombre de commandes ÷ Nombre de visites × 100 » partout.
- **Gravité** : mineur · **Certitude** : sûr.

### F5 — Prorata temporis en mois
- **Fichier** : `commun/formules.json`, « Annuité de la 1re année : Annuité pleine × Nombre de mois ÷ 12 ».
- **Problème** : en comptabilité, le prorata de l'amortissement linéaire se calcule en **jours** (année de 360 jours) ; le calcul en mois est une simplification que certains sujets acceptent.
- **Correction** : « Annuité pleine × Nombre de jours ÷ 360 (ou de mois ÷ 12 si l'énoncé le précise) ».
- **Gravité** : mineur · **Certitude** : à vérifier (selon le cours de Gestion-Finance).

### F6 — SQL : guillemets doubles
- **Fichier** : `commun/formules.json`, Systèmes d'information, « Recherche partielle : WHERE nom LIKE **"A%"** ».
- **Problème** : en SQL standard, les chaînes s'écrivent entre **apostrophes** ('A%') ; les guillemets doubles désignent un nom de colonne (certains SGBD tolèrent).
- **Correction** : `WHERE nom LIKE 'A%'`.
- **Gravité** : mineur · **Certitude** : probable.

Les autres formules (TVA, coûts, seuil, CAF, FRNG/BFR, ratios, management, droit, économie, mercatique, RH) sont correctes. À noter seulement : `f40`/« Taux de rotation (turnover) = Départs ÷ Effectif moyen × 100 » est la version simplifiée (la définition usuelle est (départs + arrivées)/2 ÷ effectif moyen) ; elle est cohérente avec le cours de RH de l'application, donc non comptée.

---

## 5. Philosophie (`philosophie`)

Programme de la voie technologique : les 7 notions (art, justice, liberté, nature, religion, technique, vérité) sont bien celles du programme. Les citations suivantes ont été contrôlées et sont exactes : Klee, Descartes (« maîtres et possesseurs », « principale perfection de l'homme », cogito, Discours IV), Montesquieu (XI, 3), Sartre (« condamné à être libre… »), Rousseau (Contrat social I, 3, version complète de la section 8), Thrasymaque, Bergson (« outils à faire des outils »), Jonas (formule du principe responsabilité), Pascal, Marx, Freud, Durkheim, Weber, Leibniz (le Rubicon), Camus, Huis clos.

### Ph1 — Victor Hugo cité comme défenseur de « l'art pour l'art »
- **Thème** : `philo-art` — L'art, section « 🏛️ Histoire de l'idée d'art : tekhnê, imitation, catharsis, esthétique » (`enrichissements.json`) : « Au **XIXᵉ siècle**, le romantisme exalte le génie de l'artiste et l'on défend **l'art pour l'art** : on pense à **Hugo**, à **Baudelaire** ».
- **Problème** : contresens. La doctrine de l'art pour l'art est celle de **Théophile Gautier** (préface de *Mademoiselle de Maupin*, 1835) puis du Parnasse ; Hugo l'a explicitement combattue (« l'art pour l'art peut être beau, mais l'art pour le progrès est plus beau encore », *William Shakespeare*, 1864). Même confusion, plus légère, en section « ⚔️ Les grandes thèses » : « Thèse 4 — … Le romantisme (Baudelaire, la théorie de « l'art pour l'art ») ».
- **Correction** : « … et certains défendent **l'art pour l'art** : Théophile Gautier (préface de *Mademoiselle de Maupin*, 1835), puis les Parnassiens. » ; Thèse 4 : « L'art pour l'art (Gautier, le Parnasse) affirme l'autonomie de l'œuvre… ».
- **Gravité** : important · **Certitude** : sûr.

### Ph2 — Citation de Baudelaire déformée
- **Thème** : `philo-art`, section « 📖 L'art en littérature… » : « **Baudelaire**, dans *Les Fleurs du mal*, revendique de « faire de la boue et d'en tirer de l'or » ».
- **Problème** : la phrase est « **Tu m'as donné ta boue et j'en ai fait de l'or** » (projet d'épilogue pour la seconde édition des *Fleurs du mal*). « Faire de la boue » dit le contraire.
- **Correction** : « Baudelaire, s'adressant à Paris dans un projet d'épilogue des *Fleurs du mal*, écrit : « Tu m'as donné ta boue et j'en ai fait de l'or » ».
- **Gravité** : important (citation fausse, reprise telle quelle en copie) · **Certitude** : sûr.

### Ph3 — La désobéissance civile attribuée à Rousseau
- **Thème** : `philo-justice` — La justice, « L'essentiel » (`matiere.json`) : « **Rousseau** : la force seule ne fonde pas le droit ; désobéir peut être juste (désobéissance civile). »
- **Problème** : la désobéissance civile est une notion de **Thoreau** (*La Désobéissance civile*, 1849), reprise par Gandhi et Martin Luther King ; Rousseau montre seulement qu'on n'est tenu d'obéir qu'aux puissances légitimes. Le mémo « L'essentiel » est ce que l'élève retient en dernier.
- **Correction** : « **Rousseau** : la force ne fait pas le droit ; on ne doit obéir qu'aux pouvoirs légitimes. **Thoreau** : désobéir publiquement à une loi injuste peut être juste (désobéissance civile). »
- **Gravité** : important · **Certitude** : sûr.

### Ph4 — Aristote : « selon son mérite ou son besoin »
- **Thème** : `philo-justice`, section « ⚖️ La justice : légal et légitime, égalité et équité » (« l'égalité **proportionnelle** (à chacun selon son mérite **ou son besoin**) ») et définition clé « Égalité arithmétique / proportionnelle : … à chacun selon son mérite ou son besoin (Aristote) » (`definitions.json`, réutilisée par les exercices générés).
- **Problème** : chez Aristote, la justice distributive est proportionnelle au **mérite** (axia) ; « à chacun selon ses besoins » est une formule socialiste du XIXᵉ siècle (Louis Blanc, Marx). Attribuer le besoin à Aristote est un contresens, ici dans une définition qui alimente des QCM.
- **Correction** : « à chacun selon son mérite (Aristote) ».
- **Gravité** : important · **Certitude** : sûr.

### Ph5 — « La Terre est plate » présentée comme une croyance longtemps partagée
- **Thème** : `philo-verite` — La vérité : intro (« « La Terre est plate » fut longtemps une opinion répandue »), section 0 (« fut longtemps une opinion partagée »), section « 📖 La vérité en littérature et en sciences » (« longtemps « la Terre est plate » ou « le Soleil tourne autour de la Terre » furent des évidences »), section « 📜 Textes et cas commentés » (« Cas — « la Terre est plate » : Longtemps évidence partagée »).
- **Problème** : c'est un mythe historiographique du XIXᵉ siècle : la rotondité de la Terre est établie depuis l'Antiquité (Aristote, Ératosthène) et admise par les savants du Moyen Âge. L'exemple central du thème « vérité » repose donc sur une contre-vérité qu'un correcteur peut relever.
- **Correction** : remplacer par le géocentrisme : « « Le Soleil tourne autour de la Terre » fut pendant des siècles une évidence partagée. Mais une vérité ne se décide pas au vote… ».
- **Gravité** : important · **Certitude** : probable (sûr pour les savants ; l'opinion populaire ancienne est mal documentée).

### Ph6 — Méthode : le format de l'explication de texte de la voie technologique n'est pas présenté
- **Thème** : `philo-methode` — Méthode & auteurs : intro (« Au bac, on choisit entre une dissertation et une explication de texte »), sections « 📖 L'explication de texte pas à pas » et « 📖 L'explication de texte en détail », remise en ordre `philo-methode-ordre2`, QCM « Pour l'explication de texte, on commence par… ».
- **Problème** : en voie technologique, l'épreuve (4 h) propose **deux sujets de dissertation et une explication de texte guidée par des questions** : **A. Éléments d'analyse**, **B. Éléments de synthèse** (idée principale, organisation du raisonnement), **C. Commentaire** (portée, enjeux, sans avis personnel plaqué). Le candidat peut répondre aux questions dans l'ordre ou rédiger une explication suivie. Le cours décrit seulement l'explication libre de la voie générale.
- **Correction** : intro : « Au bac (4 h), tu choisis entre **deux sujets de dissertation** et **une explication de texte guidée par des questions** (A. éléments d'analyse, B. éléments de synthèse, C. commentaire). » Ajouter une section qui traite le texte de Pascal avec ces trois rubriques.
- **Gravité** : important · **Certitude** : sûr · **Source** : note de service n° 2020-004 (épreuve de philosophie, voie technologique, à compter de la session 2021) ; BO 2026, note MENE2622663N, « Épreuve terminale de philosophie du baccalauréat technologique » (même structure A/B/C).

### Ph7 — « Aristote distingue trois formes de justice » (n'en cite que deux)
- **Thème** : `philo-justice`, section « 🏛️ Justice et cité… » : « pour Aristote, elle est une vertu et se dit **de deux façons** » puis, paragraphe suivant, « Aristote distingue **trois formes** de justice » — suivent seulement la distributive et la corrective.
- **Correction** : « Aristote distingue **deux formes** de justice particulière : … L'**équité** vient ensuite corriger la loi… ».
- **Gravité** : mineur · **Certitude** : sûr.

### Ph8 — « Rendre à chacun son dû (Aristote) »
- **Thème** : `philo-justice`, section « 🔎 Définitions : vertu, institution, idéal… ».
- **Problème** : la formule est celle de Simonide (rapportée dans *La République*, livre I) et du droit romain (Ulpien, *suum cuique tribuere*), pas une définition d'Aristote.
- **Correction** : « … la disposition à rendre à chacun son dû (formule de Simonide reprise par le droit romain) ».
- **Gravité** : mineur · **Certitude** : probable.

### Ph9 — Citation de Rousseau tronquée sans le signaler
- **Thème** : `philo-justice`, section « 🤔 Obéir ou désobéir… » (liste et encadré « Citation utile ») : « … s'il ne transforme sa force en droit. » (Rousseau).
- **Problème** : la phrase se poursuit « … **et l'obéissance en devoir** » (*Du contrat social*, I, 3) ; la section 8 la cite en entier. Deux versions d'une même citation dans un thème.
- **Correction** : citer la phrase complète dans les deux encadrés.
- **Gravité** : mineur · **Certitude** : sûr.

### Ph10 — Galilée condamné « preuves à l'appui »
- **Thème** : `philo-religion` — intro, sections « 📖 La religion en littérature et en histoire » et « 📜 Textes et cas commentés » (« pour avoir soutenu, **preuves à l'appui**, que la Terre tourne »).
- **Problème** : Galilée n'avait pas de preuve décisive du mouvement de la Terre (son argument des marées était faux ; les preuves viendront avec l'aberration de la lumière, 1729, et le pendule de Foucault, 1851). Le cas reste bon, mais la formule est inexacte.
- **Correction** : « pour avoir défendu que la Terre tourne autour du Soleil ».
- **Gravité** : mineur · **Certitude** : probable.

### Ph11 — Correction de QCM sans rapport avec la réponse
- **Thème** : `philo-verite`, QCM `philo-verite-qcm`, « Peut-on tout démontrer ? » → « Non : toute démonstration part d'axiomes indémontrables » ; explication : « Leibniz : vérités de raison / vérités de fait. »
- **Problème** : l'explication ne justifie pas la réponse (la distinction de Leibniz ne dit rien des axiomes).
- **Correction** : « Toute démonstration part de principes admis ; vouloir tout démontrer mènerait à une régression à l'infini (Pascal, *De l'esprit géométrique*). »
- **Gravité** : mineur · **Certitude** : sûr.

### Ph12 — « Repères mobilisables » qui ne sont pas des repères du programme
- **Thème** : tous les thèmes de notion, encadrés « Repères mobilisables » (ex. `philo-art` : « Beau / agréable · art / technique · objectif / subjectif » ; `philo-technique` : « Moyen / fin · cause / fin… » ; `philo-verite` : « démontrer / prouver »).
- **Problème** : le programme publie une liste fermée de **repères** (couples de notions). « Beau/agréable », « art/technique », « moyen/fin », « démontrer/prouver » n'en font pas partie, alors que l'intitulé laisse croire que ce sont des repères officiels.
- **Correction** : renommer l'encadré « Distinctions utiles » ou ne garder que les repères officiels (croire/savoir, légal/légitime, objectif/subjectif, obligation/contrainte, en théorie/en pratique, universel/particulier…).
- **Gravité** : mineur · **Certitude** : à vérifier (liste des repères de la voie technologique à confirmer sur le texte officiel).

---

## 6. Français — épreuve anticipée (`p1-francais`)

Contrôlé et conforme à la note de service de 2020 : écrit 4 h, coefficient 5, choix entre commentaire et contraction + essai ; contraction au quart, ±10 %, nombre de mots indiqué ; oral 20 min après 30 min de préparation, coefficient 5, partie 1 (≈12 min : lecture, explication linéaire, question de grammaire, texte choisi par l'examinateur), partie 2 (≈8 min : présentation d'une œuvre puis entretien). Les quatre objets d'étude, le vocabulaire des genres, les figures de style, les registres, les mouvements et la grammaire (interrogation, négation, subordonnées) sont justes.

### Fr1 — Nouvelle note de service de l'EAF applicable aux élèves de Première actuels
- **Thèmes** : tout `p1-francais` (en particulier `p1-fr-1` section « Comprendre l'épreuve du commentaire », `p1-fr-2`, `p1-fr-4` section « L'oral : déroulé de l'épreuve »).
- **Problème** : la note de service du 23 juillet 2020 a été **abrogée et remplacée** par la note NOR MENE2622658N du 11 septembre 2026 (BO spécial n° 4 du 17 septembre 2026), applicable **dès l'année 2026-2027** (épreuves passées au titre de la session 2028, donc par les élèves de Première de cette année). Les extraits confirment écrit 4 h, coefficient 5, et voie technologique « commentaire ou contraction suivie d'un essai », mais je n'ai pas pu lire le détail de l'oral ni des barèmes. Tout le thème décrit encore la note de 2020.
- **Correction** : relire `p1-fr-1`, `p1-fr-2` et `p1-fr-4` contre la note de 2026 (durées et déroulé de l'oral, grille d'évaluation, longueur des textes).
- **Gravité** : important · **Certitude** : à vérifier · **Source** : education.gouv.fr/bo/2026/Special4/MENE2622658N.

### Fr2 — Comptage de mots faux dans l'exemple de contraction
- **Thème** : `p1-fr-2`, section « La contraction : rédiger et respecter le quart » : « « De nos jours, force est de constater que les écrans, qu'il s'agisse des téléphones… des adolescents. » (**30 mots**) ».
- **Problème** : la phrase compte **31 mots** si l'on compte les élisions (qu', s') comme des mots, 29 sinon ; jamais 30. Gênant dans un exercice où le comptage est noté.
- **Correction** : « (31 mots) » et rappeler la règle de comptage.
- **Gravité** : mineur · **Certitude** : sûr.

### Fr3 — Règle du e muet : exemple trompeur
- **Thème** : `p1-fr-3`, section « La poésie : la versification » : « le **e muet** : il se compte s'il est suivi d'une consonne (« une rose épanouie ») ».
- **Problème** : dans l'exemple, le e de « rose » est **élidé** (suivi de la voyelle de « épanouie ») : l'élève ne voit pas lequel compte. Les deux autres règles (élision devant voyelle, e final de vers non compté) manquent.
- **Correction** : « Le e muet compte devant une consonne (« u-ne rose » : 2 syllabes pour « une ») ; il s'élide devant une voyelle (« ro-s(e) é-pa-nouie ») et ne compte pas en fin de vers. »
- **Gravité** : mineur · **Certitude** : sûr.

### Fr4 — Satire rangée dans le comique, alors que le cours en fait un registre à part
- **Thème** : `p1-fr-4`, tri `p1-fr-4-tri` « Quel registre ? » : « Une satire moqueuse → Comique ».
- **Problème** : la section « Les registres littéraires » range « polémique et satirique » ensemble, à part du comique ; l'élève qui a lu le cours hésite.
- **Correction** : remplacer l'item par « Une scène de farce avec coups de bâton → Comique ».
- **Gravité** : mineur · **Certitude** : sûr.

---

## 7. Exercices générés automatiquement à partir des cours (les 4 matières)

Le moteur (`src/data/index.js`, `sectionExercises`, `sectionPairs`, `trouFromBold`) fabrique pour chaque chapitre des QCM « notions », « cas concrets », vrai/faux, « écris le terme », textes à trous, associations, memory et flashcards à partir des puces « **terme** : définition », des tableaux à deux colonnes et des mots en gras. 875 exercices générés ont été extraits (`dump/generes.txt`, 5 446 lignes) et relus par échantillons ciblés ; les réponses « écris le terme » ont été testées avec la fonction de correction réelle (`answerMatchesCours`). Les vrai/faux générés sont justes (aucune affirmation « fausse » qui serait vraie). Les problèmes viennent de puces du cours dont le mot en gras est une **étiquette** (« Définir », « ① Dégager la thèse », « Filles »…) et non une notion.

### E1 — Philosophie, « La vérité » : la notion devient « Définir » (réponse fausse)
- **Thème** : `philo-verite`, section « 🔍 La vérité : accord de la pensée avec l'objet, opinion et savoir » (`matiere.json`), puce « **Définir** : la vérité est l'**accord de la pensée avec son objet** (adéquation). »
- **Exercices produits** (tirages réels) : « Cas concret — on observe : « la vérité est l'accord de la pensée avec son objet (adéquation) ». De quelle notion s'agit-il ? » → bonne réponse **« Définir »**, l'élève qui choisit « Vérité / réalité » est compté faux ; « « Définir » : quelle proposition est correcte ? » ; flashcard « Définir ‖ la vérité est l'accord… » ; association « Définir ↔ … » ; « Quel terme correspond à cette définition ? » → réponse attendue « Définir » (« vérité » refusé).
- **Même cause, moins grave** : `philo-religion` et `philo-technique`, section 0 (« **Définir** : la religion est… », « **Définir** : la technique est… ») → textes à trous et QCM « mot manquant » dont la réponse est « Définir ».
- **Correction** : dans le contenu, écrire la puce comme une vraie notion : « **La vérité** : accord de la pensée avec son objet (adéquation). » (idem « **La religion** : … », « **La technique** : … ») ; dans le moteur, ajouter `definir`, `identifier`, `signe`, `expliquer l'effet` à `ETAPES_METHODE`.
- **Gravité** : bloquant (une réponse fausse est enseignée et la bonne est refusée) · **Certitude** : sûr.

### E2 — Philosophie, méthode : réponses attendues avec ①②③, impossibles à taper
- **Thème** : `philo-methode`, sections « 📖 L'explication de texte pas à pas » et « 📖 L'explication de texte en détail » (puces « **① Dégager la thèse** : … », « **② Repérer les mouvements** : … », « **③ Expliquer** », « **⑤ Discuter** »).
- **Problème** : l'exercice « Écris le terme » attend « ① Dégager la thèse » ; la saisie « Dégager la thèse » est **refusée** (vérifié avec `answerMatchesCours` : `sansHabillage` n'enlève que les numéros 1., 2)…, pas ①). L'item ne peut pas être réussi.
- **Correction** : dans `sansHabillage` (`src/games/common.jsx`) et `termVariants` (`index.js`), retirer aussi `^[①-⑳]\s*` ; ou écrire « 1. Dégager la thèse » dans le cours.
- **Gravité** : important · **Certitude** : sûr.

### E3 — Français, grammaire : deux bonnes réponses
- **Thème** : `p1-fr-4`, section « La question de grammaire », tableau final : lignes « Interrogation indirecte | Dans une subordonnée, sans point d'interrogation (« Je me demande ce que tu veux ») » **et** « Interrogative indirecte | Introduite par « si » ou un mot interrogatif, COD ».
- **Problème** : c'est la même notion sous deux noms ; le QCM généré « « Interrogation indirecte » : quelle proposition est correcte ? » propose comme **mauvaise** réponse « Introduite par « si » ou un mot interrogatif, COD », qui est juste (et inversement pour « À quoi correspond « Interrogative indirecte » ? »). Même ambiguïté dans les associations et le memory.
- **Correction** : fusionner les deux lignes (« Interrogation indirecte (subordonnée interrogative indirecte) | Enchâssée dans une subordonnée introduite par « si » ou un mot interrogatif, sans point d'interrogation ni inversion ; souvent COD ») ou ajouter `["Interrogation indirecte", "Interrogative indirecte"]` à `content/commun/notions-liees.json`.
- **Gravité** : important · **Certitude** : sûr.

### E4 — Étiquettes d'exemples traités transformées en « notions »
- **Où** : `p1-math-c1` « Exemple traité — proportion… » (« **Filles** : 750 × 0,60 = 450 filles », « **Prix final** ») ; `p1-math-c3` (« **Si a > 0** », « **Signe** », « **Racines** ») ; `p1-math-c4` et `math-c3` exemples traités (« **Dérivée** », « **Signe** », « **Variations** ») ; `math-c1` (« **Taux** ») ; `math-c7` (« **Fréquence** », « **Intervalle** », « **Amplitude** ») ; `philo-verite` § 1 (« **Le rôle du doute** », « **Sortir de l'opinion** ») ; `p1-fr-1` § 6 (« **Bâtir un plan** », « **Rédiger** ») ; `p1-fr-3` « Exemple traité — une ville fourmilière » (« **Identifier** », « **Expliquer l'effet** », « **Nommer d'autres figures utiles** »).
- **Exercices produits** : « Quel terme correspond à cette définition ? « 750 × 0,60 = 450 filles » » → « Filles » ; « … « elle souligne l'agitation, la foule, l'anonymat de la vie urbaine » » → « Expliquer l'effet » ; « Quel terme correspond à cette définition ? « 18 − 8 = 10 (mesure la dispersion…) » » → « Étendue ». Ce ne sont pas des définitions : les questions sont absurdes ou devinables seulement par cœur.
- **Correction** : dans les exemples traités, ne pas utiliser la forme « **Étiquette** : texte » (écrire « Étape 1 — Identifier : … » sans gras, ou mettre l'étiquette dans le titre du bloc `example`) ; ou exclure du moteur les puces des sections `group: "methode"` / titrées « Exemple traité ».
- **Gravité** : important · **Certitude** : sûr.

### E5 — Philosophie, art : trou dont la réponse est « Pour »
- **Thème** : `philo-art`, section « ✍️ Dissertation guidée — « N'y a-t-il de beau que l'utile ? » », puce « **II. Mais le beau est désintéressé.** Pour **Kant**, le jugement de goût… ».
- **Exercices produits** : « Mais le beau est désintéressé. ____ Kant, le jugement de goût est sans intérêt… » → réponse **« Pour »** (texte à trous, « Complète — à écrire », QCM « mot manquant » où « Pour » sert aussi de leurre ailleurs).
- **Cause** : `phrases()` coupe après « II. » ; le gras se retrouve décalé et le moteur prend « Pour » entre deux `**`.
- **Correction** : dans `phrases()`, ne pas couper après un numéral romain seul (`/(^|\*\*)[IVX]+\.$/`) ; ou écrire « **II – Mais le beau est désintéressé.** ».
- **Gravité** : mineur · **Certitude** : sûr.

### E6 — Textes à trous dont la réponse reste visible
- `math-c2` § 1 : « q = 1 − 0,08 = ____, avec u_0 = 20 000. u_n = 20 000 × **0,92**^n » (réponse 0,92 écrite juste après) ; `math-c3` § 0 : « tangente : y = 1(____) + 0 = **x − 1** » (le moteur masque la première occurrence, pas le mot en gras) ; `math-c2` § 2 : le QCM « mot manquant » reprend l'arrondi faux « 1 628,90 € » (voir M5).
- **Correction** : masquer toutes les occurrences du mot dans la phrase, ou écarter la phrase si le mot y figure deux fois.
- **Gravité** : mineur · **Certitude** : sûr.

---

## Ce qui n'a pas été relu en détail

- Le **« Test du thème »** (`buildThemeTest`) n'a pas été relu tirage par tirage : il réassemble les QCM et vrai/faux du thème (tous relus ci-dessus), des questions « développe ce sous-thème » dont le corrigé est le texte même de la section (relu), et des « cas » tirés des blocs `example` (relus).
- Les **flashcards** et **memory** générés n'ont été contrôlés que par les paires dont ils sont issus (les mêmes que les QCM et associations, donc concernés par E1 à E4).
- Le **programme officiel** n'a pu être consulté qu'au travers d'extraits du moteur de recherche (eduscol et education.gouv.fr refusés par le proxy) : M1, M3, M6, P1, Ph12 et Fr1 sont à confirmer sur les textes complets.
- Hors périmètre mais remarqué : `commun/epreuves.json` annonce une « Mathématiques, épreuve anticipée » le 21 juin 2027 pour les Premières ; aucun thème de `p1-maths` ne prépare son format (automatismes).

---

## Annexe A — Calculs refaits (tous justes sauf ceux signalés)

maths : 80 → 100 € (+25 %) ; 1,2 × 0,8 = 0,96 ; 1,10 × 1,30 = 1,43 ; √1,44 = 1,2 ; √1,43 − 1 ≈ 19,6 % ; 1/1,25 = 0,8 ; 46/40 = 115 ; 92 000/80 000 = 1,15 et 1,15² = 1,3225 ; 1,04 × 1,06 = 1,1024, 551,20 €, √1,1024 ≈ 1,04995 ; 30 % de 80 = 24 ; 40/250 = 16 % ; 2/8 = 25 % ; 1,21^(1/3) ≈ 1,0656 ; 20 000 × 0,92³ ≈ 15 574 ; 200 + 10 × 15 = 350 ; 200 × 1,05¹⁰ ≈ 325,8 ; somme géométrique ≈ 2 515,6 ; 1 000 × 1,04¹⁰ ≈ 1 480 ; dérivées et tangentes (x − 1 ; −4x + 9 ; 12x² − 2) ; optimisations (f(2) = 4, f(3) = 1, B(10) = 80) ; 0,56/0,68 ≈ 0,82 ; 0,032 et 0,375 ; 90/120 = 0,75 ; 0,95²⁰ ≈ 0,358 ; √12,5 ≈ 3,54 ; IC [0,55 ; 0,65], [0,50 ; 0,60], [0,48 ; 0,56]. **Seul écart : M5.**
p1-maths : 1,2 × 0,9 = 1,08 ; 1 500 + 200 = 1 700 ; 1 000 × 1,03⁵ ≈ 1 159 ; 2 060 puis 2 121,80 ; B(3) = 18 ; Δ = 1, racines 2 et 3 ; f(2) = −5 ; 88/7 ≈ 12,6, médiane 12, étendue 10 ; 11/32 ; 40 × 0,9975 = 39,90 ; programme Python → 2121.8. **Seul écart : P2 (effectif non entier).**


---

## Rapport — Vérification 4 — Histoire-géographie et langues (RévizSTMG)

Relecture faite en lecture seule sur la copie figée `/var/tmp/verif-contenu/app/content/`. J'ai relu le contenu tel que l'élève le voit : thèmes assemblés par `src/data/index.js` (`chargerTout`, `themeChapters`, `jeuxDuChapitre`), puis exercices générés à partir du cours, tirés plusieurs fois au sort pour voir les variantes.

Scripts utilisés, tous en lecture seule, dans `scratchpad/verif/` : `dump4.mjs`, `gen4.mjs`, `overlap4.mjs`, `datenotion4.mjs`, `ch5.mjs`, `sterm4.mjs`. Leurs sorties sont dans `scratchpad/verif/out4/`.

**État du rapport : terminé.** Tout le périmètre a été relu.

### Récapitulatif

| Matière | Bloquant | Important | Mineur | Total |
|---|---:|---:|---:|---:|
| `histoire-geo` (Terminale) | 1 | 8 | 13 | 22 |
| `p1-histoire-geo` (Première) | 0 | 3 | 3 | 6 |
| `langues` (Terminale : anglais et espagnol) | 1 | 3 | 13 | 17 |
| `p1-langues` (Première) | 0 | 0 | 2 | 2 |
| **Total** | **2** | **14** | **31** | **47** |

Un point qui touche plusieurs matières n'est compté qu'une fois, dans la matière où il est décrit. Par exemple, HG-T-03 (« Écris la date » trop strict) touche aussi la Première, et LNG-T-05 (« have to ») touche aussi p1-langues.

### Les 10 problèmes les plus graves
1. **HG-T-01 (bloquant)** — hg-h3, « De la crise aux défis contemporains » : le tableau mélange périodes et notions. Résultat : un vrai/faux « « Désindustrialisation » : Désindustrialisation » corrigé FAUX, et un QCM où « Désindustrialisation » est compté faux.
2. **LNG-T-01 (bloquant)** — lng-es-voc, « Verbos frecuentes » : « être » attend « ser » dans une série et « estar » dans l'autre, et l'autre réponse est refusée.
3. **HG-T-05** — La Shoah est définie comme « génocide des Juifs et des Tsiganes » : « L'essentiel », QCM (bonne réponse), flashcard, cours-complets.
4. **HG-T-02 / HG-P-02** — QCM « Que se passe-t-il en 1944-1945 / 1948-1949 / 1950-1953 / 1945-1975 / 1793-1794 / 1894-1906 ? » avec deux bonnes réponses.
5. **HG-T-07** — « La Sécurité sociale (1945) protège contre … le chômage » : l'assurance chômage date de 1958.
6. **HG-T-08** — « Après 1991, le monde devient multipolaire » (QCM, vrai/faux, flashcard) contredit le cours (moment unipolaire).
7. **HG-T-06** — hg-h3 présenté comme « thème conclusif : une nouvelle place dans le monde », avec un QCM dédié. Le thème 3 de Terminale technologique est « La France de 1945 à nos jours : une démocratie ».
8. **HG-P-01** — p1-hg-g3 : « Les espaces ruraux ne servent plus qu'à produire » dit le contraire de ce qui est voulu.
9. **LNG-T-02** — « revenue = le revenu » dans le vocabulaire de l'entreprise : *revenue* signifie recettes, chiffre d'affaires.
10. **HG-T-03** — « Écris la date » : 133 questions, dont 81 avec mois abrégé (« 2 sept. 1945 », « juil. 1943 »). « 2 septembre 1945 » est refusé.

### Ce qui n'a pas été relu
- Le contenu commun hors matière : `content/commun/` (glossaire, méthodo, grand oral, épreuves).
- Les sections présentes dans les fichiers mais masquées par le dédoublonnage du moteur, donc invisibles pour l'élève. Exemple : `cours-complets.json` hg-h2 cours[5] et cours[6].
- Les exercices générés ont été analysés par motif (dates, notions, saisies) et par tirages répétés sur les chapitres suspects, pas question par question pour chaque tirage possible.
- Sources web : eduscol.education.fr n'était pas joignable depuis cet environnement. J'ai vérifié les points de programme par recherche web (documents académiques). Ces points sont notés « probable ».

---

## 1. Histoire-géographie — Terminale (`histoire-geo`)

**Couverture.** J'ai relu les 6 thèmes en entier (hg-h1, hg-h2, hg-h3, hg-g1, hg-g2, hg-g3). Cela comprend les 101 chapitres visibles, l'intro, « L'essentiel », `definitions.json`, `pieges.json`, les QCM, les vrai/faux et les flashcards écrits à la main. J'ai aussi analysé de façon systématique les exercices générés : QCM, saisies, vrai/faux et ordre sur les dates ; questions sur les notions ; textes à trous.

**Rappel.** Le moteur fabrique les exercices du chapitre à partir des tableaux « Notions et repères » de chaque section. Une erreur de structure dans ces tableaux produit donc des exercices faux, même quand le cours lui-même est juste.

### HG-T-01 — Tableau qui mélange périodes et notions : exercices faux (BLOQUANT)
- **Où :** hg-h3, « La France depuis 1945 », chapitre « 📉 De la crise aux défis contemporains (depuis 1974) ». Fichier `histoire-geo/histoire-approfondie.json`, clé `hg-h3`, section [5], dernier bloc (tableau « Notions et repères »).
- **Citation :** lignes `Depuis 1974 | Croissance faible, chômage de masse, désindustrialisation…`, `1973 et 1979 | Chocs pétroliers`, `Depuis les années 1970 | Chômage de masse`, `Depuis les années 1980 | Désindustrialisation`, et à côté `Désindustrialisation | Déclin des industries traditionnelles`.
- **Problème :** les périodes deviennent des « notions », et la notion « Désindustrialisation » apparaît aussi comme définition d'une période. J'ai observé ces exercices générés :
  - vrai/faux « « Désindustrialisation » : Désindustrialisation », corrigé **FAUX** ;
  - « Cas concret — on observe : « Désindustrialisation ». De quelle notion s'agit-il ? », avec la bonne réponse attendue « Depuis les années 1980 ». Le choix « Désindustrialisation » est proposé et compté faux ;
  - vrai/faux « « Depuis les années 1980 » : Déclin des industries traditionnelles », corrigé FAUX alors que c'est vrai ;
  - l'association et le memory contiennent à la fois « Depuis les années 1980 ↔ Désindustrialisation » et « Désindustrialisation ↔ Déclin des industries traditionnelles ».
- **Correction :** sortir les 5 lignes datées du tableau de notions. Les mettre dans un tableau à part dont la première colonne s'intitule « Date » (le moteur le traite alors comme une chronologie), par exemple `HEAD = ["Date", "Événement"]` : `1973 et 1979 | Chocs pétroliers` ; `Années 1970 | Début du chômage de masse` ; `Années 1980 | Accélération de la désindustrialisation`. Le tableau de notions final ne garde que Désindustrialisation / Tertiarisation / Reconversion.
- **Certitude :** sûr (reproduit avec `ch5.mjs hg-h3 5`).

### HG-T-02 — QCM « Que se passe-t-il en … ? » avec deux bonnes réponses (IMPORTANT)
- **Où :** QCM, vrai/faux et « Remets dans l'ordre » générés sur les dates. Le problème survient quand une période (« 1944-1945 ») et une date comprise dans cette période figurent dans le même tableau :

| Thème / chapitre (fichier) | Question générée | Autre choix proposé qui est juste aussi |
|---|---|---|
| hg-h1 « ⚔️ La Seconde Guerre mondiale… » (`histoire-approfondie.json` hg-h1 [4]) | « Que se passe-t-il en 1944-1945 ? » → Victoire alliée | « Capitulation allemande » (8 mai 1945), « Capitulation japonaise » (2 sept. 1945) |
| hg-h1 « Frise — Joseph Staline » (`cours-complets.json` hg-h1 cours[6]) | « … en 1941-1945 ? » → Grande Guerre patriotique | « Conférences de Yalta et Potsdam » (1945) |
| hg-h2 « 🧊 La naissance de la Guerre froide » (`histoire-approfondie.json` hg-h2 [0]) | « … en 1948-1949 ? » → Blocus de Berlin | « Division de l'Allemagne (RFA/RDA), OTAN » (1949) |
| hg-h2 « 2. La formation des blocs… » (`cours-complets.json` hg-h2 cours[1]) | « … en 1948-1949 ? » → Pont aérien ; « … en 1950-1953 ? » → Guerre de Corée | Début du blocus (24 juin 1948), OTAN (4 avril 1949), bombe A soviétique, RPC (1er oct. 1949) ; bombe H (1952), mort de Staline (5 mars 1953) |
| hg-h3 « 🏗️ Reconstruction et Trente Glorieuses » (`histoire-approfondie.json` hg-h3 [0]) | « … en 1945-1975 ? » → Trente Glorieuses | « Création de la Sécurité sociale » (1945), « Premier choc pétrolier » (1973) |

  Même cause pour les vrai/faux sur les dates. Par exemple, « 8 mai 1945 : Victoire alliée : débarquements, libération, capitulations. » est corrigé FAUX.
- **Correction :** dans chaque tableau concerné, remplacer la période par un événement précis, ou la déplacer dans le texte. Par exemple hg-h1 [4] : `1944-1945 | Victoire alliée` → `6 juin 1944 | Débarquement en Normandie (victoire alliée)`. hg-h2 [0] : `1948-1949 | Blocus de Berlin` → `juin 1948 - mai 1949 | Blocus de Berlin`, en retirant la ligne `1949` ou en la remplaçant par « 4 avril 1949 | OTAN ». Autre solution, côté moteur : exclure comme distracteur toute date incluse dans la période de la question.
- **Certitude :** sûr (liste produite par `overlap4.mjs`).

### HG-T-03 — « Écris la date » : réponse exigée au caractère près, mois abrégés (IMPORTANT)
- **Où :** tous les exercices « Écris la date — ce chapitre » (`::sdate`). On en compte 133 dans le périmètre, dont 81 avec un mois abrégé.
- **Exemples :** hg-h1 « ⚔️ La Seconde Guerre mondiale » : « Capitulation japonaise ? » attend « 2 sept. 1945 ». hg-h1 « Chronologie… (1917-1939) » : « Invasion de la Pologne ? » attend « 1er sept. 1939 ». hg-h1 « Frise — Jean Moulin » : attend « juil. 1943 ». hg-h2 « 2. La formation des blocs » : attend « mai / oct. 1949 ».
- **Problème :** l'élève qui tape « 2 septembre 1945 », « 1 septembre 1939 » ou « juillet 1943 » est compté faux. Le moteur (`saisieFromItems`, appelé pour les dates sans `alt`) ne compare qu'après avoir retiré accents et casse.
- **Correction :** dans les tableaux, écrire les mois en toutes lettres (« 2 septembre 1945 »). Mieux, côté moteur : normaliser les mois abrégés et accepter « 1er »/« 1 ». Pour les plages (« 1944-1945 »), accepter aussi l'année seule.
- **Certitude :** sûr.

### HG-T-04 — Dates traitées comme des « notions » : questions absurdes (IMPORTANT)
- **Où :** lignes de tableau dont la première colonne est une date que le moteur ne reconnaît pas comme telle (plage de jours, « mai / oct. », « Années 1950-60 », « Depuis… »). Elles deviennent des notions à définir.
  - hg-h1 « Une guerre mondiale et d'anéantissement (1939-1945) » (`cours-complets.json` hg-h1 cours[2]) : `16-17 juil. 1942`, `6 et 9 août 1945`. On obtient « Quel terme correspond à cette définition ? « Rafle du Vél' d'Hiv » » → « 16-17 juil. 1942 ».
  - hg-h2 « 1. Les origines de la Guerre froide » (`cours-complets.json` hg-h2 cours[0]) : `4-11 févr. 1945`, `juil.-août 1945`, `sept.-oct. 1947`. On obtient « Que signifie : « 4-11 févr. 1945 » ? » et des vrai/faux du même type.
  - hg-h2 « 2. La formation des blocs » (`cours-complets.json` hg-h2 cours[1]) : `mai / oct. 1949` → « Écris le terme : Naissance de la RFA puis de la RDA ». Les variantes automatiques acceptent « mai » seul comme bonne réponse.
  - hg-h3 « 👥 Les mutations de la société française » (`histoire-approfondie.json` hg-h3 [2]) : `Années 1960-70`. hg-h3 « Reconstruction et État-providence » (`cours-complets.json` hg-h3 cours[0]) : `Années 1950-60`.
- **Correction :** même principe qu'en HG-T-01, avec un tableau séparé dont l'en-tête commence par « Date ». Exemple : `HEAD = ["Date", "Événement"]` avec `16-17 juillet 1942 | Rafle du Vél' d'Hiv`.
- **Certitude :** sûr (liste produite par `datenotion4.mjs`).

### HG-T-05 — La Shoah présentée comme « génocide des Juifs et des Tsiganes » (IMPORTANT)
- **Où :**
  - `histoire-geo/matiere.json`, chapitre hg-h1, `essentiel[2]` : « **Shoah** : génocide des Juifs et des Tsiganes, planifié et industrialisé » ;
  - jeu `hg-h1-qcm`, question 2 : « La Shoah désigne… » → bonne réponse « le génocide des Juifs (et des Tsiganes) », explication « La Shoah est le génocide des Juifs et des Tsiganes » ;
  - jeu `hg-h1-flash`, carte « Shoah » → « Génocide des Juifs (et des Tsiganes)… » ;
  - `cours-complets.json` hg-h1 cours[3], « La Shoah est le génocide des Juifs d'Europe (avec aussi le génocide des Tsiganes) ».
- **Problème :** « Shoah » désigne le génocide des Juifs d'Europe. Le génocide des Tsiganes est distinct (on parle de Samudaripen ou de Porajmos). Le cours se contredit d'ailleurs lui-même : le chapitre « 💀 La Shoah et le processus d'anéantissement » les distingue correctement (« Les Tsiganes… subissent également un génocide »).
- **Correction :** « **Shoah** : génocide des Juifs d'Europe, planifié et industrialisé ; les Tsiganes sont eux aussi victimes d'un génocide. » Pour le QCM, bonne réponse « le génocide des Juifs d'Europe ». Même correction pour la flashcard et la phrase de `cours-complets.json`.
- **Certitude :** sûr. Le Mémorial de la Shoah et les programmes distinguent bien « génocide des Juifs » et « génocide des Tsiganes ».

### HG-T-06 — hg-h3 présenté comme « thème conclusif : une nouvelle place dans le monde » (IMPORTANT)
- **Où :**
  - `histoire-geo/matiere.json` hg-h3 : `formulas` (« Thème conclusif : la France, une nouvelle place dans le monde (1945 → nos jours) »), `essentiel[2]`, et `cours[0]` « Une nouvelle place dans le monde » ;
  - jeu `hg-h3-qcm`, question 3 : « Ce thème est qualifié de… » → « thème conclusif » ;
  - `cours-complets.json` hg-h3 cours[4] : « C'est le **thème conclusif** de la partie histoire. »
- **Problème :** en Terminale technologique, le thème 3 s'intitule « La France de 1945 à nos jours : une démocratie » (A — La France depuis 1945 : politique et société ; B — sujet d'étude, dont « La guerre d'Algérie »). « La France : une nouvelle place dans le monde » est un intitulé de la voie générale. Le QCM fait apprendre une étiquette inexacte, sans aucune valeur au bac.
- **Correction :** remplacer par « Thème 3 — La France de 1945 à nos jours : une démocratie » et supprimer la question 3 du QCM. Ou la remplacer par « En quelle année naît la Ve République ? » (bonne réponse 1958).
- **Certitude :** probable. Recherche web : présentation académique du programme de Terminale technologique ; je n'ai pas pu ouvrir directement le BO depuis cet environnement.

### HG-T-07 — « La Sécurité sociale (1945) protège contre… le chômage » (IMPORTANT)
- **Où :** hg-h3, chapitre « 👥 Une société transformée : femmes, immigration, État-providence ». Fichier `histoire-geo/approfondi-3.json`, clé hg-h3 [1], liste, 3ᵉ puce.
- **Citation :** « **État-providence** : la Sécurité sociale (1945) protège contre les risques (maladie, chômage, vieillesse). »
- **Problème :** l'assurance chômage ne fait pas partie de la Sécurité sociale de 1945 ; elle est créée en 1958 (Unédic/Assédic). Le chapitre « 🏗️ Reconstruction et Trente Glorieuses » donne d'ailleurs la bonne liste.
- **Correction :** « la Sécurité sociale (1945) protège contre les grands risques (maladie, vieillesse, accidents du travail) et verse les allocations familiales ; l'assurance chômage est créée en 1958. »
- **Certitude :** sûr.

### HG-T-08 — « Après 1991, le monde devient multipolaire » contredit le cours (IMPORTANT)
- **Où :**
  - jeu `hg-h2-qcm`, question 4 : « Après 1991, le monde devient… » → « multipolaire », avec le distracteur « unipolaire figé » ;
  - jeu `hg-h2-vf`, question 2 : « La fin de l'URSS ouvre un monde multipolaire. » → VRAI ;
  - jeu `hg-h2-flash`, carte « 1991 » → « Fin de l'URSS → monde multipolaire » ;
  - `matiere.json` hg-h2 `essentiel[2]` ;
  - `definitions.json` hg-h2, entrée « Monde multipolaire … (après 1991) ».
- **Problème :** le cours (chapitre « 🌐 Un monde multipolaire depuis 1991 », encadré « Piège de vocabulaire ») enseigne que les années 1990 sont un moment **unipolaire** (hyperpuissance américaine) et que la multipolarité vient progressivement. L'élève qui a retenu le cours est mis en difficulté.
- **Correction :** question « Après 1991, quelle puissance domine d'abord seule le monde ? » → « les États-Unis (moment unipolaire) ». Vrai/faux : « La fin de l'URSS ouvre un moment unipolaire, puis un monde multipolaire. » → VRAI. Flashcard : « Fin de l'URSS → hyperpuissance américaine, puis monde multipolaire ».
- **Certitude :** sûr (contradiction interne).

### HG-T-09 — BRICS défini comme les 5 pays d'origine (IMPORTANT)
- **Où :** hg-g2, « 🌍 Une mondialisation sélective… » : `histoire-geo/approfondi-4.json`, clé hg-g2 [1], 1er paragraphe. Le sigle apparaît aussi sans liste dans hg-h2 et dans hg-g2 [1] de `approfondi-3.json`.
- **Citation :** « **BRICS** (Brésil, Russie, Inde, Chine, Afrique du Sud) ».
- **Problème :** le groupe s'est élargi en 2024 (Égypte, Éthiopie, Iran, Émirats arabes unis) puis en 2025 (Indonésie). La liste est donc périmée pour le bac 2026.
- **Correction :** « **BRICS** : à l'origine Brésil, Russie, Inde, Chine, Afrique du Sud, groupe élargi depuis 2024 (Égypte, Éthiopie, Iran, Émirats arabes unis, puis Indonésie en 2025). »
- **Certitude :** sûr.

### HG-T-10 — Dates de la Grande Terreur incohérentes d'un chapitre à l'autre (mineur)
- **Où :**
  - « 1937-1938 » : `histoire-approfondie.json` hg-h1 [1] (« Entre 1937 et 1938, la Grande Terreur ») et `approfondi-3.json` hg-h1 [1] ;
  - « 1936-1938 » : `histoire-approfondie.json` hg-h1 [3], tableau « Grande Terreur | … de 1936-1938 », `cours-complets.json` hg-h1 cours[0] (« Grandes Purges de 1936-1938 ») et frise Staline.
- **Correction :** retenir une seule convention, par exemple « 1936-1938 (paroxysme en 1937-1938) ».
- **Certitude :** sûr.

### HG-T-11 — Montée électorale du parti nazi mal datée (mineur)
- **Où :** `histoire-approfondie.json` hg-h1 [0], exemple « L'Allemagne, laboratoire du désespoir ».
- **Citation :** « Entre 1929 et 1932, le parti nazi (NSDAP) passe de 12 à 230 députés ».
- **Problème :** les 12 sièges sont ceux de l'élection de mai 1928 ; les 230 sièges, ceux de juillet 1932.
- **Correction :** « Entre 1928 et juillet 1932, le parti nazi passe de 12 à 230 députés ».
- **Certitude :** sûr.

### HG-T-12 — « Yalta et Potsdam (partage du monde) » (mineur)
- **Où :** `cours-complets.json` hg-h1 cours[6], frise Staline, ligne « 1945 ».
- **Problème :** l'idée d'un « partage du monde » à Yalta est une idée reçue, remise en cause par les historiens. Cette ligne crée aussi l'ambiguïté signalée en HG-T-02.
- **Correction :** « 1945 : Conférences de Yalta et de Potsdam (organisation de l'après-guerre) ».
- **Certitude :** probable.

### HG-T-13 — « Première victoire de la gauche » en 1981 (mineur)
- **Où :** `histoire-approfondie.json` hg-h3 [1], paragraphe « La vie politique de la Ve République… ».
- **Citation :** « l'alternance en 1981 avec l'élection de François Mitterrand (première victoire de la gauche) ».
- **Problème :** la gauche avait déjà gagné des élections (Cartel des gauches en 1924, Front populaire en 1936). La méthode du même thème dit d'ailleurs correctement « sous la Ve République ».
- **Correction :** « (première victoire de la gauche à l'élection présidentielle sous la Ve République) ».
- **Certitude :** sûr.

### HG-T-14 — Nationalisation de la Banque de France datée de 1946 (mineur)
- **Où :** `cours-complets.json` hg-h3 cours[0], paragraphe 3 et tableau, ligne `1946 | Nationalisations (EDF-GDF, Banque de France)`.
- **Problème :** la loi de nationalisation de la Banque de France date du 2 décembre 1945 (effet au 1er janvier 1946). EDF-GDF date bien d'avril 1946.
- **Correction :** « 1945 : … nationalisation de Renault et de la Banque de France (déc.) » ; « 1946 : EDF-GDF ».
- **Certitude :** probable.

### HG-T-15 — Le « rideau de fer » placé après 1947 (mineur)
- **Où :** `histoire-approfondie.json` hg-h2 [0], paragraphe sur le plan Marshall.
- **Citation :** « L'URSS refuse cette aide… l'Europe se coupe en deux. Winston Churchill parle d'un « rideau de fer »… »
- **Problème :** la phrase laisse croire que le discours suit le plan Marshall (1947). Le discours de Fulton date du 5 mars 1946, comme le dit correctement le chapitre « 1. Les origines de la Guerre froide ».
- **Correction :** « Dès mars 1946, Winston Churchill avait dénoncé un « rideau de fer »… »
- **Certitude :** sûr.

### HG-T-16 — Frise de Gandhi : date d'indépendance du Pakistan (mineur)
- **Où :** `cours-complets.json` hg-h2 cours[7], ligne `15 août 1947 : Indépendance de l'Inde (et du Pakistan)`.
- **Problème :** l'indépendance du Pakistan date du 14 août 1947.
- **Correction :** « 15 août 1947 : Indépendance de l'Inde (le Pakistan la veille) ».
- **Certitude :** sûr.

### HG-T-17 — Canal de Suez : mots et chiffres (mineur)
- **Où :** `enrichissements.json` hg-g1 sections[1] (« 🌍 Étude de cas — le canal de Suez… ») et `approfondi-4.json` hg-g1 [0].
- **Problèmes :**
  1. « qui contrôle le **détroit** contrôle une route stratégique » : Suez est un **canal**, pas un détroit.
  2. « 10 % du commerce **maritime** mondial » dans un chapitre, « 10 % du commerce mondial » dans l'autre.
  3. Depuis fin 2023, les attaques en mer Rouge ont fait chuter le trafic du canal (environ la moitié des passages en 2024). C'est un exemple à ajouter pour illustrer la vulnérabilité, sinon le chiffre est présenté comme actuel.
- **Correction :** « qui contrôle le canal… » ; « environ 10 à 12 % du commerce mondial y transitait avant 2024 ; depuis fin 2023, les attaques en mer Rouge ont détourné une grande partie du trafic par le cap de Bonne-Espérance ».
- **Certitude :** sûr pour 1 ; probable pour 2 et 3 (ordre de grandeur).

### HG-T-18 — Câbles sous-marins rangés parmi les « ressources » (mineur)
- **Où :** `enrichissements.json` hg-g1 sections[0], puce « **Ressources** : pêche, hydrocarbures offshore, **câbles sous-marins** (99 % des données mondiales)… ».
- **Problème :** un câble est une infrastructure, pas une ressource. Le chiffre de 99 % concerne le trafic **intercontinental** de données.
- **Correction :** sortir les câbles dans une puce « **Infrastructures** : câbles sous-marins (≈ 99 % des communications intercontinentales) ».
- **Certitude :** probable.

### HG-T-19 — « Paris, 1er pôle touristique mondial » (mineur)
- **Où :** `approfondi-3.json` hg-g3 [0] (« tourisme n°1 au monde ») et `approfondi-4.json` hg-g3 [1] (« 1er pôle touristique mondial »).
- **Problème :** c'est la **France** qui est la 1re destination touristique mondiale en arrivées internationales. Pour Paris, le classement dépend de l'indicateur utilisé.
- **Correction :** « la France est la 1re destination touristique mondiale ; Paris est l'une des villes les plus visitées au monde ».
- **Certitude :** à vérifier.

### HG-T-20 — Autres imprécisions (mineur)
- `approfondi-3.json` hg-h1 [0] : « L'**historienne** Hannah Arendt » ; le chapitre d'ouverture dit « la philosophe ». **Correction :** « la philosophe Hannah Arendt ». Certitude : sûr.
- `histoire-approfondie.json` hg-h1 [3] : « conduit à la **conquête de l'Éthiopie en 1935** » (et tableau `Conquête de l'Éthiopie (1935)`). L'invasion date d'octobre 1935, la conquête s'achève en mai 1936. **Correction :** « (1935-1936) ». Certitude : sûr.
- `definitions.json` hg-g3 et p1-hg-g1, entrée « Aire urbaine » : depuis 2020, l'Insee a remplacé cette notion par « aire d'attraction des villes ». **Correction :** ajouter « (depuis 2020, l'Insee parle d'aire d'attraction des villes) ». Certitude : sûr.

### Remarques de programme (non comptées)
- hg-h3 ne traite presque pas le sujet d'étude « La guerre d'Algérie » du thème 3 : quelques phrases seulement, aucun chapitre.
- hg-g2 ne couvre que « Des territoires inégalement intégrés ». La seconde question du thème 2 (« Coopérations, tensions et régulations aux échelles mondiale, régionale et locale ») est absente.
- Chapitres sans aucun exercice : hg-g1 « La maritimisation : routes, conteneurisation et façades maritimes ». Plusieurs autres chapitres courts n'ont que 2 ou 3 textes à trous.

---

## 2. Histoire-géographie — Première (`p1-histoire-geo`)

**Couverture.** J'ai relu les 6 thèmes en entier (p1-hg-h1, h2, h3, g1, g2, g3), soit 34 chapitres, avec `definitions.json`, `enrichissements.json`, les jeux écrits à la main et les exercices générés.

Dans l'ensemble, les dates de la Révolution, de l'Empire, du XIXe siècle et de la IIIe République sont exactes. Je les ai contrôlées une par une, en particulier 1789, 1790-1795, 1799-1815, 1830, 1848, 1851-1852, 1858, 1860-1870, 1871, 1875-1905 et 1914-1919.

### HG-P-01 — Faute qui inverse le sens (IMPORTANT)
- **Où :** p1-hg-g3, « Les espaces ruraux », chapitre « 🌍 L'essentiel — les espaces ruraux, multifonctionnels ». Fichier `p1-histoire-geo/enrichissements.json`, clé p1-hg-g3, sections[0], 1re puce.
- **Citation :** « Les espaces ruraux **ne servent plus qu'à produire** : ils sont multifonctionnels ».
- **Problème :** « ne… plus que » veut dire « seulement ». La phrase affirme le contraire de ce qu'elle veut dire.
- **Correction :** « Les espaces ruraux **ne servent plus seulement à produire** : ils sont multifonctionnels (agriculture, résidence, tourisme, nature). »
- **Certitude :** sûr.

### HG-P-02 — QCM de dates avec deux bonnes réponses (IMPORTANT, même cause que HG-T-02)
- p1-hg-h1, « De la monarchie constitutionnelle à la République (1790-1799) » (`matiere.json` p1-hg-h1 cours[1]) : « Que se passe-t-il en 1793-1794 ? » → la Terreur. « Exécution de Louis XVI » (21 janv. 1793) et « 9 Thermidor » (27 juil. 1794) sont proposés aussi et sont tout aussi justes.
- p1-hg-h1, « Frise — Napoléon Bonaparte » (cours[4]) : « … en 1798-1799 ? » → Campagne d'Égypte, alors que « 18 Brumaire » (9-10 nov. 1799) est juste aussi.
- p1-hg-h3, « La IIIe République s'enracine » (`matiere.json` p1-hg-h3 cours[0]) : « … en 1894-1906 ? » → Affaire Dreyfus, alors que « Loi de 1901 » et « Séparation des Églises et de l'État (1905) » sont justes aussi.
- **Correction :** remplacer les périodes par une date-repère, par exemple `1793-1794 | La Terreur` → `sept. 1793 - juil. 1794 | La Terreur` ou `5 sept. 1793 | La Terreur « à l'ordre du jour »`, et `1894-1906 | Affaire Dreyfus` → `1898 | « J'accuse » de Zola (affaire Dreyfus)`. Ou bien corriger le moteur, comme indiqué en HG-T-02.
- **Certitude :** sûr.

### HG-P-03 — Dates traitées comme des « notions » (IMPORTANT, même cause que HG-T-04)
- `matiere.json` p1-hg-h1 cours[0] : `5-6 octobre 1789` → « Écris le terme : « Le roi ramené de Versailles à Paris » » attend « 5-6 octobre 1789 ».
- p1-hg-h2 cours[0] : `27-29 juil. 1830`. p1-hg-h2 cours[1] : `22-24 févr. 1848`. Même effet.
- **Correction :** écrire ces lignes dans un tableau d'en-tête « Date », ou utiliser une date simple (« 28 juillet 1830 »).
- **Certitude :** sûr.

### HG-P-04 — Chapitre « De l'État autoritaire à l'État libéral (1848-1970) » (mineur)
- **Où :** `p1-histoire-geo/matiere.json` p1-hg-h3 cours[2].
- **Problèmes :**
  1. Les bornes « 1848-1970 » (titre et 1re phrase) sont très probablement une coquille pour « 1848-1870 » : le chapitre illustre la bascule du Second Empire. Pourtant, la frise court jusqu'en 1962.
  2. Le paragraphe sur l'État libéral énumère « presse libre, surtout après la loi de **1881** » et « syndicats autorisés en **1884** », puis conclut « C'est le cas de l'Empire libéral, de 1860 à 1870, puis de la IIIe République ». Cela attribue au Second Empire des lois de la IIIe République (anachronisme).
- **Correction :**
  1. Titre « De l'État autoritaire à l'État libéral (1848-1870) ». Si l'on veut garder 1944-1962, en faire un encadré « Et après ? ».
  2. « L'Empire libéral (1860-1870) amorce cette évolution (droit d'adresse, droit de grève en 1864, libertés de 1868) ; la IIIe République l'accomplit (liberté de la presse en 1881, syndicats en 1884). »
- **Certitude :** probable pour 1 ; sûr pour 2.

### HG-P-05 — Définition réductrice de la laïcité (mineur)
- **Où :** `p1-histoire-geo/definitions.json` p1-hg-h3, entrée « Laïcité » → « Séparation des Églises et de l'État (loi de 1905) ».
- **Problème :** cette définition confond la notion avec la loi. Le cours, lui, donne la bonne définition.
- **Correction :** « Laïcité : principe de neutralité de l'État en matière religieuse, qui garantit la liberté de conscience (loi de séparation de 1905). »
- **Certitude :** sûr.

### Remarques de programme (non comptées)
- Le thème conclusif de géographie de Première technologique, « La Chine : des recompositions spatiales multiples », est absent : seuls 3 thèmes de géographie sur 4 sont présents.
- p1-hg-g2 « Des espaces productifs qui se recomposent » et « Une multiplicité d'acteurs » n'ont **aucun** exercice. p1-hg-g1 et p1-hg-g3 ont des chapitres avec seulement 2 textes à trous.

---

## 3. Langues — Terminale (`langues`)

**Couverture.** J'ai relu les 10 thèmes en entier :
- anglais : conjugaisons, vocabulaire, verbes irréguliers, grammaire, compréhension ;
- espagnol : les mêmes cinq thèmes.

Cela représente 41 chapitres. J'ai vérifié chaque conjugaison, chaque tableau de verbes irréguliers et chaque ligne de vocabulaire (environ 400 entrées), les 12 textes de compréhension et leurs questions, les jeux écrits à la main, ainsi que les générateurs `src/data/langgen.js` (listes `EN_IRREGULAR`, `ES_IRREGULAR` et items de grammaire). Les générateurs sont justes ; ils ne semblent d'ailleurs plus utilisés, car les jeux « verbs » et « grammar » ont leur propre banque de questions.

Les conjugaisons (anglais et espagnol), les participes irréguliers, les radicaux du futur, le subjonctif et l'impératif sont exacts. Les compréhensions sont cohérentes avec leurs textes.

### LNG-T-01 — Espagnol : « être » attend tantôt « ser », tantôt « estar » (BLOQUANT)
- **Où :** lng-es-voc, chapitre « Verbos frecuentes ». Fichier `langues/matiere.json`, `chapters[id=lng-es-voc].cours[6]`, tableau « Vocabulaire à retenir ».
- **Citation :** lignes `ser | être` et `estar | être`.
- **Problème :** l'exercice « Écris le terme — ce chapitre » demande « Quel terme correspond à cette définition ? « être » ». La série 1 attend « ser », la série 2 attend « estar », et l'autre réponse est comptée fausse. J'ai observé ces items avec `sterm4.mjs`. Le même risque existe pour les QCM « Cas concret » quand ser et estar sont tous les deux proposés.
- **Correction :** `ser | être (identité, caractère durable)` et `estar | être (état, lieu)` ; de même `tener | avoir (possession)`, à côté de `haber | avoir (auxiliaire)`.
- **Certitude :** sûr.

### LNG-T-02 — Anglais : « revenue » traduit par « le revenu » (IMPORTANT)
- **Où :** lng-en-voc, « Entreprise, gestion & finance (STMG / ETLV) ». Fichier `langues/matiere.json`, `chapters[id=lng-en-voc].cours[2]`, paragraphe 2 (« le **revenue** (revenu) ») et tableau (`revenue | le revenu`).
- **Problème :** dans le vocabulaire de l'entreprise, *revenue* désigne les **recettes**, c'est-à-dire le chiffre d'affaires (synonyme de *turnover* en anglais américain), et non « le revenu » d'une personne (*income*). C'est un faux-ami classique, et c'est justement le vocabulaire STMG/ETLV. Les exercices générés peuvent en outre marquer FAUX « « revenue » : le chiffre d'affaires ».
- **Correction :** `revenue | les recettes, le chiffre d'affaires (US)`. Dans le texte : « le **turnover** ou **revenue** (chiffre d'affaires, recettes) ».
- **Certitude :** sûr (Cambridge Dictionary, sens « Business »).

### LNG-T-03 — « Écris le terme » en vocabulaire : variantes justes refusées (IMPORTANT)
- **Où :** exercices `::sterm` des chapitres de vocabulaire lng-en-voc et lng-es-voc (`langues/matiere.json`, `cours[0..7]`).
- **Problème :** la réponse doit être tapée exactement comme dans le tableau.
  - **Anglais :** « se réveiller » attend « to wake up », et « wake up » est refusé, car le moteur retire les articles français mais pas « to ». « l'appartement » attend « flat » (« apartment » refusé). « le voisin » attend « neighbour » (« neighbor » refusé). « les vacances » attend « holidays » (« holiday », « vacation » refusés). « la note » attend « grade » (« mark » refusé). « l'élève » attend « student » (« pupil » refusé).
  - **Espagnol :** l'article est enlevé pour « la » mais pas pour « el », « los » ou « las ». Ainsi « familia » est accepté pour « la familia », mais « vecino » est refusé pour « el vecino » et « vacaciones » pour « las vacaciones ».
- **Correction :**
  - contenu : écrire les variantes avec « / », que le moteur découpe déjà en réponses acceptées : `flat / apartment`, `neighbour / neighbor`, `holidays / vacation`, `grade / mark`, `student / pupil` ;
  - moteur : dans `sansHabillage` / `cleReponse`, retirer aussi « to », « el », « los », « las » en tête de réponse pour les matières de langues.
- **Certitude :** sûr (lecture du code `src/games/common.jsx` et tirages `sterm4.mjs`).

### LNG-T-04 — « Écris le terme » en grammaire : étiquettes impossibles à deviner, réponses absurdes acceptées (IMPORTANT)
- **Où :** exercices `::sterm` et textes à trous générés des chapitres lng-en-gram `cours[0..5]` et lng-es-gram `cours[0..6]` (`langues/matiere.json`), à partir des tableaux « Notions et définitions ».
- **Exemples :**
  - « « Action en cours, situation temporaire » » attend « Emploi du present continuous » : « present continuous » est refusé ;
  - « « comí, comiste, comió… » » attend « Indefinido en -er/-ir (comer) », mais les variantes automatiques acceptent « comer » ou « -ir » seuls ;
  - « « soy, eres, es… » » attend « Ser (présent) » ; « présent » seul est accepté ;
  - textes à trous dont la réponse est une étiquette (« ____ : indefinido = action datée… » attend « Emploi » ; « Irréguliers fréquents au présent » ; « Radicaux irréguliers » ; « Will + base » ; « a / an »).
- **Correction :** mettre le nom simple dans la 1re colonne (« Present continuous », « Indefinido ») et le détail entre crochets ou dans la 2e colonne, sans parenthèses. Les parenthèses sont prises pour des sigles acceptés comme réponse. Pour les étiquettes de paragraphe (« **Emploi** : »), retirer le gras.
- **Certitude :** sûr.

### LNG-T-05 — Modaux : « have to » et « ought to » contredisent la règle « jamais de to » (mineur)
- **Où :** `langues/matiere.json` lng-en-gram `cours[3]` (tableau `have to | Obligation extérieure`, `should / ought to | Conseil`, puis `Modal + base verbale | Jamais de to…`). Même point en Première, `p1-langues/matiere.json` p1-lng-en `cours[1]` (« **Modaux** (+ base verbale) : … have to … »).
- **Correction :** « *have to* (semi-modal, suivi de la base verbale avec *to*) » ; « *ought to* contient déjà *to* ».
- **Certitude :** sûr.

### LNG-T-06 — Autres points d'anglais (mineur)
- `lng-en-gram cours[5]` : « famille i – a – u : … *run – ran – run* ». *Run* suit u – a – u. **Correction :** sortir *run* de cette liste ou écrire « (et *run – ran – run*) ». Certitude : sûr.
- `lng-en-voc cours[7]` : « Pour conclure, on utilise … **in fact** (en fait) ». *In fact* ne sert pas à conclure. **Correction :** le placer avec *indeed* (« on explique avec… »). Certitude : sûr.
- `lng-en-voc cours[2]` : `cash flow | la trésorerie`. **Correction :** « les flux de trésorerie ». Certitude : probable.
- `lng-en-voc cours[2]` : « ses **shareholders** (actionnaires), qui sont l'une de ses **stakeholders** ». **Correction :** « qui font partie de ses **stakeholders** (parties prenantes) ». Certitude : sûr.
- `lng-en-voc cours[6]` : `to make | fabriquer`. *Make* se traduit le plus souvent par « faire » (*make a decision*), ce qu'un vrai/faux généré peut marquer FAUX. **Correction :** `to make | faire, fabriquer` (et `to do | faire (une activité)`). Certitude : sûr.
- Jeu `lng-en-future-trou`, « I think it ____ (rain) tomorrow. » : seul « will rain » est accepté. **Correction :** ajouter `"alt": ["is going to rain"]`. Certitude : sûr.
- lng-en-grammar-ex : « L'essentiel » et `definitions.json` annoncent question tags, superlatif, voix passive et discours indirect, qui ne sont pas traités dans ce thème (hors chapitre). **Correction :** aligner « L'essentiel » sur le chapitre (a/an, -s, comparatif, some/any, much/many, this/these). Certitude : sûr.

### LNG-T-07 — Autres points d'espagnol (mineur)
- `lng-es-gram cours[6]` : « *salí, leí, oí* et *volví* restent réguliers ». *Leer* et *oír* changent à la 3e personne (*leyó, leyeron ; oyó, oyeron*). **Correction :** « … sont réguliers à la 1re personne (attention : *leyó*, *oyó*) ». Certitude : sûr.
- `lng-es-verbs cours[0]` : le titre annonce « racines e → ie, o → ue », mais aucun verbe en e → ie n'est donné. **Correction :** ajouter `querer (quiero, quiso)` ou `pensar (pienso, pensó)`, ou retirer « e → ie » du titre. Certitude : sûr.
- `lng-es-voc cours[0]` : « puis vient **el desayuno** (le petit-déjeuner), premier repas, **la comida** ». En Espagne, *la comida* désigne surtout le **déjeuner**. **Correction :** `la comida | le repas ; (en Espagne) le déjeuner`. Certitude : sûr (RAE, *comida*, sens 3).
- `lng-es-voc cours[7]` : `por fin | enfin`. Pour annoncer le dernier point d'un texte, on emploie *por último* ou *finalmente* ; *por fin* exprime le soulagement (« enfin ! »). **Correction :** `por último / finalmente | enfin (dernier point)` et `por fin | enfin ! (soulagement)`. Certitude : sûr.
- lng-es-grammar-ex : « L'essentiel » et `definitions.json` (concordancia, comparativo, superlativo, voz pasiva, estilo indirecto) ne correspondent pas au chapitre (hors chapitre). Certitude : sûr.

---

## 4. Langues — Première (`p1-langues`)

**Couverture.** J'ai relu les 3 thèmes en entier (p1-lng-en, p1-lng-es, p1-lng-axes), soit 6 chapitres, avec leurs jeux. Les 8 axes culturels (« Gestes fondateurs et mondes en mouvement ») sont exacts et dans l'ordre officiel, et les 6 activités langagières sont justes.

### LNG-P-01 — Texte à trous de Première : réponse trop stricte et question hors chapitre (mineur)
- **Où :** jeu `p1-lng-en-trou` (`p1-langues/matiere.json`), rattaché au chapitre « Les temps : prétérit ou present perfect ».
- **Problèmes :**
  1. « She ____ (work) here since 2020. » n'accepte que « has worked », alors que « has been working » est aussi correct.
  2. « They ____ (watch) TV when I arrived. » porte sur le *past continuous*, qui n'est pas enseigné dans le chapitre. « If it ____ (rain)… » relève du chapitre suivant.
- **Correction :**
  1. ajouter `"alt": ["has been working"]` ;
  2. ajouter le *past continuous* au cours (« was/were + V-ing : action en cours dans le passé ») ou remplacer l'item par un item preterit/present perfect.
- **Certitude :** sûr.

(Le point « have to » rangé parmi les modaux concerne aussi p1-lng-en : voir LNG-T-05.)


---

## Rapport — Vérification 5 — Première, matières de gestion (SGN, management, droit, économie) et fichiers communs

Relecture en lecture seule de la copie figée `/var/tmp/verif-contenu/app/content/`. Aucun fichier du dépôt n'a été modifié.

> État : relecture terminée. Tout le périmètre a été couvert (voir « Méthode et couverture »).

## Récapitulatif

| Matière | Bloquant | Important | Mineur | Total |
|---|---|---|---|---|
| SGN (`p1-sgn`) | 1 | 3 | 9 | 13 |
| Management (`p1-management`) | 0 | 1 | 3 | 4 |
| Droit (`p1-droit`) | 0 | 6 | 4 | 10 |
| Économie (`p1-economie`) | 1 | 3 | 7 | 11 |
| Communs (`epreuves`, `methodo`, `glossaire`, `definitions-matieres`) | 0 | 1 | 3 | 4 |
| **Total** | **2** | **14** | **26** | **42** |

`epreuves.json` : dates de la session 2027 vérifiées, sans erreur.

### Les problèmes les plus graves, par ordre de priorité
1. **ECO-1** (bloquant) — Économie t1 : l'utilité « décroissante » confond utilité totale et utilité marginale. Le vrai/faux « L'utilité d'un bien augmente à chaque unité consommée → FAUX » est faux, et le QCM l'est aussi.
2. **SGN-1** (bloquant) — SGN t3 : « Performance = atteindre ses objectifs » et « Efficacité = atteindre l'objectif fixé » sont indiscernables. Les QCM, l'association et le memory générés ont deux bonnes réponses.
3. **DRT-1** (important) — Droit t2, étude de documents de Sophie (3 000 €) : le corrigé annonce un appel, impossible en dessous de 5 000 € (art. R. 211-3-24 COJ). Il oublie aussi la tentative amiable obligatoire.
4. **DRT-3** (important) — Droit t2 : « la preuve doit être obtenue loyalement » est présentée comme absolue, alors que l'Assemblée plénière de la Cour de cassation a changé la règle le 22 décembre 2023.
5. **DRT-2** (important) — Droit t2 : la reconnaissance de dette « écrite et signée » est donnée comme preuve parfaite sans la mention manuscrite de la somme (art. 1376 C. civ.).
6. **DRT-4** (important) — Droit t2 : le « 1er degré », la CJUE et la CEDH sont présentés comme des voies de recours (essentiel, cours, flashcard).
7. **ECO-2 / ECO-3** (importants) — Économie : intitulés et découpage des thèmes 2 à 5 différents du programme officiel ; propensions moyenne et marginale à consommer et à épargner absentes.
8. **MGT-1** (important) — Management t2 : les faits du cas des boulangeries (« Forces = notoriété locale… ») deviennent des « définitions » dans les flashcards et les QCM.
9. **SGN-2 / SGN-3 / DRT-6** (importants) — Vrai/faux et « cas concrets » générés faux quand un tableau mêle une notion et ses sous-types : charge de personnel et coût du travail, biais et stéréotype, groupe et groupe formel, preuve parfaite et acte authentique, droit d'auteur et droit moral… Correction groupée : quelques lignes dans `commun/notions-liees.json`.
10. **DRT-5** (important) — Droit t3 : unicité, indivisibilité et universalité du patrimoine se recouvrent ; le QCM a deux réponses défendables.

Autres importants : SGN-4 (chiffre d'affaires classé en performance financière), ECO-4 (QCM « Un agent qui épargne a une… » : réponse devinable et notion inexacte), COM-1 (fiche Grand Oral à mettre à jour pour la voie technologique, session 2027, à vérifier).

## Méthode et couverture

- Contenu assemblé tel que l'élève le voit, avec `chargerTout`, `ALL_CHAPTERS`, `themeChapters` et `jeuxDuChapitre`. Scripts : `/tmp/claude-0/-home-user-NAH/b00c6cf6-33b6-5d76-a12d-45338d0a337c/scratchpad/verif/p1g/dump.mjs` (cours et exercices écrits à la main) et `/tmp/claude-0/-home-user-NAH/b00c6cf6-33b6-5d76-a12d-45338d0a337c/scratchpad/verif/p1g/paires.mjs` (paires notion → définition que le moteur transforme en QCM, vrai/faux, « cas concrets », associations, memory et flashcards). Les sorties sont dans le même dossier (`p1-*-cours.txt`, `p1-*-exos.txt`, `paires.txt`).
- Tout a été relu, thème par thème : le cours, l'intro, l'encadré « L'essentiel », les QCM, les vrai/faux, les tris, les remises en ordre, les associations, les flashcards, les textes à trous, les études de documents et les cas pratiques. Fichiers relus : `matiere.json`, `enrichissements.json`, `definitions.json`, `pieges.json`, `cas-pratiques.json`, `etudes-documents.json` et `exercices-sections.json` des quatre matières, plus `commun/glossaire.json`, `commun/definitions-matieres.json`, `commun/methodo.json`, `commun/epreuves.json` et `commun/notions-liees.json` (ce dernier est utile pour les corrections).
- Les exercices générés automatiquement à partir du cours ont été contrôlés à la source (les tableaux « Notions et définitions » et les puces « **terme** : définition »). Un défaut à cet endroit se répète dans plusieurs exercices.
- Calculs refaits : marges, valeur ajoutée, taux de marque, revenu disponible, taux d'épargne, taux de croissance, élasticité. Ils sont tous justes, sauf mention contraire.
- Sources officielles : eduscol, education.gouv.fr et legifrance ne répondent pas depuis ce poste (proxy 403, DNS). Seule la recherche web fonctionne. Les points vérifiés ainsi citent la page trouvée ; ceux qui restent incertains sont classés « à vérifier ».

Légende : **gravité** = bloquant (faux pour l'élève) / important / mineur ; **certitude** = sûr / probable / à vérifier.

---

## 1. Sciences de gestion et numérique (`p1-sgn`)

Thèmes : t1 « De l'individu à l'acteur » (23 chapitres), t2 « Numérique et intelligence collective » (11), t3 « Création de valeur et performance » (10), t4 « Temps et risque » (10). Le contenu est globalement juste et bien expliqué. Les problèmes viennent surtout des tableaux de définitions qui alimentent les exercices générés.

### SGN-1 — « Performance » et « Efficacité » ont presque la même définition : deux bonnes réponses
- **Thème** : p1-sgn-t3 « Création de valeur et performance », chapitre 6 « La performance : efficacité et efficience ».
- **Fichier** : `p1-sgn/matiere.json`, `chapters[p1-sgn-t3].cours[6]`, tableau « Notions et définitions ».
- **Citation** : « Performance | Atteindre ses objectifs » / « Efficacité | Atteindre l'objectif fixé ».
- **Problème** : les deux définitions sont interchangeables. Le moteur en tire le QCM « Que signifie « Performance » ? », dont un distracteur est « Atteindre l'objectif fixé » ; le « cas concret » « on observe : « Atteindre l'objectif fixé » », qui propose « Performance » comme mauvaise réponse ; et une association et un memory où l'élève ne peut pas distinguer les deux cartes. Le tableau contredit aussi le paragraphe juste au-dessus : « Une organisation performante est à la fois efficace ET efficiente ».
- **Correction** : `Performance | Atteindre ses objectifs (efficacité) en utilisant au mieux ses ressources (efficience)`.
- **Gravité** : bloquant. **Certitude** : sûr.

### SGN-2 — « Charge de personnel » et « Coût du travail » présentés comme des notions différentes
- **Thème** : p1-sgn-t1, chapitre 16 « L'activité humaine : charge de personnel ou capital humain ? ».
- **Fichier** : `p1-sgn/matiere.json`, `cours[16]`, tableau « Notions et définitions ».
- **Citation** : « Charge de personnel | Le travail comme coût à payer… » / « Coût du travail | Salaire brut + cotisations sociales patronales ».
- **Problème** : en comptabilité, les charges de personnel sont précisément les salaires bruts plus les cotisations patronales, c'est-à-dire le coût du travail. Le QCM « Cas concret — on observe : « Salaire brut + cotisations sociales patronales ». De quelle notion s'agit-il ? » attend « Coût du travail » mais propose « Charge de personnel » comme distracteur, alors que cette réponse est juste aussi.
- **Correction** : ajouter `["Charge de personnel", "Coût du travail"]` dans `commun/notions-liees.json` (le moteur n'oppose alors plus ces deux notions). Ou bien écrire `Charge de personnel | Vision comptable du travail : un coût à réduire (salaires bruts + cotisations patronales)`.
- **Gravité** : important. **Certitude** : sûr.

### SGN-3 — Vrai/faux générés faux quand un tableau mêle une notion générale et ses sous-types
- **Fichiers** : `p1-sgn/matiere.json`, tableaux « Notions et définitions » de :
  - t1 `cours[3]` (biais) : « Biais de perception | Erreur de jugement systématique » + Stéréotype, Effet de halo, Première impression, Projection, Effet de contexte ;
  - t1 `cours[19]` : « Groupe | Individus en interaction… » + Groupe formel, Groupe informel ;
  - t3 `cours[4]` : « Partie prenante | Acteur concerné… » + Parties prenantes internes / externes ;
  - t4 `cours[5]` : « Risque | Événement incertain… » + Risque financier, commercial, etc.
- **Problème** : le générateur de vrai/faux associe une notion à la définition d'une autre notion du même tableau et marque l'affirmation FAUX. On obtient par exemple « « Stéréotype » : Erreur de jugement systématique » → FAUX (un stéréotype est pourtant un biais, donc une erreur de jugement systématique) ; « « Groupe formel » : Individus en interaction, avec un but commun… » → FAUX (un groupe formel est un groupe) ; « « Partie prenante » : Clients, fournisseurs, banques… » → FAUX. Les « cas concrets » proposent ces mêmes notions comme distracteurs.
- **Correction** : ajouter dans `commun/notions-liees.json` les paires `["Biais de perception","Stéréotype"]`, `["Biais de perception","Effet de halo"]`, `["Biais de perception","Première impression"]`, `["Biais de perception","Projection"]`, `["Biais de perception","Effet de contexte"]`, `["Groupe","Groupe formel"]`, `["Groupe","Groupe informel"]`, `["Partie prenante","Parties prenantes internes"]`, `["Partie prenante","Parties prenantes externes"]`, `["Risque","Risque financier"]`, `["Risque","Risque commercial"]`, `["Risque","Risque humain / social"]`, `["Risque","Risque numérique"]`, `["Risque","Risque environnemental / juridique"]`.
- **Gravité** : important. **Certitude** : sûr (lu dans le code de `vraiFauxFromDefs` et `qcmFromPairs`, `src/data/index.js`).

### SGN-4 — Classement « Chiffre d'affaires → performance financière » discutable
- **Thème** : p1-sgn-t3, chapitre 8. **Fichiers** : `matiere.json`, jeu `p1-sgn-t3-tri` (item « Chiffre d'affaires » → `fin`) et `cours[8]` (« La performance financière se mesure par le résultat, la marge, le chiffre d'affaires et la rentabilité »).
- **Problème** : le chiffre d'affaires mesure le volume des ventes. La plupart des manuels de STMG en font un indicateur de performance **commerciale**, au même titre que la part de marché. L'élève qui le classe en « Commerciale » est sanctionné.
- **Correction** : remplacer l'item du tri par « Rentabilité » ou « Résultat net » ; dans le cours, ranger le chiffre d'affaires dans la performance commerciale (« … nombre de clients, chiffre d'affaires, part de marché… ») et garder résultat, marge et rentabilité pour la performance financière.
- **Gravité** : important. **Certitude** : probable.

### SGN-5 — La diversification rangée à la fois en « réduction » et en « transfert » du risque
- **Thème** : p1-sgn-t4, chapitres 7 « Anticiper et prévenir les risques » et 8 « Transférer et couvrir le risque ».
- **Citation** : `cours[7]` « Réduire l'exposition : demander un acompte, diversifier ses clients et fournisseurs » ; `cours[8]` « Certains risques ne peuvent qu'être transférés ou couverts : … la diversification ».
- **Problème** : diversifier ne transfère pas le risque à un tiers (comme le fait l'assurance). On le répartit et on le réduit. Les deux chapitres se contredisent.
- **Correction** : retirer la diversification de `cours[8]`, ou renommer le chapitre « Transférer, répartir et couvrir le risque » en précisant que « la diversification répartit le risque, elle ne le transfère pas ».
- **Gravité** : mineur. **Certitude** : sûr.

### SGN-6 — « Incertitude » : la définition n'en est pas une
- **Thème** : p1-sgn-t4, chapitre 1. **Fichier** : `cours[1]`, tableau.
- **Citation** : « Incertitude | Plus l'horizon est lointain, plus la décision est risquée ».
- **Problème** : c'est une relation, pas une définition, et elle devient « la définition d'Incertitude » dans les QCM, les flashcards et l'onglet Définitions.
- **Correction** : `Incertitude | Impossibilité de connaître à l'avance toutes les conséquences d'une décision ; elle augmente avec l'horizon`.
- **Gravité** : mineur. **Certitude** : sûr.

### SGN-7 — « Les stéréotypes sont interdits par la loi »
- **Thème** : p1-sgn-t1, chapitre 3. **Fichier** : `cours[3]`, bloc `warning`.
- **Citation** : « … sont des jugements faux et discriminatoires qui privent l'organisation de talents et sont interdits par la loi ».
- **Problème** : la loi n'interdit pas un jugement ou une opinion. Elle interdit la **discrimination**, c'est-à-dire le traitement défavorable fondé sur un critère prohibé (art. L1132-1 du Code du travail, art. 225-1 du Code pénal).
- **Correction** : « … sont des jugements faux qui peuvent conduire à des discriminations (à l'embauche, dans l'évaluation), lesquelles sont interdites par la loi ».
- **Gravité** : mineur. **Certitude** : sûr.

### SGN-8 — Style « laisser-faire » de Lewin assimilé au style délégatif
- **Thème** : p1-sgn-t1, chapitre 21. **Fichiers** : `cours[21]` et son tableau (« Style laisser-faire (Lewin) | Grande autonomie : efficace avec des experts, risqué sinon »).
- **Citation** : « Avec le style laisser-faire, ou délégatif, … c'est efficace avec une équipe experte ».
- **Problème** : dans les expériences de Lewin (1939), le laisser-faire est le style le moins efficace : le leader est absent et le groupe se désorganise. « Délégatif, efficace avec des experts » vient d'un autre modèle, le management situationnel de Hersey et Blanchard. Attribuer cela à Lewin mélange deux auteurs.
- **Correction** : « Avec le style laisser-faire, le leader intervient très peu : chez Lewin, c'est le style qui donne les moins bons résultats (désorganisation, faible productivité). Ne pas le confondre avec la délégation du management situationnel, qui suppose une équipe compétente et autonome. »
- **Gravité** : mineur. **Certitude** : probable.

### SGN-9 — Primes d'ancienneté classées dans la « part variable »
- **Thème** : p1-sgn-t1, chapitre 15. **Fichier** : `cours[15]` et tableau (« Primes / part variable | Liées à la performance, aux résultats, à l'ancienneté »).
- **Problème** : la prime d'ancienneté ne dépend ni de la performance ni des résultats. Ce n'est pas une rémunération variable.
- **Correction** : « S'y ajoutent les primes : certaines sont variables (liées à la performance, aux résultats), d'autres sont fixes (ancienneté, 13e mois). »
- **Gravité** : mineur. **Certitude** : sûr.

### SGN-10 — La qualification « situe l'individu dans l'organigramme »
- **Thème** : p1-sgn-t1, chapitre 14. **Fichier** : `cours[14]`.
- **Problème** : la qualification situe le salarié dans la **grille de classification** de la convention collective, et c'est elle qui fixe le salaire minimum. L'organigramme représente les liens hiérarchiques, pas les qualifications.
- **Correction** : « La qualification situe le salarié dans la grille de classification de la convention collective et sert de base à sa rémunération. »
- **Gravité** : mineur. **Certitude** : sûr.

### SGN-11 — Définition du système d'information et des indicateurs
- **Fichiers** : t2 `cours[3]`, tableau (« Système d'information (SI) | Organisation qui collecte, stocke, traite et diffuse l'information ») ; `p1-sgn/definitions.json`, p1-sgn-t3 (« Indicateur | Mesure chiffrée… »).
- **Problème** : le SI n'est pas une « organisation » : le paragraphe du cours le définit lui-même comme « l'ensemble organisé des ressources ». Et le cours (t3 `cours[7]`) admet des indicateurs qualitatifs, ce que contredit « mesure chiffrée ».
- **Correction** : `Système d'information (SI) | Ensemble organisé de ressources (matériels, logiciels, données, procédures, personnes) qui collecte, stocke, traite et diffuse l'information` ; `Indicateur | Mesure (chiffrée ou qualitative) servant à évaluer et piloter la performance`.
- **Gravité** : mineur. **Certitude** : sûr.

### SGN-12 — « Deux grandes théories sont au programme » (Maslow, Herzberg)
- **Thème** : p1-sgn-t1, chapitre 17. **Fichier** : `cours[17]`.
- **Problème** : je n'ai trouvé aucune source qui montre que le programme officiel de SGN nomme Maslow et Herzberg (le programme de 2019 cite des notions, pas des auteurs). Le contenu sur ces deux auteurs est juste.
- **Correction** : « Deux théories classiques permettent de l'analyser. »
- **Gravité** : mineur. **Certitude** : à vérifier.

### SGN-13 — Cas pratique non affiché, et notion absente du cours
- **Fichier** : `p1-sgn/cas-pratiques.json` (p1-sgn-t3 « Valeur créée et marge »).
- **Constat** : les calculs sont justes (marge 120 − 90 = 30 € ; taux de marque 30 / 120 = 25 %). Mais `exercices-sections.json` n'a pas de clé `p1-sgn-t3::cas`, donc le cas n'est rattaché à aucun chapitre et l'élève ne le voit pas (voir `themeChapters`). De plus, le « taux de marque » et le « coût de revient » n'apparaissent nulle part dans le cours du thème 3.
- **Correction** : si on le rattache (`"p1-sgn-t3::cas": 5`), ajouter au chapitre 5 « Coût, prix et marge » la formule `Taux de marque = marge / prix de vente HT × 100` ; sinon, retirer la question 2.
- **Gravité** : mineur. **Certitude** : sûr.

**SGN, relu sans autre problème** : t1 (personnalité, perception, émotions, attitude/comportement, statut/rôle, schéma de la communication à 8 éléments, registres, obstacles, communication formelle/informelle, prescrit/réel, compétences, compétence collective, rétribution, coût du travail = brut + cotisations patronales, Maslow, Herzberg, QVT, conflits) ; t2 (donnée → information → connaissance, qualité de l'information, SI, bases de données, PGI, DIC, RGPD 2018) ; t3 (valeurs, VA = production − CI, exemples chiffrés 900 − 560 = 340 €, 750 − 560 = 190 €, meuble 800 − 300 = 500 €) ; t4 (horizons, cycle de vie, cycle d'exploitation, types de risques). Les 16 + 4 + 5 + 4 QCM écrits à la main, les vrai/faux, les tris, les ordres (Maslow, donnée → décision), les associations, les flashcards et les textes à trous ont tous une bonne réponse juste.

---

## 2. Management (`p1-management`)

Thèmes : t1 « À la rencontre du management des organisations » (5 chapitres), t2 « Le management stratégique, du diagnostic à la fixation des objectifs » (6), t3 « Les choix stratégiques des organisations » (6). Le contenu est court mais juste : définition de l'organisation, finalités, trois formes d'organisations, PESTEL, micro-environnement, SWOT, stratégies de domaine et globales, DAS, intégration et externalisation. Tous les QCM, tris, ordres et flashcards écrits à la main sont justes.

### MGT-1 — Le cas des boulangeries (SWOT) présenté comme un tableau de définitions
- **Thème** : p1-mgmt-t2, chapitre 5 « 💼 Exemple traité — des boulangeries face à une grande enseigne : le SWOT ».
- **Fichier** : `p1-management/enrichissements.json` (section ajoutée au thème p1-mgmt-t2), tableau final `["Notion","Définition"]`.
- **Citation** : « Forces | Notoriété locale, qualité, savoir-faire » ; « Faiblesses | Peu de moyens financiers, peu digitalisée » ; « Opportunités | Goût pour le « fait maison », circuits courts » ; « Menaces | Concurrence de la grande enseigne… ».
- **Problème** : ce sont les faits du cas, pas des définitions. Comme l'en-tête est « Notion / Définition », le moteur les affiche dans l'onglet « Définitions » et en fait des flashcards (« Forces » → « Notoriété locale, qualité, savoir-faire »), un QCM « Que signifie « Forces » ? », un vrai/faux et un memory. L'élève apprend une fausse définition des forces et des faiblesses.
- **Correction** : remplacer l'en-tête par `["Élément du SWOT", "Dans le cas des boulangeries"]` (le moteur classe alors le tableau comme un cas et ne le transforme plus en définitions), ou donner de vraies définitions : `Forces | Atouts internes de l'organisation (ici : notoriété locale, qualité, savoir-faire)`, `Faiblesses | Points faibles internes (ici : peu de moyens financiers, faible présence numérique)`, `Opportunités | Évolutions externes favorables (ici : goût pour le fait maison, circuits courts)`, `Menaces | Évolutions externes défavorables (ici : arrivée d'une grande enseigne, hausse du coût des matières)`.
- **Gravité** : important. **Certitude** : sûr.

### MGT-2 — Domination par les coûts définie comme « proposer des prix plus bas »
- **Thème** : p1-mgmt-t3, chapitre 1. **Fichiers** : `matiere.json` `cours[1]` (« La domination par les coûts consiste à proposer des prix plus bas que les concurrents… ») et son tableau ; flashcard `p1-mgmt-t3-flash` ; `definitions.json` (« Stratégie visant les prix les plus bas grâce à des coûts réduits ») ; QCM `p1-mgmt-t3-qcm` (« Vendre moins cher que les concurrents grâce à des économies d'échelle »).
- **Problème** : la domination par les coûts consiste à obtenir des **coûts** plus bas que ceux des concurrents. Cela permet de baisser les prix, ou de garder des prix alignés avec une meilleure marge. Réduire la stratégie à un « prix bas » est une confusion classique que le correcteur sanctionne.
- **Correction** : `Domination par les coûts | Obtenir des coûts plus faibles que les concurrents (économies d'échelle, productivité, standardisation), ce qui permet de pratiquer des prix bas`.
- **Gravité** : mineur. **Certitude** : sûr.

### MGT-3 — Des puces d'exemples deviennent de fausses « notions » dans les exercices générés
- **Fichiers** : `matiere.json` p1-mgmt-t1 `cours[3]` (puces « **Parties prenantes** : … », « **Champ d'action** : … », « La **performance** se mesure selon la **finalité** : un profit pour l'entreprise… ») ; `enrichissements.json` p1-mgmt-t1, cas de l'association sportive (« **Type d'organisation** : c'est une organisation à but non lucratif… », « **Objectif** (précis, mesurable) : « organiser 4 tournois cette année » »).
- **Problème** : le format « terme : explication » fait de ces puces des paires notion → définition. On obtient « Que signifie « La performance se mesure selon la finalité » ? » ou « Que signifie « Objectif (précis, mesurable) » ? » → « « organiser 4 tournois cette année » » : un exemple donné comme définition.
- **Correction** : dans le cas, écrire « Objectif — exemple : « organiser 4 tournois cette année » (précis, chiffré, daté) » sans le gras sur le terme suivi de deux-points ; et reformuler la puce sur la performance en phrase : « La performance se mesure selon la finalité de l'organisation : … ».
- **Gravité** : mineur. **Certitude** : sûr.

### MGT-4 — Définitions rangées dans le mauvais thème ou divergentes
- **Fichier** : `p1-management/definitions.json`.
- **Constat** : « Domaine d'activité stratégique (DAS) » et « Avantage concurrentiel » sont rangés en p1-mgmt-t2, alors que le cours les enseigne en t3. La définition de « Intégration » (« Prendre le contrôle d'activités situées en amont ou en aval ») ne correspond pas à celle du cours t3 `cours[3]` (« réaliser soi-même une activité (la « faire ») »).
- **Correction** : déplacer les deux entrées vers p1-mgmt-t3 et aligner : `Intégration | Réaliser soi-même une activité, voire prendre le contrôle d'activités situées en amont ou en aval (fournisseurs, distribution)`.
- **Gravité** : mineur. **Certitude** : sûr.

---

## 3. Droit (`p1-droit`)

Thèmes : t1 « Qu'est-ce que le droit ? » (5 chapitres), t2 « Comment le droit permet-il de régler un litige ? » (6), t3 « Qui peut faire valoir ses droits ? » (4), t4 « Quels sont les droits reconnus aux personnes ? » (4). Ils suivent bien les quatre thèmes du programme de Première. Sont justes : la hiérarchie des normes (bloc de constitutionnalité > traités et droit de l'UE > lois > règlements), la QPC depuis 2010, les caractères de la règle de droit, l'acte et le fait juridique, les preuves parfaites et imparfaites, la preuve électronique (art. 1366 C. civ.), la mise en examen (« indices graves ou concordants »), le jugement et l'arrêt, l'animal « être vivant doué de sensibilité » depuis 2015 (art. 515-14 C. civ.), la sauvegarde de justice, la curatelle et la tutelle, l'usus, le fructus et l'abusus, les caractères de la propriété, le trouble anormal du voisinage (responsabilité sans faute), le droit d'auteur sans formalité et le droit moral perpétuel, l'art. 9 C. civ., le RGPD et la CNIL.

### DRT-1 — Litige de 3 000 € : le corrigé annonce un appel qui est impossible
- **Thème** : p1-droit-t2. **Fichier** : `p1-droit/etudes-documents.json`, étude « Le litige, la preuve et le procès » : document 4 (« Sophie a prêté 3 000 € à un ami… ») et question rédigée « Décris brièvement les étapes du procès civil que va suivre l'affaire de Sophie ».
- **Citation** : « Si l'une des parties n'est pas satisfaite, elle pourra faire **appel**, la cour d'appel rendant alors un **arrêt**. »
- **Problème** : pour une demande inférieure ou égale à 5 000 €, le tribunal judiciaire statue **en dernier ressort** (art. R. 211-3-24 du Code de l'organisation judiciaire). L'appel est irrecevable ; seul le pourvoi en cassation reste ouvert. De plus, pour une telle somme, une tentative préalable de règlement amiable (conciliation, médiation ou procédure participative) est obligatoire avant de saisir le juge (art. 750-1 du CPC, rétabli par le décret n° 2023-357 du 11 mai 2023).
- **Correction** (la plus simple) : porter le prêt à **8 000 €** dans le document 4 et dans le corrigé. Sinon, remplacer la dernière phrase du corrigé par : « Le litige portant sur 3 000 € (moins de 5 000 €), le tribunal judiciaire statue en dernier ressort : pas d'appel possible, seulement un pourvoi en cassation. Avant le procès, Sophie devra aussi tenter une conciliation ou une médiation. »
- **Gravité** : important. **Certitude** : sûr. **Source** : art. R. 211-3-24 COJ (seuil confirmé par CA Nîmes, 30 avril 2026, appel irrecevable pour 2 934 €, cité par kohenavocats.com) ; art. 750-1 CPC.

### DRT-2 — Reconnaissance de dette « écrite et signée » donnée comme preuve parfaite sans la mention de la somme
- **Thème** : p1-droit-t2. **Fichier** : `etudes-documents.json`, même étude : document 4, QCM « Grâce à sa reconnaissance de dette signée, Sophie dispose… » (réponse « d'une preuve parfaite (acte sous signature privée) ») et question rédigée « La reconnaissance de dette de Sophie a-t-elle plus de valeur… ».
- **Problème** : un engagement unilatéral de payer une somme d'argent ne fait preuve que s'il porte la signature du débiteur **et la mention, écrite par lui-même, de la somme en chiffres et en lettres** (art. 1376 C. civ.). Sans cette mention, ce n'est qu'un commencement de preuve par écrit. Le document ne précise pas cette mention, et le corrigé conclut à une preuve parfaite.
- **Correction** : document 4 : « Elle possède une reconnaissance de dette signée par lui, sur laquelle il a écrit de sa main la somme (« trois mille euros — 3 000 € ») » ; ajouter dans le corrigé : « … rédigée conformément à l'article 1376 du Code civil (signature et somme écrite en chiffres et en lettres) ».
- **Gravité** : important. **Certitude** : sûr. **Source** : art. 1376 du Code civil.

### DRT-3 — « La preuve doit être obtenue loyalement » : règle présentée comme absolue alors que la jurisprudence a changé
- **Thème** : p1-droit-t2, chapitre 1 « La preuve : charge, objet et modes ». **Fichiers** : `matiere.json` `cours[1]` (« La preuve doit porter sur l'objet du litige et être obtenue **loyalement** ») ; `etudes-documents.json`, document 1 (« La preuve doit être obtenue loyalement. »).
- **Problème** : depuis l'arrêt de l'Assemblée plénière de la Cour de cassation du 22 décembre 2023 (n° 20-20.648), en matière civile, une preuve obtenue de façon déloyale ou illicite n'est plus écartée d'office. Le juge l'admet si elle est indispensable à l'exercice du droit à la preuve et si l'atteinte aux autres droits est proportionnée.
- **Correction** : « En principe, la preuve doit être obtenue loyalement. Depuis 2023, le juge civil peut toutefois admettre une preuve obtenue de façon déloyale si elle est indispensable pour prouver son droit et si l'atteinte aux droits de l'autre partie reste proportionnée. »
- **Gravité** : important. **Certitude** : sûr. **Source** : Cass. ass. plén., 22 déc. 2023, n° 20-20.648.

### DRT-4 — Le « premier degré », la CJUE et la CEDH présentés comme des voies de recours
- **Thème** : p1-droit-t2, chapitre 4. **Fichiers** : `matiere.json`, `essentiel` de p1-droit-t2 (« voies de recours : **1er degré → appel → pourvoi en cassation** (+ CJUE, CEDH) ») ; `cours[4]` (« Une décision de justice peut être contestée par les voies de recours : • premier degré : le tribunal juge l'affaire… ») ; flashcard `p1-droit-t2-flash` « [Voies de recours] => 1er degré → appel → pourvoi en cassation ».
- **Problème** : le jugement de premier degré est la décision que l'on conteste, pas un moyen de la contester. La CJUE ne peut pas être saisie par un justiciable contre un jugement français : c'est le juge national qui lui pose une question préjudicielle. La CEDH est saisie après épuisement des voies de recours internes, et elle n'annule pas la décision française. Un élève qui écrit « faire appel devant la CJUE » serait sanctionné.
- **Correction** : essentiel : « Deux ordres (**judiciaire** civil/pénal, **administratif**) ; décision de **premier degré**, puis voies de recours : **appel** (cour d'appel, faits + droit) → **pourvoi en cassation** (droit seulement). Au-delà : CEDH (après épuisement des recours internes) ; la CJUE répond aux questions des juges nationaux. » Dans `cours[4]` : « Le tribunal juge d'abord l'affaire en premier degré (faits et droit). Sa décision peut ensuite être contestée par les voies de recours : … ».
- **Gravité** : important. **Certitude** : sûr.

### DRT-5 — Principes du patrimoine : unicité, indivisibilité et universalité se recouvrent, ce qui rend le QCM ambigu
- **Thème** : p1-droit-t3, chapitre 2. **Fichiers** : `matiere.json` `cours[2]` (« unicité : toute personne a un patrimoine et un seul » ; « universalité : l'actif répond du passif » ; « indivisibilité : le patrimoine forme un tout ») ; QCM `p1-droit-t3-qcm` « Le principe selon lequel chaque personne n'a qu'un seul patrimoine est… », dont un distracteur est « l'indivisibilité ».
- **Problème** : dans la théorie classique (Aubry et Rau), « unicité » et « indivisibilité » désignent le même principe : une personne n'a qu'un patrimoine. Et « le patrimoine forme un tout » est justement ce qu'exprime l'universalité. Le QCM a donc deux réponses défendables. Les vrai/faux et « cas concrets » générés (par exemple « « unicité » : le patrimoine forme un tout » → FAUX) piègent l'élève qui a appris avec un autre manuel.
- **Correction** : `unicité (ou indivisibilité) : toute personne a un patrimoine et un seul` ; `universalité : le patrimoine forme un tout où l'actif répond du passif` ; supprimer la puce « indivisibilité » ; dans le QCM, remplacer le distracteur « l'indivisibilité » par « l'insaisissabilité ». Mettre aussi à jour la flashcard `p1-droit-t3-flash` (« Unicité, universalité, indivisibilité, incessibilité »).
- **Gravité** : important. **Certitude** : probable.

### DRT-6 — Vrai/faux générés faux (notion générale contre notion particulière)
- **Fichiers** : `matiere.json`, tableaux « Notions et définitions » de p1-droit-t2 `cours[1]` (Preuve parfaite / Acte authentique / Acte sous signature privée) et p1-droit-t4 `cours[1]` (Droit d'auteur / Droit moral / Droits patrimoniaux (d'auteur)).
- **Problème** : le générateur produit par exemple « « Acte authentique » : Valeur fixée par la loi, s'impose au juge (acte authentique, …) » → FAUX, alors que c'est vrai : l'acte authentique est une preuve parfaite. De même, « « Droit d'auteur » : Exploiter l'œuvre et en tirer des revenus, pour une durée limitée » → FAUX, alors que le droit d'auteur comprend ces droits patrimoniaux. Les « cas concrets » proposent ces notions comme mauvaises réponses.
- **Correction** : ajouter dans `commun/notions-liees.json` les paires `["Preuve parfaite","Acte authentique"]`, `["Preuve parfaite","Acte sous signature privée"]`, `["Droit d'auteur","Droit moral"]`, `["Droit d'auteur","Droits patrimoniaux (d'auteur)"]`.
- **Gravité** : important. **Certitude** : sûr.

### DRT-7 — « L'usufruit » comme mauvaise réponse à « percevoir les revenus d'un bien »
- **Thème** : p1-droit-t4. **Fichier** : `etudes-documents.json`, étude « Propriété, création et vie privée », première question (choix « le fructus », « l'usus », « l'abusus », « l'usufruit »).
- **Problème** : l'usufruit, c'est l'usus plus le fructus, c'est-à-dire le droit d'utiliser le bien **et d'en percevoir les revenus**. Le distracteur est donc en partie juste. Le QCM `p1-droit-t4-qcm` a « l'usufruit du voisin », formule étrange mais clairement fausse.
- **Correction** : remplacer « l'usufruit » par « la servitude » (dans les deux QCM).
- **Gravité** : mineur. **Certitude** : sûr.

### DRT-8 — Domicile présenté comme un élément d'état civil
- **Thème** : p1-droit-t3, chapitre 0. **Fichier** : `matiere.json` `cours[0]`.
- **Citation** : « Toute personne est identifiée par des éléments d'état civil : notamment un nom et un domicile ».
- **Problème** : le domicile est un élément d'identification de la personne, mais il ne relève pas de l'état civil (nom, prénoms, sexe, date et lieu de naissance, filiation, situation matrimoniale). La phrase s'applique en outre à « toute personne » alors que l'état civil ne concerne que les personnes physiques.
- **Correction** : « Toute personne physique est identifiée par son nom, ses prénoms, son domicile (lieu de son principal établissement) et son état civil (date et lieu de naissance, filiation, situation familiale). »
- **Gravité** : mineur. **Certitude** : sûr.

### DRT-9 — Patrimoine d'affectation de l'entrepreneur individuel : présentation antérieure à 2022
- **Thème** : p1-droit-t3, chapitre 2. **Fichiers** : `matiere.json` `cours[2]` (« une personne peut isoler certains biens pour une activité (ex. l'entrepreneur individuel) ») ; `etudes-documents.json`, corrigé « Qu'est-ce que le patrimoine ? ».
- **Problème** : depuis le 15 mai 2022 (loi n° 2022-172 du 14 février 2022), l'entrepreneur individuel a **automatiquement** deux patrimoines, l'un professionnel et l'autre personnel ; il n'a plus à « isoler » ses biens par un choix (l'EIRL est fermée aux nouvelles créations). La phrase laisse croire qu'il s'agit d'une option.
- **Correction** : « Par exception, la loi admet des patrimoines séparés : depuis le 15 mai 2022, l'entrepreneur individuel a automatiquement un patrimoine professionnel distinct de son patrimoine personnel, ce qui protège ses biens personnels. »
- **Gravité** : mineur. **Certitude** : probable.

### DRT-10 — Des puces de cas deviennent de fausses notions
- **Fichier** : `p1-droit/enrichissements.json` : p1-droit-t4, cas « une maison et une vie privée » (« Les seconds sont **incessibles** : on ne peut pas les vendre ») ; p1-droit-t3, cas « créer une société » (« **Capacité** : à 25 ans, elle est majeure et capable → elle peut contracter seule »).
- **Problème** : le moteur crée les notions « Les seconds sont incessibles » et « Capacité » (avec « à 25 ans… » comme définition). Hors contexte, cela donne des questions incompréhensibles ou fausses (« Que signifie « Les seconds sont incessibles » ? »).
- **Correction** : « Les droits extrapatrimoniaux sont **incessibles** : on ne peut pas les vendre. » et « **Capacité juridique** : aptitude à avoir des droits et à les exercer ; ici, à 25 ans, elle est majeure et capable, elle peut contracter seule. »
- **Gravité** : mineur. **Certitude** : sûr.

**Remarques sans correction obligatoire** : le cours ne présente pas la règle « preuve libre des faits juridiques / preuve écrite des actes juridiques au-delà de 1 500 € » (art. 1359 C. civ.) ni les modes amiables autres que la négociation, la médiation et la conciliation (l'arbitrage et la transaction manquent). Ces notions font partie du thème 2 dans la plupart des manuels ; elles sont à ajouter si l'on veut couvrir tout le programme.

---

## 4. Économie (`p1-economie`)

Thèmes de l'application : t1 « Les grandes questions économiques » (8 chapitres), t2 « Comment crée-t-on des richesses et comment les mesure-t-on ? » (8), t3 « Comment répartir les revenus et la richesse ? » (8), t4 « Comment les agents économiques se financent-ils ? » (8), t5 « Les marchés sont-ils concurrentiels ? » (9). Les mécanismes sont bien expliqués : rareté et coût d'opportunité, circuit économique, production marchande et non marchande, VA, limites du PIB, revenus primaires, redistribution, revenu disponible, besoin et capacité de financement, actions et obligations, création monétaire (« les crédits font les dépôts »), taux directeurs de la BCE, offre et demande, élasticité, coût marginal, CPP, monopole, oligopole, concurrence monopolistique, asymétries d'information. Calculs refaits et justes : VA 300 000 − 110 000 = 190 000 € ; 300 000 − 90 000 = 210 000 € ; 20 000 − 7 000 = 13 000 € ; revenu disponible 3 000 − 800 + 200 = 2 400 € et 2 800 − 600 + 200 = 2 400 € ; taux d'épargne 400 / 2 500 = 16 % et 300 / 2 400 = 12,5 % ; croissance (2 550 − 2 500) / 2 500 = 2 % ; élasticité −15 / 5 = −3.

### ECO-1 — Confusion entre utilité totale et utilité marginale (le vrai/faux est faux)
- **Thème** : p1-eco-t1, chapitre 3 « L'utilité et le comportement du consommateur ».
- **Fichier** : `p1-economie/matiere.json` :
  - `cours[3]` : « L'utilité est **décroissante** : chaque unité supplémentaire d'un même bien procure **moins** de satisfaction que la précédente » ;
  - `essentiel` : « Le consommateur maximise son utilité (décroissante) » ;
  - QCM `p1-eco-t1-qcm` : « L'utilité procurée par la consommation est… » → « décroissante » (distracteur « toujours croissante ») ;
  - vrai/faux `p1-eco-t1-vf` : « L'utilité d'un bien augmente à chaque unité consommée. » → **FAUX** (« l'utilité est décroissante ») ;
  - flashcard `p1-eco-t1-flash` « [Utilité décroissante] ».
- **Problème** : c'est l'utilité **marginale** (celle de l'unité supplémentaire) qui décroît. L'utilité **totale** augmente à chaque unité tant que l'utilité marginale reste positive (elle croît de moins en moins vite). L'affirmation du vrai/faux est donc **vraie** pour l'utilité totale, et la réponse attendue est fausse. Le QCM est faux lui aussi. Cela contredit l'étude de documents du même niveau (`etudes-documents.json`, p1-eco-t5, document 4 : « la valeur ne dépend pas de l'utilité totale d'un bien, mais de son utilité marginale »).
- **Correction** : cours : « L'**utilité marginale** est décroissante : chaque unité supplémentaire procure moins de satisfaction que la précédente (l'utilité totale augmente, mais de moins en moins vite). » ; essentiel : « … maximise son utilité (dont l'**utilité marginale** est décroissante)… » ; QCM : « L'utilité apportée par chaque unité supplémentaire consommée (utilité marginale) est… » → « décroissante » ; vrai/faux : « La satisfaction apportée par chaque unité supplémentaire augmente à mesure qu'on consomme. » → FAUX, explication « l'utilité marginale est décroissante » ; flashcard « Utilité marginale décroissante ».
- **Gravité** : bloquant. **Certitude** : sûr.

### ECO-2 — Découpage et intitulés des thèmes différents du programme officiel
- **Fichier** : `p1-economie/matiere.json`, champs `name` des thèmes.
- **Constat** : selon l'annexe « Droit et économie » du programme de Première STMG (2019), les cinq thèmes sont : 1 « Quelles sont les grandes questions économiques et leurs enjeux actuels ? » ; 2 « Comment la richesse se crée-t-elle et se répartit-elle ? » ; 3 « Comment les ménages décident-ils d'affecter leur revenu ? » ; 4 « Quels modes de financement de l'activité économique ? » ; 5 « Les marchés des biens et services sont-ils concurrentiels ? ». Dans l'application, la répartition (revenus primaires, redistribution) est au thème 3 au lieu du thème 2, et le thème 3 porte un intitulé (« Comment répartir les revenus et la richesse ? ») qui n'existe pas au programme. L'élève qui révise « le thème 3 » vu en classe ne retrouve pas le même contenu.
- **Correction** : reprendre les intitulés officiels. Déplacer les chapitres « répartition primaire », « revenus primaires » et « redistribution » vers t2 ; faire de t3 « Comment les ménages décident-ils d'affecter leur revenu ? » (revenu disponible, consommation et épargne, pouvoir d'achat, patrimoine).
- **Gravité** : important. **Certitude** : probable (intitulés relevés par recherche web dans l'annexe officielle publiée par le SNES, `snes.edu/IMG/pdf/stmg_annexe-1_droit_et_economie_bo.pdf`, et sur eduscol ; je n'ai pas pu ouvrir le PDF lui-même).

### ECO-3 — Notions exigibles absentes : propensions à consommer et à épargner ; monnaie et ses fonctions
- **Thèmes** : p1-eco-t3 (chapitre « Consommer ou épargner ») et p1-eco-t1 ou t4.
- **Constat** : la fiche eduscol du thème 3 demande de « calculer et interpréter les propensions moyenne et marginale à consommer et à épargner ». Le cours ne présente que le taux d'épargne. La monnaie et ses trois fonctions (intermédiaire des échanges, unité de compte, réserve de valeur) figurent, selon une fiche citant le programme de 2019, dans le thème 1 (I.3) ; elles sont absentes de l'application, qui ne traite que de la création monétaire.
- **Correction** : ajouter au chapitre « Consommer ou épargner » : `PMC = C / RD ; PMS = E / RD ; PMC + PMS = 1 ; propension marginale à consommer = ΔC / ΔRD`, avec un exemple chiffré (RD 2 500 €, C 2 100 € → PMC = 0,84, PMS = 0,16) ; ajouter une section « La monnaie et ses fonctions ».
- **Gravité** : important. **Certitude** : probable pour les propensions (eduscol, cité par lafinancepourtous.com et nomadeducation.fr) ; à vérifier pour la monnaie (citeco.fr, « STMG 1ERE 2 »).

### ECO-4 — QCM « Un agent qui épargne a une… » : réponse devinable et notion inexacte
- **Thème** : p1-eco-t4, chapitre 0. **Fichier** : `matiere.json`, QCM `p1-eco-t4-qcm`, question 1 (choix « capacité de financement », « besoin de financement », « dette obligatoire », « obligation légale ») ; voir aussi la flashcard `p1-eco-t4-flash` « [Besoin / capacité de financement] => Dépenser plus que gagner / épargner ».
- **Problème** : (1) « a une… besoin de financement » ne s'accorde pas, ce qui donne la réponse ; (2) épargner ne suffit pas pour avoir une capacité de financement : il faut que l'épargne dépasse l'investissement (un ménage qui épargne mais achète un logement à crédit est en besoin de financement). Le cours lui-même parle de « ressources > dépenses ».
- **Correction** : « Un agent dont l'épargne dépasse ses dépenses d'investissement dégage… » → « une capacité de financement » / « un besoin de financement » / « un découvert » / « une dette » ; flashcard : « Dépenses > ressources (il faut emprunter) / ressources > dépenses (épargne disponible à prêter) ».
- **Gravité** : important. **Certitude** : sûr.

### ECO-5 — Secteurs institutionnels : « six catégories » d'un côté, cinq agents de l'autre
- **Thème** : p1-eco-t1, chapitre 5. **Fichiers** : `matiere.json` `cours[5]` (« La comptabilité nationale les regroupe en **six** grandes catégories (les secteurs institutionnels) », avec le reste du monde) ; `essentiel` et flashcard (« Ménages, entreprises, banques, administrations, reste du monde », sans ISBLSM) ; `etudes-documents.json` p1-eco-t1, document 3 (même liste à cinq).
- **Problème** : les trois passages se contredisent. En comptabilité nationale, il y a **cinq secteurs institutionnels résidents** (SNF, sociétés financières, APU, ménages, ISBLSM) **plus** le reste du monde, qui n'est pas un secteur résident.
- **Correction** : « La comptabilité nationale distingue cinq secteurs institutionnels résidents (ménages, sociétés non financières, sociétés financières, administrations publiques, ISBLSM) et le reste du monde » ; ajouter les ISBLSM dans l'essentiel et la flashcard.
- **Gravité** : mineur. **Certitude** : sûr.

### ECO-6 — « PIB = somme des valeurs ajoutées » présenté comme une égalité exacte
- **Thème** : p1-eco-t2, chapitre 4. **Fichiers** : `matiere.json` `cours[4]` (bloc `formula`), `essentiel`, QCM et flashcards ; `definitions.json`.
- **Problème** : selon l'Insee, PIB = somme des valeurs ajoutées brutes + impôts sur les produits (dont la TVA) − subventions sur les produits. La simplification est courante, mais la formule est donnée comme exacte.
- **Correction** : `PIB = somme des valeurs ajoutées + impôts sur les produits (TVA…) − subventions sur les produits`, avec une phrase : « en première approche, le PIB est la somme des valeurs ajoutées ».
- **Gravité** : mineur. **Certitude** : sûr. **Source** : définition du PIB sur insee.fr.

### ECO-7 — Facteur capital défini comme « durable », puis capital circulant « consommé »
- **Thème** : p1-eco-t2, chapitre 1. **Fichier** : `matiere.json` `cours[1]` et tableau.
- **Citation** : « Le facteur capital correspond aux moyens matériels durables… » puis « … du capital circulant (matières premières, consommées dans la production) ».
- **Problème** : contradiction interne : le capital circulant n'est pas durable.
- **Correction** : « Le facteur capital regroupe les moyens de production : le capital fixe (machines, bâtiments, logiciels, utilisés pendant plusieurs cycles) et le capital circulant (matières premières, énergie, détruits au cours de la production). »
- **Gravité** : mineur. **Certitude** : sûr.

### ECO-8 — Définition ambiguë du revenu disponible
- **Fichier** : `p1-economie/definitions.json`, p1-eco-t3.
- **Citation** : « Revenu disponible | Revenu restant après impôts et prestations… ».
- **Problème** : « après prestations » laisse croire que les prestations sont retirées, alors qu'elles s'ajoutent.
- **Correction** : `Revenu disponible | Revenus primaires − prélèvements obligatoires + revenus de transfert : ce qui reste pour consommer ou épargner`.
- **Gravité** : mineur. **Certitude** : sûr.

### ECO-9 — Fautes de formulation dans les QCM
- **Fichiers** : `matiere.json` QCM `p1-eco-t3-qcm` (« La redistribution consiste à… prélever des prélèvements obligatoires et verser… ») et `etudes-documents.json` p1-eco-t3 (même formule) ; vrai/faux `p1-eco-t5-vf` (« Faux : elle est peu élastique (on l'achète quel que soit le prix) »).
- **Problème** : « prélever des prélèvements » est un pléonasme. Et une demande peu élastique n'est pas indépendante du prix : « quel que soit le prix » décrit une demande parfaitement inélastique.
- **Correction** : « opérer des prélèvements obligatoires et verser des revenus de transfert » ; « elle est peu élastique : même si le prix augmente, on continue d'en acheter presque autant ».
- **Gravité** : mineur. **Certitude** : sûr.

### ECO-10 — Cas pratiques jamais affichés
- **Fichier** : `p1-economie/cas-pratiques.json` (p1-eco-t2 « Créer et mesurer la richesse », p1-eco-t5 « Le marché et l'élasticité »).
- **Constat** : les calculs sont justes (190 000 € ; 2 % ; −3 ; « élastique »). Mais `exercices-sections.json` n'a pas de clés `p1-eco-t2::cas` ni `p1-eco-t5::cas` : ces cas ne sont rattachés à aucun chapitre et l'élève ne les voit pas. Les thèmes contiennent des formules chiffrées sans exercice de calcul à saisir.
- **Correction** : ajouter `"p1-eco-t2::cas": 7` (chapitre « Exemple chiffré — une boulangerie ») et `"p1-eco-t5::cas": 3` (chapitre « L'élasticité-prix de la demande ») dans `exercices-sections.json`.
- **Gravité** : mineur. **Certitude** : sûr.

### ECO-11 — Redites et chiffres voisins qui peuvent troubler
- **Fichiers** : `matiere.json` p1-eco-t3 `cours[1]` : le paragraphe sur les revenus mixtes est dit deux fois de suite (« Les revenus mixtes rémunèrent à la fois le travail et le capital… » puis « Les revenus mixtes concernent les indépendants… impossible de séparer les deux »). Ailleurs, la même boulangerie qui produit 300 000 € a 110 000 € de consommations intermédiaires dans le cas du chapitre 7 et 90 000 € dans le QCM `p1-eco-t2-qcm`.
- **Correction** : supprimer le second paragraphe ; dans le QCM, prendre un autre exemple (« Un garage produit 300 000 € en consommant 90 000 €… »).
- **Gravité** : mineur. **Certitude** : sûr.

---

## 5. Fichiers communs

### `commun/epreuves.json` — aucune erreur trouvée
Dates vérifiées pour la session 2027 : philosophie le lundi 14 juin ; français écrit anticipé le mardi 15 juin ; spécialités de la voie technologique les 16 et 17 juin ; mathématiques anticipées le lundi 21 juin ; Grand oral du 21 juin au 2 juillet ; oral de français fixé par l'académie. La référence au BO spécial n° 2 du 25 août 2026 est cohérente avec les annexes publiées sur education.gouv.fr (« annexe IV session 2027 calendrier des épreuves écrites du baccalauréat technologique ») et avec eduscol (« Dates des examens 2027 »). Rien à corriger.

### COM-1 — Fiche « Grand Oral » de `methodo.json` à mettre à jour pour la voie technologique (session 2027)
- **Fichier** : `commun/methodo.json`, entrée `id: "grand-oral"` (intro « Une présentation de 10 minutes, sans notes… puis 10 minutes d'échange » ; étape « Pourquoi cette question : Explique pourquoi tu as choisi cette question… »).
- **Constat** : une note de service publiée au BO spécial n° 4 du 17 septembre 2026 (NOR MENE2622701N) fixe de nouvelles modalités du Grand oral du **baccalauréat technologique** à partir de la session 2027 : 20 minutes de préparation, 20 minutes d'épreuve, coefficient **12** (et non plus 14). Le candidat présente **deux questions** et le jury en retient une. La fiche ne parle que d'« une » question choisie par le candidat, qu'il doit justifier en début d'exposé. Je n'ai pas pu lire le détail du déroulement (temps de l'exposé, notes autorisées) dans le texte officiel.
- **Correction** : relire la note MENE2622701N et adapter l'intro et l'étape 2 (par exemple « Tu prépares deux questions ; le jury en choisit une : sois prêt à présenter l'une ou l'autre »). Vérifier aussi le coefficient affiché ailleurs dans l'application (`grand-oral.json`, hors de mon périmètre).
- **Gravité** : important. **Certitude** : à vérifier. **Source** : education.gouv.fr/bo/2026/Special4/MENE2622701N (trouvée par recherche, page non ouverte) ; ent2d.ac-bordeaux.fr, « Grand oral du baccalauréat technologique : nouvelles modalités à compter de la session 2027 » (25 septembre 2026).

### COM-2 — Méthode du cas pratique juridique : cas de rupture anticipée du CDD incomplets
- **Fichier** : `commun/methodo.json`, entrée `cas-droit`, `example.c`.
- **Citation** : « Règle : un CDD ne peut être rompu par anticipation que dans des cas limités (faute grave, force majeure, accord des parties) ».
- **Problème** : la liste semble exhaustive alors qu'il manque l'inaptitude constatée par le médecin du travail (art. L1243-1 C. trav.) et la rupture à l'initiative du salarié qui justifie d'une embauche en CDI (art. L1243-2). La conclusion (dommages-intérêts) est juste : au moins les rémunérations jusqu'au terme (art. L1243-4).
- **Correction** : « … que dans des cas limités : accord des parties, faute grave, force majeure, inaptitude constatée par le médecin du travail, ou embauche du salarié en CDI (art. L1243-1 et L1243-2 du Code du travail). »
- **Gravité** : mineur. **Certitude** : sûr.

### COM-3 — Glossaire : traductions qui induisent en erreur dans le vocabulaire de gestion
- **Fichier** : `commun/glossaire.json`.
- **Constat** : « chiffre d'affaires » → « turnover ». C'est un usage britannique, mais en français de gestion « turnover » désigne la rotation du personnel, et le cours de SGN t3 l'emploie dans ce sens (« Le turnover est un indicateur de performance sociale »). « trésorerie » → « cash flow » : le cash flow, ce sont les flux de trésorerie ; la trésorerie, c'est « cash » ou « cash position ». « peu » → « few » : traduction incomplète (« little / not much »).
- **Correction** : `"chiffre d'affaires" → "revenue / sales (UK: turnover)"` ; `"trésorerie" → "cash"` ; `"peu" → "little / few"`.
- **Gravité** : mineur. **Certitude** : sûr.

### COM-4 — `definitions-matieres.json` : « Produit = recette » ; fichier apparemment inutilisé
- **Fichier** : `commun/definitions-matieres.json`, `gestion-finance`.
- **Constat** : « Produit | Recette de l'exercice, qui augmente le résultat » confond produit (notion comptable : richesse acquise sur l'exercice) et recette (encaissement). Par ailleurs, la fonction `subjectFallbackFor` (`src/data/keyterms.js`) qui lit ce fichier n'est appelée nulle part dans `src/` : le fichier ne semble pas affiché.
- **Correction** : `Produit | Ressource acquise sur l'exercice (ventes, prestations…), qui augmente le résultat`.
- **Gravité** : mineur. **Certitude** : sûr pour la définition, probable pour le fait que le fichier n'est pas utilisé.

`commun/methodo.json` (étude de cas, question de gestion, raisonnement A-E-I) : rien d'autre à signaler.
