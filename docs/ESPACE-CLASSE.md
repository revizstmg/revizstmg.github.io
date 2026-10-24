# Espace classe

Le professeur peut choisir un nom à la création ou conserver le nom proposé, puis le modifier depuis l’en-tête. Le nom, limité à 60 caractères, est enregistré dans `teacher_class.label`. Le code d’invitation reste stable. Les élèves retrouvent ce nom dans leur sélecteur de classe.

La vue d’ensemble présente les effectifs, l’activité du jour, les quiz publiés, les questions ouvertes, les derniers échanges et l’objectif collectif. Les raccourcis diffèrent selon le rôle : publier un quiz et suivre les élèves pour le professeur ; ouvrir les quiz et poser une question pour l’élève. Les autres espaces restent accessibles dans le menu complémentaire. Le suivi professeur conserve tableau, groupes et réglages.

Les opérations d’écriture signalent les échecs et conservent les champs saisis. Le renommage filtre à la fois le code et le propriétaire et vérifie la représentation retournée ; les politiques existantes protègent l’écriture. Les élèves résolvent les noms par le RPC existant, sans accès à la liste des classes des autres professeurs. Aucun schéma, règle RLS ni donnée NAH n’a été modifié.

L’interface utilise les six langues locales et s’adapte aux petits écrans. Les contrôles navigateur emploient un serveur REST simulé, sans écriture sur les comptes réels. Ils couvrent plusieurs classes, création et renommage persistants, erreurs réseau, groupes, annonces, quiz, actualisation, accès clavier, contrastes clair/sombre et absence de débordement à 320 px.

Sur téléphone (moins de 768 px), le bouton « Menu de la classe » regroupe toutes les rubriques. Le professeur dispose aussi d’accès directs aux groupes et aux réglages. La rubrique active est indiquée ; le panneau se ferme après un choix, par la croix, par Échap ou en touchant le fond extérieur. Son en-tête reste visible pendant le défilement ; la tabulation reste dans le dialogue et le défilement de la page est suspendu. Un passage à une largeur ordinateur ferme le panneau.

À partir de 1024 px, quatre liens permanents dans l’en-tête général donnent accès à Ma classe, Amis, Boutique et Classement, avec indication de la page ouverte. Ils utilisent les traductions du site et ne changent pas les onglets personnels de la barre du bas.
