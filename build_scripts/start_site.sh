#!/bin/bash

set -euo pipefail

source build_scripts/common.sh
load_env --require-dot-env

if [[ -z "${EXTERNAL_SITE_PATH}" ]]; then
  echo "EXTERNAL_SITE_PATH not set"
  exit 1
else
  /bin/bash build_scripts/prep_external_site.sh
  # Change to our content directory, update modules and run hugo server
  cd $EXTERNAL_SITE_PATH
  hugo mod get -u
  hugo server -p 3000 --bind 0.0.0.0 --renderToDisk
fi
