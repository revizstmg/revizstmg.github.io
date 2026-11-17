# Deux défauts du Grand Oral

Recherche du17novembre2026 sur `ceaa5e8a7`, compilation publique `6e3b71fdf939cc2b1fb2cf4aef34a401cdc162b5`. Produit et services en lecture seule. Les priorités sur10 évaluent l’impact pratique, pas un score CVSS. Les défauts précédents des rappels/exercices ne sont pas recomptés.

## 1. Enregistrement ou réécoute conservés sous le compte suivant : 7/10

**Condition précise reproduite :** le compte B a déjà sa progression dans le stockage local lorsque l’événement interonglets de changement de session est traité. B a immédiatement accès au Grand Oral (dans la sonde, compte ancien éligible à la grâce). Les deux comptes ont une filière Terminale valide et la route ne change pas.

**Scénario A, en cours :** A lance un enregistrement. La copie locale et la session deviennent celles de B, puis l’événement `storage` est déclenché. Le store indique B mais le même enregistreur reste monté, son état natif reste `recording` et aucune piste n’a reçu `stop()`. Le bouton Arrêter reste accessible à B.

**Scénario B, réécoute :** A enregistre puis arrête. Après le même changement, B voit toujours le lecteur audio de A, avec exactement la même URL blob, non révoquée. Aucun enregistrement de B n’a été effectué.

**Cause :** `GrandOral.jsx:67–72` ne donne pas une clé d’identité à `GrandOralPage`. `AudioRecorder.jsx:21–27` nettoie seulement au démontage et ne suit pas le propriétaire du compte. Dans `store.jsx:680–683`, si la copie locale est déjà celle de B, elle peut être restaurée directement sans état vide intermédiaire : la route et le composant peuvent donc rester montés.

**Contrôles de portée :** deux sondes sans copie de B préalablement disponible confirment que le nettoyage fonctionne alors : piste arrêtée, lecteur absent et URL de réécoute révoquée. Ce défaut ne touche donc pas tous les changements de compte. La copie disponible avant traitement de l’événement représente une livraison différée d’événements de stockage, par exemple dans un onglet suspendu ; cet ordre est simulé, pas une reproduction physique complète de deux onglets suspendus. Les mesures établissent le défaut de ce chemin du code, pas sa fréquence chez les utilisateurs.

**Impact :** confidentialité de l’audio et poursuite du micro sur un navigateur partagé. Aucun accès distant ni fuite serveur démontré.

**Correction recommandée :** rattacher l’enregistreur (ou la page) au propriétaire du compte et invalider les permissions/enregistrements/URL à chaque changement. Conserver également les gardes existantes de réponse de permission après démontage.

Preuves : [micro](preuves/copie-micro-compte.json), [réécoute](preuves/copie-reecoute-compte.json), contrôles [micro nettoyé](preuves/sans-copie-micro-compte.json) et [réécoute nettoyée](preuves/sans-copie-reecoute-compte.json).

## 2. Panne native présentée comme un enregistrement toujours actif : 6/10

**Reproduction :** lancer l’enregistreur, simuler une erreur native `MediaRecorder`, suivie de `dataavailable` et `stop`, puis avancer l’horloge de65secondes. Les événements de fin sont bien livrés, et la piste est arrêtée par le gestionnaire existant.

**Observation :** le moteur natif est `inactive`, mais l’interface garde le bouton Arrêter et le compteur atteint1:05. Aucune erreur n’est expliquée. L’élève peut poursuivre son exposé en pensant être enregistré. La sonde ne prouve pas une fuite du microphone dans ce cas : la piste a reçu `stop()`.

**Cause :** `AudioRecorder.jsx:41–54` n’installe pas de gestionnaire `onerror`. `onstop` produit une réécoute mais ne remet pas `recording` à faux et ne coupe pas le compteur. Seul le clic sur Arrêter met à jour ces états.

**Correction recommandée :** gérer les erreurs d’enregistrement indépendamment d’un refus de permission, réconcilier systématiquement l’état d’interface et le minuteur avec la fin native, arrêter les pistes et ne pas annoncer un audio valable si la capture a échoué. Préserver l’isolation de génération/démontage.

Preuve : [état natif et écran](preuves/panne.json), [capture](preuves/panne.png).

## Méthode et limites

Trois scénarios défectueux confirmés et deux contrôles de nettoyage normaux dans une seule exécution : **5 sondes réussies en17,9secondes**. Réussir une sonde de défaut signifie qu’elle constate le problème, pas que le produit fonctionne correctement. [Journal](preuves/confirmation-controles.log), [sonde exécutée](preuves/sondes.spec.js).

Les premiers essais ont permis d’écarter le cas sans copie B et de déplacer l’installation de l’horloge avant la création de l’intervalle ; ces échecs de sonde ne sont pas comptés comme bugs supplémentaires. Les chemins absolus du script sont ceux de l’environnement d’audit ; le helper autorise les fichiers publics et bloque/simule les services tiers.

Navigateur sur le vrai site public, avec faux flux micro, faux MediaRecorder, faux audio et profils/REST simulés. Aucun accès à un microphone réel, envoi de voix, écriture Supabase/NAH, compte réel, paiement, e-mail ou appel IA. Aucun correctif produit effectué et aucune nouvelle suite générale dupliquée. Cette passe n’est pas une certification exhaustive du site.
