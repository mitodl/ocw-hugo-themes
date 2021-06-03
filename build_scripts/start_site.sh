#!/bin/bash

set -euo pipefail

if test -f ".env"; then
  export $(cat .env | xargs)
else
  echo ".env file not found"
  exit 1
fi

if [[ -z "${EXTERNAL_SITE_PATH}" ]]; then
  echo "EXTERNAL_SITE_PATH not set"
  exit 1
else
  # Change to our content directory and run hugo server
  THEME_DIR=$PWD
  cd $EXTERNAL_SITE_PATH
  hugo server -p 3000 --bind 0.0.0.0 --renderToDisk --themesDir $THEME_DIR --theme "base-theme,www"
fi
