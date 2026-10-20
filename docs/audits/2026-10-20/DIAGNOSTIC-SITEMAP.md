# Diagnostic de récupération du sitemap

## Résultat établi

Le propriétaire voit « Impossible de récupérer le sitemap » dans Search Console.
Le test d’URL active de Google affiche pourtant « Google a accès à cette URL »
(20 octobre 2026, 22:56, heure de Paris). Le propriétaire a ensuite confirmé
que l’adresse affichée lors du test réussi était bien
https://revizstmg.github.io/sitemap.xml, et non l’accueil. Le rapport Sitemaps
et le test en direct donnent donc des résultats différents.

Contrôles du site effectués :

- GET HTTPS du sitemap : 200, application/xml, aucune redirection ; même contenu
  de 387 octets avec les identifiants navigateur, Googlebot et Google Inspection.
  Changer l’identifiant ne reproduit pas une requête depuis un vrai serveur Google.
- XML UTF-8 valide et conforme au XSD officiel sitemap 0.9 ; une URL absolue,
  https://revizstmg.github.io/, correspondant à la canonique de l’accueil.
- robots.txt répond 200 et autorise Googlebot à lire le sitemap et l’accueil.
  Aucun en-tête X-Robots-Tag ne bloque le sitemap.
- DNS public : les quatre A et quatre AAAA standard de GitHub Pages.
  Requêtes HTTPS ciblant les quatre adresses IPv4 : 200 et même contenu,
  en conservant le nom TLS/Host et le proxy de l’environnement.
- HTTP redirige une fois vers HTTPS, puis 200 ; l’URL envoyée est déjà HTTPS.
- Aucun incident GitHub non résolu signalé au moment du contrôle.

La cause interne de l’échec dans Search Console n’est pas démontrée. Les contrôles
ne permettent pas d’affirmer un défaut de cache, une pénalité, une panne Google
ou une erreur de configuration du site. La tentative PageSpeed sans clé a été
refusée par le quota de cette API ; elle ne constitue pas un échec du site.

## Contournement à valider

Ajout de https://revizstmg.github.io/sitemap.txt, fichier UTF-8 avec une URL par
ligne, aussi déclaré dans robots.txt. Il reprend l’accueil et conserve le XML.
Ce format est officiellement pris en charge par Google. L’URL distincte permet
une nouvelle soumission indépendamment de l’entrée XML en échec.

Publication réalisée dans #44 : réponse publique 200 text/plain et contenu
exact vérifiés, référence robots présente, ancien XML conservé. Recette main :
293 tests unitaires et 152 parcours navigateur réussis (#39497302917).
Prochaine étape : envoyer sitemap.txt dans Search Console. Le succès du rapport Google reste
à constater par le propriétaire ; la présence du fichier seule ne le démontre pas.
Si ce format est accepté, il peut rester comme entrée alternative. Si le refus
persiste aussi, conserver le résultat de récupération détaillé de Search Console
et vérifier les paramètres propres à la propriété avec son propriétaire.

La PR #41 de Claude ajoute un sitemap XML complet des cours publics. Elle reste
indépendante ; le fichier texte de secours ne contient que l’accueil existant.
Il n’est pas présenté comme l’inventaire des futures pages /cours/.

## Références

- Google, formats et création :
  https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google, diagnostic de récupération :
  https://support.google.com/webmasters/answer/7451001?hl=fr
- Schéma officiel : https://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
