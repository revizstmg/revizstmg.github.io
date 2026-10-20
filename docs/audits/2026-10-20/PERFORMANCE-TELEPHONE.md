# Démarrage sur téléphone — mesure complémentaire (Claude, 20 octobre 2026)

Suite de [la mesure de Codex](PERFORMANCE.md) (point 27). Cette fois, le
processeur est ralenti et la compression gzip est active, comme sur GitHub Pages.

## Ce qui a changé

| Changement | Effet |
|---|---|
| Les données propres à une page (Grand Oral, étude de gestion, outils de projet, méthodo, atelier de formules) arrivent avec leur page, et non plus au démarrage (`src/content/contenu.js`) | JavaScript principal : 578 707 → 527 310 octets (−51 ko ; gzip 179 → 165 ko) |
| Inter et Cormorant Garamond en version « variable » : un fichier par police pour toutes les graisses (`src/polices.css`) | Polices de l'accueil : 5 fichiers, 121 ko → 2 fichiers, 86 ko |

Le rendu est inchangé. Sur les captures de l'accueil avant et après, 850 pixels
sur 2,4 millions diffèrent, et seulement par le lissage des lettres.

## Mesure

`node scripts/mesure-mobile.mjs <dist avant> <dist après>`. La mesure émule un
Pixel 7, un processeur 4 fois plus lent et une 4G lente (1,6 Mbit/s, 150 ms de
latence). Un serveur local compresse en gzip, et le service worker est désactivé
(cas de la première visite). L'élève est fictif et déjà inscrit, et aucune
requête extérieure ne part. Chaque version est mesurée trois fois ; le tableau
donne la médiane.

| Indicateur (médiane de 3) | Avant | Après |
|---|---:|---:|
| Octets reçus jusqu'à l'accueil complet | 335 698 | 287 672 (−14 %) |
| Titre de l'accueil affiché (ms) | 2 179 | 2 149 |
| LCP (ms) | 1 700 | 1 672 |
| Blocage du fil principal, tâches longues au-delà de 50 ms (ms) | 217 | 231 |

Essais bruts (titre, LCP, blocage) :
- avant : (2179, 1700, 217), (2105, 1668, 205), (2252, 1772, 331) ;
- après : (2176, 1700, 199), (2149, 1672, 274), (2114, 1620, 231).

## Lecture

- Le gain certain est le volume : 48 ko de moins à chaque première visite, ce
  qui compte pour un forfait limité ou un réseau faible.
- Les temps bougent peu, et de moins que l'écart entre deux essais. Le texte
  s'affiche déjà avec une police de secours en attendant la vraie
  (`font-display: swap`), et le temps de blocage vient surtout de l'analyse du
  code React et du premier affichage.
- Pistes restantes, à mesurer avant de les entreprendre :
  - `Welcome.jsx` (26 ko) est chargé à chaque ouverture ;
  - `react-dom` et `react-router-dom` pèsent environ 250 ko non compressés ;
  - `fr.js` (41 ko) contient toutes les étiquettes.
- Cette mesure reste une émulation. Il manque un essai sur un vrai téléphone
  d'entrée de gamme.
