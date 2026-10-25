# Prix de l’excellence économique

Entrée dans Bac blanc, route `/#/excellence-economique`. Entraînement indépendant : aucune inscription, note officielle, classement ou récompense du concours.

## Dossiers vérifiés

Quatre sujets authentiques, sessions 2021-2022, 2022-2023, 2023-2024 et 2024-2025, respectivement 12, 13, 11 et 10 pages. Sources et SHA-256 dans `supabase/functions/examen-blanc/excellence-subjects.js`. Originaux Banque de France et académies de Polynésie/Besançon ; index du CrCom : https://crcom.ac-versailles.fr/Sujets-Prix-de-l-excellence-economique . Les sujets non récupérés ne sont pas inventés ni présentés comme disponibles.

PDF intacts dans `app/public/excellence/<année>/sujet.pdf`. Aperçus JPEG 120 dpi pour défilement fiable, notamment mobile sans lecteur PDF ; transcription texte par page, avec lien permanent vers PDF/original et source. Texte extrait par `pdftotext -layout`, images par `pdftoppm -jpeg -jpegopt quality=82,optimize=y -r 120`. Les graphiques et tableaux sont conservés dans les images et le PDF. Le texte extrait ne remplace pas les figures. Aucune nouvelle dépendance. Le dossier de 17 Mo est chargé à la demande, pas dans le précache initial ; publication par le script existant étendu à ce seul dossier.

## Copie

Deux panneaux indépendants sur ordinateur : copie à gauche, documents à droite. Deux boutons Copie/Documents sur téléphone ; ni défilement horizontal ni réduction illisible des deux panneaux. Jusqu’à 60 000 caractères, export texte, repère de quatre heures depuis le début volontaire, conservé au rechargement et arrêté à la remise. Aucune remise automatique ni perte à échéance.

Brouillons et corrections stockés localement par compte et par sujet, pas synchronisés. Chaque changement sauvegarde la copie ; erreur de stockage affichée et export disponible. Changement de compte : composant réinitialisé et appel annulé. La modification d’une copie corrigée exige confirmation et efface seulement sa correction locale. Les visiteurs lisent les documents sans pouvoir envoyer de copie.

## Correction

Consentement explicite à l’envoi à Gemini du texte sans identité et du dossier officiel. Action `excellence` dans la fonction existante `examen-blanc`, JWT conservé, vérification Auth `/user`, refus des comptes anonymes et limite de 12 demandes/h/instance existante. Ce compteur mémoire n’est pas un plafond de facturation global. Aucun changement de schéma, SQL, Storage, abonnement ou NAH.

Le serveur accepte seulement un identifiant de sujet connu et la rédaction. Il télécharge le PDF à une URL GitHub Pages fixe et vérifie sa signature et son SHA-256 avant envoi au modèle ; aucune URL fournie par le client, aucun document substituable. Taille bornée à 4 Mo, téléchargement 15 s, fournisseur 120 s et attente totale client 150 s, annulable. Un fichier manquant ou différent bloque la correction sans faux résultat. Tous les textes sont traités comme données non fiables ; aucune instruction dans une copie ne doit modifier la grille.

Grille RévizSTMG annoncée avant rédaction et remise, distincte du barème officiel : notions 5, documents 5, argumentation 5, structure 3, expression 2. Le serveur valide chaque critère, demi-points/plafonds/identifiants uniques et additionne lui-même les points sur 20. Les citations commentées doivent être des passages exacts de la copie. Bilan, points forts, priorités, commentaires et proposition de plan ; aucune note future garantie. En cas d’échec, aucune note attribuée et copie conservée.

## Fiabilité des questions de contrôle

Le journal serveur a confirmé une erreur fournisseur 503 le 25 octobre 2026 à 13:26 UTC. Reprise Gemini différée de 2,5 s, toujours bornée et sans nouvelle tentative sur quota/permission. Si le service reste indisponible à la préparation, une synthèse structurée peut être construite sans génération à partir de trois extraits exacts du seul chapitre et de cinq critères. Cette origine est explicitement signalée. Pas de faux résultat fournisseur ni ajout de notions. Si le cours ne contient pas trois extraits exploitables, aucun faux exercice de secours n’est inventé. La correction reste effectuée par le fournisseur ; erreur d’indisponibilité/configuration/réponse invalide désormais distinguée du message générique. Les limites et annulations existantes restent actives.

## Vérification

Tests réseau simulés uniquement : métadonnées/PDF/pages/empreintes, note et citations contrôlées, compte et modèle requis, dossiers remplacés, isolation et reprise ; parcours ordinateur/téléphone, erreur/annulation/délai, consentement, export et accessibilité. Déploiement serveur et validation publique à confirmer dans la PR de livraison. Une réussite de sonde des métadonnées fournisseur ne garantit pas une génération à chaque requête.
