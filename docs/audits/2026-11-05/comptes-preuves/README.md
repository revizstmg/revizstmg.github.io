# Reproduction des cinq sondes

Les journaux sont conservés tels quels, y compris l’échec initial de casse du libellé parent. Il n’indique pas une panne de chargement : la reprise isolée confirme le résultat attendu.

Pour rejouer localement sur la version auditée compilée, copier `sondes.spec.js` dans `app/` sous le nom `audit-comptes-probes.spec.js`, ainsi que les deux fichiers `playwright.audit-*.config.js` dans `app/`. Garder `tests/parcours/eleve.js` et son blocage des services extérieurs. Le port4301 doit être libre ; un seul worker est configuré. Adapter uniquement le port si nécessaire. Le test parent écrit son observation dans ce répertoire.

Depuis `app/` : `npx playwright test --config playwright.audit-probes.config.js`. Ces sondes cherchent à observer les comportements décrits, elles ne sont pas des preuves de correction du produit. Aucun compte réel ou appel facturé n’est nécessaire.
