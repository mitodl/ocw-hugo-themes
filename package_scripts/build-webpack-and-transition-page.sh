#!/usr/bin/env bash

set -euo pipefail

webpack --config base-theme/assets/webpack/webpack.prod.ts "$@"
transition_noindex="$(node -r dotenv/config -p 'process.env.NOINDEX ?? "true"')"
transition_learn_url="$(node -r dotenv/config -p 'process.env.MIT_LEARN_BASE_URL ?? ""')"
NOINDEX="$transition_noindex" MIT_LEARN_BASE_URL="$transition_learn_url" hugo --source sites/ocw-transition \
  --themesDir "$PWD" \
  --destination "$PWD/base-theme/dist/ocw-transition"
