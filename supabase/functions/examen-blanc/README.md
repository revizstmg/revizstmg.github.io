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
  défaut `gemini-2.5-flash` ; sinon
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
- Copie locale séparée par compte (`revizstmg_exam_v1_<id>`), pas synchronisée
  entre appareils. Une seule copie courante par compte, remplacement confirmé.
  Le corrigé reçu est caché dans l’interface avant remise ; ce n’est pas un
  dispositif anti-triche et le chronomètre n’est pas certifié côté serveur.
- Le chronomètre continue pendant une fermeture/veille. Remise à échéance,
  corrigé et auto-évaluation, sans note automatique sur une rédaction.
- Les sujets/corrigés sont en français ; contrôles traduits dans les cinq langues.
- Impression via le navigateur (destination « Enregistrer au format PDF »).

Tests : `app/tests/examen-personnalise.test.js` (serveur avec fournisseur simulé,
contrat, source, durée, isolation locale, langues) et
`app/tests/parcours/examen-personnalise.spec.js` (réseau simulé uniquement).
