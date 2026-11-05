# Corrections des huit constats du 4 novembre

Source de départ : df6d703a. Références : audits `01-fonctions.md` et `UX-INDEPENDANT.md` du 4 novembre. Les propositions de refonte ergonomique distinctes des huit défauts ne font pas partie de ce correctif.

| Constat | Correction |
| --- | --- |
| F01 Parent en boucle | Traducteur stable, chargement au lien ou à la langue, actualisation explicite ; réponses obsolètes ignorées après retrait ou démontage. |
| F02 Ancienne fiche photo après reset | Génération invalidée et requête vision annulée au reset, changement des photos, du compte ou démontage. Progression/résultat OCR également protégés. |
| F03 Erreur de duel ami cachée | Zone d’état commune sous les onglets ; erreurs annoncées comme alertes, invitation conservée et action réutilisable. |
| F04 OAuth et pourcentage | Valeur de URLSearchParams utilisée directement, sans second décodage ; pourcentages, accents, plus et séquences malformées testés. |
| F05 Reprise après adresse invalide | Index entier canonique requis ; visite et temps enregistrés uniquement si le chapitre existe. |
| F06 Double envoi de duel de classe | Verrou immédiat et écran de transmission ; score conservé avec réessai. La création conserve un UUID par partie, utilisant la clé primaire déjà existante. Un conflit de réessai n’est confirmé que si le résultat relu correspond au compte, quiz, classe et score. |
| UX01 Partage flashcards hors écran | Fenêtre rendue dans body ; libellé du code, focus interne, Tab, Échap et retour du focus. Confirmation de copie ou possibilité de sélectionner le code. |
| UX02 Focus hors écran | Fenêtre rendue dans body, hauteur dynamique, disposition compacte en paysage ; commandes testées sans plein écran natif à quatre tailles. |

Aucune migration, configuration ou donnée Supabase réelle modifiée. Aucun contenu de cours changé. Les nouveaux textes de transmission sont disponibles dans les six langues. Les contrôles navigateur utilisent uniquement des comptes/réponses synthétiques et bloquent les fournisseurs réels. La protection par UUID utilise le schéma existant ; l’application de toutes les règles RLS en production et les flux entre appareils réels ne sont pas certifiés par ces tests.

Les sondes des audits sont intégrées aux tests de non-régression `audit-huit-*`, complétées par les tests unitaires du décodage et du réessai de duel. Résultats généraux et diffusion à consigner après validation.
