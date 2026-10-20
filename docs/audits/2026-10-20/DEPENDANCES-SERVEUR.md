# Points 15 et 19 — décisions et contrats avant activation

Proposition Codex, 20 octobre 2026. Aucun changement appliqué à Supabase.
Le projet est partagé avec NAH : ne toucher à aucune table de NAH.
Coordonner avec les migrations de droits d'accès de Claude (point 8).

## 15. Récompenses commerciales

Le portefeuille actuel et les scores viennent du navigateur, puis de la sauvegarde
personnelle. Une sauvegarde protégée par RLS ne rend pas un score authentique.
Ni XP local, ni test déclaré par le client, ni capture d'écran ne doivent activer
Premium/Ultimate. Les réservations actuelles n'activent rien.

Contrat proposé à approuver avant migration :

- Session utilisateur vérifiée côté serveur ; aucune clé privilégiée dans le navigateur.
- `start_attempt(theme_id)` : le serveur choisit les questions/version, garde les
  solutions hors de la réponse et crée une tentative liée à `auth.uid()`.
- `submit_attempt(attempt_id, answers, idempotency_key)` : transaction atomique,
  verrouillage de tentative, contrôle propriétaire/version/expiration, correction
  côté serveur, clôture unique. Aucune confiance dans `score`, `xp`, `coins` reçus.
- Tables privées : tentatives, réponses attendues, événements de gains avec une
  contrainte unique `(user_id, source_type, source_id)` ; portefeuille calculé à
  partir de ces événements. RPC authentifiées et `search_path` fixé.
- Attribution d'offre : vérifier 20 thèmes distincts à >=90% et 20 000 XP vérifiés
  pour Premium, 30 à >=95% et 73 500 XP vérifiés pour Ultimate ; création atomique
  d'un droit unique `(user_id, offer)`. Le contenu des offres reste à définir.
- Aucun reclassement automatique des anciens XP comme « vérifiés ». Décision
  requise : garder les anciens XP pour les cosmétiques et démarrer séparément les
  conditions commerciales vérifiées à la mise en service (proposition).
- Exiger les migrations RLS de Claude avant ouverture. Le simple contrôle de
  cohérence ou une signature calculée dans le navigateur ne suffit pas.

Recette de sécurité obligatoire sur une base de test : deux envois concurrents ne
donnent qu'un gain ; rejeu identique stable ; autre compte refusé ; tentative
expirée refusée ; score/XP falsifiés ignorés ; changement de version explicite ;
20 fois le même thème ne remplace pas 20 thèmes ; aucune lecture des solutions
avant clôture ; aucune lecture/écriture directe des gains par `anon/authenticated`.
Tester aussi les retries après timeout (résultat initial confirmé, pas doublé).

## 19. Renouvellement des codes parents

Le déclencheur `revizstmg_garde_code` de `child_stats` force `new.code := old.code`
(migration `20261013171304`). Une rotation par simple upsert serait inefficace.
La génération côté navigateur utilise désormais `crypto.getRandomValues` pour les
nouveaux codes, conserve les codes existants, et n'utilise plus de code de secours
partagé quand le stockage échoue. Cela ne constitue pas une protection anti-bruteforce.

Contrat proposé :

1. RPC authentifiée `rotate_parent_code()` ; propriétaire résolu depuis
   `auth.uid()`, jamais depuis un identifiant fourni ; transaction qui verrouille
   la ligne, génère un code aléatoire serveur de 12 caractères lisibles, le rend
   unique et remplace l'ancien code. Adapter/remplacer le déclencheur seulement
   pour ce chemin autorisé. Une seule rotation validée à la fois.
2. Ne mettre à jour le code affiché localement qu'après confirmation ; conserver
   l'ancien affichage en cas d'erreur. Informer que les parents devront se relier.
3. Adapter ensemble normalisation, taille du champ parent, contraintes SQL et
   RPC ; conserver la lecture des anciens codes tant qu'ils ne sont pas renouvelés.
4. Point d'entrée Edge pour la recherche ; compteur partagé atomique, limite
   proposée 5 essais/minute et 30/heure par origine pseudonymisée. Bloquer l'accès
   direct à l'ancienne RPC anonyme sinon le filtre est contournable. Les limites
   et la durée de rétention des compteurs doivent être validées ; ne pas se fier
   à un compteur local ni à un `X-Forwarded-For` fourni librement par le client.
5. Réponses génériques sans révéler si le code existe ; pas de statistiques
   d'enfant dans les logs. Arrêt du partage = révocation immédiate côté serveur.

Recette : rotation échouée ne modifie rien ; ancien code ne lit plus après succès ;
code nouveau lit une seule ligne ; autre utilisateur ne peut pas tourner ce code ;
requêtes concurrentes cohérentes ; limite réelle multi-appareils ; suppression et
arrêt du partage restent prioritaires ; code absent ne produit aucun code partagé.

Sources consultées le 20/10/2026 : changelog Supabase du 14/10/2026 et
https://supabase.com/docs/guides/functions/auth (vérification des appelants Edge).
L'intégration ci-dessus est une spécification à décider et implémenter, pas une
migration livrée ou une validation de la sécurité actuelle.
