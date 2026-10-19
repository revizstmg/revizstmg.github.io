# Audit technique et fonctionnel — RévizSTMG

Date : 19 octobre 2026, Europe/Paris. Sources applicatives auditées : `6a32b03` (les commits de coordination ajoutés pendant la lecture ne modifient pas ces sources). Aucun fichier du dépôt ni donnée réelle modifié. Aucun appel Supabase réel. Reproductions uniquement avec données synthétiques et fonctions locales. Les tests globaux sont laissés au coordinateur.

## Couverture et méthode

Cartographie du routeur : 34 déclarations, dont page 404 et trois routes de compatibilité (`/subject/:sid/chapter/:cid`, `/express`, `/formules`). Inspection des modules de compte/session, restauration et persistance, calcul de progression, SRS, récompenses et boutique, classes/QCM/mur/groupes/direct, amis/duels, classement/ligues, espace parent, photographie/OCR/vision, chargement à la demande, PWA/service worker et écrans d'erreur. Les pages de ces fonctions ont été inspectées dans le code ; ce rapport ne prétend pas avoir cliqué tous les états connectés en production.

Atouts constatés : pages et matières chargées à la demande ; écrans d'erreur avec relance ; isolation des requêtes par identité de compte ; reprise de lecture par compte ; partage parent volontaire ; contrôle d'existence du code de classe ; absence de clé privilégiée nécessaire côté client ; correction locale de l'atelier de formules ; redirections des anciens outils. Conserver ces protections lors des refontes.

## Travaux existants à relire et intégrer

Les corrections déjà préparées doivent être validées puis fusionnées, sans refaire un développement concurrent. Lecture de la différence de la PR #14 effectuée pendant cet audit : elle couvre explicitement l'envoi complet et son état (T01/T06), les suppressions et notes datées (T02), la conservation de weekly.rewarded (T03) et les dates civiles (T04). Elle contient les tests correspondants. Recommandation immédiate pour ces cinq sujets : relecture, tests de régression avec l'état actuel du site, fusion, puis vérification de publication ; les reproductions ci-dessous portent sur main, pas sur la version corrigée de la PR. T09 (temps cumulé par maximum) reste présent dans le diff de #14 et doit être étudié séparément. Le problème d'envoi QCM T05 n'apparaît pas corrigé par les changements de #14 inspectés.

PR #18 : suppression du compte, à valider avec les permissions serveur et les scénarios d'effacement. PR #20 : Mes notes, dépendante de travaux de sauvegarde et suppression ; synchroniser l'intégration, ne pas créer une seconde page de notes. PR #13 : répartition du travail ; l'utiliser pour affecter les tâches restantes. Rapport consolidé partagé dans la PR #25.

## Priorités recommandées

### T01 — P1 — Les modifications de notes, dossiers et temps ne déclenchent pas seules la synchronisation
Statut : confirmé par inspection de l'effet React.
Preuve : `app/src/store.jsx:17` inclut dans PROGRESS_KEYS notes, fiches, grandOral, etudeGestion, savedDecks, erreurs, themeTime, bacDate et srs. Or la liste de dépendances de l'effet d'envoi à `store.jsx:352-360` n'inclut pas ces champs. Modifier un dossier seul après les 2 secondes suivant l'ouverture ne planifie donc aucun nouvel envoi. La déconnexion envoie tout, mais fermer un onglet directement ne passe pas par ce chemin.
Impact : travail visible sur l'appareil mais absent de l'autre appareil ; effacement du stockage = risque de perte.
Recommandation : file de sauvegarde fondée sur l'ensemble des données synchronisées, statut visible « enregistré / en attente / échec », relance au retour réseau. Vérifier par scénario simulé : une note seule est bien envoyée, sans exercice supplémentaire.
Effort : moyen, 1 à 2 jours.

### T02 — P1 — La fusion peut restaurer les éléments supprimés et remplacer une note corrigée par une ancienne
Statut : reproduit localement.
Preuves : `store.jsx:33`, `:76-91`, `:96-99`. Les favoris et collections sont fusionnés par union ; les notes par longueur maximale. Reproduction avec la fonction exacte extraite du code : une note locale « Texte corrige » est remplacée par « Ancien texte beaucoup plus long » ; un favori retiré et un paquet supprimé réapparaissent à la fusion.
Impact : suppressions et corrections non fiables entre appareils, sentiment que le site ignore l'élève.
Recommandation : dates de modification par élément et marqueurs de suppression ; versionner les notes ; journal de conflits pour les dossiers importants.
Effort : moyen à élevé, 2 à 4 jours avec migration compatible.

### T03 — P1 — Récompense hebdomadaire réclamable après restauration
Statut : perte de marqueur reproduite localement ; répétition du gain déduite du chemin de code, sans gain réel exécuté.
Preuves : `store.jsx:45` reconstruit weekly avec seulement week et done quand les semaines correspondent ; `store.jsx:645-651` bloque une deuxième récompense grâce à weekly.rewarded. La fusion supprime donc précisément ce verrou, même si les deux sauvegardes portent la même semaine.
Impact : réclamation supplémentaire possible après fusion/restauration, pièces et niveaux faussés.
Recommandation : conserver le marqueur lors de la fusion puis, avant toute récompense commerciale réelle, déduplication transactionnelle côté serveur.
Effort : faible pour le verrou local, plus élevé pour l'autorité serveur.

### T04 — P1 — Dates de répétition espacée décalées à Paris
Statut : reproduit avec le module réel sous `TZ=Europe/Paris`.
Preuve : `app/src/data/srs.js:3-5`. `dayKey(new Date('2026-10-19T00:30:00+02:00'))` renvoie `2026-10-18`. Plus grave : `addDays('2026-10-19', 1)` renvoie `2026-10-19` car un minuit local est converti en UTC.
Impact : révisions dues calculées avec un jour de retard ou intervalle réduit ; désaccord entre compteurs journaliers et affichage local.
Recommandation : un utilitaire de date civile commun à toutes les fonctions, avec contrôles de minuit et changements d'heure. Une PR de progression peut déjà traiter ce sujet : coordonner avant modification.
Effort : moyen, 1 jour avec tests de fuseaux.

### T05 — P1 — Un QCM de classe peut se terminer sans avoir transmis le résultat au professeur
Statut : confirmé par le code.
Preuve : `app/src/pages/Classe.jsx:592-596` ignore toute exception de submitQuizResult et appelle toujours onDone. L'élève ne voit pas que le professeur n'a pas reçu sa réponse.
Recommandation : conserver le résultat localement en attente, afficher un état explicite et permettre un nouvel envoi idempotent. Ne pas exiger de refaire les questions.
Effort : moyen, 1 à 2 jours.

### T06 — P1 — Échec de sauvegarde silencieux
Statut : confirmé par inspection ; perte de données sur un vrai compte non provoquée.
Preuves : `store.jsx:302-309` ignore quota/localStorage indisponible ; `store.jsx:356` ignore erreur réseau ; `app/src/auth.js:262-271` retourne false sur réponse HTTP en échec, sans que l'appelant vérifie ce booléen ; `store.jsx:514-527` ferme la session après une tentative finale même échouée.
Impact : l'élève peut croire son travail enregistré, puis le perdre en fermant/session ou sur appareil partagé.
Recommandation : trois états de sauvegarde compréhensibles, une file persistante de reprise, export de secours des dossiers, message avant fermeture de session si données non synchronisées.
Effort : moyen à élevé, 2 à 3 jours.

### T07 — P1 conditionnelle / P0 si confirmé en production — Revalider les droits des fonctions sociales avant ouverture large
Statut : risque documenté, NON revalidé sur la base réelle pendant cet audit.
Preuves documentaires : `supabase/README.md`, sections « En attente d'application » et « Audit de sécurité » ; anciennes politiques ouvertes et corrections sous `supabase/a-valider/`. Le code récent suppose des protections par appartenance/propriétaire, mais le dépôt seul ne prouve pas leur application au serveur.
Recommandation : contrôler catalogue et historique de migrations en lecture seule ; tester les droits sur base jetable avec élève A, élève B, professeur et parent ; appliquer séparément les éventuelles corrections autorisées. Inclure suppression de compte, accès aux photos et codes parents. Aucun constat de fuite actuelle n'est affirmé.
Effort : moyen pour validation ; déploiement selon écarts constatés.

### T08 — P1 avant abonnements réels — Les gains et achats restent décidés dans le navigateur
Statut : architecture confirmée, limite déjà reconnue par le projet ; aucune exploitation réelle tentée.
Preuves : `store.jsx:435-460` crédite XP/pièces et scores localement ; `store.jsx:59-65` portefeuille sélectionné par date du client et objets possédés réunis par union ; `app/src/data/shop.js` calcule achats et réservations localement ; `auth.js:262` sauvegarde le JSON global.
Impact : un client modifié peut produire de faux résultats ; deux appareils peuvent conserver deux achats et seulement un débit ; incompatible avec attribution automatique d'un avantage commercial sur cette seule preuve.
Recommandation : journal transactionnel serveur et règles d'éligibilité vérifiées ; garder les mois offerts comme réservations tant que cette vérification n'existe pas. Ne pas promettre de date d'activation avant définition des offres.
Effort : élevé, plusieurs jours.

### T09 — P2 — Fusion des cumuls : l'activité simultanée sur deux appareils peut être sous-comptée
Statut : calcul confirmé par inspection de `store.jsx:29-31` et `:73-74` ; aucune session réelle simulée.
Exemple : base 100 XP, +10 sur A, +20 sur B : maximum 120 au lieu du total d'événements 130. Même principe pour temps de travail.
Recommandation : enregistrement d'événements avec identifiants uniques, puis agrégation dédupliquée ; éviter addition naïve des deux instantanés, qui provoquerait un double comptage.
Effort : élevé ; traiter avec T08 et la refonte de synchronisation.

### T10 — P2 — Le hors-ligne annoncé n'a pas de signal de préparation fiable
Statut : risque démontré par conception, coupure pendant installation non exécutée.
Preuves : `app/pwa/sw.js:30-45` ignore chaque échec de cache, active quand même la nouvelle version et efface les anciens caches. L'application peut être partiellement téléchargée alors que le service worker est installé. Le catalogue local comporte 93 fichiers précachés, environ 3,81 Mo bruts (hors CORE), pas une mesure des octets réseau compressés.
Recommandation : distinguer installation et « cours prêts hors ligne », contrôler les ressources indispensables, reprise des téléchargements interrompus, activation atomique d'une version complète. Proposer éventuellement téléchargement par filière.
Effort : moyen, 1 à 2 jours.

### T11 — P2 — Trop d'échecs sociaux sans explication, et absence de délai applicatif
Statut : code confirmé ; pas de panne de production provoquée.
Preuves : `app/src/pages/Friends.jsx:119-120` ignore les erreurs d'acceptation/suppression ; `Classe.jsx:75-81` création en erreur silencieuse ; plusieurs opérations de modération ignorent également les erreurs. `auth.js`, `reseau.js`, `classroom.js`, `friends.js`, `parent.js` n'emploient pas AbortController/délai pour leurs requêtes.
Recommandation : messages d'action précis, réessai, annulation après délai raisonnable, protection contre le double envoi. Le code erroné, le manque de droits et la panne réseau doivent être distingués.
Effort : moyen, 1 à 2 jours.

### T12 — P2 — Préparation au suivi parental : code porteur et erreur indistincte
Statut : conception constatée, résistance à l'énumération serveur non vérifiée.
Preuves : `app/src/parent.js:17-26` code à 5 caractères aléatoires après P, via Math.random, constant de repli si stockage échoue ; `pages/Parent.jsx:60-81` affiche le même message pour absence d'enfant et panne ; l'accès parent est prévu sans compte.
Recommandation : code fort révocable, rotation et visibilité des accès, quotas serveur de recherche, message de panne distinct. Vérifier d'abord les protections réelles ; ne pas publier de code d'élève dans un rapport.
Effort : moyen ; nécessite décision de produit et validation serveur.

### T13 — P2 — Mieux mesurer et maîtriser la performance d'entrée
Statut : mesure de fichiers compilés locaux, pas de score Lighthouse ni mesure réseau utilisateur.
Preuves : `app/dist/assets/index-CFUWVPfw.js` = 564 053 octets bruts ; les matières sont bien séparées dans `vite.config.js`. Le précache récupère ensuite tout le catalogue, y compris les matières non choisies.
Recommandation : budget sur JS initial et téléchargement total, mesure mobile avec réseau lent, chargement par langue et revue des imports communs ; conserver les matières séparées et faire du hors-ligne complet un choix explicite si les mesures le justifient.
Effort : moyen.

### T14 — P2 — Moderniser l'authentification sans confondre UI et autorisation
Statut : opportunité de durcissement, aucune faille d'accès intercompte reproduite ici.
Preuves : `app/src/auth.js:166-171` flux OAuth implicite ; `auth.js:7-24` jetons en localStorage ; `auth.js:114-140` protège déjà les requêtes contre les changements de compte ; `store.jsx:235-258` restaure le rôle du profil.
Recommandation : évaluer flux OAuth PKCE et politique CSP compatible avec le site statique ; vérifier les autorisations professeur côté base, jamais seulement par visibilité du bouton ; prévoir scénario multi-onglets et révocation de session. Le stockage local d'un jeton est une exposition en cas de script malveillant, pas une preuve qu'un tel script existe.
Effort : moyen à élevé selon migration.

## Plan de réalisation suggéré

1. Relire/tester/fusionner la PR #14 pour T01, T02, T03, T04, T06. Corriger séparément le résultat QCM non transmis T05.
2. Récompenses : contrôle de non-régression T03 après fusion ; T08/T09 avant abonnement réel.
3. Validation d'accès T07 en parallèle, sans supposer l'état de la production.
4. Robustesse et confort : T10/T11/T12/T13, puis T14 selon le modèle de menace.

## Limites

Audit du code actuel et petites reproductions locales ; aucune certification de sécurité ni de disponibilité, aucun contrôle des réglages Supabase réels, aucun accès aux données des élèves, aucun test de paiement. Les exemples de code montrent les défauts du chemin logique ; ils n'établissent pas leur fréquence chez les utilisateurs. Les changements de Claude en branches ouvertes peuvent déjà résoudre certains constats : comparer les PR avant de créer des corrections concurrentes. Le parent consolide avec l'audit visuel/accessibilité et l'audit pédagogique dans le PDF final.
