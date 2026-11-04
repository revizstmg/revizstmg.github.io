# EPS publié

La page https://revizstmg.github.io/#/sport-bac est publiée. Depuis la page, choisir « Les 26 activités et l’examen ponctuel » pour accéder au catalogue et au programme complémentaire.

Contrôle public du 4 novembre 2026 :26 activités, lecture correcte du palier800m, programme de8séances, trois PDF en HTTP200 avec leurs empreintes officielles. Les comptes/services privés utilisés par le navigateur de test sont synthétiques ; aucun appel réel à Supabase, à un fournisseur d’IA ou à Stripe. Preuve : audits/2026-11-04/eps-public.json.

La publication native restait bloquée après la création de l’archive. Le workflow relancer-pages.yml utilise les actions officielles upload-pages-artifact/deploy-pages et vérifie l’empreinte de l’index avant la diffusion. Les PDF sont également vérifiés et inclus dans cette archive. Permissions nécessaires : contents:read, pages:write et id-token:write ; environnement github-pages existant, branche main uniquement.

Le script publier.mjs omettait le dossier eps de dist. #174 corrige cette omission pour les compilations suivantes et teste le remplacement des anciens fichiers. Les fichiers compilés ne sont pas modifiés manuellement.

La commande manuelle de secours se lance après les tests d’une compilation en donnant son empreinte SHA-256. Elle ne crée pas de nouvelles sources, ne modifie pas Supabase et refuse un index différent de l’empreinte demandée. Le référentiel détaillé de Claude, les plans existants et la règle d’accès Premium sont conservés.
