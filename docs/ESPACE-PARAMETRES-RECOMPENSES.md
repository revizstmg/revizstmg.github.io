# Espaces du compte et récompenses

Demande du 25 octobre 2026, PR #107. Charte conservée avec retour des émojis demandé dans la même session.

## Sessions et communauté

Le diagnostic réel a trouvé des appels anonymes refusés aux tables leaderboard, friend_user, live_session et à revizstmg_ligue. Les comptes authentifiés disposent des droits, avec RLS. Aucun droit de la base n’a été élargi.

Un profil local n’est pas une preuve de connexion. Classes, amis et classements présentent une invitation à se reconnecter si le jeton manque ou si son propriétaire diffère du compte affiché. Une expiration non renouvelable avertit le rendu dans le même onglet. Le formulaire de reconnexion reste ouvert malgré le profil local déjà configuré. Les requêtes sociales ne partent pas anonymement ; seule la consultation parent par code, prévue sans compte, conserve son exception explicite.

## Paramètres

L’ancien identifiant d’onglet profil reste stable, mais affiche Paramètres et mène à /parametres. Les anciens liens /moi continuent de montrer les progrès. Le menu du compte et le menu mobile donnent accès aux paramètres.

Profil et photo sont enregistrés explicitement sur profiles avant la mise à jour locale ; retrait de photo compris. Pas de modification du rôle du compte. Photo JPEG/PNG/WebP de 5 Mo maximum, recadrée localement à 160 px. Erreur visible, formulaire conservé en cas d’échec. Mot de passe via Auth avec contrôle de confirmation et champs effacés après réussite. Accessibilité, langue, thème, onglets, langues étudiées, suivi parent, rappels, export et suppression restent disponibles.

## Déplacement des onglets

Maintenir la poignée pendant 350 ms puis glisser. Capture du pointeur sur la liste stable pour supporter le déplacement des lignes. Relâcher enregistre l’ordre ; annuler le geste ou Échap ne le modifie pas. Le reste de la page reste défilable ; la poignée réserve le geste tactile. Boutons monter/descendre et flèches du clavier conservés, annonce accessible, 2 à 5 onglets et préférences existantes réutilisées.

## Lots immédiats

| Lot | Conditions | Attribution |
|---|---|---|
| Semaine organisée | 250 XP, 2 tests de thèmes à au moins 70 % | Planning PDF personnalisé de 7 jours |
| Dossier de progrès | 1 900 XP, 5 tests à 80 % | Bilan, questions enregistrées à retravailler, 3 gels |
| Pack objectif bac | 6 500 XP, 10 tests à 85 % | Programme de 14 jours, bilan, questions et cartes de rappel enregistrées, 5 gels |
| Toute la collection | 12 200 XP, 15 tests à 90 % | Personnalisations actuelles de la boutique, sans consommer de pièces |

Une collecte unique utilise shopRewards et la fusion existante ; les documents peuvent être retéléchargés avec les données actualisées. Un QCM reprend le texte de la réponse correcte, pas son numéro de choix. Si des questions ou cartes manquent, le PDF le dit ; aucune erreur ni réussite n’est inventée. Le document est un support d’entraînement, pas une certification. Pas d’appel IA ni de dépense externe.

Les récompenses cosmétiques et anciens achats restent valides. Les mois Premium/Ultimate restent des réservations futures à vérifier, sans activation commerciale côté client. Aucun lot payant, stock ou partenaire fictif annoncé. L’accessibilité et les cours restent accessibles sans déblocage.

## Organisation des réglages (PR #114)

L’index Paramètres présente désormais des grandes rubriques, puis leurs sous-réglages, avec les formulaires affichés uniquement dans le panneau choisi. Profil, mot de passe, export et suppression sont conservés. Structure et adresses dans [PARAMETRES-RUBRIQUES.md](PARAMETRES-RUBRIQUES.md). Le menu principal est également accessible sur ordinateur.
