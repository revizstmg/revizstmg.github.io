# Synthèse

## En bref

Cinq analyses ont inspecté la version en ligne de RévizSTMG les 19 et 20 octobre 2026, chacune sous un angle différent, sans rien modifier sur le site ni dans la base. Elles proposent **480 améliorations**. Une relecture ligne à ligne des cours et des exercices, faite juste avant, avait déjà relevé **217 erreurs de contenu** ; son bilan est en annexe.

| Partie | Angle | Propositions | Dont priorité 1 |
|---|---|---:|---:|
| 1. Fonctionnalités | Ce qu'il faut garder, améliorer ou créer, comparé à la concurrence | 118 | voir le top 15 de la partie |
| 2. Interface | 37 écrans, téléphone et ordinateur, clair et sombre, arabe, accessibilité | 157 | voir le top 15 de la partie |
| 3. Parcours et défauts | Chaque profil (visiteur, essai, Première, Terminale ×4, prof, parent), chaque route | 78 (43 défauts dont 3 bloquants, 35 améliorations) | 3 bloquants |
| 4. Technique | Vitesse, hors ligne, fiabilité, sécurité, vie privée, tests | 65 | 15 |
| 5. Pédagogie et épreuves | Couverture du programme, format des épreuves, révision, progression | 62 | 27 |

**Ce qui marche déjà bien.** Un contenu très vaste pour une application gratuite (19 matières, 94 thèmes, 806 chapitres, environ 27 500 questions). Aucune erreur JavaScript ni débordement sur 35 routes, de 320 à 1 440 px, arabe compris. Le hors ligne fonctionne sur toutes les pages après une première visite. Aucun secret dans le code. La publication est bloquée tant qu'un test échoue. Pas de cookie publicitaire ni de pistage.

## Ce sur quoi les cinq analyses se rejoignent

| # | Constat partagé | Vu par | Ce qu'il faut faire |
|---|---|---|---|
| 1 | **Les données des élèves (mineurs) sont trop ouvertes** : 60 règles d'accès sur 64 laissent n'importe qui lire et modifier prénoms, photos et scores. | Technique, Fonctionnalités | Appliquer les règles prêtes dans `supabase/a-valider/` (accord du propriétaire requis), puis séparer la base de celle de NAH. À faire avant toute classe ou tout paiement. |
| 2 | **La progression n'est pas fiable** : synchronisation incomplète, dates en heure universelle, sauvegarde abîmée qui remet tout à zéro, stockage plein sans message, essai sans compte effacé à la déconnexion, effacement par Safari après 7 jours. | Parcours, Technique, Pédagogie | Une grande partie est corrigée dans la PR #14 (en attente de fusion). Restent : copie de secours, stockage plein, essai sans compte, stockage persistant, filière, classe et photo. |
| 3 | **Le score de maîtrise ne reflète pas le travail** : 11 exercices réussis laissent un thème à 0 % ; « point faible » à 31 % avec 92 % au test ; test du thème validé avec des réponses vides ; un bac blanc remplit l'objectif de la semaine. | Parcours, Fonctionnalités, Pédagogie | Un seul score de maîtrise, expliqué à l'élève, alimenté par tous les exercices ; réponses vides refusées ; objectif de la semaine compté en chapitres réellement travaillés. |
| 4 | **Les entraînements ne ressemblent pas aux épreuves** : bac blanc en QCM qui mélange les matières ; sujets « 4 h » trop maigres (2 questions en SIG) ; pas d'épreuve anticipée de maths en Première ; droit-économie sans questions ouvertes ; 85 QCM d'études de documents qui ont tous la bonne réponse en A ; 97 % des questions en simple rappel de définition. | Pédagogie, Fonctionnalités | Lire d'abord le BO spécial n° 4 du 17 septembre 2026 (session 2027), puis écrire de vrais sujets par épreuve, avec barème et corrigé ; ajouter des exercices d'application et de justification ; mélanger l'ordre des réponses. |
| 5 | **Trop d'outils, trop de touchers** : 6 touchers de l'accueil à une question ; plusieurs outils de révision qui se font concurrence ; barre du bas tournée vers la boutique et les amis ; fin de série qui ne mène nulle part ; jusqu'à 4 fenêtres à l'arrivée. | Interface, Fonctionnalités, Parcours | « Ma séance du jour » en un bouton ; barre du bas Accueil · Cours · Réviser · Bac blanc · Moi ; exercice en plein écran ; écran de fin avec « Refaire mes erreurs » ; une seule sollicitation par visite. |
| 6 | **La révision espacée est trop grossière** : par thème entier, une réussite au bac blanc repousse tout le thème, le carnet d'erreurs n'est pas alimenté par tous les modes et se vide après une seule réussite. | Pédagogie, Fonctionnalités | Répétition par notion ou par carte ; carnet d'erreurs alimenté par tous les modes, avec sortie après trois réussites espacées ; « Pourquoi ? » sous chaque correction, avec la phrase du cours. |
| 7 | **Hors ligne et mises à jour fragiles** : page blanche le lendemain d'une publication, page « Introuvable » qui remplace l'application, 0,3 à 1,5 Mo retéléchargés à chaque publication (24 en une semaine). | Technique, Parcours | Ne mettre en cache que des réponses valides et neuves ; ne pas activer une version incomplète ; regrouper les publications. |
| 8 | **Le contenu a des erreurs** : 217 relevées, dont 12 donnent une réponse fausse ; la plupart viennent du générateur d'exercices quand deux notions se recouvrent. | Vérification du contenu, Pédagogie | Corriger les 12 bloquants ; compléter `content/commun/notions-liees.json` ; replacer les exercices rattachés au mauvais chapitre ; afficher les cours masqués. |
| 9 | **Les professeurs et les parents reçoivent l'interface d'un élève**, et l'inscription avec confirmation d'e-mail rend le compte inutilisable. | Parcours, Fonctionnalités | Accueil propre au professeur (onglet Classe) et au parent ; corriger l'inscription ; comptes élèves sans e-mail créés par le professeur. |
| 10 | **Langues et accessibilité incomplètes** : libellés récents restés en français, cours français mal orienté en arabe, anneau de focus peu visible (contraste 1,8:1), lignes du cours trop longues sur ordinateur. | Interface, Parcours | Ajouter ces textes aux dictionnaires ; isoler le français et les nombres en arabe ; focus à 3:1 ; 68 caractères par ligne au plus. |

## Déjà fait ou en attente

| Sujet | Où | État |
|---|---|---|
| Sauvegarde complète et versionnée, état « Non sauvegardé » visible, reprise au retour du réseau, déconnexion sans perte | PR #14 | Prête, en attente de fusion |
| Dates en heure de Paris (séries, défi, révisions, intervalles de révision espacée) | PR #14 | Prête, en attente de fusion |
| Suppression complète du compte, partout | PR #18 | Prête, en attente de fusion (fonction déjà appliquée sur Supabase) |
| « Mes notes de classe » (proposition n° 80 des fonctionnalités) | PR #20 | Prête, brouillon |
| Accueil : un outil conseillé, les autres dans « Ta trousse » | PR #22 | Publiée le 19 octobre |
| Règles d'accès de la base | `supabase/a-valider/` | Prêtes et testées en local, en attente de l'accord du propriétaire |

## Feuille de route proposée

| Quand | Quoi | Pourquoi d'abord |
|---|---|---|
| **Tout de suite** | Règles d'accès de la base ; fusion des PR #13, #14, #18 et #20 ; corrections du hors ligne (page blanche, page d'erreur en cache) ; copie de secours de la progression ; les 12 erreurs de contenu bloquantes et la liste des notions liées ; inscription avec confirmation d'e-mail ; essai sans compte protégé. | Sécurité de mineurs, perte de données, réponses fausses : rien d'autre ne compte tant que ce n'est pas réglé. |
| **Avant janvier 2027** | Lecture du BO du 17 septembre 2026 ; score de maîtrise unique ; test du thème non validable à vide ; « Ma séance du jour » ; barre du bas et accueil simplifiés ; exercice en plein écran et fin de série utile ; « Pourquoi ? » sous la correction ; carnet d'erreurs alimenté par tout. | Ce que l'élève voit chaque jour, et le socle des offres payantes prévues en janvier. |
| **Avant les épreuves de juin 2027** | Vrais sujets par épreuve (management et sciences de gestion avec SIG, droit-économie, philosophie, épreuve anticipée de maths et de français) ; révision espacée par notion ; programme à rebours pondéré par épreuve ; accueil professeur et parent ; devoirs en un clic. | La raison d'être de l'application : réussir le bac. |
| **Ensuite** | Le reste des propositions P2 et P3 : accessibilité fine, performances, mises à jour légères, référencement, motivation, orientation après le bac. | Améliorations utiles, sans urgence. |

## Correspondance avec l'audit de Codex du 19 octobre

Codex a publié de son côté un audit global à trois agents (39 points regroupés en 23 actions, `docs/audits/2026-10-19/PLAN-ACTIONS.md`) et un audit des cours (PR #24). Les deux travaux se recoupent largement ; ce tableau rattache chaque constat partagé ci-dessus aux actions de Codex, pour éviter deux chantiers concurrents.

| Constat partagé (ci-dessus) | Actions du plan de Codex | Ce que ce document ajoute |
|---|---|---|
| 1. Données trop ouvertes | A06 (droits sociaux, promesse de confidentialité) | 60 règles ouvertes sur 64 comptées dans les migrations ; correctif prêt et testé dans `supabase/a-valider/` |
| 2. Progression peu fiable | A01 (PR #14), A07 (date de bac passée) | Sauvegarde abîmée qui remet à zéro, stockage plein sans message, essai sans compte effacé, Safari après 7 jours, filière, classe et photo non synchronisées |
| 3. Score de maîtrise | A17 (objectifs et progression), A09 (vérifier les gains) | Exercices de chapitre non comptés (11 réussis → 0 %), test du thème validé à vide, bac blanc qui remplit l'objectif de la semaine |
| 4. Entraînements différents des épreuves | A08 (quiz chronométré et sujet au format du bac), A02 | Sujets 4 h trop maigres (SIG), épreuve anticipée de maths absente, QCM d'études de documents toujours en A, 97 % de questions de rappel |
| 5. Trop d'outils, trop de touchers | A15 (découverte et première action), A16 (moteur d'entraînement), A20 (retour, recherche) | 6 touchers jusqu'à une question, barre du bas, exercice en plein écran, fin de série, fenêtres superposées |
| 6. Révision espacée grossière | A17 | Répétition par notion, carnet d'erreurs alimenté par tous les modes, « Pourquoi ? » sous la correction |
| 7. Hors ligne et mises à jour | A11 (cours prêts hors ligne), A22 (performance) | Page blanche après une publication et page « Introuvable » en cache (reproduits), poids des mises à jour |
| 8. Erreurs de contenu | A02, PR #24 | 217 erreurs relevées sur les 19 matières, dont 12 bloquantes, avec la correction proposée pour chacune |
| 9. Professeurs et parents | A13 (suivi parental), A05 (QCM de classe) | Interface d'élève servie au professeur et au parent, inscription avec confirmation d'e-mail inutilisable |
| 10. Langues et accessibilité | A03 (clavier), A14 (lisibilité), A21 (traductions) | Libellés récents restés en français, cours français en arabe, contraste du focus, longueur des lignes |

Les actions A04 (lancement de l'atelier), A10 (boutique), A12 (erreurs des actions sociales), A18 (atelier comme parcours), A19 (progrès, réglages et informations légales) et A23 (connexion) sont propres au plan de Codex et rejoignent plusieurs propositions de détail des parties 1 et 2.

## Qui fait quoi

La répartition entre Claude et Codex est celle de `docs/TACHES.md` (couloirs de fichiers). À titre indicatif : la base, les comptes, la sauvegarde, la révision espacée et les pages légales relèvent du couloir de Claude ; le contenu, le moteur d'exercices, les jeux, les traductions et l'accueil, de celui de Codex. Le propriétaire décide des priorités et attribue les tâches ; ce document n'en attribue aucune.

## Limites communes

- Les sites officiels (eduscol, education.gouv.fr, Légifrance, CNIL) étaient bloqués depuis l'environnement d'analyse : les points de programme ont été vérifiés par moteur de recherche et sont marqués « probable » ou « à vérifier » quand le texte lui-même n'a pas pu être lu. C'est le cas du BO du 17 septembre 2026, à relire en premier.
- La base réelle n'a pas été consultée : comptes, classe, amis, classement et espace parent ont été joués avec un faux serveur ou jugés sur le code.
- Seul Chromium était disponible : Safari et les vrais téléphones restent à tester.
- Les captures d’écran (plus de 1 000) sont restées dans l'environnement d'analyse ; les rapports citent leurs noms.
