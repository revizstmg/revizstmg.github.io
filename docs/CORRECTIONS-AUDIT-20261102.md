# Livraison des quatre corrections

Livraison confirmée le 2 novembre 2026. #159 (`06157bc9`) corrige les quatre constats de #158 ; #160 (`05bd1531`) finalise le contraste du lecteur et le contrôle du temps sur une adresse de cours valide. Intégration de #161 conservée.

- **Profil entre comptes :** identité revérifiée après la lecture JSON et avant la mutation du profil courant ; le retour tardif de A ne modifie plus B.
- **Retrait parent :** la lecture du corps JSON est bornée à15secondes ; une réponse suspendue ne bloque plus indéfiniment la file avant suppression. Les publications et suppressions gardent leur ordre.
- **Photos :** limite affichée et appliquée de quatre pages. Un lot supérieur est refusé entièrement, la sélection existante reste disponible, aucune page n’est omise silencieusement. Une image impossible à charger interrompt l’analyse au lieu d’être ignorée. Textes traduits dans les cinq catalogues.
- **Cours :** le thème doit appartenir à la matière indiquée ; une adresse incohérente affiche une page introuvable, sans écraser la reprise valide ni attribuer le temps au mauvais thème.

La validation intermédiaire avait relevé le test de temps sur `/subject/gf`, adresse invalide : il utilise désormais `/subject/gestion-finance` et vérifie le titre réel avant toutes les assertions temporelles conservées. Le numéro de page du lecteur utilise la couleur de texte principale pour renforcer son contraste. Aucun contrôle AA ou temporel supprimé.

Validation finale CI41503625386 : **691 tests unitaires en UTC puis Paris et359 parcours navigateur réussis**, aucun ignoré. Compilation `f0f70220fd34f6fbba1d6416f3c99e6a0cd3e1e7`, Pages41506196286 réussie. SHA-256 public identique : `c0cb4337d48b30af6dd6e3fe3556fea854d8b8a7f5e2ae60e7f2089c4d8ea309`.

Les quatre régressions ont aussi été rejouées avec succès sur l’adresse publique, avec comptes et réponses externes synthétiques. Aucun véritable compte, paiement ou donnée d’élève modifié. Aucun déploiement Supabase par Codex ; les limites de déploiement de fonctions mentionnées par Claude dans #161 restent explicites dans le journal. Le contrôle client du partage ne certifie pas l’état historique ni toutes les courses entre appareils réels.

Une nouvelle campagne de dix agents indépendants démarre ensuite sur cette version gelée : voir `audits/2026-11-02/`.
