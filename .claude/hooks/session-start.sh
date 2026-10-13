#!/bin/bash
# Sessions cloud : installe les dépendances de app/ pour que npm test et les
# parcours marchent tout de suite. Chromium est déjà fourni par le conteneur
# (PLAYWRIGHT_BROWSERS_PATH), on ne lance donc pas « playwright install ».
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR/app"
npm install --no-audit --no-fund
