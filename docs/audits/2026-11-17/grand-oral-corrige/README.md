# Correction de l’audio du Grand Oral

Suite aux [deux défauts reproduits](../grand-oral/README.md), la [PR236](https://github.com/revizstmg/revizstmg.github.io/pull/236) est fusionnée dans `79f57045615cff54cae284d3f5b947aa646ea3a8`.

## Comportements corrigés

- La page Grand Oral est identifiée par le compte. Le passage de A à B démonte l’ancienne page, même si B est restauré directement depuis sa copie locale. L’ancien flux est arrêté et son URL de réécoute révoquée ; B dispose d’un enregistreur neuf.
- Les réponses de permission tardives restent invalidées après démontage, et le double clic en attente ne crée pas plusieurs demandes.
- Les fins natives et erreurs arrêtent le minuteur et l’état d’enregistrement de l’interface. Les pistes sont libérées par une opération idempotente ; une capture échouée/vide ne devient pas une réécoute annoncée comme valide.
- Une erreur pendant l’arrêt natif libère également le flux et permet de recommencer. Une ancienne réponse ne remplace pas le nouvel essai.
- Le message d’échec est intégré aux cinq catalogues étrangers, disponible hors ligne et lisible en mode sombre. Aucun contenu pédagogique, prix, droit ou schéma changé.

## Validation ciblée

- **16 tests unitaires réussis** : traductions et hooks, dont un nouveau contrôle des cinq traductions du message d’erreur.
- **16 parcours téléphone réussis** : sept nouveaux cas et neuf précédents, notamment permission tardive/double clic, lecture audio et autres corrections existantes.
- **7 nouveaux parcours ordinateur réussis**. Les fixtures du compte B incluent désormais un abonnement fictif connu, afin que les assertions d’isolation ne reposent pas sur la période de grâce. Elles vérifient également que B peut ouvrir son propre enregistreur après le nettoyage.
- Compilation finale réussie. Les contrôles de contenu ne sont pas remplacés ni leurs empreintes mises à jour.

## Limites

Les parcours manipulent le vrai code d’interface, mais simulent MediaRecorder, les flux, l’audio et les services de compte/paiement. Aucun microphone réel, voix enregistrée/envoyée, compte réel, écriture Supabase/NAH, paiement, e-mail ou génération facturée. Ces contrôles techniques ne remplacent pas un essai de compatibilité audio sur chaque appareil et ne constituent pas une certification pédagogique.

## Livraison terminée

- Les quatre transitions de compte ont également été reprises sur la compilation finale téléphone avec succès : [journal](preuves/comptes-finaux.log).
- CI générale [44064761338](https://github.com/revizstmg/revizstmg.github.io/actions/runs/44064761338) réussie : **897 tests UTC**, **897 Paris**, compilation et **449 parcours navigateur**. [Extrait](preuves/ci-extrait.log). Aucun contrôle supprimé.
- Compilation publiée automatiquement : `67bfcbc120c1e216a2d8e6f3f68b813a20a48d1f` ; [Pages44067118887](https://github.com/revizstmg/revizstmg.github.io/actions/runs/44067118887) réussi.
- Après Pages : **16 fichiers publics sur16 identiques à Git**, dont GrandOral, l’entrée et les cinq catalogues. [Empreintes](preuves/fichiers-publics.json).
- **7 parcours publics réussis** : panne et nouvel essai, quatre transitions d’identité, fin naturelle et exception à l’arrêt. [Journal](preuves/parcours-publics.log). Ils utilisent les mêmes faux flux et services que les parcours locaux ; aucune voix réelle ni écriture métier.
