# Examens blancs personnalisés

Fonction indépendante, aucune table ni migration. `plan` sélectionne dans le
catalogue des chapitres ; `generate` reçoit uniquement le texte des sections
confirmées. Le sujet JSON comprend documents fictifs, questions rédigées,
barème sur 20, corrigé et critères. Les données utilisateur sont séparées des
instructions système. Le contrat rejette identifiants inconnus, doublons,
barème incorrect, absence de corrigé et volume incompatible avec la durée.
Cette validation structurelle ne prouve pas la justesse pédagogique : une
relecture avec le cours est explicitement demandée.

## Configuration

Déployer `index.ts`, `handler.js`, `contract.js` sous `examen-blanc`, avec
`verify_jwt: true`. Le POST vérifie aussi le jeton via `/auth/v1/user` et refuse
les comptes anonymes. Le GET retourne uniquement `{ready: boolean}` : il ne
fait aucun appel payant et ne révèle aucun secret.

Secrets serveur (jamais dans Vite ni le navigateur) :
- `GEMINI_API_KEY` (ou `GOOGLE_API_KEY`), modèle `EXAM_GEMINI_MODEL`, valeur par
  défaut `gemini-3.6-flash` ; sinon
- `ANTHROPIC_API_KEY`, modèle `EXAM_ANTHROPIC_MODEL`, défaut `claude-sonnet-4-6`.

Sans clé, l’interface montre la disponibilité réelle et les sujets existants.
Une clé peut déjà être présente dans les secrets du projet ; ne pas l’afficher.
Le nom de modèle peut être remplacé dans les secrets si le fournisseur change
ses versions. Un fournisseur peut refuser un modèle ou atteindre ses quotas :
les messages sont contrôlés et aucun faux sujet n’est généré en remplacement.

## Limites et données

- Validation d’un vrai utilisateur avant appel IA ; 12 requêtes/heure/utilisateur
  par instance chaude. **Ce compteur mémoire n’est pas un quota global durable**.
  Configurer aussi un plafond de dépenses/quota fournisseur avant une ouverture
  commerciale importante. Un quota persistant nécessiterait une migration
  distincte, pas incluse ici. Corps limité à 350 000 caractères, timeout IA 140 s.
- L’IA reçoit la demande et les extraits de cours, pas la session, l’identité,
  les réponses ni la copie. Aucune journalisation des prompts/jetons ici.
- Sujet personnalisé local séparé par compte (`revizstmg_exam_v1_<id>`), pas synchronisée
  entre appareils. Un seul sujet courant par compte, remplacement confirmé.
  Le sujet et le corrigé sont téléchargés dans deux PDF séparés.
- Depuis la refonte PDF, les réponses se rédigent sur une copie papier ; le
  formulaire de réponses et le chronomètre de la création personnalisée ont été
  retirés. Les anciennes données locales ne sont pas effacées. Le corrigé guide
  l’auto-évaluation, sans note automatique sur une rédaction.
- Les sujets/corrigés sont en français ; contrôles traduits dans les cinq langues.
- Téléchargement de deux véritables PDF A4 via jsPDF, chargé à la demande :
  sujet complet et corrigé séparé. Pagination, documents et barème inclus.
- Les annales officielles 2026 proposées dans Bac blanc sont des liens directs
  aux fichiers ministériels originaux et fonctionnent sans clé IA. Elles ne
  prétendent pas être des sujets de la session 2027.

Tests : `app/tests/examen-personnalise.test.js` (serveur avec fournisseur simulé,
contrat, source, durée, isolation locale, langues) et
`app/tests/parcours/examen-personnalise.spec.js` (réseau simulé uniquement).

## Activer depuis le tableau de bord

1. Créer une clé chez le fournisseur choisi (par exemple Google AI Studio).
2. Ouvrir le projet **Revizstmg**, puis **Edge Functions → Secrets** dans Supabase.
3. Ajouter `GEMINI_API_KEY` (ou `ANTHROPIC_API_KEY`) avec sa valeur, uniquement
   dans cet écran. Aucune clé à coller dans le dépôt ou dans un message.
4. Dans **Bac blanc → Crée ton examen blanc**, cliquer **Réessayer** : le contrôle
   de disponibilité relit les secrets côté serveur, sans appeler le fournisseur.
5. Connecté à son compte, essayer une demande précise, vérifier le périmètre et
   créer un sujet. Relire ce premier sujet avec les cours avant une large ouverture.

Au contrôle du 21 octobre 2026 après déploiement v1 : fonction active, JWT requis,
GET 200 `ready:false`, POST visiteur 401. La génération par un fournisseur réel
attend une clé ; les tests automatisés utilisent exclusivement des réponses simulées.

## Diagnostic fournisseur

Le GET habituel indique la présence d’une clé, pas la réussite d’une génération.
`GET ?check=provider` vérifie les métadonnées du modèle Gemini avec la clé serveur,
sans envoi de cours ou de demande et sans génération de texte. Le résultat contrôlé
est mutualisé et mis en cache une minute par instance. Une réponse positive
confirme uniquement cet accès aux métadonnées ; l’appel authentifié de génération
peut encore être refusé (permissions, quotas ou paramètres).
Les échecs sont journalisés sous `exam_provider_failure` (statut HTTP et catégorie)
ou `exam_request_failure` (catégorie / type contrôlé), jamais avec la clé, le prompt,
le jeton ou le message brut du fournisseur.

Depuis le correctif de modèle : un identifiant préfixé par `models/` est normalisé.
Le modèle par défaut est `gemini-3.6-flash` ; une alternative `gemini-3.8-flash`
est permise uniquement sur 404 (modèle indisponible) ou 503 (service indisponible).
Sur 503, une seule reprise après une seconde est autorisée avant l’alternative.
Le délai global des appels Gemini est borné à 120 secondes. Aucun repli sur une
clé invalide, des permissions, un quota ou une réponse incohérente ; aucun modèle
Pro n’est choisi automatiquement. Si tout échoue, aucun sujet factice n’est fourni.

Action `study` : bilan et 3–8 nouveaux exercices liés aux cours fournis. Les cours, déclarations et fichiers sont des données non fiables, jamais des instructions. Accès contrôlé via la réponse Auth `/user`, métadonnées serveur `revizstmg_subscription`, plan et expiration obligatoire. Premium : texte ; Ultimate : sujet puis copie, séparés par `subjectFiles`. Aucun changement SQL, Storage ou d’abonnement utilisateur. Réutilise Gemini pour les fichiers (6 Mo/6 fichiers au total) et les limites existantes du fournisseur.
