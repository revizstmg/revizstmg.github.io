# Audit 3 : examens, productions, accompagnement et offres

Référence : worktree `audit-global-20261109-3`, HEAD `9eea90627`. Inspection en lecture seule, version compilée existante servie au port 4263. Aucun appel réel à Gemini, aucun achat, courriel ou changement Supabase/NAH.

## Couverture

- 24 ouvertures en navigateur : Bac blanc, Prix, Mes notes, Grand Oral, étude de gestion, EPS, parcours personnalisé, vacances, Avenir, offres, fiches photo et coach. Deux profils simulés : Terminale sur ordinateur 1280px et Première sur téléphone 390px. Aucune exception JavaScript et aucun débordement horizontal dans ces ouvertures (`routes.json`, `probe.mjs`). Les avis hors niveau du Grand Oral/étude sont prévus ; le Prix redirige la Première vers le bac blanc.
- 91 tests ciblés réussis : contrats examen et correction, Prix et grille, EPS, étude, Grand Oral, vacances et orientation actuelle (`vitest.log`). Les réponses fournisseurs sont simulées ; ce résultat ne prouve pas la disponibilité de Gemini en production.
- Inventaire technique de 79 fichiers PDF hors copie app/public (copies ressources/assets/publication incluses) : 1 383 pages cumulées, tous ouvrables par PyMuPDF, aucun chiffré. 69 contenus uniques par SHA256. Nombre de champs interactifs recensé (`pdf-inventory.json`). Ce contrôle vérifie l'intégrité des fichiers, pas la justesse pédagogique des 1 383 pages.
- Lecture des contrôles d'identité, sauvegarde locale, quotas, consentements, délais et reprise dans CreateExam, ExamCopy, ChapterControl, CourseTutor, PhotoFiche, fichesVision, Excellence, MesNotes, SportBac et abonnements.
- 28 parcours navigateur ciblés validés : 27 dans la campagne initiale (`browser.log`), puis le test allemand du Prix dans son viewport mobile attendu (`mobile-recheck.log`). Mon premier lancement desktop faisait attendre un onglet volontairement réservé au mobile ; ce faux positif de configuration a été écarté. Scénarios réutilisés avec réseau externe bloqué, compilation inchangée. Barème Prix 5+5+5+3+2, panne fournisseur, annulation et attente maximale, copies illisibles, consentements, reprise, séparation des comptes, choix manuels inter-niveaux, téléchargements PDF, EPS/AFL et partage parent vacances contrôlés.

## Défauts nouveaux confirmés

Aucun défaut nouveau reproductible confirmé dans les contrôles achevés. Les anciens incidents de correction infinie ne sont pas requalifiés comme présents : les contrôles ont maintenant des délais et des mécanismes de reprise. Une lecture de code ne suffit pas à affirmer que tous les cas réels fonctionnent.

## Améliorations distinctes des bugs

| Importance | Proposition | Justification et source |
|---|---|---|
| 5/10 | Bouton Annuler pendant l'analyse et la génération d'examen | `app/src/components/CreateExam.jsx:68` prévoit 180 secondes et `:126` un statut, mais pas d'annulation explicite ; les deux boutons de programme sont désactivés pendant l'attente (`:128`). Faciliter la sortie sans quitter l'écran. |
| 5/10 | Même annulation pour le tuteur | `app/src/components/CourseTutor.jsx:18` borne à 150 secondes et désactive les contrôles pendant l'attente. Permettre de reprendre la main comme pour les questions type contrôle. |
| 4/10 | Mieux expliquer la différence entre sauvegarde de copie et sauvegarde de pièces jointes | Les copies et résultats sont locaux ; les fichiers déposés restent volontairement en mémoire pour la confidentialité. Une synthèse très courte avant dépôt aiderait l'élève à comprendre la reprise après rechargement. |
| 3/10 | Rendre visible la progression en trois étapes pendant l'examen personnalisé | Demande, programme puis sujet sont fonctionnels, mais une progression compacte réduirait l'impression d'attente indéfinie sans ajouter de commandes. |

## Points à ne pas présenter comme validés

Pas de paiement Stripe réel, de webhook, d'autorisation/RLS en base réelle, d'envoi de fichiers personnels, d'accès caméra/micro réel ou d'appel fournisseur. Aucun jugement complet sur la pédagogie des PDF, ni sur la notation d'une copie réelle. Disponibilité production, coûts et quotas réels restent à contrôler séparément. Pas de suite globale ni de compilation concurrente. Avenir : ce rapport décrit la version de référence ; la nouvelle version développée par le parent doit être contre-relue séparément.

## Contrelecture de la nouvelle version Avenir (sources non compilées)

Worktree `fix-economie-audits`, lecture de `avenir.js`, `avenirGlobal.js`, `BilanAvenirGlobal.jsx`, `Avenir.jsx` et CSS. Aucune modification de produit, compilation ni suite complète.

Validé par sonde de données : 80 questions et 80 identifiants uniques, 12 étapes ; les 56 anciennes réponses sont conservées, reprise sur `methodes` ; les clés inconnues sont exclues ; quatre voies présentes. Les notes ne suppriment aucune piste et l'ajustement reste borné à +/-0,2. La complétude est contrôlée avant tout bilan, y compris après navigation directe entre étapes. Le projet libre est rendu comme texte React, pas injecté en HTML ; il reste dans la sauvegarde privée de profil et n'apparaît pas dans `buildChildSnapshot`. Aucun appel IA n'est ajouté. Les formulations distinguent préférences déclarées, questionnaire maison et admission ; ECT inclut la poursuite au-delà des deux années.

Défaut trouvé, **4/10** : impression des préférences détaillées fermées. Le CSS affiche `details` et `dl`, mais Chromium conserve le contenu d'un `details` fermé masqué (hauteur `dl=0`). Étapes : afficher un `details.avenir-profile-details` fermé avec ce CSS, émuler l'impression et produire le PDF. Attendu : questions/réponses imprimées. Observé : seul le titre de rubrique apparaît. Preuves : `check-print.mjs`, `avenir-print-proof.pdf/json`. Source : règles `@media print` finales de `app/src/pages/Avenir.css`, composant `BilanAvenirGlobal.jsx` rubrique « Mes préférences en détail ». Transmis au parent avant publication ; ouvrir/restaurer les détails à l'impression ou prévoir un rendu statique imprimable. Contrôle après correction à réaliser par le parent sur sa compilation.

### Recontrôle du correctif d'impression sur compilé

**Défaut corrigé et validé** sur `http://127.0.0.1:4270/#/parcours-avenir`, profil fictif complété80réponses. La copie statique est masquée à l'écran et visible à l'impression ; les détails interactifs sont masqués à l'impression. PDF A4 réel généré : les **24 questions et leurs 24 réponses des préférences complémentaires sont toutes présentes dans le texte extrait**, sans élément manquant. Le projet libre figure dans le bilan/PDF personnel attendu et n'apparaît dans aucune requête réseau capturée pendant ce contrôle. Aucun appel backend réel autorisé : cette dernière vérification ne remplace pas un audit RLS.

Preuves : `check-final-print.mjs`, `avenir-final-print.pdf`, `.txt`, `.json`, `avenir-final-print-text-check.json`. Aucun fichier source ou test modifié ; aucune recompilation effectuée par l'agent3.
