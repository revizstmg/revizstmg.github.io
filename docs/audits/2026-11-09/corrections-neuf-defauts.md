# Corrections des neuf constats de l’audit cinq agents

Les rapports de `cinq-agents/` décrivent la version `c702938bb`. Cette intervention corrige leurs neuf défauts et les deux formulations signalées ; elle ne change aucune donnée ou configuration Supabase.

## Comportement corrigé

1. **Questions liées à leur cours.** Les jeux manuels GF, mercatique et RH gardent leurs identifiants et leurs rattachements ; les questions étrangères sont remplacées par des applications des notions effectivement enseignées. Le jeu SIG est rattaché à l’introduction au SI, qui définit ses quatre fonctions et le PGI. Les questions ciblent désormais stockage, PGI, collecte et traitement. Aucun cours artificiellement enrichi pour justifier un ancien exercice. L’empreinte de contenu ne change que pour `gf-t3`, `mkg-t1`, `rh-t2` et `sig-t1`.
2. **Retour OAuth.** Fragment nettoyé dès réception, lecture de l’utilisateur bornée à quinze secondes, erreur et nouvelle tentative possibles. Une réponse tardive ne remplace pas un autre compte ouvert entre-temps.
3. **Profil.** L’envoi et la lecture de la réponse sont placés sous une même échéance de quinze secondes. La saisie reste disponible après l’erreur ; le compte est vérifié avant de restituer le résultat.
4. **Mot de passe.** La lecture d’un corps d’erreur fait partie du délai, ce qui libère aussi le bouton de déconnexion.
5. **POST sociaux.** La fonction commune lit le corps avant de rendre une réponse exploitable, sous le même délai que l’envoi. Les erreurs de corps, HTTP 200 silencieux et DELETE 204 sont couverts. Le compte encore actif est vérifié avant de rendre les données.
6. **Classement.** Le bouton « Changer de classe » ouvre la gestion des classes. Il ne supprime plus une adhésion en effaçant seulement le code local. L’action explicite de départ reste dans la page Classe, avec actualisation du profil et prise en compte des autres adhésions.
7. **Code ami.** Le succès n’est affiché qu’après confirmation du presse-papiers. En cas de refus ou d’API absente, une indication de copie manuelle est affichée, traduite dans les six langues ; aucun rejet de promesse non géré.
8. **Audio mobile.** Dialogue borné à la hauteur de l’écran ; texte intégral défilant ; commandes et fermeture accessibles sur 320 × 568 px, y compris avec un recto et un verso longs.
9. **Préparation des examens.** Le chargement du catalogue a son propre délai de trente secondes, en amont de l’appel IA. L’échec libère le formulaire et conserve la demande. Le choix manuel des chapitres utilise le même catalogue borné. Un chargement tardif ne déclenche pas l’appel abandonné.

## Formulations

- Le calcul d’un seuil en unités précise la **marge sur coût variable unitaire**, distincte du taux de MCV utilisé pour le chiffre d’affaires.
- L’aide audio décrit l’enchaînement terme/définition dans les six langues, sans annoncer une répétition infinie.

## Vérification locale

- Douze nouveaux tests unitaires : contenu des quatre jeux, OAuth et compte tardif, profil, corps d’erreur du mot de passe, corps POST sociaux et réponse 204, catalogue silencieux et nouvelle tentative.
- Sept nouveaux parcours navigateur : profil/reprise, OAuth et fragment, mot de passe/déconnexion, presse-papiers refusé, audio long tactile, changement de classe sans DELETE d’adhésion, module de catalogue bloqué sans appel IA.
- Onze parcours existants de validation de codes de classe réussis. Les trois attentes initiales erronées des nouveaux tests ont été corrigées : message d’erreur générique des paramètres, bouton de connexion désactivé tant que les champs sont vides, DELETE légitime de statistiques parentales distingué d’un DELETE d’adhésion. Aucun contrôle retiré.
- Empreinte actualisée et vérifiée pour les quatre thèmes voulus uniquement ; compilation réussie. La première suite complète a réussi 831 contrôles sur 832 et signalé l’index léger SIG devenu incohérent après le déplacement du jeu. L’index est régénéré par `npm run chapitres` : une seule valeur de SIG change. Les contrôles de chargement/contenu et la compilation sont repris avant publication. Les résultats finaux sont consignés dans le journal après leur achèvement.

Les comptes, réponses réseau, voix et services IA sont simulés dans les tests. Aucun achat, envoi de copie réelle, changement de base ou donnée NAH. Les fichiers compilés à la racine ne sont pas modifiés à la main.
