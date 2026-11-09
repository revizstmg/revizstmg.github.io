# Audit de cinq agents : bilan du 9 novembre 2026

Référence examinée : `c702938bb55b3456733cd7726951b67940fcd2f4`. La source produit correspond à la version compilée `c0b7632c501048ea31866879f8a0028af8e89584`. L'audit n'a modifié ni le site ni les données.

La première passe a été interrompue par une limite d'utilisation. Les résultats effectivement terminés ont été récupérés, puis cinq agents ont achevé leurs volets et recherché des cas supplémentaires. Les échecs de serveur local et les sondes non concluantes ne sont pas comptés comme des défauts du site.

Les correctifs de ces constats sont décrits dans [le suivi des corrections](../corrections-neuf-defauts.md). Le journal de coordination précise leur état de publication. Cet audit conserve les observations de la version examinée.

## Neuf défauts confirmés, par priorité

La note indique l'importance estimée, de 1 (mineur) à 10 (critique). Les scénarios de panne sont simulés : ils démontrent un défaut de reprise, pas une indisponibilité actuelle d'un service externe.

| Priorité | Défaut | Conséquence | Rapport |
|---|---|---|---|
| 7/10 | Jeux manuels contenant des notions étrangères au chapitre associé | Exemples vérifiés en GF, mercatique, RH et SIG ; quatre occurrences d'une même famille de rattachement | [Cours](03-cours-exercices.md) |
| 7/10 | Retour OAuth sans échéance | Connexion bloquée si la lecture de l'utilisateur ne répond pas ; fragment non nettoyé durant l'attente | [Comptes C5-01](01-comptes-navigation.md) |
| 7/10 | Recherche des chapitres d'examen non bornée | Un module de langues Première bloqué empêche une demande de management Terminale, avant tout appel IA | [Examens E5-01](05-examens-pdf.md) |
| 6/10 | Code du profil conservé après sortie de classe depuis Classement | Le code de l'ancienne classe est rétabli à la restauration ; interaction et restauration testées séparément | [Social S1](02-social-boutique.md) |
| 6/10 | Enregistrement du profil sans échéance sur l'envoi | Formulaire occupé et désactivé sans possibilité de réessai | [Comptes C5-02](01-comptes-navigation.md) |
| 6/10 | Corps d'erreur de changement de mot de passe lu hors délai | Champs et déconnexion restent désactivés | [Comptes C5-03](01-comptes-navigation.md) |
| 6/10 | Corps de réponse de création de groupe lu hors délai | Action sociale laissée en attente malgré une limite annoncée de 15 secondes | [Social S3](02-social-boutique.md) |
| 6/10 | Carte audio longue sans défilement sur petit écran | Commandes de lecture hors écran à 320 × 568 px ; fermeture accessible | [Révision R1](04-revision-progression.md) |
| 3/10 | Confirmation de copie erronée dans Amis | « Copié » affiché malgré le refus du presse-papiers | [Social S2](02-social-boutique.md) |

## Résultats positifs et couverture exacte

- **Cours :** 32 tests ciblés antérieurs réussis ; nouvelle sonde de 110 thèmes, 861 sections, 4 320 jeux pour un tirage et 5 332 QCM. Aucun choix exactement identique et aucun blanc manquant dans ce tirage. Ce contrôle structurel ne certifie pas la justesse de toutes les notions.
- **Boutique :** 15 tests ciblés réussis à la reprise ; aucun nouveau défaut de boutique confirmé dans ce volet.
- **Révisions :** 11 parcours antérieurs réussis et 3 parcours de reprise réussis, plus une nouvelle sonde révélant le défaut audio.
- **Comptes :** 3 pannes reproduites et 4 contrôles Axe à 320 px sans violation détectée ni débordement sur les écrans examinés.
- **Social :** 2 interactions navigateur et 2 sondes de logique ; pas de reconnexion ou réinscription dans la vraie base.
- **Examens/productions :** 34 parcours réussis, dont 20 antérieurs récupérés et 14 complémentaires terminés à la reprise (langues, Prix, sujets prêts et téléchargements).
- **PDF :** 61 fichiers et 503 pages contrôlés techniquement, sans NUL, page vide ou débordement horizontal détecté.
- **Publication :** 10 modules/styles actifs et les 61 PDF publics comparés octet par octet au dépôt ; [preuve](publication-verifiee.json).
- **Sitemap :** HTTP 200, XML valide, 858 URL sans fragment et sur le bon domaine ; [preuve](sitemap-verifie.json). Cela ne prouve pas que Search Console l'a traité ni que toutes les pages sont indexées.

## Deux formulations à clarifier

1. GF : préciser « marge sur coût variable **unitaire** » dans l'avertissement sur le calcul d'un seuil en unités.
2. Audio : l'aide dit « en boucle », alors que le lecteur s'arrête à la dernière carte.

Ces améliorations de formulation ne sont pas ajoutées aux neuf défauts reproduits.

## Preuves et limites

Les cinq rapports détaillent les étapes, le résultat attendu et observé, les sources et les preuves. Les JSON légers sont archivés dans [preuves/](preuves/). Captures et scripts supplémentaires restent dans `/workspace/output/audit-cinq-20261109/`.

Aucun appel IA payant ou réel, mutation Supabase/Auth/NAH, achat, envoi de message ou de copie réelle n'a été effectué. Les comptes, droits et réponses réseau de test sont simulés. Les règles serveur réellement déployées, Google OAuth en production, Stripe, la facturation et la correction d'une copie par le fournisseur ne sont donc pas certifiés. Une relecture exhaustive des cours et des langues n'est pas démontrée par ce contrôle.

Les neuf défauts sont **identifiés, pas corrigés** dans cette livraison d'audit.
