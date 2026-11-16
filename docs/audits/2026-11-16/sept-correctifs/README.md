# Corrections des sept défauts

Demande du propriétaire du16novembre2026 après l’audit de trois agents. Référence initiale08f6a79. Aucun cours, tarif ou droit d’abonnement changé.

## Changements

1. Retrait parent : désactivation locale immédiate, attente de confirmation distante clairement affichée, reprise au retour réseau, toutes les30secondes et sur demande. La désactivation reste mémorisée dans la progression, donc reprise au rechargement ; aucun instantané republié pour la reprendre. Réponses tardives et timers séparés par identité. Une ancienne confirmation n’est pas réutilisée après réactivation.
2. Suppression du compte : délai complet15secondes sur le RPC et sa réponse ; état occupé libéré et message de résultat non confirmé, sans annoncer à tort que le compte existe encore ou a été supprimé. La session locale est conservée si le résultat est incertain.
3. Annonces du mur : migration ciblée appliquée sur Supabase, garde du genre/nom/anonymat pour l’auteur aussi. Le professeur conserve ses droits, les membres conservent les réactions et l’auteur l’édition de son texte. Aucun autre changement de base, aucune table NAH modifiée.
4. Publication : distinction dernière tentative / dernière réussite. Un échec récent ne devient plus un succès ancien ; seules les annulations explicitement identifiées sont écartées. Le rapprochement avec la routine utilise les dates et ne masque pas un échec non daté.
5. Statistiques : délai15secondes sur la requête Supabase et son corps ; résultat indisponible explicite et poursuite des autres collectes. Le corps des réponses GitHub est également borné.
6. Documentation : état présent des offres, langues, accueil, révisions, services déployés et RLS ; séparation du mode TEST et de l’ouverture commerciale ; consignes CLAUDE synchronisées.
7. CGU : précision des espaces gratuits sans rendre le classement gratuit ni modifier les droits existants.

Complément mineur : échec du presse-papiers expliqué. Messages des corrections intégrés hors ligne dans les cinq langues étrangères.

## Vérifications

- 61 tests ciblés (authentification, statistiques/publication, rapport et traductions) réussis.
- Compilation réussie ; contrôles navigateur et CI générale à compléter avant déclaration de publication.
- Supabase : migration enregistrée, garde active. Six scénarios sur table temporaire avec le vrai déclencheur : annonce/usurpation de nom/réponse professeur/texte d’autrui refusés ; texte propre et réaction autorisés. Transaction annulée, table temporaire retirée. Aucun compte réel utilisé.
- Lot initial d’audit :866tests unitaires réussis,422parcours réussis et5échecs. Ces résultats historiques ne sont pas présentés comme ceux du nouveau code.
- La première reprise locale a montré un défaut du nouveau test (bouton avec émoji), corrigé sans toucher au produit. Le choix de matière du Parcours recalculait deux fois tous les exercices pour en compter les thèmes : remplacé par un parcours de métadonnées unique, sans changer les résultats. Test de non-régression vérifiant les comptes et l’absence de génération. Le parcours QCM garantira une réussite et une erreur à partir du vrai cours, au lieu de supposer que cinq tirages aléatoires donneront des XP.

## Limites inchangées

Stripe reste en TEST ; aucune vente ni génération payante exercée. Les recommandations d’intégrité du classement, de modèle conditionnel fiche-vision, d’advisors ou de lancement ne sont pas confondues avec ces sept défauts. Aucune relecture pédagogique complète prétendue. Les contrôles automatisés simulent les services, sauf la vérification SQL ciblée décrite ci-dessus.
