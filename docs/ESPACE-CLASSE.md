# Espace classe

Le professeur peut choisir un nom à la création ou conserver le nom proposé, puis le modifier depuis l’en-tête. Le nom, limité à 60 caractères, est enregistré dans `teacher_class.label`. Le code d’invitation reste stable. Les élèves retrouvent ce nom dans leur sélecteur de classe.

La vue d’ensemble présente les effectifs, l’activité du jour, les quiz publiés, les questions ouvertes, les derniers échanges et l’objectif collectif. Les raccourcis diffèrent selon le rôle : publier un quiz et suivre les élèves pour le professeur ; ouvrir les quiz et poser une question pour l’élève. Les autres espaces restent accessibles dans le menu complémentaire. Le suivi professeur conserve tableau, groupes et réglages.

Les opérations d’écriture signalent les échecs et conservent les champs saisis. Le renommage filtre à la fois le code et le propriétaire et vérifie la représentation retournée ; les politiques existantes protègent l’écriture. Les élèves résolvent les noms par le RPC existant, sans accès à la liste des classes des autres professeurs. Aucun schéma, règle RLS ni donnée NAH n’a été modifié.

L’interface utilise les six langues locales et s’adapte aux petits écrans. Les contrôles navigateur emploient un serveur REST simulé, sans écriture sur les comptes réels. Ils couvrent plusieurs classes, création et renommage persistants, erreurs réseau, groupes, annonces, quiz, actualisation, accès clavier, contrastes clair/sombre et absence de débordement à 320 px.
