# Mesure de chargement — 20 octobre 2026

Comparaison locale de la version publiée `175e4f2` (source `826e4bb`) et du lot
`9dcf0c6`, après intégration du lot de Claude (PR #31). [Mesures brutes](performance-mobile.json).

| Indicateur | Avant | Après |
|---|---:|---:|
| JavaScript principal, octets | 595,157 | 578,453 |
| Même fichier gzip niveau 6, octets | 184,728 | 179,500 |
| Ressources du démarrage observées | 13 | 13 |
| Corps téléchargés au démarrage local, octets | 860,786 | 845,323 |
| LCP, essai 1 (ms) | 6028 | 3612 |
| LCP, essai 2 (ms) | 3572 | 2884 |

Le JavaScript principal diminue de 16,704 octets
(2.8 %). La référence historique du formulaire
(`content/commun/formules.json`), qui n’est plus utilisée par l’interface, reste
importable par les tests mais sort du chargement commun initial. Les formules
actuelles, leurs exercices et leurs tests restent disponibles.

Méthode : Playwright 1.56.1 / Chromium, émulation de l’écran Pixel 7, CPU natif
de l’environnement, réseau simulé 4 Mbit/s, latence 100 ms, deux contextes neufs
par version. Deux serveurs HTTP locaux sans compression ; compte et données
fictifs ; toute requête extérieure bloquée. LCP observé trois secondes après
l’apparition du titre de l’accueil. Gzip calculé séparément, pas présenté comme
un transfert HTTP compressé réellement mesuré.

Les service workers sont bloqués pendant cette comparaison afin d’isoler le
démarrage et de ne pas mélanger le préchargement des cours à la navigation.
Le volume brut des fichiers compilés listés dans `PRECACHE` figure dans le JSON
(hors HTML, manifest et icônes du groupe `CORE`) ;
ce préchargement reste un coût supplémentaire de la première visite.

Deux essais sur un hôte partagé et une émulation d’écran ne démontrent pas une
vitesse garantie sur téléphone physique. Les temps varient nettement entre les
essais ; l’amélioration certaine mesurée ici est la baisse du poids initial.
Il reste à profiler un téléphone réel et les premières visites avec préparation
hors ligne, puis à examiner l’index commun et les tâches longues avant de
changer davantage le chargement.
