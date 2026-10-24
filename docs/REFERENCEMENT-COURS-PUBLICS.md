# Cours publics et référencement

Reprise du générateur préparé par Claude dans #41, adaptée au contenu et à la charte actuels dans #108. L’application React et ses routes #/ sont conservées ; pas de migration de framework.

## Compilation et publication

`npm run build` compile l’application, génère les pages de lecture, puis finalise la PWA. Les pages utilisent le même moteur de contenu que l’application : cours, paragraphes, listes, tableaux, définitions et schémas SVG rendus en HTML à la compilation. Les exemples de QCM proviennent seulement des exercices explicitement rattachés à la section. Le nombre d’activités affiché correspond au moteur actuel ; une section sans activité n’en promet pas.

Les dossiers /cours/, /a-propos/ et /partager/ sont remplacés intégralement par la publication automatique. Les assets de la version précédente restent conservés selon la règle existante. Ne jamais éditer manuellement les fichiers compilés à la racine.

Sitemap XML et texte sont générés depuis la liste exacte des pages, sans #, ainsi que llms.txt. Les anciennes copies fixes dans app/pwa/ sont supprimées pour éviter qu’elles écrasent la génération. L’accueil livré contient aussi un catalogue HTML réel dans #root ; React le remplace au démarrage de l’application. Aucun rendu spécial selon le visiteur ou le robot, aucun contenu dissimulé.

## Adresses

- /cours/ : catalogue Première et Terminale.
- /cours/premiere/.../ et /cours/terminale/.../ : matière, thème puis chapitre.
- /cours/langues/ et /cours/langues/en/ (es, it, ar, de) : guides actuels et vidéos. Les anciens cours de langues archivés ne sont pas publiés.
- /a-propos/ : auteurs, méthode, limites et sources officielles.
- /partager/ : liens et texte de présentation honnête.

La canonical reste https://revizstmg.github.io/. Le domaine revisionstmg.fr cité dans le texte de demande est un site tiers ; aucune migration n’a été réalisée vers ce domaine.

## Fiabilité

Une fiche porte un titre, une description, sa canonical, les métadonnées de partage et les données structurées BreadcrumbList/LearningResource. Les auteurs sont présentés comme élèves, conformément aux mentions légales. Aucune certification d’enseignant, note, avis, partenariat ou audience n’est inventé.

Les définitions placées en tête reprennent celles du chapitre ; les textes de cours ne sont pas réécrits pour le SEO. Les sources officielles sont des points de vérification, sans affirmer qu’un professeur a validé chaque fiche. Les passerelles thématiques relient un nombre limité de chapitres pertinents au même niveau et ne changent jamais les banques de questions.

## Apparence et hors ligne

Les pages de lecture reprennent vert profond, crème, doré et les polices locales déjà compilées. Boutons à angles discrets, pas de dégradé ni animation, lecture mobile et impression. Dans l’application, seuls des liens de lecture/À propos et le titre de l’onglet sont ajoutés ; les interfaces ne sont pas refaites.

Si le service worker de l’application est déjà installé, une fiche consultée est mise en cache sous sa propre adresse. Une fiche non disponible hors ligne reçoit une page explicite avec statut 503, pas le HTML d’une autre page renvoyé comme un succès.

## Exploitation

Lire docs/DIFFUSION-RESSOURCES.md pour la préparation des partages, Search Console et Bing. Aucun message externe ni demande d’indexation dans un compte privé n’a été envoyé par le générateur. L’indexabilité technique ne garantit ni indexation ni première position.
