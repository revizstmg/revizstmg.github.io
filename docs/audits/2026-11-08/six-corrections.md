# Corrections des audits du 8 novembre 2026

- PDF : police DejaVu Sans embarquée à la demande pour les paragraphes contenant des notations absentes de Times WinAnsi. Préserve moyenne, somme, indice, intersection, union et racine sans remplacer le sens par du texte. Police existante et licence conservées ; sa représentation base64 est reproductible avec `node app/scripts/police-pdf.mjs`.
- Authentification : requêtes de connexion, inscription et récupération bornées à 15 secondes, lecture de la réponse comprise. Annulation réseau et message accessible, possibilité de recommencer sans perdre les champs.
- Boutique : les boutons pour gagner des XP conduisent aux cours accessibles gratuitement.
- Formules : le taux de chômage relève de Terminale, sans lien Première artificiel.
- Accueil : bouton principal prioritaire sur les petits écrans bas, y compris avec bandeaux cookies et hors connexion.
- Audio : le français reste la langue par défaut des cartes françaises quelle que soit la langue de l'interface. Choix explicite de voix, sauvegardé dans le paquet et conservé lors du partage/import.
- Offres : parcours et programmes adaptatifs réservés à Ultimate, cohérence entre accès, offres, CGU et traductions. Les objectifs déjà enregistrés sont conservés. L'information publique sur les vacances reste accessible sans abonnement.

## Vérification

Tests unitaires de délai avec annulation et reprise ; CMap Unicode des sujets et corrigés ; extraction PyMuPDF et inspection visuelle des notations (aucun caractère NUL, sujet 3 pages et corrigé 2 pages pour le cas synthétique). Tests navigateur : cours gratuits depuis la boutique, droits Premium/Ultimate, objectifs conservés, serveur Auth silencieux, interface allemande avec cartes françaises et voix enregistrée. Tests existants d'accueil, vacances et parcours maintenus.

Les tests navigateur utilisent des comptes et réponses réseau simulés ; aucune mutation de base Supabase ni appel IA réel.
