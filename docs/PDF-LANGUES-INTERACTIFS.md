# Guides de langues interactifs

Les cinq guides conservent leurs cours, exercices, vidéos, sommaires et corrigés. Chaque exercice dispose d’un champ de réponse (liste A/B/C pour les QCM, texte multiligne pour les autres) et d’une case « À retravailler ». Les réponses sont vides à la distribution ; aucun corrigé automatique ni script PDF n’est ajouté. Les liens permettent de consulter la correction puis de revenir à l’énoncé.

Télécharger puis ouvrir le fichier dans un lecteur compatible AcroForm et enregistrer une copie pour garder les réponses. Les prévisualisations des navigateurs et téléphones ne prennent pas toutes en charge les formulaires ou leur sauvegarde. Pour l’arabe, utiliser un lecteur gérant la saisie de droite à gauche. Les vidéos demandent toujours une connexion.

## Génération

Dans l’environnement de développement, avec les dépendances Node du projet et Chromium Playwright installés :

```sh
python3 -m pip install -r app/scripts/requirements-pdf.txt
node app/scripts/guides-langues.mjs
python3 app/scripts/verifier-guides-interactifs.py --sortie /tmp/preuves-pdf.json
```

La génération HTML réserve des espaces à hauteur bornée. Le post-traitement PyMuPDF ajoute les formulaires, supprime les seuls repères techniques et conserve les liens. Les champs sont identifiés par l’identifiant stable de l’exercice et portent un libellé lisible. Les zones de réponse sont défilantes, sans agrandir chaque exercice en page séparée. PyMuPDF est une dépendance de génération manuelle uniquement ; ni l’application ni la compilation Pages ne l’exécutent. Git traite les PDF comme des binaires via `.gitattributes`.

## Contrôles

La vérification lit les cinq fichiers, compte les champs et leurs types, contrôle les réponses initiales vides, les choix proposés, les liens et leurs destinations, ainsi que le texte antérieur hors pieds de page. Elle remplit une copie temporaire, sélectionne une réponse et coche une case, enregistre puis relit les valeurs. Le document distribué reste inchangé. L’arabe et les caractères accentués sont inclus dans ce contrôle ; une page remplie en arabe est inspectée visuellement. Ces contrôles démontrent les formulaires standards et leur persistance, sans certifier chaque application de lecture disponible.

504 champs de réponse et 504 cases de suivi au total. Les résultats détaillés sont dans le journal de coordination et les preuves de livraison.

Les captures des deux parcours navigateur Langues restent complètes à l’échelle CSS : cela évite des images de plus de100000pixels en haute densité sans modifier les contrôles fonctionnels, WCAG ou de navigation. Les deux parcours sont réussis sur Première et Terminale.
