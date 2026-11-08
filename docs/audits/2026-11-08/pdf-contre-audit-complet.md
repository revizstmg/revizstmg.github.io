# Contre-audit des PDF, langues comprises

## Couverture confirmée

Nouvelle passe sur la version publique issue des PR #201 à #203, avant publication de la correction de boutique. 61 PDF internes ont été téléchargés, ouverts et comparés octet par octet aux fichiers publiés : 48 sujets/corrigés, cinq guides de langues, cinq dossiers du Prix et trois références EPS. Total : 503 pages. Aucune extraction contenant un caractère NUL dans ces fichiers.

19 URL de références PDF externes ont également été ouvertes : six annales, programmes/référentiels, références de langues et sources du Prix. Toutes sont finalement accessibles ; l’original Besançon 2024 a nécessité une seconde tentative plus longue après un téléchargement partiel. Ce délai ne constitue pas un lien cassé confirmé. Certains fichiers sont des doublons de miroirs internes, pas 19 cours supplémentaires.

Les 219 liens externes des cinq guides de langues répondent HTTP 200 après reprise à concurrence réduite. Cela confirme leur accessibilité, pas la lecture vidéo dans chaque pays ou sans compte. Les guides anglais, allemand, espagnol, italien et arabe sont inclus, avec leurs liens et leurs corrigés.

Preuves : `contre-audit-internes.json`, `contre-audit-externes.json`, `contre-audit-liens-langues.json`. Les téléchargements et reproductions locaux sont dans `/workspace/output/contre-audit-pdf/`.

## Défaut confirmé et correction

Le générateur des examens personnalisés utilisait encore le symbole √ avec Times standard, produisant du texte corrompu. La reproduction synthétique « √25 = 5 » et des symboles apparentés provoquait 47 caractères NUL dans le PDF témoin ; la version corrigée n’en contient plus. Aucune copie réelle ni génération payante n’a été utilisée.

Normalisation ajoutée pour √, π, ∞ et ≠, en conservant le sens du calcul. Le test des comparateurs inclut maintenant ces cas. La preuve avant/après est dans `contre-audit-symboles.json`. Les 48 PDF préconçus actuels n’étaient pas affectés ; le défaut concernait un contenu possible des examens générés à la demande. Cette correction n’est pas une garantie de prise en charge de tout caractère Unicode imaginable.

## Langues : relecture et limites

L’agent chargé de cette passe a indiqué avoir relu les sources des 126 leçons et des 504 couples énoncé/corrigé, sans faute majeure certaine relevée à ce stade. Son exécution a ensuite été interrompue par une limite d’utilisation, avant remise d’un rapport final complet. Cette indication intermédiaire ne vaut donc pas certification linguistique exhaustive.

La reprise principale confirme les contrats des guides et leurs ressources publiques ; une relecture ciblée des explications sur les temps anglais, les hypothèses italiennes, l’article et l’annexion arabes ainsi que l’accord des pluriels non humains n’a pas établi de faute certaine. Les exemples anglais précisent que for/since ne choisissent pas seuls le temps ; les leçons arabes distinguent l’épithète de l’attribut et le pluriel humain du non-humain. Ces contrôles ne remplacent pas une validation complète par des enseignants des cinq langues.

Aucune nouvelle modification des leçons ni de leurs corrigés n’a été faite sur la base d’une simple préférence de formulation. Les consignes génériques répétées de certaines séries restent une amélioration pédagogique possible, distincte d’un corrigé faux.

## Exports dynamiques et périmètre

Les kits personnalisés ne sont plus proposés dans la nouvelle boutique et leurs anciens identifiants ne permettent plus de les générer avec le code courant. Ils sont remplacés par des collections de profil. L’ancienne bibliothèque PDF conservée pour compatibilité ne constitue pas une nouvelle récompense.

Les impressions à la demande de chaque cours, de chaque plan et de chaque configuration de classe ne sont pas toutes générées dans cette passe. Les futurs sujets produits par un modèle ne peuvent pas être certifiés à l’avance. Les contrôles du rendu dynamique portent ici sur la reproduction des symboles et les tests existants. Aucun contrôle de vraie copie ni appel IA facturé.

## Décision boutique

Les suivis pédagogiques personnalisés sont retirés des récompenses. Envol, Astral et Prestige donnent des objets permanents réellement équipables, et des gels selon le lot. Les anciens reçus permettent de récupérer les nouveaux objets sans recréditer les gels ou les pièces déjà reçus ; les tests couvrent la fusion des sauvegardes. Les réservations de mois d’abonnement aux hauts scores restent soumises à vérification, sans activation automatique côté client.
