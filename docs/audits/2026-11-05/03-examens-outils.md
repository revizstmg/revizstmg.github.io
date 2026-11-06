# Audit indépendant : examens et outils

Version figée : `79d4fa01e8c05addd7dc1d33fbaebce9368b37a9`, après publication des huit correctifs. Compilation partagée en lecture seule, index SHA-256 `4b4a47454744f0daa35ca924c4c26e90f34ff28ad39e1fc65dd3388219b0ec1b`. Campagne commencée le 5 novembre, rédaction finalisée le 6 novembre 2026 après interruption par la limite d’utilisation.

Aucun changement produit, build ou mutation Supabase. Toutes les identités, copies et réponses de service sont synthétiques ; les fournisseurs réels sont bloqués. Les notes ci-dessous sont des priorités relatives, de 1 (superflu) à 10 (critique), pas des notes de qualité du site.

## Améliorations classées

| ID | Priorité | Nature | Amélioration et impact | Solution concrète | Effort |
| --- | --- | --- | --- | --- | --- |
| OUT01 | **7/10** | Bug reproduit | Une longue copie du Prix peut être tronquée à l’impression : seule la fin visible dans le champ apparaît. L’élève ne dispose pas d’une version papier complète. | Pour l’impression, remplacer le textarea par un rendu texte intégral avec retours à la ligne et pagination naturelle ; vérifier des marqueurs au début, au milieu et à la fin d’une copie de plusieurs pages. | Faible à moyen |
| OUT02 | **7/10** | Proposition fondée sur le code | Les réponses rédigées aux questions type contrôle restent en mémoire du composant. Une navigation ou un rechargement peut faire perdre un travail déjà long. La conservation après une erreur réseau pendant la visite fonctionne et ne doit pas être confondue avec une sauvegarde durable. | Brouillon local par compte et chapitre, restauration proposée à la prochaine visite, effacement explicite ; annoncer « sur cet appareil ». Ne pas synchroniser de texte personnel sans choix clair. | Moyen |
| OUT03 | **6/10** | Comportement reproduit, amélioration de reprise | La demande d’examen, la durée et les choix préparatoires ne sont pas restaurés après rechargement avant génération. Le sujet déjà généré, lui, possède un brouillon sauvegardé. | Conserver localement le prompt, la durée, le mode et les chapitres choisis par compte ; proposer « Reprendre ma préparation » et « Effacer ». | Faible à moyen |
| OUT04 | **6/10** | Proposition fondée sur le code | Pendant l’analyse/génération d’examen et la correction d’une copie déposée, l’interface annonce l’attente mais ne propose pas d’annulation explicite. Les requêtes sont bornées à trois minutes et annulées au démontage : ce n’est pas une attente infinie démontrée. | Bouton « Annuler l’attente » utilisant le contrôleur existant, retour au brouillon sans effacer prompt/fichiers ; distinguer chargement du catalogue, préparation et génération. Préciser qu’une annulation côté client ne garantit pas l’arrêt d’un calcul déjà commencé côté fournisseur. | Faible à moyen |
| OUT05 | **6/10** | Proposition de performance fondée sur le code | Le catalogue d’examen charge toutes les matières et leurs contenus avant la sélection. Les deux dépassements de temps observés sous charge ne prouvent pas une panne générale, mais ce travail préalable est évitable. | Produire à la compilation un index léger des chapitres avec titres, niveaux, tailles et disponibilité ; charger les textes uniquement pour les chapitres sélectionnés. Mesurer ensuite le temps de préparation sur téléphone. | Moyen à important |
| OUT06 | **6/10** | Proposition pédagogique | L’EPS distingue honnêtement repères nationaux et notation locale, mais l’élève ne peut pas joindre simplement la grille effectivement utilisée par son professeur. | Ajouter une zone facultative pour la grille du lycée, avec sa source/date ; garder les trois étapes simples. Tant qu’elle n’est pas validée, ne pas transformer les indicateurs d’atelier en note officielle sur 20. | Moyen |
| OUT07 | **5/10** | Proposition, fonctionnement actuel annoncé | La discussion avec le tuteur est limitée à la visite et n’est pas enregistrée dans le compte, ce qui est explicitement indiqué. Une explication utile ne peut pas être retrouvée facilement plus tard. | Action volontaire « Garder cette explication » par chapitre, avec suppression et portée de stockage visibles ; privilégier un résumé utile plutôt qu’un historique permanent automatique. | Moyen |
| OUT08 | **5/10** | Proposition fondée sur le code | Le dépôt de copie montre les noms, tailles et commandes d’ordre, mais aucun aperçu des pages. Un fichier mal cadré ou la mauvaise copie peut être découvert seulement après analyse. | Miniatures locales des photos et aperçu PDF avant envoi, zoom et ordre conservé, sans transfert supplémentaire ; libérer les URL temporaires à la fermeture. | Moyen |
| OUT09 | **4/10** | Proposition, fonctionnement actuel annoncé | L’enregistrement d’entraînement au Grand Oral est seulement réécoutable pendant la visite ; l’écran annonce qu’il n’est pas conservé. | Téléchargement volontaire de l’audio avec durée et format, pour comparer deux entraînements ou l’apporter à un professeur ; aucune mise en ligne automatique. | Faible |

## Preuves des comportements reproduits

### OUT01 : copie longue imprimée

Dans Prix de l’excellence économique, ouvrir un sujet, commencer la copie, puis saisir une composition synthétique de 16 581 caractères et 90 paragraphes, encadrée par `DEBUTPREUVECOPIE` et `FINPREUVECOPIE`. Le textarea mesure 16 477 px de contenu pour 598 px visibles. Imprimer en A4 avec le moteur Chromium du parcours.

Le PDF obtenu a une page et 924 caractères extraits. Le marqueur du début est absent ; le marqueur de fin est présent, avec les paragraphes 87 à 90. La preuve ne dépend pas d’une correction IA réelle. Elle porte sur cette impression de textarea dans Chromium, pas sur tout navigateur ou toute méthode d’export. Le téléchargement texte existant conserve une voie alternative.

Preuves : `outils-preuves/copie-longue.pdf`, `copie-longue.json`, `copie-longue-extrait.txt`, `impression-verification.json`. Cause : `app/src/pages/Excellence.jsx:57` et `app/src/pages/Excellence.css:3` : la règle print donne une hauteur automatique au textarea, mais ne rend pas son texte intégral hors du contrôle.

### OUT03 : préparation d’examen avant génération

Dans Bac blanc, saisir une demande de management de Première et Terminale, choisir 240 minutes, puis recharger sans lancer la génération. Le champ revient vide et la durée à 120 minutes. Preuve : `outils-preuves/demande-rechargement.json`. Cause : `CreateExam.jsx:29-38` conserve ces champs en état React ; la sauvegarde `:52-55` concerne seulement `draft`, créé après génération.

## Sources des autres propositions

- OUT02 : `app/src/components/ChapterControl.jsx:12`, réponse et correction en `useState`. Son bouton d’annulation existe déjà : il ne faut pas présenter OUT04 comme un défaut de ce composant.
- OUT04 : `CreateExam.jsx:67-68` et `:116-120`, `ExamCopy.jsx:35-37` et `:65`. Les contrôleurs et délais existent ; aucune commande d’annulation visible dans ces deux flux. Le Prix dispose déjà d’« Annuler l’attente » (`Excellence.jsx:62`).
- OUT05 : `app/src/data/examenPersonnalise.js:9-10` appelle `chargerTout()`. `CreateExam.jsx:70-76` puis `ExamChapterPicker.jsx:10-12` filtrent ensuite les cours par texte.
- OUT06 : `app/src/pages/SportBac.jsx`, `app/src/data/epsPreparation.js` et `docs/EPS-TRIO.md` : repères nationaux et limites locales déjà explicites ; il ne s’agit pas d’un barème erroné observé.
- OUT07 : `app/src/components/CourseTutor.jsx:11,38`, historique en mémoire et avertissement explicite.
- OUT08 : `app/src/components/ExamCopy.jsx:55-61`, liste de fichiers avec nom/taille et commandes de déplacement, sans aperçu.
- OUT09 : `app/src/components/AudioRecorder.jsx:3-5,13` et fin du composant, URL temporaire et lecteur audio sans téléchargement.

## Contrôles et limites

Le lot ciblé initial contient 12 scénarios, avec un seul worker : **10 réussites et 2 dépassements de temps**. Les dix réussites incluent les deux nouvelles sondes et huit non-régressions : réponse rédigée conservée après erreur, tuteur indisponible sans faux échange, fiche EPS imprimable, dépôt de copie avec consentement et correction détaillée, ordre des photos et refus de fausse note, Prix sur ordinateur, entraînement Grand Oral, bilan des notes de classe.

Les deux dépassements concernent la création personnalisée et la gestion du quota. Ils surviennent pendant la recherche des chapitres dans une exécution concurrente avec les autres audits. Ils ne sont pas classés comme bugs prouvés. La limite d’utilisation a interrompu la rédaction initiale ; les fichiers et les journaux ont été repris sans relancer les dix scénarios réussis. Une reprise isolée du scénario de création est consignée ci-dessous.

Le PDF de preuve et ses données ne contiennent aucun travail d’élève réel. Les services Gemini, quotas déployés, exactitude des notes manuscrites, configuration RLS, Safari/iOS natif et toutes les pages de tous les sujets ne sont pas certifiés. Cet audit ne garantit pas l’absence d’autres défauts.

Reprise isolée du 6 novembre : **création des deux PDF réussie en 22,7 s** (25,6 s pour le lancement), avec les mêmes assertions et les fournisseurs simulés. Le dépassement initial de création n’est donc pas retenu comme défaut produit. Le scénario de quota n’a pas été repris et reste sans confirmation lors de cette campagne. Journal local : `/workspace/work/audit-outils-creation-reprise-20261106.log`.

Les deux nouvelles sondes sont conservées dans `outils-preuves/sondes.spec.js`. Pour les rejouer, les placer sous `app/tests/parcours`, adapter le dossier de sortie absolu et utiliser le préparateur qui bloque le réseau réel. Les vérifications PDF utilisent l’extraction de texte après impression, sans corriger artificiellement la mise en page.
