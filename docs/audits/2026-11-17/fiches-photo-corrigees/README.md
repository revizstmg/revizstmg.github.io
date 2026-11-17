# Isolation et nettoyage des fiches photo

Correction des [deux défauts reproduits](../fiches-photo/README.md) dans la [PR239](https://github.com/revizstmg/revizstmg.github.io/pull/239), fusionnée dans `d551c312b13453ef40f2fc98e52646348e91e61f`.

## Changements

- La page de travail est identifiée par le compte. Une transition vers B démonte le travail de A, même si la copie locale B est déjà disponible. Champs, résultat, photos et messages sont recréés pour B ; les fiches explicitement sauvegardées restent dans la progression de leur propriétaire.
- Les actions de génération/sauvegarde et création de flashcards vérifient l’identité actuelle. Une ancienne vue ne peut plus enregistrer après un changement de session avant la mise à jour visuelle.
- Chaque blob URL créée est suivie dans une collection propre à l’instance. Retrait, réinitialisation et démontage libèrent les URL concernées. La suppression d’une URL déjà retirée est ignorée ; l’ajout d’une image ne révoque pas les autres.
- Départ et changement de compte invalident la génération et annulent l’attente réseau. Les retours OCR/vision périmés ne restaurent plus d’ancien travail.
- Pas de nouveau texte d’interface ni changement des droits, prix, cours ou fonctions Supabase. Le README précise la propriété du brouillon et la durée de vie des prévisualisations.

## Vérifications ciblées

- **3 tests unitaires réussis** : hooks et contrat du client vision.
- **11 parcours téléphone réussis** : huit nouveaux scénarios et les trois précédents des fiches-photo (lot corrompu, OCR/fiche/sauvegarde/reprise, réponse tardive après réinitialisation).
- **8 nouveaux parcours ordinateur réussis**. Les droits de B sont fictifs mais explicites, indépendants de la grâce.
- Les nouvelles assertions vérifient les champs/résultat vides et la photo libérée sous B, puis la sauvegarde normale de son propre texte. Les départs répétés révoquent toutes les ressources ; Retirer/Tout recommencer restent fonctionnels. L’ajout/retrait garde les aperçus restants lisibles. Un clic d’une ancienne identité ne sauvegarde rien. Une réponse vision retardée après départ ne réapparaît pas.
- Compilation réussie ; aucun contrôle ni empreinte de contenu supprimé.

## Portée et limites

Faux comptes, images synthétiques et services REST/vision simulés. Structuration locale et OCR simulé dans les contrôles existants ; aucune voix/photo personnelle, génération facturée, écriture Supabase/NAH, paiement ou message réel. Les essais vérifient la révocation des URL et leur indisponibilité après nettoyage, pas un nombre d’octets de RAM libérés ni une mesure de performance. Les bibliothèques enregistrées ne sont pas purgées rétroactivement.

## Livraison terminée

- CI générale [44126280705](https://github.com/revizstmg/revizstmg.github.io/actions/runs/44126280705) réussie : **897 tests UTC**, **897 Paris**, compilation et **457 parcours navigateur**. [Extrait](preuves/ci-extrait.log). Aucun contrôle supprimé.
- Compilation publiée automatiquement : `86b86bb29953dd4879006c708da24822a5e70b44` ; [Pages44129356069](https://github.com/revizstmg/revizstmg.github.io/actions/runs/44129356069) réussi.
- Après Pages : **17 fichiers publics sur17 conformes à Git**, dont PhotoFiche et l’entrée active. [Empreintes](preuves/fichiers-publics.json).
- **8 parcours publics réussis** : les deux transitions de compte suivies d’une sauvegarde normale de B, trois départs successifs, retrait, réinitialisation, ajout/retrait conservant les aperçus, clic d’une ancienne session et réponse vision retardée. [Journal](preuves/parcours-publics.log). Images, profils et services restent simulés ; aucune donnée réelle modifiée.
