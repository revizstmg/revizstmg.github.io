# Nouvelle vérification par deux agents

Audit du 31 octobre 2026, après les correctifs #156 et #157. Version examinée : `a85d8102`, compilation publiée `52334f12`, source `b4a27b34`. L’index public correspond à cette compilation : SHA-256 `f396a12c41d50a4bfe36ccf5c7030ba42fb00033c727a0b58ac164bcbf21efe1`.

Deux agents ont travaillé indépendamment, dans deux worktrees et avec des serveurs distincts. Chacun a couvert son périmètre principal et effectué un passage transversal. Aucun échange de conclusions entre eux avant remise des rapports ; le coordinateur a ensuite rejoué les quatre sondes. Aucun changement produit pendant cet audit.

## Quatre défauts confirmés

| Priorité proposée | Référence | Défaut et reproduction | Portée démontrée |
|---|---|---|---|
| Haute | C2-02 | Enregistrer le profil A, suspendre le corps de sa réponse, passer au compte B puis libérer la réponse A : le prénom de A remplace le profil local de B. | Identifiant de compte B conservé ; profil local écrasé. Aucun changement de rôle ni effet serveur réel démontré. |
| Haute | C2-01 | Activer le partage parent ; laisser arriver les en-têtes du POST mais suspendre le JSON ; désactiver le partage et avancer 60 s : aucun nouveau DELETE. La libération du corps débloque la suppression. | Le client n’a pas de délai pour cette lecture et bloque sa file. La conservation réelle d’un instantané serveur reste conditionnelle, non observée en production. |
| Moyenne | APP2-01 | Choisir cinq photos dans Fiches par photo : cinq vignettes, mais seulement quatre images dans la requête, sans avertissement. | Troncature client reproduite avant fournisseur ; le code serveur limite aussi à quatre, tandis que l’interface en autorise huit. |
| Faible | APP2-02 | Après le cours de dérivation, ouvrir une URL mélangeant Gestion & Finance et le thème math-c3 : le cours de maths s’affiche dans le contexte Gestion & Finance. | Adresse incohérente saisie/manipulée nécessaire ; aucun lien normal produisant cette adresse ni contournement d’abonnement trouvé. |

Ces quatre constats sont reproduits sur la compilation publiée et contre-vérifiés par le coordinateur. Les assertions métier des quatre sondes échouent sur les valeurs fautives attendues : il ne s’agit pas d’échecs de connexion ou de montage. Détails dans [comptes.md](comptes.md) et [apprentissage.md](apprentissage.md). **Ils ne sont pas corrigés dans cette campagne de vérification.**

C2-01 complète le correctif précédent : le POST entièrement retardé est bien traité ; la nouvelle sonde isole le cas différent où ses en-têtes sont déjà reçus et où seul le corps reste bloqué. C2-02 est distinct de la demande d’ami tardive, dont la régression passe.

## Couverture et résultats

- **Comptes/social/navigation :** 81 parcours ciblés distincts et 60 tests unitaires ciblés réussis ; deux sondes de défaut séparées. Classes et rôles, amis/duels, boutique/récompenses, parent, paramètres/photo/mot de passe/export, sauvegarde et erreurs réseau, accès et paiements simulés, mobile/desktop/clavier et visiteurs FR/DE/AR. [Rapport complet](comptes.md).
- **Apprentissage :** 77 exécutions, 73 réussites ; quatre échecs bruts répartis entre deux défauts produit, une capture d’écran géante et une attente de titre non reproduite lors de la reprise. Cours/définitions/exercices, flashcards/audio/import, révision, formules, temps/progression, programme/langues/PDF, parcours/vacances, examens/copies, tuteur/contrôles, Grand Oral, étude et notes. Une sonde supplémentaire a ouvert 20 routes à 320 px sans exception ni débordement. [Rapport complet](apprentissage.md).
- **Coordinateur :** les quatre défauts rejoués et confirmés ; l’index public correspond à la compilation ; 867 URLs uniques du sitemap ont un fichier publié présent ; GET public de disponibilité des examens : HTTP 200, ready=true, sans génération.
- **Référence générale préalable :** CI 41198050177, 688 tests unitaires UTC puis Paris et 353 parcours navigateur réussis. Cette suite complète n’a pas été rejouée pendant le présent audit. Les sélections des deux agents se recoupent : leurs nombres ne constituent pas un total de fonctionnalités uniques.

**Amis, Boutique et Ma classe sans abonnement : confirmé.** Les trois corrections précédentes passent leurs régressions historiques ; les nouveaux cas limites ci-dessus restent à traiter.

## Écarts de test séparés des défauts du site

La capture géante des langues a expiré après les assertions PDF/contraste ; les dix vérifications de PDF aux deux niveaux passent sans cette capture. L’attente du titre de Mon parcours a échoué une fois, puis réussi isolément. Une première sonde de profil attendait un champ après une redirection normale ; elle a été corrigée avant confirmation du défaut de profil. Aucun de ces incidents n’est ajouté au nombre des bugs produit.

## Limites

Vérification ciblée des principales familles et inventaire des 44 routes, pas certification de chaque bouton, chapitre ou combinaison. Les détails non rejoués sont explicités dans les deux rapports. Aucun compte réel, paiement, mail, donnée d’élève ni écriture réelle Supabase utilisé. Les réponses IA et les identités sont synthétiques ; pas de certification de qualité des corrections, OCR, manuscrits, quotas/RLS effectivement déployés ou synchronisation entre appareils réels. Le GET public ready=true constate une disponibilité technique au moment du test, sans garantir une génération ou un quota disponible. Chromium et tailles d’écran échantillonnées, pas Safari/iOS physique ni relecture exhaustive des traductions/PDF.

Les scripts sous preuves/ sont des copies des sondes temporaires : ils s’appuient sur le helper réseau bloqué `app/tests/parcours/eleve.js`. Pour les rejouer, utiliser une worktree de la version indiquée et adapter leurs chemins de sortie ; ne pas enlever les interceptions réseau. Les traces complètes et captures géantes sont conservées hors dépôt, les preuves compactes ci-dessous suffisent à examiner les constats :

- [Profil local après réponse tardive](preuves/profil-tardif.json)
- [Ordre des requêtes de retrait parent](preuves/parent-retrait.json)
- [Quatre contre-vérifications](preuves/contre-verification.json)
- [Sondes comptes](preuves/comptes-sondes.spec.js) et [sondes apprentissage](preuves/apprentissage-sondes.spec.js)
- [Routes inventoriées](preuves/routes-inventoriees.json), [pages statiques](preuves/pages-statiques.json), [disponibilité publique](preuves/disponibilite-publique.json)
