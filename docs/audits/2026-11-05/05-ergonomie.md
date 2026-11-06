# Audit indépendant : ergonomie et présentation

Version figée `79d4fa01e8c05addd7dc1d33fbaebce9368b37a9`, huit corrections du 4 novembre déjà publiées. Index compilé SHA-256 `4b4a47454744f0daa35ca924c4c26e90f34ff28ad39e1fc65dd3388219b0ec1b`. Audit commencé le 5 novembre, finalisé le 6 novembre après interruption par la limite d’utilisation. Aucune modification produit.

Le design vert, crème et doré et les émojis sont conservés dans les propositions. Les anciennes classes de dégradés/pilules présentes dans certains fichiers ne constituent pas une preuve de leur affichage : les règles de présentation les neutralisent à la compilation. Aucun faux défaut de ce type n’est retenu.

## Améliorations classées

Les notes expriment une priorité de travail, pas une mesure de gravité automatique. Aucun défaut critique noté 9 ou 10 n’a été prouvé dans ce périmètre. Les observations subjectives sont séparées des comportements établis.

### UX-01 · 7/10 · Simplifier les portes d’entrée de Réviser

**Type : proposition ergonomique appuyée par une mesure.** À390×844, avec un compte et un paquet fictifs, le contenu de main mesure2905px CSS et comporte14actions. Cela ne signifie pas14méthodes différentes : ce total inclut les boutons du paquet. Les portes concurrentes sont néanmoins présentes dans le code : séance, mission, vacances, trois méthodes, reprendre/commencer, toutes les matières, flashcards et bac blanc. Source : `app/src/pages/Revise.jsx:78` à164 ; preuve `ux-preuves/mesures.json`.

**Impact :** l’élève doit arbitrer entre plusieurs chemins avant de commencer. **Solution :** présenter d’abord Continuer / Mes erreurs / Mes acquis, puis la bibliothèque Flashcards ; mettre mission, vacances et lien Bac blanc dans une rubrique secondaire dépliable. Garder l’accès aux matières à l’intérieur du choix. **Effort : moyen.** Aucun nouveau bouton ni suppression d’outil nécessaire. Ce n’est pas une panne technique.

### UX-02 · 6/10 · Permettre d’annuler la suppression d’un paquet

**Type : comportement confirmé, amélioration de protection.** Un clic sur la corbeille retire immédiatement le paquet : sonde synthétique1paquet→0, aucune confirmation native et aucun bouton Annuler. Source : `Revise.jsx:145` et `store.jsx:713`. Preuve `ux-preuves/mesures.json`, sonde conservée. La cible mesure déjà44×44px dans le rendu final ; l’ancienne classe h-9 ne prouve donc pas une cible trop petite.

**Impact :** une mauvaise manipulation peut retirer le travail personnel de l’élève. **Solution :** message « Paquet supprimé » avec Annuler pendant quelques secondes, puis persistance définitive ; à défaut, confirmation courte nommant le paquet. Ne pas ajouter de dialogue à chaque autre action. **Effort : faible à moyen.** Les scénarios de fusion/suppression des sauvegardes doivent rester cohérents. Aucun retour intempestif de paquet supprimé n’est allégué.

### UX-03 · 6/10 · Rendre le téléchargement hors connexion sélectif

**Type : proposition de performance fondée sur le code et les fichiers.** Le précache inclut les148assets compilés sans distinguer la matière ou la langue choisie :13299907octets, soit12,68MiB non compressés sur disque. Les5guides PDF représentent5283737octets. Source : `app/pwa-postbuild.mjs:24` à33 et `app/pwa/sw.js:42` à56. Preuve `ux-preuves/precache.json`.

**Impact :** téléchargement et stockage de guides/langues non utilisés, notamment sur connexion limitée. Ce poids n’est ni une mesure de transfert compressé, ni un LCP, ni une preuve de ralentissement vécu. **Solution :** petit socle hors ligne, choix des matières/guides et option Tout télécharger sur Wi-Fi. Afficher un état honnête des éléments prêts ; adapter le contrôle OFFLINE_STATUS pour ne pas annoncer tous les cours téléchargés si seul un sous-ensemble l’est. Garder la possibilité de tout télécharger. **Effort : moyen à important.** Recette des versions et de la disponibilité hors ligne indispensable.

### UX-04 · 5/10 · Rendre les offres comparables d’un regard

**Type : proposition de présentation.** La page mesurée contient9lignes de fonctionnalités dans ses trois cartes, puis le composant de souscription ; elle mesure1936px CSS sur mobile. Source : `app/src/pages/Offers.jsx:18`, `app/src/data/studyJourney.js:23` à25 et `app/src/components/Abonnement.jsx`. Preuve `ux-preuves/mesures.json`.

**Impact :** le parent compare des descriptions de formats différents avant de comprendre la différence de service. **Solution :** une comparaison compacte de trois axes communs (cours, entraînement corrigé, accompagnement personnalisé), puis Tout ce qui est inclus dépliable. Conserver prix TTC, périodes, limites réelles (Premium une utilisation mensuelle par aide ; Ultimate plafond annoncé), information sur la correction automatique et liens juridiques. Aucun avis ou résultat scolaire garanti à ajouter. **Effort : moyen.** Il ne s’agit pas d’un prix incorrect ni d’un paiement réel refusé constaté.

### UX-05 · 5/10 · Conserver le choix de révision au rechargement

**Type : constat de code et proposition.** `pathMode` est un état React dans `Revise.jsx:33` ; matière et chapitre sont également des états dans `RevisionPath.jsx:16`. Les choix ne sont pas encodés dans l’adresse. La reprise de lecture/exercice existe séparément (`readPosition` à32) ; elle ne doit pas être présentée comme absente.

**Impact :** revenir sur un choix précis ou recharger la page demande de sélectionner à nouveau méthode, matière et chapitre. **Solution :** paramètres d’URL pour ces trois choix, avec valeurs validées et retour du navigateur cohérent. Le questionnaire doit conserver sa logique de reprise actuelle. **Effort : moyen.** La perte de réponses pendant une séance n’a pas été démontrée par ce constat.

### UX-06 · 4/10 · Annoncer le résultat d’un import aux lecteurs d’écran

**Type : proposition d’accessibilité sourcée, sans test humain de lecteur d’écran.** Le message d’import est rendu dans un simple paragraphe (`Revise.jsx:159`), alors que le résultat de copie possède déjà `role=status` à180. Le focus reste sur l’importation ; un utilisateur non voyant peut ne pas recevoir l’information spontanément.

**Solution :** région `aria-live=polite` pour la confirmation d’import et alerte associée en cas d’erreur, avec texte du paquet importé. Conserver le libellé actuel de l’entrée. **Effort : faible.** Aucune violation de contraste ni panne de lecture vocale n’est prétendue sur cette seule lecture de code.

### UX-07 · 3/10 · Compacter les illustrations de Réviser sur petit écran

**Type : proposition esthétique, distincte de la simplification des choix.** Les aperçus de papiers occupent au minimum200px par méthode sur mobile (`Revise.css:47`), soit une place importante avant l’entraînement. Ils sont décoratifs (`aria-hidden=true`).

**Solution :** garder la feuille et le numéro comme signature visuelle mais réduire l’aperçu sur téléphone ; réserver la composition illustrée complète au bureau. Ne pas remplacer les émojis ni ajouter d’animation. **Effort : faible à moyen.** Le style actuel reste cohérent avec Bac blanc ; il n’est pas considéré comme un défaut fonctionnel.

## Contrôles achevés et limites

- Le lot ciblé de18parcours du5novembre est allé à son terme :17réussites et un timeout du contrôle d’accueil en allemand. Il comprend le lecteur agrandi en320/390/paysage, les vues mobiles clair/sombre et bureau, le menu principal et ses onglets, ainsi que les paramètres en français, allemand et arabe.
- Le scénario allemand a été rejoué seul le6novembre : réussite en2,8s (7,1s au total). Le timeout initial sous charge n’est pas retenu comme bug. Les18scénarios distincts disposent donc d’un résultat de réussite, dont un après reprise ; ce n’est pas18réussites au premier passage.
- Une microsonde de mesure/suppression est réussie (2s,4,7s au total). Les comptes, paquet et réponses sont synthétiques ; services privés bloqués. Aucun paquet réel n’a été supprimé.
- Les tests existants comprennent leurs contrôles de clavier, de débordement et axe aux états ciblés. Ils ne certifient ni tous les écrans, ni Safari/iOS réel, ni un lecteur d’écran humain, ni la performance sur réseau mobile réel.
- Ni les huit anciens défauts, ni les vieux dégradés/classes arrondies neutralisés au build ne sont recensés comme nouvelles pannes. Aucun nouveau bug bloquant n’a été prouvé par cet audit UX.
- La version compilée n’a pas été reconstruite, le contenu pédagogique et les données réelles n’ont pas été modifiés. Les scripts npm généraux n’ont pas été relancés pour cette livraison documentaire.

Les journaux et mesures sont dans `ux-preuves`. Pour rejouer `mesures.spec.js`, la copier dans app, adapter la configuration de test et utiliser le préparateur qui bloque les fournisseurs réels.
