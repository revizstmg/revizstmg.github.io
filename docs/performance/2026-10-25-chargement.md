# Chargement initial du 25 octobre 2026

Optimisation ciblée sans changement visuel : préchargement des deux polices locales depuis le HTML public et applicatif, panneau Accessibilité chargé uniquement à l’ouverture (toujours mis en cache pour le hors ligne). Le dictionnaire reste immédiat pour préserver son comportement clavier.

Mesures locales comparables, trois passages alternés avant/après, Chromium Pixel 7, cache froid et service workers bloqués, réseau simulé 4 Mbit/s et latence 100 ms, CPU ralenti ×4. Serveur HTTP local sans compression ; ces valeurs ne représentent pas les temps réels de tous les visiteurs. Les données détaillées figurent dans le fichier JSON voisin.

| Médiane | Avant | Après |
| --- | ---: | ---: |
| Accueil : fin de téléchargement des polices | 2 823 ms | 696 ms |
| Page Droit : fin de téléchargement des polices | 818 ms | 478 ms |
| Accueil : LCP observé | 940 ms | 1 060 ms |
| Page Droit : LCP observé | 536 ms | 572 ms |

Les polices arrivent plus tôt et le script initial diminue de 2 212 octets non compressés. Ce protocole ne démontre pas un gain de LCP : le premier texte utilise déjà une police de remplacement, et le préchargement change la concurrence des ressources. Ne pas annoncer un gain global de vitesse ou de position Google à partir de ces chiffres. L’objectif mesuré est l’arrivée plus rapide de la typographie définitive.

Deux requêtes publiques ponctuelles avant modification ont donné un premier octet à 208 et 429 ms. Ce temps dépend de GitHub Pages, du cache réseau et du lieu de connexion : le code du site ne peut pas le fixer à zéro. Aucun hébergement, domaine ou réglage Supabase modifié.
