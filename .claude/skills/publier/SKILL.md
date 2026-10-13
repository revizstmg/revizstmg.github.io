---
name: publier
description: Tester, committer et mettre en ligne une modification de RévizSTMG (fusion dans main, workflow « Tester et publier », GitHub Pages). À utiliser à la fin de chaque changement de code ou de contenu, ou quand l'utilisateur demande de publier, déployer, mettre en ligne ou fusionner.
---

# Publier une modification

La racine du dépôt (`index.html`, `sw.js`, `manifest.webmanifest`, icônes) est
**générée** par `.github/workflows/deploy.yml` : ne la modifiez jamais à la main.

## 1. Vérifier en local

```bash
cd app
npm test
npm run build
npm run test:parcours      # ~3 min
```

Tout doit être vert. Une empreinte de contenu modifiée n'est acceptable que pour
un changement de contenu voulu (`npm run test:maj`).

## 2. Committer

- Travaillez sur la branche de la session, jamais directement sur `main`.
- Message en français, court, sur le modèle de l'historique : « Matière : ce qui
  change » (voir `git log --oneline`).
- Ne committez ni `app/dist/`, ni `app/test-results/`, ni `tests/.detail/`.

## 3. Mettre en ligne

1. Poussez la branche (`git push -u origin <branche>`). Le workflow « Tester et
   publier » tourne dessus : vérifiez qu'il est vert (outils GitHub :
   `actions_list` / `get_job_logs`).
2. Fusionner dans `main` met le site en ligne : **demandez d'abord l'accord de
   l'utilisateur** sauf s'il a déjà dit de publier. Ouvrez une PR (ou fusionnez si
   c'est ce qu'il a demandé).
3. Sur `main`, le workflow reteste, puis crée le commit « Publication automatique
   (<sha>) » à la racine. Vérifiez qu'il est vert et que
   https://revizstmg.github.io répond avec la nouvelle version.

## 4. Si le workflow échoue

Lisez les logs du job, reproduisez en local la commande qui échoue, corrigez,
revérifiez, poussez. Ne désactivez jamais un test pour obtenir du vert. En cas
d'échec des parcours, le rapport est dans l'artefact `rapport-parcours`.

## Rappel

Si vous modifiez une commande npm utilisée par la routine du matin, gardez
`.claude/settings.json` (liste `permissions.allow`) en accord.
