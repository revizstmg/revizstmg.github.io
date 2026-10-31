# Contre-audits après correction

Bilan consolidé le 31 octobre 2026. Les dix défauts précédents sont corrigés et publiés par la PR #153 : source cbfda015, compilation a0ba33ca. Validation générale : 688 tests unitaires dans les deux fuseaux et 349 parcours navigateur réussis ; publication Pages confirmée. Voir ../../CORRECTIONS-AUDIT-20261030.md.

## Cinq agents indépendants

Les cinq agents ont démarré après vérification publique, avec worktrees et serveurs distincts, sans lire les conclusions des autres. Deux rapports sont finalisés ; trois rédactions ont été interrompues par la limite d’utilisation. Le coordinateur a récupéré les journaux déjà terminés. Il ne s’agit donc pas de cinq audits exhaustifs achevés.

| Périmètre | État et résultats disponibles |
|---|---|
| [Première](premiere.md) | Rapport final, aucun nouveau défaut confirmé ; 31 routes mobiles et parcours pédagogiques complémentaires. |
| [Transversal](transversal.md) | Rapport final, aucun nouveau défaut confirmé ; 45 vues et 28 scénarios distincts. |
| [Identités et social](identites.md) | Rapport partiel ; 19 tests unitaires, 49 parcours réussis au premier passage puis les 3 échecs de connexion au serveur rejoués avec succès. Trois sondes finales réussies : deux défauts et navigation transversale. |
| [Examens](examens.md) | Rapport partiel ; journaux terminés : 65 parcours et 4 sondes complémentaires réussis. Une sonde démontre un blocage produit. |
| [Terminale](terminale.md) | Rapport absent, résultats partiels : 54 succès, 3 échecs dont un port de test incorrect ; deux cas restent non conclusifs. |

Ces couvertures se recoupent : leurs nombres ne doivent pas être additionnés comme des fonctions uniques.

## Trois nouveaux défauts reproduits

1. **Demande d’ami après changement de compte.** Si le corps de la recherche arrive après le passage de A à B, la demande utilise l’identité B mais le nom de A. Arrêter toute l’opération si son propriétaire change, y compris après lecture du corps. Preuve : preuves/ami-retarde.json et scénario correspondant.
2. **Retrait du partage parent pendant une publication.** Le client supprime le partage, mais ne rattrape pas un ancien POST terminé après le DELETE. L’ordre des requêtes et l’absence de suppression compensatoire sont reproduits ; la recréation d’une ligne est simulée, pas constatée en production. Corriger le séquencement et prévoir une protection serveur du consentement. Preuve : preuves/parent-consentement.json.
3. **Disponibilité du créateur d’examen sans délai.** Une requête GET retenue laisse « Vérification » et le bouton d’analyse désactivé après cinq minutes simulées, sans réessai. Ajouter un délai d’arrêt et une reprise explicite. Preuve : dernier scénario de preuves/examens.spec.js ; examens-supplement.log : 4 passed.

Les deux premiers constats sont distincts des anciens défauts de codes locaux corrigés. Ces trois nouveaux cas sont signalés, pas corrigés dans cette campagne d’audit.

## Limites

Réseau et comptes synthétiques, IA et paiements simulés, aucun élève réel ni écriture dans Supabase. Les règles réellement déployées, fournisseurs, codes historiques et qualité des corrections IA ne sont pas certifiés. Les PDF Excellence locaux sont structurellement lisibles (46 images décodées), sans relecture pédagogique intégrale. Les incidents d’outillage et échecs non conclusifs restent explicitement séparés des défauts confirmés.
