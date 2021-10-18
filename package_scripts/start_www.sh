#!/bin/bash

set -euo pipefail

source package_scripts/common.sh
load_env --require-dot-env

if [[ -z "${WWW_CONTENT_PATH}" ]]; then
  echo "WWW_CONTENT_PATH not set"
  exit 1
elif [[ -z "${WWW_HUGO_CONFIG_PATH}" ]]; then
  echo "WWW_HUGO_CONFIG_PATH not set"
  exit 1
else
  # Change to our content directory and start the Hugo server
  THEMES_PATH=$(pwd)
  cd $WWW_CONTENT_PATH
  hugo server -p 3000 --bind 0.0.0.0 --config $WWW_HUGO_CONFIG_PATH --themesDir $THEMES_PATH --renderToDisk
fi
