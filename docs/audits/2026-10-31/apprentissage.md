# Audit indépendant 2 : apprentissage et productions

Audit en lecture seule du 31 octobre 2026. Aucun échange de conclusions avec l’autre auditeur, aucun sous-agent, aucune modification produit, commit ou écriture dans le dépôt principal. Les scripts de contrôle temporaires vivent dans une worktree détachée ; leurs copies et traces sont dans `audit2-apprentissage-preuves/`.

## Version et méthode

- Dépôt audité : `/workspace/work/audit2-apprentissage-20261031`, HEAD `a85d810272d893ba0f3f7dae6cbfef40c39fbc65`.
- Compilation servie : `52334f12b64fa23c03ad7ff20dd3ac8fc211442a`, source `b4a27b34`.
- SHA-256 de `index.html` : `f396a12c41d50a4bfe36ccf5c7030ba42fb00033c727a0b58ac164bcbf21efe1`.
- Serveur statique Python sur `http://127.0.0.1:4191/`, racine compilée, aucun serveur de développement.
- Chromium Playwright, profil Pixel 7, un seul worker, variantes 320/390/1280 pixels selon les parcours. Élève et abonnement synthétiques via `tests/parcours/eleve.js` ; sorties réseau hors localhost bloquées, endpoints simulés explicitement lorsque nécessaires. Aucun appel IA facturé, paiement, mail, véritable utilisateur ou accès en écriture à Supabase.
- AGENTS.md, CLAUDE.md et instructions de coordination lus. L’autorisation d’audit en lecture seule dispense de toute réservation de code : aucun journal du dépôt principal écrit.
- Référence générale fournie par le coordinateur : CI `41198050177` verte, 688 tests unitaires UTC/Paris et 353 parcours. Cette référence n’a pas été relancée ; les résultats locaux ci-dessous sont distincts.

## Commandes réellement exécutées

Depuis le dépôt principal : `git worktree add --detach /workspace/work/audit2-apprentissage-20261031 a85d810272d893ba0f3f7dae6cbfef40c39fbc65`, puis lien vers ses dépendances existantes. Depuis la worktree : `python3 -m http.server 4191 --bind 127.0.0.1`.

Depuis `app/` :

```sh
npx playwright test -c audit2.config.js cours-langues course-studio course-tutor flashcards.spec formules programme parcours-personnalise vacances examen-personnalise excellence grand-oral etude-gestion notes-classe revision-studio practice-studio temps-theme chapter-control exercices-chapitre --grep-invert 'attente maximale|délai maximal|correction bloquée'
```

Configuration conservée : `audit2-apprentissage-preuves/audit2.config.js`. Aucun test unitaire global, compilation ou mise à jour d’empreinte inutilement rejoué.

## Couverture fonctionnelle ciblée

| Famille | Vérification locale |
|---|---|
| Cours et définitions | Onglets, affichage du lecteur et définitions, accessibilité automatisée sur main, absence de débordement à 320/390/1280, bibliothèque/matière/chapitres |
| Exercices | Neuf formats distincts d’un chapitre de droit, Memory et deux QCM lancés ; nouveaux nombres en maths ; périmètre personnalité Première ; anciens exercices langues et philosophie |
| Séries automatiques | Réponses synthétiques : rattachement au cours, correction sourcée, nouvelle série, reprise locale, échec et annulation |
| Flashcards | Paquet enregistré, glissement, boutons, clavier, comptage acquis/à revoir, import invalide ; sondes d’aller-retour Unicode et audio séparées |
| Révision | Choix fil/erreurs/acquis, filtres matière, absence de contenu lorsqu’aucune erreur, liens et bibliothèque ; parcours métier supplémentaires séparés |
| Formules | Sélection, résultat/correction/bilan, maîtrise inchangée, Première et anciens liens, catalogue étendu et reprise |
| Temps et progression | Attribution d’une visite et séance au thème, réparation des anciennes durées aberrantes sans perdre temps normal ni XP ; persistance vérifiée par plusieurs parcours |
| Programme | Première restreinte aux épreuves français et maths même après une visite SDGN |
| Langues et PDF | Cinq langues et PDF locaux aux deux niveaux, en-têtes PDF vérifiés ; clair/sombre, accès clavier/contraste automatisés ; limitation de capture explicitée ci-dessous |
| Parcours | Objectifs, positionnement, adaptation du plan, mobile sombre et allemand ; accès via menu repris isolément après un écart |
| Vacances | Parcours entier, reprise, bilans distincts et séances adaptatives, langue/sombre ; accord de partage et résumé sans réponses privées |
| Bac et créateur | Deux PDF distincts, reprise, indisponibilité, quota sans sujet inventé, dépôt consenti, correction et reprise, fichiers non stockés, ordre photos, illisible, sélection manuelle entre niveaux |
| Excellence/copie | Dossier, défilement, remise, correction simulée, mobile, reprise et téléchargement ; séparation des sessions, accès sans compte, allemand hors ligne et accessibilité |
| Contrôles rédigés | Barème, note indicative, modification/réponse, nouvelle question, isolation par chapitre, panne sans fausse note, repli signalé |
| Tuteur | Reformulations, contexte borné, isolation par chapitre, panne conservant le message sans échange inventé |
| Grand Oral | Règles 2027 affichées, questions, entraînement, sources, analyse, arguments par question |
| Étude de gestion | Catégories, source, analyse, argument A-E-I, évaluation simulée et dossier ; visibilité selon niveau |
| Notes | Saisie/diagnostic, bilan personnalisé, nouveaux exercices/correction et sauvegarde avec la note |
| Compléments | Sondes dédiées : favoris, fiche personnelle/photo, méthodes, coach/minuteur, défi, paramètres, navigation et espaces sociaux ; portée exacte dans les journaux des sondes |

Cette couverture est un échantillonnage fonctionnel conséquent ; elle ne constitue pas une relecture pédagogique de chaque chapitre, une certification linguistique ni un test exhaustif de chaque bouton.

## Défauts reproduits

### APP2-01 — P2 — Les photos 5 à 8 sont ignorées silencieusement par l’analyse

Sur `/fiches-photo`, l’interface annonce « jusqu’à 8 » pages. Ajouter cinq fichiers image synthétiques valides affiche cinq vignettes. Après « Analyser la photo », la requête interceptée vers `fiche-vision` contient exactement **quatre** images. La réponse simulée est acceptée et présentée comme résultat normal, sans avertissement sur la cinquième page omise.

Reproduction autonome : test `audit2: cinq photos selectionnees et nombre envoye au fournisseur` dans `audit2-apprentissage-preuves/audit2-probes.spec.js`. L’assertion attendue `sent === 5` échoue avec `4`. Le journal `probes.log` contient `PHOTO_COUNT { selected: 5, sent: 4 }`. Capture `photo-5-pages.png` et trace de ce scénario conservées.

La lecture du code confirme le mécanisme : `app/src/pages/PhotoFiche.jsx` conserve huit photos, mais `app/src/ficheVision.js` parcourt `files.slice(0, 4)` ; la fonction serveur `supabase/functions/fiche-vision/index.ts` tronque aussi à quatre. Une copie de plusieurs pages peut ainsi être résumée partiellement sans que l’élève le sache. Corriger le contrat d’interface ou traiter effectivement toutes les pages dans les limites autorisées ; afficher explicitement toute limite ou omission. Aucun fournisseur réel utilisé.

### APP2-02 — P3 — Une URL associant une mauvaise matière à un thème reste acceptée

1. Ouvrir `/#/subject/maths/theme/math-c3/chapter/0`.
2. Dans le même document, naviguer vers `/#/subject/gestion-finance/theme/math-c3/chapter/0`.
3. Le cours **Nombre dérivé et tangente** reste affiché avec le contexte de la matière Gestion & Finance. Une combinaison incohérente devrait être refusée ou normalisée vers sa véritable matière.

Reproduction : test `audit2: mauvaise association matiere theme apres chargement`. L’assertion « Page introuvable » échoue, le journal contient le cours de dérivation ; capture `matiere-theme.png` et trace conservées. Le code de `Chapter.jsx` et `Theme.jsx` recherche `sid` et `tid` séparément et ne vérifie pas que le thème appartient à la matière. Le scénario requiert une adresse incohérente saisie/manipulée : aucun lien normal de l’application produisant cette adresse n’a été trouvé. Il s’agit d’un défaut de cohérence de route de faible priorité, pas d’un contournement d’abonnement démontré.

## Écarts de test et points non confirmés

- **Capture des langues Terminale** : timeout de 90 s dans `page.screenshot`, `cours-langues.spec.js`, après les vérifications des cinq PDF, modes clair/sombre et contrastes. Les captures mobiles déjà produites mesurent environ 1082 × 101233 pixels. Le parcours Première équivalent réussit en 1,3 min. La sonde séparée vérifiant les cinq PDF aux deux niveaux sans capture géante réussit (dix contrôles HTTP/signature PDF, fichiers de 842081 à 1228760 octets). Cet écart ne prouve pas un défaut fonctionnel des langues.
- **Titre après accès Mon parcours par le menu** : le premier passage atteint `/parcours`, mais expire sur la visibilité du titre. Le snapshot final contient pourtant le titre exact « Construisons ton parcours ». Reprise isolée consignée dans les résultats finaux ; ne pas déduire un bug produit de cette occurrence seule.
- **Analyse photo sans délai explicite** : `ficheVision.js` utilise un `fetch` sans AbortController/délai ni annulation dans l’écran. C’est un risque lu dans le code, non soumis ici à une sonde de requête éternelle ; il n’est pas compté comme défaut reproduit.

## Résultats finaux et reprises

- Premier lot : **57 réussis / 59**, 10,4 minutes. Deux écarts décrits ci-dessus, sans assimilation automatique à deux bugs produit.
- Second lot : **16 réussis / 18**, 1,5 minute. Les deux échecs sont les assertions attendues des deux nouveaux défauts reproduits. Le scénario menu→Mon parcours **réussit à la reprise isolée** en 9,7 s : ralentissement/instabilité non reproduite, aucun défaut produit confirmé pour ce chemin.
- Total : **77 exécutions de scénarios**, dont une reprise du menu, **73 réussites et 4 échecs bruts**. Deux défauts produit confirmés ; un échec de capture et un échec de visibilité non reproduit. Aucun parcours ignoré dans ces deux sélections. Ne pas additionner ces nombres à la CI générale comme s’il s’agissait de scénarios tous différents.
- Trois contrôles audio réussis : Échap/focus, arrêt pendant le délai entre cartes, Pause/Suivant/Jouer sans ancien délai réactivé. Ce résultat porte sur une API de synthèse vocale simulée, pas sur les voix physiques de l’appareil.
- Les quatre parcours fil/erreurs/acquis et attribution multi-matière réussissent, ainsi que l’espacement du carnet et les deux sondes de variété QCM/trous.
- La sonde Unicode produit puis réimporte correctement le titre `Économie العربية` et la carte `Valeur ajoutée ?` / `Richesse créée.` ; l’état importé complet est journalisé.
- Fiche saisie sans photo : génération locale, enregistrement et conservation après rechargement réussis, aucun fournisseur appelé.
- Coach : démarrage du minuteur, pause conservant le compteur malgré 62 secondes simulées, changement de page/rechargement et reprise conservée réussis ; suppression du favori synthétique sauvegardée.
- Sonde 320 px sur 20 routes : `/cours`, `/favoris`, `/revision`, `/coach`, `/coach-ia`, `/fiches-photo`, `/methodo`, `/defi`, `/moi`, `/programme`, `/parcours`, `/vacances`, `/bac-blanc`, `/grand-oral`, `/etude-de-gestion`, `/mes-notes`, `/parametres`, `/amis`, `/classe`, `/boutique`. Toutes ont un contenu principal, aucune exception collectée, aucune largeur supérieure à 320 px. L’étude de gestion a un message adapté à Terminale ; son parcours complet avait été exercé en Première dans le premier lot.

Commande réelle du second lot (configuration conservée sous `audit2-probes.config.js`) :

```sh
npx playwright test -c audit2-probes.config.js audit2-probes revision-parcours variete-questions carnet audit-dix-correctifs parcours-personnalise --grep 'audit2:|audio :|les acquis|erreurs par matière|suivre le fil|toutes les matières attribue|qcm : Rejouer|trou : Rejouer|une question ratée|accueil : le menu'
```

Journaux complets : `parcours.log`, `probes.log`. Résultats structurés : `parcours.json`, `probes.json`. Les traces d’échec et snapshots sont dans `test-results/` et `probe-results/`. Scripts finaux et configurations conservés à la racine des preuves. Le serveur 4191 est laissé disponible pour le contre-contrôle du coordinateur.

## Limites explicites

- Les intégrations réelles IA, authentification, stockage/synchronisation Supabase, contraintes RLS, paiements et courriels ne sont **pas vérifiés** ; toutes les réponses correspondantes sont synthétiques ou bloquées. Aucun état historique serveur ou partage entre appareils réels certifié.
- Grand Oral, contrôles, tuteur, bac et copie : contrats d’interface/client et persistance testés ; aucune appréciation pédagogique réelle d’un modèle d’IA ou correction humaine certifiée.
- Fiche photo : contrat de nombre d’images reproduit avec PNG synthétiques et réponse simulée ; qualité OCR, reconnaissance manuscrite et extraction réelle non vérifiées. Le défaut de troncature se produit avant tout fournisseur réel.
- PDF : disponibilité locale et signature PDF contrôlées ; aucune relecture intégrale des guides, annales et corrigés. Impression d’une fiche de cours non soumise ici à une vérification de pagination physique.
- Méthodes et défi quotidien : ouverture, contenu et absence de débordement/exceptions seulement dans la sonde propre ; toutes les méthodes, réponses du défi et récompenses n’ont pas été déroulées de nouveau. Coach IA : ouverture couverte ; l’échange de coaching réel n’est pas certifié.
- Social/paramètres : bref passage indépendant sur les pages, sans envoyer d’ami, rejoindre une vraie classe, acheter ou modifier un vrai compte. La majorité des actions de ces familles relève du second auditeur et de la référence CI fraîche ; aucun rapport de cet auditeur consulté.
- Une configuration Premium/Ultimate synthétique permet d’auditer les outils ; le premier lot couvre aussi quelques refus sans compte. Il ne remplace pas la matrice exhaustive de droits par formule/niveau.
- Les écrans clairs/sombres et langues sont échantillonnés par les parcours nommés ; pas de vérification exhaustive de toutes les combinaisons d’appareil, langue, filière ou état de progression, ni d’audit manuel complet au lecteur d’écran.

Aucune correction produit engagée. Aucun fichier suivi de la worktree modifié ; seuls scripts/configurations temporaires et lien de dépendances sont non suivis. Rapport et preuves hors du dépôt principal.
