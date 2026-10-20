# RévizSTMG — audit global et plan d’amélioration

19 octobre 2026 (Europe/Paris). Source applicative `6a32b03`. Trois agents,198 tests réussis, compilation fraîche séparée.

[PDF](RevizSTMG-audit-global-2026-10-19.pdf) · [PR partagée #25](https://github.com/revizstmg/revizstmg.github.io/pull/25)

## Synthèse

Priorité à la sauvegarde, aux exercices strictement liés aux chapitres, au clavier et au lancement de l’atelier. Les correctifs déjà en PR #14 doivent être relus et intégrés plutôt que réimplémentés. Les droits serveur restent à vérifier ; aucune fuite actuelle ni conformité générale n’est affirmée.

## Méthode et limites

34 déclarations de routes cartographiées.29 routes ouvertes aux deux tailles (27/29 et 23/29 rendues après attente courte, chargements distingués) ; reprises ciblées sur site publié et build frais.12 routes×2 profils dans l’audit pédagogique, avec reprise des quatre chargements lourds et atelier jusqu’au bilan. Lecture des fonctions sociales, PWA, compte et progression.

Aucun vrai compte ni donnée d’élève, aucune modification de production. Pas de certification de sécurité, RGPD ou WCAG ; pas de contrôle des droits réels Supabase ou relecture exhaustive des 806 cours. Le rapport antérieur de cours est réutilisé explicitement.

## A01 — Finaliser la fiabilité des sauvegardes et des dates

**P1 · Bugs confirmés ; correctifs déjà en PR**

**Impact :** Une note modifiée seule peut ne pas être envoyée ; une ancienne sauvegarde peut rétablir des favoris supprimés ou écraser une note. Le marqueur de récompense hebdomadaire peut être perdu. Les dates civiles se décalent à Paris.

**Preuve et limite :** store.jsx : dépendances de sauvegarde, fusion par union/longueur, weekly.rewarded ; srs.js : conversions UTC. Reproductions locales synthétiques. Le diff de la PR #14 traite ces cinq sujets.

**Action proposée :** Relire et tester la PR #14 de Claude sur la version actuelle, puis fusionner et vérifier sa publication. Ne pas réécrire un correctif concurrent. Vérifier les conflits avec accueil, profil et préférences.

**Critère de livraison :** Une note seule se synchronise ; une suppression reste supprimée ; la dernière modification gagne ; une récompense ne peut être réclamée deux fois ; minuit et changements d’heure sont testés.

**Effort indicatif :** 1 à 2 jours de revue et recette, hors conflits éventuels

**Coordination :** Claude : PR #14 ouverte ; revue croisée proposée.

**Provenance :** T01, T02, T03, T04, T06

## A02 — Corriger les anomalies pédagogiques connues

**P1 · Anomalies confirmées ; revue antérieure réutilisée**

**Impact :** Un élève peut apprendre une écriture fausse ou être interrogé sur un autre chapitre que celui qu’il vient de lire.

**Preuve et limite :** GF T1, chapitre index 20 : débit 607 à 1881 € avec escompte 765 de 19 € ; total débit 2257,20 € contre crédit 2276,20 €. Quatre dossiers documentaires hors chapitre reproduits dans la PR #24. Généralisation juridique sur la responsabilité des associés.

**Action proposée :** Passer le débit 607 à 1900 € dans cet exemple. Découper les dossiers mixtes par section ; examiner les 17 dossiers documentaires. Préciser la forme sociale en droit. Poursuivre ensuite la relecture métier des 19 matières.

**Critère de livraison :** Écriture équilibrée ; documents, questions et corrections restent dans leur section ; contre-exemples couverts par des tests et relus humainement. Aucun simple déplacement de dossier mixte.

**Effort indicatif :** Quelques heures pour les deux corrections ponctuelles ; plusieurs jours pour les dossiers et la relecture

**Coordination :** Nouveau chantier contenu, à réserver dans le journal. Audit disponible en PR #24.

**Provenance :** PED-01

## A03 — Rendre menus et surcouches utilisables au clavier

**P1 · Bugs reproduits dans le navigateur**

**Impact :** Le focus peut quitter un panneau ouvert ; Échap ne le ferme pas. Une personne utilisant le clavier ou un lecteur d’écran perd le contexte.

**Preuve et limite :** Menu mobile : role=menu encore présent après Échap, puis focus sur Accueil derrière. Accessibilité :0 dialog sémantique, trois commutateurs encore présents après Échap ; surcouche persistante après navigation.

**Action proposée :** Créer un composant de panneau/modale accessible : nom, rôle adapté, focus initial, confinement si modal, fermeture Échap, retour au déclencheur. Étendre la recette à Recherche, Dictionnaire et Personnalisation.

**Critère de livraison :** Parcours complet sans souris ; aucun focus derrière une modale ; fermeture et restauration du focus vérifiées ; recette NVDA/VoiceOver avant toute déclaration de conformité.

**Effort indicatif :** 1 à 3 jours, puis recette assistive

**Coordination :** Nouveau chantier Layout/Accessibility ; coordonner avec les modifications Layout de #14.

**Provenance :** UX-01, PED-02

## A04 — Garder le lancement de l’atelier toujours accessible

**P1 · Problème ergonomique mesuré**

**Impact :** Après avoir choisi une formule en bas du catalogue mobile, l’élève doit remonter plusieurs écrans pour lancer ses exercices.

**Preuve et limite :** Site publié à 390px : scrollY 4241 après sélection ; bouton Générer ày=-3599 dans le viewport. En Première :18 formules et page d’environ 3201px.

**Action proposée :** Ajouter une barre récapitulative sticky avec sélection, total d’exercices et action lancer ; prévoir Voir ma sélection et des catégories repliables. Respecter la navigation basse et les zones sûres.

**Critère de livraison :** Sélectionner la dernière formule et démarrer sans remonter ; aucun contrôle masqué à 360/390px, zoom 200 % ou clavier virtuel ouvert.

**Effort indicatif :** 0,5 à 1 jour

**Coordination :** Nouveau chantier atelier ; conserver les cases matières et l’accueil actuels.

**Provenance :** UX-02, PED-05

## A05 — Ne pas perdre un résultat de QCM de classe

**P1 · Chemin d’erreur confirmé dans le code**

**Impact :** L’élève peut finir son QCM sans que le professeur reçoive le résultat et sans savoir que l’envoi a échoué.

**Preuve et limite :** Classe.jsx : exception de submitQuizResult ignorée avant onDone. Aucun envoi réel ni panne sur un vrai compte n’a été provoqué.

**Action proposée :** Conserver le résultat en attente, afficher son état et permettre un renvoi idempotent. Ne pas obliger l’élève à refaire toutes les questions.

**Critère de livraison :** Couper le réseau à la soumission : résultat local conservé, statut explicite, renvoi unique au retour réseau, puis confirmation de réception.

**Effort indicatif :** 1 à 2 jours

**Coordination :** Point non couvert par le diff #14 examiné ; tâche distincte à annoncer.

**Provenance :** T05

## A06 — Vérifier les droits sociaux et la promesse de confidentialité

**P1 · Vérification serveur à faire ; aucune fuite actuelle affirmée**

**Impact :** Les espaces classe, parent, photos et contributions exigent une audience claire et des droits réellement appliqués. Le code du dépôt seul ne prouve pas l’état des règles en production.

**Preuve et limite :** Le README Supabase documente des corrections à valider. Privacy affiche une conformité tout en décrivant des limites de visibilité des données partagées. Aucun accès réel à la base pendant cet audit.

**Action proposée :** Contrôler les politiques appliquées en lecture seule, puis tester les rôles sur une base jetable. Montrer les audiences près des actions de partage. Revoir les affirmations de conformité et la suppression complète avec la PR #18.

**Critère de livraison :** Matrice élèveA/élèveB/professeur/parent validée sans accès croisé indu ; suppression et visibilité vérifiables ; texte juridique cohérent avec le fonctionnement réel.

**Effort indicatif :** 1 à 3 jours pour qualifier ; corrections selon écarts

**Coordination :** Claude : #18 suppression ouverte. Toute modification de base suit l’autorisation du propriétaire.

**Provenance :** T07, PED-11

## A07 — Distinguer une date de bac passée d’aujourd’hui

**P1 · Bug reproduit**

**Impact :** Un compte à rebours faux désoriente le programme de révision.

**Preuve et limite :** Programme.jsx utilise dLeft>0 sinon itsToday. Profil avec date 18/10/2026 consulté le 19 : C’est aujourd’hui.

**Action proposée :** Gérer trois états futur, aujourd’hui et date passée ; proposer de mettre à jour la session. Vérifier le besoin avec #14 sans supposer que sa correction générale des dates couvre cet affichage.

**Critère de livraison :** Tests hier/aujourd’hui/demain aux fuseaux pertinents ; message passé distinct et date personnalisable conservée.

**Effort indicatif :** Quelques heures et tests

**Coordination :** Coordonner avec #14 ; contrôler ce cas particulier après intégration.

**Provenance :** PED-04

## A08 — Séparer quiz chronométré et sujet au format du bac

**P1 · Promesse pédagogique à clarifier**

**Impact :** Un score de QCM sur 20 et une appréciation de mention peuvent être pris pour une prédiction de note au véritable examen.

**Preuve et limite :** Bac blanc annonce comme le jourJ ; Exam.jsx associe le score QCM à des appréciations de mention. Des sujets structurés de spécialité existent séparément en Terminale.

**Action proposée :** Présenter deux modes : Entraînement chronométré(QCM) et Sujet au format de l’épreuve. Détailler compétences, durée et barème. Dire que le score QCM n’est pas une prédiction de note au bac.

**Critère de livraison :** Un élève distingue les deux formats avant de commencer ; en Première, les épreuves anticipées français/maths sont clairement séparées de la révision générale.

**Effort indicatif :** 0,5 à 1 jour pour les libellés ; plus pour enrichir les sujets

**Coordination :** Nouveau chantier de présentation pédagogique, sans retirer les sujets existants.

**Provenance :** PED-03

## A09 — Vérifier les gains avant toute récompense commerciale réelle

**P1 · Limite d’architecture confirmée**

**Impact :** Le navigateur décide aujourd’hui des scores, achats et réservations. Ce n’est pas une preuve suffisante pour attribuer automatiquement un avantage commercial.

**Preuve et limite :** Crédits XP/pièces locaux ; portefeuille fusionné selon date du client et objets par union. L’activité simultanée peut aussi être sous-comptée par maximum. Aucune exploitation réelle tentée.

**Action proposée :** Garder Premium/Ultimate au statut de réservations tant que les offres ne sont pas définies. Prévoir des événements dédupliqués et un registre transactionnel serveur pour gains, dépenses et éligibilité.

**Critère de livraison :** Un gain n’est crédité qu’une fois ; deux appareils ne conservent pas deux achats pour un seul débit ; activité simultanée conservée sans addition naïve des instantanés.

**Effort indicatif :** Plusieurs jours, cadrage et backend nécessaires

**Coordination :** À traiter avant activation commerciale ; le cumul de temps reste à examiner au-delà de #14.

**Provenance :** T08, T09

## A10 — Montrer une prochaine étape atteignable dans la boutique

**P2 · Comportements confirmés ; évolution UX**

**Impact :** Le débutant découvre surtout des objets verrouillés et un bouton Continuer à progresser désactivé.

**Preuve et limite :** Collection du moment : trois objets à 5000,10000 et 12200XP. Shop.jsx désactive l’action quand les conditions ne sont pas remplies.

**Action proposée :** Afficher un objet accessible, un palier intermédiaire et un objectif prestige. Ajouter Voir ce que je peux obtenir et un lien actif vers un entraînement ; séparer le statut verrouillé de l’action pour progresser.

**Critère de livraison :** Un nouveau compte comprend comment obtenir son premier objet ; chaque verrou explique la condition manquante ; catalogue et conditions des réservations conservés.

**Effort indicatif :** 0,5 à 1 jour

**Coordination :** Nouveau chantier boutique, après fiabilité des récompenses.

**Provenance :** UX-07, UX-08

## A11 — Afficher quand les cours sont réellement prêts hors ligne

**P2 · Risque de conception ; coupure d’installation non reproduite**

**Impact :** Un service worker installé ne garantit pas que tous les cours ont été téléchargés avec succès.

**Preuve et limite :** Le service worker ignore les échecs individuels du cache, active la version puis supprime les anciens caches. Pas d’indicateur fiable de complétude.

**Action proposée :** Distinguer application installée et cours prêts hors ligne. Contrôler les ressources indispensables, reprendre les téléchargements interrompus et envisager un téléchargement par filière.

**Critère de livraison :** Installation interrompue puis reprise testées ; version incomplète non présentée comme prête ; passage hors ligne avec cours et exercices essentiels validé.

**Effort indicatif :** 1 à 2 jours

**Coordination :** Nouveau chantier PWA ; conserver le chargement des matières à la demande.

**Provenance :** T10

## A12 — Rendre visibles les erreurs des actions sociales

**P2 · Erreurs ignorées dans le code**

**Impact :** Accepter un ami, créer une activité ou modérer peut échouer sans explication, avec un état qui semble bloqué.

**Preuve et limite :** Friends.jsx et plusieurs actions de Classe ignorent les exceptions ; absence de délai applicatif dans plusieurs modules de requêtes.

**Action proposée :** Afficher un message lié à l’action, proposer Réessayer, distinguer panne/droits/code invalide, annuler après un délai raisonnable et prévenir les doubles envois.

**Critère de livraison :** Panne et refus simulés : message compréhensible, action relançable, aucun double envoi ni faux succès.

**Effort indicatif :** 1 à 2 jours

**Coordination :** Nouveau chantier réseau/états UI, à coordonner avec #14.

**Provenance :** T11

## A13 — Renforcer le suivi parental sans masquer les pannes

**P2 · Conception à durcir ; protections serveur non vérifiées**

**Impact :** Un code porteur doit être révocable et résister aux recherches abusives ; une panne ne doit pas passer pour un enfant introuvable.

**Preuve et limite :** parent.js crée un code court avec Math.random et un repli en cas d’échec du stockage ; Parent.jsx ne distingue pas toujours absence de lien et panne.

**Action proposée :** Prévoir un code fort et révocable, sa rotation, la visibilité des accès et les quotas serveur de recherche. Garder le partage volontaire et la lecture seule.

**Critère de livraison :** Révocation immédiate vérifiée ; erreur réseau distincte ; tests de quotas et droits sur base de test. Aucun code d’élève réel publié dans le rapport.

**Effort indicatif :** 1 à 3 jours, validation serveur comprise

**Coordination :** Coordonner avec #18 et la validation des droits ; pas de test intrusif en production.

**Provenance :** T12

## A14 — Rendre les informations utiles lisibles et les contrôles explicites

**P1 · Petits textes confirmés ; autres points à mesurer**

**Impact :** Les explications de progression à 9px sont difficiles à lire. Sélections, accordéons et boutons de déplacement manquent parfois de sémantique.

**Preuve et limite :** Home.css:57–67 :9px ; Profile :0,65 rem. Methodo sans aria-expanded ; choix du bac sans état sélectionné accessible ; boutons ↑/↓/× peu descriptifs. Contrastes de certaines couleurs brutes à vérifier.

**Action proposée :** Augmenter les métadonnées utiles à 12–13px et le corps à 14–16px ; nommer les commandes, annoncer sélection/ouverture, ajouter un lien d’évitement. Mesurer contrastes et cibles dans chaque thème.

**Critère de livraison :** Zoom 200 %, clavier, clair/sombre et RTL testés ; aucun texte utile masqué ; focus visible ; ne pas annoncer une conformité WCAG sans recette complète.

**Effort indicatif :** 1 à 3 jours, puis recette assistive

**Coordination :** Conserver la grille compacte et les deux cartes appréciées par le propriétaire.

**Provenance :** UX-03, UX-13, PED-09

## A15 — Clarifier la découverte du site et la première action

**P2 · Évolutions UX fondées sur le parcours**

**Impact :** Un nouveau visiteur voit surtout la connexion ; Commencer peut ouvrir une matière sans expliquer laquelle.

**Preuve et limite :** Welcome affiche le formulaire avant un exemple de cours. Home sans historique ouvre realSubjects[0] ; Chapitre au hasard est fortement présent.

**Action proposée :** Mettre Découvrir les cours en évidence avec une fiche et un exercice publics. Expliquer l’essai et sa sauvegarde. Renommer Commencer en Choisir une matière ou annoncer le thème proposé avec sa raison.

**Critère de livraison :** En 30 secondes, un nouvel élève identifie le bénéfice et démarre une activité ; aucune preuve de réussite ni témoignage inventé ; reprise conservée pour les habitués.

**Effort indicatif :** 1 à 2 jours

**Coordination :** Proposition à valider visuellement ; pas de nouvelle refonte générale non demandée.

**Provenance :** UX-05, UX-06

## A16 — Nommer et expliquer le moteur d’entraînement personnalisé

**P2 · Clarification de promesse**

**Impact :** Coach IA peut faire attendre un dialogue libre ou une génération par modèle qui ne correspond pas au moteur local observé.

**Preuve et limite :** CoachAI utilise un diagnostic, des règles, des seuils et des banques locales ; le libellé annonce une IA qui analyse et crée un entraînement sur mesure.

**Action proposée :** Préférer Entraînement personnalisé ; expliquer pourquoi un thème est conseillé et quelles données manquent. Proposer un diagnostic court facultatif et laisser choisir sa matière.

**Critère de livraison :** La promesse décrit la capacité effectivement disponible ; un élève comprend pourquoi une question lui est proposée et peut choisir son point de départ.

**Effort indicatif :** 0,5 à 1 jour

**Coordination :** Nouveau chantier de vocabulaire et guidage ; conserver le moteur existant.

**Provenance :** UX-10, PED-07

## A17 — Équilibrer les objectifs et expliquer la progression

**P2 · Comportement de priorité observé**

**Impact :** À priorité égale, un nouvel élève de Première peut recevoir quatre objectifs de maths et aucun de français.

**Preuve et limite :** Capture Première : quatre objectifs maths ; reviewQueue garde l’ordre source en cas d’égalité et dailyPlan prend les premiers. Le filtrage français/maths fonctionne.

**Action proposée :** Équilibrer doucement les matières à priorité égale, préserver l’urgence des lacunes, afficher une durée indicative et la condition de fin d’objectif. Expliquer thème, chapitre, score et maîtrise différée.

**Critère de livraison :** Les deux matières sont représentées quand les priorités sont égales ; une lacune urgente reste prioritaire ; le calcul de progression est intelligible.

**Effort indicatif :** 1 à 2 jours

**Coordination :** Coordonner avec #14 dates/SRS ; pas de changement arbitraire des scores existants.

**Provenance :** PED-08

## A18 — Faire de l’atelier un parcours d’apprentissage réutilisable

**P2 · Évolution pédagogique**

**Impact :** Un bilan global et une substitution numérique n’indiquent pas encore quelle formule retravailler ; recharger fait perdre la séance en cours.

**Preuve et limite :** Séance stockée en état React ; aucun lien explicite de formule vers son cours ; pas de bilan par formule ni reprise de session.

**Action proposée :** Ajouter notion/prérequis, indice facultatif, réessai, bilan par formule et Refaire mes erreurs. Relier aux cours, proposer des problèmes contextualisés et une reprise locale par compte.

**Critère de livraison :** Quitter/revenir permet reprendre ou abandonner ; erreurs regroupées par formule ; unités et contexte explicites. Ne pas modifier la maîtrise des chapitres sans règle validée.

**Effort indicatif :** 2 à 4 jours et relecture pédagogique

**Coordination :** Nouveau chantier atelier après A04 ; garder la génération locale et la saisie décimale.

**Provenance :** PED-06

## A19 — Séparer progrès, réglages et informations légales

**P2 · Proposition de navigation**

**Impact :** Le profil mélange statistiques, compte et préférences sur une longue page ; les textes légaux sont difficiles à parcourir rapidement.

**Preuve et limite :** Profil mobile mesuré àenviron 3477px dans le build initial ; Confidentialité 5992px et CGU 4322px. Ces longueurs ne prouvent aucune erreur juridique.

**Action proposée :** Séparer Mes progrès de Réglages et compte ; donner un accès direct aux préférences. Ajouter aux pages légales un sommaire d’ancres, un résumé et une date de mise à jour.

**Critère de livraison :** Accessibilité, date du bac, export et suppression sont trouvables sans parcourir tous les graphiques ; le résumé ne remplace pas les textes complets.

**Effort indicatif :** 1 à 2 jours

**Coordination :** Attention aux chevauchements #14 et #18 ; intégrer #20 Mes notes seulement après décision.

**Provenance :** UX-09, UX-12

## A20 — Harmoniser retour, recherche et contexte de niveau

**P2 · Petits défauts et choix de produit**

**Impact :** Une croix utilisée pour revenir, une recherche vide ambiguë ou un lien partagé vers un outil hors niveau brouillent la navigation.

**Preuve et limite :** Layout utilise ✕ pour navigate(-1) ; aucun résultat de recherche affiche surtout la requête entre tirets. Les routes Grand Oral et Étude de gestion restent directement accessibles aux deux niveaux.

**Action proposée :** Employer une flèche Retour adaptée au RTL ; expliquer zéro résultat et proposer reformulation/matières. Afficher le niveau des outils et proposer un retour vers l’outil pertinent sans bloquer les enseignants.

**Critère de livraison :** Retour et fermeture ont des icônes distinctes ; zéro résultat est annoncé ; un lien direct hors contexte n’est jamais une impasse.

**Effort indicatif :** 0,5 à 1,5 jour

**Coordination :** Choix d’accès libre ou redirection douce à valider ; conserver les routes de compatibilité.

**Provenance :** UX-04, UX-11, UX-14

## A21 — Valider les traductions pédagogiques essentielles hors ligne

**P2 · Amélioration de qualité ; recette multilingue à approfondir**

**Impact :** Une traduction automatique peut modifier une notion juridique, une unité ou une formulation d’exercice ; une panne peut laisser un mélange de langues.

**Preuve et limite :** Moteur public avec MyMemory, cache et message de traduction partielle. La mécanique est relue ; ce nouvel audit n’a pas recertifié chaque langue ou chaque cours.

**Action proposée :** Livrer d’abord un catalogue relu des consignes, formules et corrigés essentiels ; conserver symboles/unités et accès au français original. Tester arabe/RTL et la séance téléchargée hors ligne.

**Critère de livraison :** Une séance essentielle fonctionne dans chaque langue sans réseau après téléchargement ; termes disciplinaires validés ; aucun brouillon privé envoyé à la traduction.

**Effort indicatif :** Plusieurs jours par lot de contenu, avec relecture linguistique

**Coordination :** Plan éditorial à répartir par matière ; ne pas confondre traduction UI et validation du fond.

**Provenance :** PED-10

## A22 — Mesurer la performance avant de fixer un budget de chargement

**P2 · Mesure locale ; pas un score réseau ou Lighthouse**

**Impact :** Le chargement initial et le précache complet peuvent coûter du temps et des données sur un téléphone modeste.

**Preuve et limite :** Build frais 6a32b03 : JS initial 564053 octets bruts,174766 octets avec gzip indicatif. Les matières sont séparées ; le précache récupère ensuite le catalogue.

**Action proposée :** Mesurer les pages clés sur appareil et réseau lents ; fixer un budget JS et téléchargement ; revoir les imports communs et le chargement par langue. Garder les matières chargées à la demande.

**Critère de livraison :** Mesures reproductibles avant/après sur entrée, accueil, cours et atelier ; premier exercice utilisable sans télécharger des matières inutiles lorsque cela est possible.

**Effort indicatif :** 1 à 2 jours de mesure, optimisations selon résultats

**Coordination :** À traiter avec A11 ; chiffres gzip indicatifs, pas trafic réellement observé.

**Provenance :** T13

## A23 — Planifier le durcissement de la connexion

**P2 · Recommandation d’architecture ; aucune intrusion constatée**

**Impact :** Le stockage des jetons et le flux OAuth doivent être cohérents avec le modèle de menace du site statique et les autorisations serveur.

**Preuve et limite :** auth.js utilise un flux implicite et localStorage. Des protections contre les réponses tardives et changements de compte existent et doivent être conservées.

**Action proposée :** Évaluer PKCE et une politique CSP compatible ; tester multi-onglets, révocation et changement de compte. Vérifier que les droits professeur sont imposés côté serveur, pas seulement par le bouton visible.

**Critère de livraison :** Connexion, retour OAuth, déconnexion et révocation testés ; pas de régression élève/professeur ; protections serveur contrôlées sur environnement de test.

**Effort indicatif :** Plusieurs jours selon migration

**Coordination :** Coordonner avec #14 ; ce rapport ne démontre pas de script malveillant ni de fuite active.

**Provenance :** T14

## Coordination et livraison

- PR #14 : sauvegarde, fusion, état, récompense hebdomadaire et dates ; relecture/recette avant intégration.
- PR #18 : suppression complète, promesse UI et vérification des droits.
- PR #20 : Mes notes, intégration à décider.
- PR #13 : répartition à respecter, sans attribuer une tâche à Claude à sa place.
- PR #24 : preuves pédagogiques à convertir en corrections séparées.
- PR #25 : cette livraison documentaire, sans correctif de production.

## Rapports et preuves

- [Expérience utilisateur](agents/experience-utilisateur.md)
- [Fiabilité technique](agents/fiabilite-technique.md)
- [Pédagogie et accessibilité](agents/pedagogie-accessibilite.md)
- [Mesures UX](captures/mesures-ux.json)
- [Interactions pédagogiques](captures/interactions-pedagogiques.json)

Les captures montrent exclusivement un profil fictif. Les efforts sont des estimations, les responsables sont à confirmer dans le journal. Aucun changement applicatif ni backend livré par cet audit.
