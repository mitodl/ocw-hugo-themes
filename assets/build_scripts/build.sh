#!/bin/bash

set -euo pipefail

ENV_FILE=.env

if test -f "$ENV_FILE"; then
    export $(cat .env | xargs)
fi

npm run build:webpack
if [[ -z "${EXTERNAL_SITE_PATH}" ]]; then
  # Build the site without external content
  hugo -d dist -v
else
  # Prep our external site to use this theme
  /bin/bash assets/build_scripts/prep_external_site.sh
  # Build the site
  cd $EXTERNAL_SITE_PATH
  hugo -d $PWD/dist -v
fi
