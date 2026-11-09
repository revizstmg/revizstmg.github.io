# Audit comptes, navigation et paramètres

Contrôle du 9 novembre 2026 sur `c702938bb55b3456733cd7726951b67940fcd2f4`. Produit en lecture seule ; aucune modification de code, de test suivi ou de configuration. Chromium sur le build existant, servi localement sur le port 4174. Les comptes et réponses réseau sont simulés et tout accès métier extérieur est bloqué.

Les deux anciennes sondes marquées `ERR_CONNECTION_REFUSED` le 8 novembre étaient des échecs d'environnement, pas des défauts du site. Elles ont été reprises sur un serveur disponible et produisent maintenant les constats ci-dessous.

## Défauts confirmés

### C5-01 — Retour OAuth sans échéance : connexion bloquée (7/10)

- Reproduction : ouvrir une page de retour OAuth avec des jetons **fictifs** dans le fragment ; simuler un serveur qui ne répond pas à `GET /auth/v1/user` ; avancer l'horloge du navigateur de 31 secondes.
- Observé : une requête lancée, bouton « Un instant… », aucune alerte, aucune session enregistrée. Le fragment conserve encore les jetons fictifs.
- Attendu : attente bornée, erreur compréhensible et possibilité de recommencer ; nettoyage du fragment sans attendre indéfiniment la réponse.
- Cause : `app/src/auth.js:218` à `236` ; `getUser()` attend `fetch()` et `json()` sans échéance ; `consumeOAuthRedirect()` ne nettoie le fragment qu'après cette attente. `app/src/components/Welcome.jsx:149` à `164` maintient `busy` en attendant.
- Preuves : `/workspace/output/audit-cinq-20261109/comptes/resultats.json`, scénario `oauth-utilisateur-silencieux`, et `oauth-silencieux.png`.
- Limite : ce test démontre le comportement face à une panne simulée, pas un échec actuel de Google ou de Supabase. Aucune fuite de jeton réel n'est démontrée.

### C5-02 — Enregistrement du profil sans échéance réseau (6/10)

- Reproduction : Paramètres → Mon compte → Mon profil ; modifier le prénom ; simuler un `POST /rest/v1/profiles?on_conflict=id` qui ne répond pas ; enregistrer ; avancer de 31 secondes.
- Observé : une requête lancée, champs toujours désactivés, bouton « Un instant… », aucune alerte. Les changements locaux ne sont pas confirmés.
- Attendu : erreur après une durée bornée, champs utilisables et nouvelle tentative possible sans perdre la saisie.
- Cause : `app/src/auth.js:272` attend `authFetch()` sans délai ; le délai à la ligne `278` ne protège que la lecture du corps **après** réception des en-têtes. `app/src/pages/Settings.jsx:42` conserve `busy` jusqu'à résolution.
- Preuves : même fichier JSON, scénario `profil-serveur-silencieux`, et `profil-silencieux.png`.
- Limite : le champ `waiting: 0` de la sonde cherchait l'ancien libellé « Patiente… » ; le constat repose sur `firstDisabled: true` et le texte réellement capturé « Un instant… », pas sur cette recherche de libellé.

### C5-03 — Changement de mot de passe bloqué sur un corps d'erreur incomplet (6/10)

- Reproduction : Paramètres → Mon compte → Sécurité ; saisir deux mots de passe conformes et identiques ; simuler une réponse HTTP 400 dont `json()` ne se termine jamais ; cliquer sur « Changer mon mot de passe » ; avancer de 31 secondes.
- Observé : champs mot de passe et bouton de déconnexion désactivés, « Un instant… », aucune alerte. Le délai déjà présent ne libère pas ce cas.
- Attendu : la lecture des réponses d'erreur doit être comprise dans l'échéance de l'action ; une erreur exploitable doit permettre la reprise.
- Cause : `app/src/auth.js:259` à `263` ; le délai englobe les en-têtes, puis `res.json()` est attendu hors de ce délai sur la branche HTTP non réussie. `app/src/pages/Settings.jsx:43` et `58` lient les champs et la déconnexion à cette attente.
- Preuves : même JSON, scénario `security-partial-error-body`, et `securite-corps-silencieux.png`. Le cas est reproduit lors de la passe initiale puis de la reprise.

## Couverture et limites

- Sondes de panne ciblées sur les trois actions ci-dessus. Les horloges sont accélérées ; il s'agit de 31 secondes simulées, pas de 31 secondes d'attente humaine par scénario.
- Contrôles Axe WCAG 2 A/AA dans `main`, en français à 320 × 850 px : profil, sécurité, apparence et accessibilité. Résultats et captures dans le même répertoire de preuves ; ne constituent pas une certification d'accessibilité du site entier.
- Aucun nouvel audit complet de toutes les routes ni de toutes les traductions. L'OAuth Google réel, l'envoi d'e-mails de récupération, la révocation entre appareils, les règles RLS effectivement déployées et le comportement fournisseur réel ne sont pas validés ici.
- Aucun paiement, e-mail, mutation Auth/Supabase/NAH ou appel IA réel. Aucun contrôle existant supprimé. L'absence de défaut signalé sur les autres écrans ne prouve pas leur absence.

Bilan de la reprise terminée : **7 scénarios exécutés**, dont trois reproductions de défauts et quatre contrôles Axe à 320 px sans violation détectée ni débordement horizontal. Aucune erreur d'environnement sur cette reprise. Le libellé `OK` du journal signifie que la sonde a pu observer l'écran, et non que les trois comportements défectueux sont corrects.
