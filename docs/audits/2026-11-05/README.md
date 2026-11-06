# Cinq audits : améliorations priorisées

Campagne commencée le 5 novembre 2026, finalisée le 6 novembre après interruption des rédactions par la limite d’utilisation. Les cinq auditeurs ont repris leurs résultats et seulement les contrôles restés sans verdict. Les grandes séries achevées n’ont pas été relancées.

Les huit défauts initiaux sont corrigés et publiés (#179). Référence générale finale : CI42102058237,764tests unitaires en UTC puis Paris et392parcours navigateur réussis. Compilation8968dcbe, code applicatif identique à la version auditée79d4fa01 ; index public HTTP200, SHA256 `4b4a47454744f0daa35ca924c4c26e90f34ff28ad39e1fc65dd3388219b0ec1b`. La correction du test de profil et les preuves publiques figurent dans #180 et `huit-public.json`.

## Lecture des notes

Les notes évaluent la priorité de travail :1–2superflu/cosmétique,3–4confort,5–6amélioration utile,7–8fiabilité ou usage important,9–10indispensable avant commercialisation ou défaut critique. Elles ne sont ni des notes de qualité du site ni un calcul scientifique. Aucun10n’est attribué par cette campagne. Les prérequis de vente à9ne sont pas des vulnérabilités ou pannes réelles démontrées.

Les43constats des rapports sont regroupés en40axes : diagnostic « non évalué » parent/professeur, reprise de Réviser et copie des codes ont chacun deux origines regroupées. La priorité la plus haute des deux est conservée. Le JSON `priorites.json` conserve la correspondance exhaustive.

## Liste consolidée

| N° | Note | Amélioration concrète | Nature | Références |
| --- | --- | --- | --- | --- |
| 1 | **9/10** | **Finaliser le cadre de vente**. Statut, conditions de vente, rétractation et remboursements avant tout encaissement réel. | Prérequis commercial | [AC01](01-comptes.md) |
| 2 | **9/10** | **Faire une recette serveur réelle**. Vérifier droits entre comptes, versions déployées, quotas, paiements, webhooks et résiliation. Aucun défaut réel de ces services n’est affirmé par les simulations. | Vérification à effectuer | [AC02](01-comptes.md) |
| 3 | **8/10** | **Annuler un export après changement de compte**. Un téléchargement demandé par A ne doit pas se terminer dans la session B. | Bug reproduit | [AC03](01-comptes.md) |
| 4 | **8/10** | **Isoler les erreurs par chapitre**. Empêcher qu’un énoncé identique dans deux thèmes écrase ou fasse progresser la mauvaise erreur. | Bug reproduit | [APP01](02-apprentissage.md) |
| 5 | **8/10** | **Vérifier les mois offerts côté serveur**. Contrôler éligibilité, unicité et attribution avant d’activer les réservations Premium ou Ultimate. | Prérequis commercial | [S05](04-social-recompenses.md) |
| 6 | **7/10** | **Compléter l’export des données**. Inclure les brouillons du compte, notamment examens et EPS, et annoncer les éléments manquants. | Limitation confirmée | [AC04](01-comptes.md) |
| 7 | **7/10** | **Confirmer le partage parent**. Afficher en attente, publié ou échec et permettre de réessayer avant de présenter le code comme utilisable. | Bug reproduit | [AC05](01-comptes.md) |
| 8 | **7/10** | **Distinguer absence de résultat et difficulté**. Afficher « Pas encore évalué » pour les nouveaux élèves et les matières non travaillées, chez le professeur comme chez le parent. | Bugs reproduits regroupés | [AC06](01-comptes.md), [S02](04-social-recompenses.md) |
| 9 | **7/10** | **Corriger les statistiques hebdomadaires de classe**. Ne pas compter les activités d’une ancienne semaine dans la semaine courante. | Bug reproduit | [S01](04-social-recompenses.md) |
| 10 | **7/10** | **Imprimer les longues copies intégralement**. Rendre tout le texte du Prix à l’impression, avec pagination, au lieu du seul contenu visible du champ. | Bug reproduit | [OUT01](03-examens-outils.md) |
| 11 | **7/10** | **Sauvegarder les réponses rédigées**. Restaurer le travail des questions type contrôle après navigation ou actualisation, par compte et chapitre. | Proposition fondée sur le code | [OUT02](03-examens-outils.md) |
| 12 | **7/10** | **Afficher une leçon de langue à la fois**. Garder sommaire, reprise et écoute proches de la leçon plutôt que tous les exercices sur une page très longue. | Mesure et proposition ergonomique | [APP02](02-apprentissage.md) |
| 13 | **7/10** | **Simplifier Réviser**. Mettre les trois méthodes et les flashcards en premier ; ranger missions, vacances et Bac blanc dans un accès secondaire. | Proposition ergonomique | [UX-01](05-ergonomie.md) |
| 14 | **6/10** | **Conserver les réponses de langues**. Retrouver les saisies et la leçon active après rechargement, avec commande d’effacement. | Perte de saisie reproduite | [APP03](02-apprentissage.md) |
| 15 | **6/10** | **Reprendre le parcours de révision**. Conserver méthode, matière, chapitre et séance ; rendre le retour du navigateur cohérent. | Propositions regroupées | [APP04](02-apprentissage.md), [UX-05](05-ergonomie.md) |
| 16 | **6/10** | **Suivre la couverture pédagogique**. Relier notions, compétences et activités ; dater les relectures réellement effectuées et citer les références pertinentes. | Proposition éditoriale | [APP05](02-apprentissage.md) |
| 17 | **6/10** | **Garder la préparation d’examen**. Retrouver prompt, durée et chapitres avant la génération ; le sujet déjà généré possède une sauvegarde distincte. | Comportement reproduit | [OUT03](03-examens-outils.md) |
| 18 | **6/10** | **Annuler une génération ou correction en attente**. Ajouter une commande visible conservant prompt et fichiers ; ne pas promettre l’annulation du coût serveur déjà engagé. | Proposition fonctionnelle | [OUT04](03-examens-outils.md) |
| 19 | **6/10** | **Charger un catalogue léger pour les examens**. Sélectionner les chapitres à partir de leurs métadonnées, puis charger seulement les textes nécessaires. | Proposition de performance | [OUT05](03-examens-outils.md) |
| 20 | **6/10** | **Joindre la grille EPS du professeur**. Garder les repères nationaux et permettre d’ajouter la grille locale sans inventer une note officielle. | Proposition pédagogique | [OUT06](03-examens-outils.md) |
| 21 | **6/10** | **Réparer les liens de confidentialité**. Ouvrir directement les réglages Export, Suppression et Profil au lieu de l’ancien espace personnel. | Chemin trompeur reproduit | [AC07](01-comptes.md) |
| 22 | **6/10** | **Annuler une suppression de flashcards**. Proposer « Paquet supprimé · Annuler » ou une confirmation courte avant suppression définitive. | Protection proposée, comportement mesuré | [UX-02](05-ergonomie.md) |
| 23 | **6/10** | **Choisir les contenus hors ligne**. Télécharger les matières et guides souhaités, avec une option complète sur Wi-Fi et un état de disponibilité exact. | Proposition de performance | [UX-03](05-ergonomie.md) |
| 24 | **6/10** | **Ajouter blocage et signalement**. Prévoir un recours simple en cas de sollicitations répétées, avec règles de modération et contrôles serveur. Aucun abus réel constaté. | Proposition fonctionnelle | [S06](04-social-recompenses.md) |
| 25 | **5/10** | **Indiquer la portée des sauvegardes**. Distinguer « Sur cet appareil » et « Synchronisé avec le compte » dans chaque outil. | Proposition de clarté | [AC08](01-comptes.md) |
| 26 | **5/10** | **Montrer les lots d’erreurs restants**. Annoncer « 12 sur N » et proposer la série suivante sans réintroduire un carnet visuel ou trop de boutons. | Proposition de clarté | [APP06](02-apprentissage.md) |
| 27 | **5/10** | **Suivre les progrès par formule**. Conserver un historique agrégé entre les séances et orienter vers les difficultés restantes. | Proposition pédagogique | [APP07](02-apprentissage.md) |
| 28 | **5/10** | **Garder une explication du tuteur**. Permettre d’enregistrer volontairement une explication utile par chapitre, avec suppression. | Proposition fonctionnelle | [OUT07](03-examens-outils.md) |
| 29 | **5/10** | **Prévisualiser les copies avant envoi**. Afficher miniatures des photos et aperçu PDF, zoom et ordre, sans transfert supplémentaire. | Proposition fonctionnelle | [OUT08](03-examens-outils.md) |
| 30 | **5/10** | **Fiabiliser la copie des codes**. Attendre le succès réel du presse-papiers ; en cas de refus, annoncer l’échec et proposer une copie manuelle pour Amis et Parent. | Bug ami et amélioration parent regroupés | [S03](04-social-recompenses.md), [AC10](01-comptes.md) |
| 31 | **5/10** | **Figer la version des quiz de duel**. Prévenir des épreuves différentes si le quiz est modifié côté données ; aucun éditeur existant ni panne normale du parcours n’a été observé. | Prévention, scénario API uniquement | [S04](04-social-recompenses.md) |
| 32 | **5/10** | **Préciser les messages d’erreur sociaux**. Parler de l’invitation, du duel ou du message concerné plutôt que d’un problème de classement générique. | Proposition de clarté | [S07](04-social-recompenses.md) |
| 33 | **5/10** | **Suspendre les rafraîchissements inutiles**. Ralentir ou arrêter les lectures de duels et Direct en arrière-plan ou hors ligne, puis reprendre au retour. | Proposition de performance | [S08](04-social-recompenses.md) |
| 34 | **5/10** | **Relier les récompenses à la prochaine action**. Proposer le thème, test ou objectif qui permet réellement de franchir le prochain palier. | Proposition d’engagement | [S10](04-social-recompenses.md) |
| 35 | **5/10** | **Comparer les offres d’un regard**. Présenter trois axes communs puis des détails dépliables, en conservant prix et limites exacts. | Proposition de présentation | [UX-04](05-ergonomie.md) |
| 36 | **4/10** | **Clarifier le retrait d’un élève côté parent**. Expliquer que l’action retire le suivi de cet appareil, sans supprimer le compte élève ni son consentement. | Proposition de clarté | [AC09](01-comptes.md) |
| 37 | **4/10** | **Télécharger son entraînement au Grand Oral**. Permettre un export volontaire de l’audio actuellement temporaire, sans mise en ligne automatique. | Proposition fonctionnelle | [OUT09](03-examens-outils.md) |
| 38 | **4/10** | **Annoncer les résultats d’import aux lecteurs d’écran**. Ajouter un statut accessible pour la confirmation et une alerte associée aux erreurs. | Proposition d’accessibilité | [UX-06](05-ergonomie.md) |
| 39 | **4/10** | **Préciser et prolonger l’historique des duels**. Annoncer la portée des 60 derniers duels et proposer de charger les précédents ou des agrégats distincts. | Limitation confirmée, proposition | [S09](04-social-recompenses.md) |
| 40 | **3/10** | **Compacter les illustrations sur téléphone**. Garder le style des feuilles de Réviser en réduisant leur hauteur sur petit écran. | Proposition esthétique | [UX-07](05-ergonomie.md) |

## Rapports et limites

- [Comptes, parents, offres et sauvegarde](01-comptes.md) :21parcours et cinq micro-sondes achevés. Une attente sensible à la casse a été reprise seule.
- [Apprentissage](02-apprentissage.md) :15contrôles distincts réussis après une reprise isolée ; capture intégrale géante écartée comme incident de test, pas panne des guides.
- [Examens et outils](03-examens-outils.md) :10réussites sur le lot initial de12, puis création d’examen réussie seule en22,7s ; le quota non repris reste non certifié. Deux sondes nouvelles documentent impression et préparation avant génération.
- [Social et récompenses](04-social-recompenses.md) :22parcours et trois micro-sondes achevés, sans relance du lot.
- [Ergonomie et présentation](05-ergonomie.md) :18scénarios distincts réussis, dont un après reprise isolée, et une micro-sonde. Poids de précache mesuré12,68MiB non compressés sur disque, pas une mesure de transfert ou de performance ressentie.

Les périmètres se recoupent : leurs nombres ne sont pas additionnés en un faux total de fonctionnalités certifiées. Les comptes et réponses sont synthétiques, les fournisseurs privés bloqués. Ni RLS réellement appliquées, ni Stripe réel, Google réel, corrections Gemini réelles, Safari natif, lecteur d’écran humain ou chaque page des PDF ne sont certifiés par ces simulations. Les propositions éditoriales ne prétendent pas qu’une erreur de cours a été trouvée.

Cette livraison ajoute des rapports et preuves uniquement. Elle ne corrige pas silencieusement les nouveaux constats : les huit corrections précédentes restent distinctes. Aucun fichier applicatif, donnée réelle, réglage ou fonction Supabase n’est modifié.
