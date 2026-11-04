# Préparer ses trois sports

L’entrée /#/sport-bac présente un parcours unique en trois étapes :

1. Choisir le barème Homme/Femme du référentiel national et les trois sports. Pour le CCF, trois champs différents sont nécessaires.
2. Indiquer les performances actuelles et visées. Les épreuves chronométrées ou mesurées utilisent les repères nationaux disponibles. Les autres activités proposent un indicateur d’atelier personnel clairement distinct d’une note officielle. Les critères AFL1/2/3 et la répartition 4/4,6/2 ou2/6 restent accessibles dans les détails de chaque sport.
3. Créer une fiche imprimable : écart actuel/objectif, repère intermédiaire, priorités, exercices encadrés et préparation à domicile, carnet de séance et rôle auprès des autres.

La fiche ne transforme pas arbitrairement une performance en note sur20. Le seuil national CA1 correspond seulement à3points sur6 de performance ; la grille du lycée reste déterminante. Les masses des engins et hauteurs des haies sont conservées dans les précisions des épreuves.

Les propositions d’entraînement sont dans app/content/eps/preparation.json et les fiches d’activité existantes. La priorité et le repère intermédiaire dépendent de l’écart saisi, sans garantie d’atteindre un résultat dans un délai donné. Les situations à risque restent encadrées ; les exercices à domicile sont distincts.

Le brouillon reste dans localStorage sur cet appareil, sous une clé propre au compte ; il n’est pas envoyé à une IA ou à Supabase. Le composant est recréé au changement de compte. Le stockage indisponible est signalé et la fiche reste imprimable. La suppression des données de l’appareil existante efface aussi ces clés. Les contrôles sont disponibles dans les six langues de l’interface ; les textes pédagogiques utilisent le mécanisme de traduction publique existant.

Le référentiel complet, les calculs et le catalogue antérieurs restent disponibles via « Référentiel détaillé ». Leurs tests sont conservés et ouvrent désormais cette vue explicitement. Aucun changement d’abonnement.

Validation locale :760 tests unitaires réussis,36 contrôles ciblés réussis,11 parcours EPS distincts réussis dont4 pour le nouveau parcours. La sonde de changement d’activité a été reprise avec le bouton Retour limité au formulaire pour éviter la confusion avec le Retour général. PDF d’exemple de3pages A4 et rendu mobile320px/contrastes clair-sombre contrôlés. La publication nécessite encore les contrôles GitHub et une vérification publique de la version livrée.
