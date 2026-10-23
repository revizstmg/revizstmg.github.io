# Relecture des manuels anglais, espagnol et italien
Date : 24 octobre 2026 (Europe/Paris). État publié PR #96. Aucun fichier du dépôt modifié par cet agent.

## Couverture

Relecture de 75 leçons, leurs lexiques et de 318 énoncés, réponses, choix et justifications : EN 24/110, ES 25/122, IT 26/86. Contextes de compréhension, sections pratiques et méthodes relus. Extraction textuelle des trois PDF (148 pages). Inspection visuelle de six pages : EN 3/11, ES 15/39, IT 16/34 ; planche /workspace/work/audit-langues-planche.png. L’intégrité des cinq PDF et les liens HTTP sont contrôlés par le parent pour éviter les doublons. Cette relecture ne constitue pas une certification native ni une comparaison exhaustive au programme officiel.

Les remplacements exacts (34 champs/ajouts, avec texte avant/après et justification) sont disponibles dans /workspace/work/audit-pdf-en-es-it-remplacements.json. Les deux séries de consignes erronées ci-dessous ont déjà été corrigées par le parent. La lecture prévue est terminée.

## Erreurs et incohérences confirmées

### 1. Traduction demandée, conjugaison donnée — haute

EN p15–16, en-ex-031 à 036 : « Donne le sens en français de : go/see/take/write/speak/break », mais réponses gone/seen/taken/written/spoken/broken. Le corrigé affirme de fausses correspondances lexicales. Demander explicitement le participe passé et expliquer les trois formes.

ES p17–18, es-ex-047 à 052 : « Donne le sens en français de : ser/ir ; tener ; hacer ; estar ; poder ; decir », mais réponses fui/tuve/hice/estuve/pude/dije. Demander la première personne du singulier au prétérit (indefinido), en explicitant le sujet. Ces 12 cas sont pris en charge par le parent.

### 2. Article devant STMG — moyenne

EN p3, en-pratique-7 §0 et sections[7].text : « I’m a STMG student » doit être « I’m an STMG student ». Le sigle épelé commence par le son vocalique /es/. Correction exacte dans le JSON.

### 3. Modaux : règle contradictoire — haute

EN p5 et p10–11, p1-langues-p1-lng-en-1 §0, langues-lng-en-gram-3 §2 et lexique « Modal + base verbale ». Le cours inclut have to et ought to puis annonce « toujours sans to ». Distinguer les modaux centraux, suivis de la base sans to, de ought to + base et have/has/had to + base. Il faut corriger aussi le tableau, pas seulement le paragraphe. Formulations complètes dans le JSON.

### 4. Marqueurs temporels mécaniques — moyenne

EN p4, p1-langues-p1-lng-en-0 §2 : « une date précise impose le preterit ; for/since/ever/already/yet appellent le present perfect ». Contre-exemple : I worked there for two years, then I left. Une date peut aussi accompagner un past continuous. Expliquer période passée achevée et situation encore liée au présent ; les marqueurs ne choisissent pas un temps à eux seuls.

### 5. Prétérit « sans lien avec le présent » — moyenne

EN p7, langues-lng-en-gram-1 §1. Une action au prétérit peut avoir une conséquence actuelle : la jambe cassée hier peut encore être cassée aujourd’hui. Parler d’un événement situé dans une période passée achevée, sans nier toute conséquence présente.

### 6. Mauvaise famille de verbes — moyenne

EN p14, langues-lng-en-gram-5 §1 : run–ran–run est classé dans la famille i–a–u avec begin/drink/sing. Ses formes sont correctes, son classement est faux. Présenter run séparément.

### 7. Cash flow : correction incomplète — haute

EN p20, langues-lng-en-voc-2 §1 : « cash flow (la trésorerie) » subsiste, alors que lexique et exercice donnent flux de trésorerie. Harmoniser en « les flux de trésorerie, à distinguer du solde disponible ».

### 8. Compréhension : deux inférences trop affirmatives — moyenne

EN p32, en-ex-072 : « What did she buy with her money? », alors que le texte dit qu’Emma a gagné assez pour acheter un ordinateur, sans dire qu’elle l’a acheté. Demander « What did Emma earn enough money to buy? » ; réponse A laptop inchangée.

EN p32, en-ex-070 : « How does the customer pay? », alors que le dialogue montre une demande autorisée. Demander « What payment method does the customer ask to use? » ; réponse By card inchangée. Ajuster les justifications. Le JSON contient les formulations.

### 9. Past continuous attendu sans règle dans la leçon — moyenne

EN p4, en-ex-002 : They ____ (watch) TV when I arrived → were watching, rattaché à p1-langues-p1-lng-en-0. Le cours explique present continuous/prétérit/present perfect mais pas was/were + V-ing. Ajouter le paragraphe fourni dans cette même leçon pour rendre l’exercice autonome.

### 10. Ser/estar : fausse opposition encore présente — haute

ES p4, p6–7 et plusieurs tableaux p16–17/28. p1-langues-p1-lng-es-0 §0 et langues-lng-es-gram-0 §1 disent ser = permanent, estar = passager. L’avertissement ajouté plus loin ne supprime pas cette fausse règle ni les lexiques qui la répètent. Un état peut être durable ; la profession peut changer ; Madrid reste en Espagne mais se situe avec estar ; un événement se situe avec ser. Réviser les paragraphes et six définitions lexicales indiqués dans le JSON, y compris langues-lng-es-gram-6 et langues-lng-es-voc-6.

### 11. Indefinido « daté et ponctuel » et QCM ambigu — moyenne

ES p9–10, langues-lng-es-gram-1 §3 + lexique. Viví allí durante veinte años n’est pas ponctuel. L’indefinido présente un événement ou une période comme achevés.

ES p6, es-ex-011 propose comía et comí pour « Ayer ___ (comer) », et choisit comí uniquement à cause de ayer. Or « Ayer comía cuando llamaste » est correct. Indiquer explicitement un repas envisagé comme événement achevé dans l’énoncé. Les trois corrections exactes sont dans le JSON.

### 12. Subjonctif « après que » — moyenne

ES p13, langues-lng-es-gram-4 §1 et lexique « Emploi du subjonctif ». La liste « après que, ojalá, es necesario que, quiero que » est trompeuse : que seul ne suffit pas. Comparer Creo que viene et No creo que venga, et donner les constructions complètes de souhait/nécessité.

### 13. Impératif tú sans exceptions — moyenne

ES p13, langues-lng-es-gram-4 §2 : « identique à la troisième personne du présent » doit être limité aux verbes réguliers. Ajouter les huit formes très utiles : di, haz, ve, pon, sal, sé, ten, ven. Le remplacement exact garde les règles usted/vosotros.

### 14. Markdown imprimé littéralement — basse

ES p15, langues-lng-es-gram-5 §2 imprime « **Verbes type *gustar*** ». Confirmé dans l’extraction PDF et sur l’image rendue. Le rendu léger ne traite pas ce gras/italique imbriqué ; simplifier le texte source en « **Verbes de type gustar** ».

### 15. Comparaison italienne écrite avec un mot français — moyenne

IT p13, langues-lng-it-gram-4 §2 : « L’égalité se dit aussi… come ». Le modèle doit être così… come ou tanto… quanto. La phrase è interessante come l’altro est correcte, avec omission possible du premier terme. Remplacement complet fourni.

### 16. C’è/ci sono attendu sans règle imprimée — moyenne

IT p11, it-ex-079 : In ufficio ____ tre persone → ci sono. Sa leçon langues-lng-it-gram-1 n’explique pas cette construction ; elle est seulement dans une section pratique non imprimée. Ajouter c’è au singulier / ci sono au pluriel et les deux exemples fournis.

### 17. Promesse de jeu dans un PDF statique — basse

EN p29 et ES p30, dernier paragraphe des leçons langues-lng-en-grammar-ex-0 et langues-lng-es-grammar-ex-0 : « Chaque partie mélange dix questions… Certaines questions peuvent revenir ». Le PDF ne procède pas à ce tirage et ce nombre ne décrit pas sa leçon. Remplacer par la consigne d’entraînement/autocorrection du JSON.

## Améliorations facultatives

1. EN : éviter les assemblages « À l’school », « des knowledge », « on applies » dans les paragraphes lexicaux. Ce ne sont pas des phrases modèles anglaises ; une phrase française propre et une vraie phrase anglaise courte seront plus claires. Rappeler les indénombrables homework/knowledge/software.
2. EN langues-lng-en-voc-1 p19 : degree mérite la précision « diplôme de l’enseignement supérieur » pour ne pas devenir la traduction universelle de tout diplôme français.
3. Les réponses de certaines consignes ouvertes ne sont pas uniques : has been working peut aussi convenir à She… here since 2020. Annoncer le temps voulu ou citer la variante. Les productions libres sont déjà signalées comme exemples possibles, ce qui est correct.
4. IT it-ex-080 : dei nuovi clienti est une variante possible au pluriel de un nuovo cliente. Nuovi clienti est correct ; ajouter la variante apporterait de la précision.
5. Les micro-leçons EN/ES « Niveau A2/B1/B2 » font 1–2 lignes. Ajouter stratégies et critères de compréhension plutôt qu’un simple intitulé. A2 est élémentaire, pas le tout premier début.
6. Les documents dits B2 EN télétravail et ES e-commerce gagneraient une question d’implicite, une reformulation et un avis justifié : les QCM actuels font surtout du repérage.
7. IT : les anciens exercices transversaux réimpriment de longs contextes de grammaire déjà présents dans les leçons. Un rattachement au cours existant ou un lien limiterait les répétitions, en conservant toutes les informations utiles.
8. EN p3 : l’étiquette « LEÇON 4 · GRAMMAIRE ESSENTIELLE » reste seule en bas de page, le titre est p4. Éviter cette coupure de présentation.
9. ES p39 : la fin de vidéothèque occupe seulement le haut de page. La liste seule pourrait être compactée pour économiser une page.
10. IT : contextualiser Libreria = librairie, « dans ce récit », car libreria peut également désigner un meuble bibliothèque. Le cours pratique le précise déjà.
11. EN langues-lng-en-gram-5 §2 dit « le tableau final ». Le tableau existe sous la forme du lexique immédiatement suivant (56 entrées), pas d’une annexe finale manquante. Formulation plus exacte : « Le lexique qui suit réunit les trois formes et le sens de chaque verbe. »

## Fin

Aucun bloc restant à lire. Les erreurs explicitement proposées comme exercices à corriger ne sont pas des fautes du manuel. Les constats sont bornés à cette relecture ; aucune garantie absolue d’absence de faute n’est annoncée. Le parent peut appliquer les propositions, régénérer puis valider le résultat final.

---

## Addendum de vérification finale — anglais, espagnol, italien

24 octobre 2026, Europe/Paris. Contrôle en lecture seule après corrections et régénération. Aucun fichier du dépôt modifié.

- PDF présents et lisibles : anglais **51 pages**, espagnol **52 pages**, italien **47 pages**.
- Les **34 remplacements/ajouts proposés** sont intégrés : 33 correspondent exactement aux propositions, et le paragraphe cash flow comporte en plus la correction voulue « constituent une catégorie de stakeholders ». Les textes corrigés sont retrouvés dans les PDF définitifs (normalisation des espaces et du Markdown).
- **12 consignes réparées** retrouvées dans les PDF : EN031–036 demandent les participes passés, avec les trois formes et une explication correcte ; ES047–052 demandent explicitement yo à l’indefinido.
- EN : article **an STMG student**, distinction **modaux centraux / ought to / have to**, règle contextuelle des marqueurs temporels, définition du prétérit sans négation des conséquences actuelles, famille de run séparée, **cash flow = flux de trésorerie**, ajout du past continuous vérifiés.
- ES : définitions **ser/estar** harmonisées avec la fonction et non la seule durée ; **que seul ne suffit pas** au subjonctif ; **huit impératifs irréguliers tú** présents ; indefinido défini comme événement/période envisagés comme achevés et QCM011 précisé.
- ES : **Verbes de type gustar** rendu sans astérisques parasites ; zéro astérisque littéral dans le texte extrait du PDF espagnol.
- IT : modèles **così… come / tanto… quanto**, règle **c’è / ci sono** et exemples imprimés ; les bases grammaticales précèdent désormais les axes culturels.
- Les reformulations des questions EN070/072, la suppression des promesses de mélange aléatoire dans le PDF et le renvoi anglais au **lexique qui suit** sont intégrés.
- La liste des verbes irréguliers n’était pas perdue : elle est bien présente en lexique de la leçon. La reformulation du renvoi évite de chercher une annexe inexistante.

Contrôle final ciblé des corrections, pas une seconde relecture intégrale de toutes les pages. Les améliorations facultatives du rapport initial restent des pistes distinctes des erreurs corrigées. Aucun nouveau défaut bloquant observé sur ces points.
