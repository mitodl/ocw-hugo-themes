#!/usr/bin/env bash

set -euo pipefail

webpack --config base-theme/assets/webpack/webpack.prod.ts "$@"
transition_noindex="$(node -r dotenv/config -p 'process.env.NOINDEX ?? "true"')"
NOINDEX="$transition_noindex" hugo --source sites/ocw-transition \
  --themesDir "$PWD" \
  --destination "$PWD/base-theme/dist/ocw-transition"
