# Audit révisions et progression

Audit en lecture seule de `c702938bb55b3456733cd7726951b67940fcd2f4`. Aucun produit, test suivi, abonnement ni donnée réelle modifié.

## Couverture réellement vérifiée

- Journal du premier agent récupéré : **11 parcours navigateur réussis** le 8 novembre, même source produit. Retournement opaque des flashcards en clair/sombre et à 320 px, Bienvenue et mouvement réduit, acquis matière/chapitre et bonnes réponses sauvegardées, erreurs filtrées par matière, reprise propre à chaque matière, attribution des résultats transversaux au bon thème, temps par thème et réparation des valeurs incohérentes.
- Reprise du 9 novembre : **3 parcours ciblés réussis**. Premium ne peut pas ouvrir Parcours/Vacances personnalisés ; Ultimate y accède ; les objectifs préexistants sont conservés. Cartes françaises lues en français avec interface allemande, puis choix explicite de voix enregistré.
- Une nouvelle sonde navigateur sur les cartes audio longues, avec compte et synthèse vocale simulés. Validation séparée du codec de partage/import : la carte de 455 caractères est acceptée.
- Inspection ciblée des sources audio, partage/import, stockage des paquets, réparation du temps, filtres de formules et garde Ultimate. Cette inspection ne constitue pas une validation pédagogique de chaque formule ou un essai de chaque voix réelle.

Logs : `/workspace/output/audit-cinq-20261108/revision/existing-parcours.log` et `/workspace/output/audit-cinq-20261109/revision/parcours.log`.

## R1. Les commandes audio deviennent inaccessibles avec une carte longue sur petit écran

**Gravité : 6/10. Défaut reproduit.**

### Reproduction

1. Disposer d'un paquet contenant une carte dont le recto comporte 455 caractères. Le partage/import accepte ce contenu sans troncature.
2. Sur un écran de 320 × 568 px, ouvrir Réviser, puis « Révision audio » pour ce paquet.
3. Essayer d'atteindre les commandes de lecture en faisant défiler la fenêtre.

La sonde initialise directement un paquet identique à ce qu'un import valide peut enregistrer ; le parcours complet de collage/import n'a pas été rejoué dans cette sonde. Le codec `encodeDeck`/`decodeDeck` a été exécuté séparément et conserve les 455 caractères.

**Attendu :** le texte peut défiler et les boutons lire/pause/précédent/suivant restent accessibles dans la fenêtre.

**Observé :** le dialogue mesure 1 031 px de haut, commence à y=48 et termine à y=1 079. Le bouton « Jouer » est à y=954..1 010, hors de l'écran de 568 px. Après une tentative de défilement de 1 200 px dans le dialogue, sa position et celle du bouton sont inchangées ; `scrollTop` reste à zéro. La fermeture reste accessible : ce défaut empêche la lecture de cette carte au tactile, sans bloquer toute l'application.

**Sources :** `app/src/components/AudioReview.jsx:69` (surcouche fixe sans défilement), `:70` (panneau non borné), `:82` (texte sans zone défilante), `:87` (commandes après le contenu). L'import sans limite de longueur par champ est permis par `app/src/deckShare.js:22`, puis conservé par `app/src/store.jsx:709`.

**Correction suggérée :** borner le dialogue à la hauteur disponible, rendre son contenu défilant et maintenir les commandes accessibles. Préserver le texte intégral plutôt que le couper arbitrairement. Ajouter un contrôle sur petit écran avec recto et verso longs.

**Preuves :** [mesures JSON](04-preuves-revision.json) ; script `/workspace/output/audit-cinq-20261109/revision/sonde-audio.mjs` ; capture `/workspace/output/audit-cinq-20261109/revision/audio-long-mobile.png`.

## Limites et améliorations distinctes

- Les 14 parcours réussis et la nouvelle sonde ne prouvent pas l'absence d'autres bugs. Aucune suite globale ni compilation n'a été relancée pour cet audit.
- Aucune correction IA réelle, synchronisation entre appareils ou voix native iOS/Android n'a été sollicitée. Les droits Premium/Ultimate et le réseau sont simulés ; ces tests ne certifient pas les autorisations de production côté serveur.
- La conservation de la langue lors du partage/import est confirmée par inspection du codec et le contrôle ciblé existant. Tous les formats possibles de paquet n'ont pas été essayés.
- Petit point de clarté, non bloquant : l'aide audio française dit « en boucle », alors que la lecture s'arrête après la dernière carte (`AudioReview.jsx:41`). Préciser si une répétition complète est souhaitée, ou décrire simplement l'enchaînement des cartes. Ce point n'est pas compté comme un second défaut navigateur confirmé.
