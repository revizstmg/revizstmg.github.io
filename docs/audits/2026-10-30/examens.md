> Rapport partiel : rédaction interrompue par la limite d’utilisation. Les journaux terminés ont ensuite été récupérés par le coordinateur ; voir README.md. Les mentions « à compléter » ci-dessous ne constituent pas une validation.

# Contre-audit indépendant — examens, productions et corrections

Date : 30 octobre 2026. Agent 4. Travail en lecture, sur la worktree détachée `/workspace/work/contre-audit-examens`, compilation publiée `a0ba33ca5473842649bbf5aa3da5fd56cdf2dac9` issue de `cbfda015` (#153). Aucun rapport récent d’un autre agent consulté. Aucun changement du code produit, aucune écriture Supabase, aucun compte, paiement, microphone ou fichier d’élève réel. Les seuls fichiers ajoutés dans la worktree sont des outils temporaires de vérification.

## Méthode et preuves

Version compilée servie à `http://localhost:4188/`, navigateur Chromium, émulation Pixel 7, un worker. Les helpers `app/tests/parcours/eleve.js` bloquent tout réseau extérieur et injectent des comptes et abonnements fictifs. Les réponses IA sont simulées : les résultats concernent les états de l’application, les contrats et la reprise, jamais la qualité pédagogique réelle du fournisseur, sa lecture des copies ou sa disponibilité en production.

Commandes et résultats définitifs : à compléter après exécution. Journal brut `/workspace/work/examens-run.log`, résultat structuré `/workspace/work/examens-results.json`, traces d’échec `/workspace/work/examens-artifacts`. Les preuves ne contiennent que des données synthétiques.

## Couverture réellement exécutée

La sélection couvre les parcours suivants ; les résultats chiffrés finaux sont consignés ci-dessus après terminaison :

| Domaine | Vérification navigateur |
|---|---|
| Accès et navigation | Gratuit, Premium, Ultimate, grâce, relecture après changement d’abonnement, routes encodées, retour cours/offres ; contrôles transversaux AA en clair/sombre. |
| Bac blanc | Quatre rubriques selon Première/Terminale, centres des annales, URLs PDF et lecteur Excellence agrandi avec zoom/fermeture/focus. |
| Maths Première | Réponses, correction locale, note indicative, nouveau sujet, sortie ; complément sur reprise du même sujet après rechargement et sortie. |
| Création d’examen | Plan simulé, génération, durée, chapitres manuels sur deux niveaux, limite de sélection, filtres, PDF sujet/corrigé distincts, reprise du sujet généré, service indisponible et quota. |
| Copie d’examen | Consentement, PDF/photos synthétiques, ordre des pièces, format interdit, correction simulée détaillée, copie illisible, absence de note fabriquée et absence de fichiers dans le stockage de reprise. |
| Excellence économique | Dossier complet, copie, quatre heures indicatives, remise, correction simulée, reprise, téléchargement texte, séparation des sessions, panne/annulation/délai ; complément sur retour tardif après annulation. |
| Contrôle de chapitre et tuteur | Préparation/correction simulées, barème, autre question, isolation du chapitre, conservation de réponse en erreur, annulation/délai et repli signalé ; contexte de discussion borné. |
| Notes et bilans | Saisie/validation des notes et chapitres, provenance du bilan, fichiers synthétiques et consentement, annulation/délai/illisibilité/quota, brouillon et reprise. |
| Grand Oral / étude de gestion | Questions, sources, analyses, arguments, auto-évaluation et téléchargements ; reprise après rechargement ; permission micro tardive/double clic et refus simulés. |

Les noms précis et durées des scénarios sont dans le journal brut et le JSON. Un passage automatique AA n’est pas une certification d’accessibilité ni un essai avec lecteur d’écran.

## Bugs reproduits

À compléter après reproduction.

## Risques et limites, distincts des bugs reproduits

- Les annales de droit-économie et management sont des liens vers le ministère : les variantes de centre et les destinations sont contrôlées dans le navigateur, mais le réseau extérieur est bloqué ; aucun succès de téléchargement distant actuel n’est certifié.
- Les quatre PDF Excellence livrés localement sont lisibles par `pdfinfo` : sessions 2024/2023/2022/2021, respectivement 10/11/13/12 pages. Preuves `/workspace/work/examens-pdf-local.json` et `/workspace/work/examens-assets.json` ; les 46 images correspondantes ont aussi passé un décodage Pillow sans erreur. Ce contrôle structurel ne vaut pas relecture pédagogique intégrale.
- L’activation réelle des fonctions, les droits et quotas effectivement appliqués au serveur, l’expiration réelle d’un abonnement, les fichiers scannés réels et les fournisseurs d’IA ne sont pas vérifiés. Les profils gratuit/Premium/Ultimate et les refus utilisent des simulations.
- La reprise des copies locales ne certifie pas une synchronisation entre appareils. Le sujet de maths utilise `sessionStorage` (`app/src/data/sessionDraft.js:1`) et annonce une conservation limitée à l’onglet : fermer cet onglet termine cette garantie.

- Firefox, Safari, lecteur d’écran réel, appareil mobile physique, fermeture complète du navigateur, manque de place disque et perte matérielle du microphone ne sont pas couverts par cette exécution. La matrice de tous les rôles et toutes les spécialités n’a pas été rejouée exhaustivement dans ce périmètre.
