#!/bin/bash

set -euo pipefail

if test -f ".env"; then
  export $(cat .env | xargs)
fi

npm run build:webpack
if [[ -z "${EXTERNAL_SITE_PATH}" ]]; then
  echo "EXTERNAL_SITE_PATH not set"
  exit 1
else
  # Prep our external site to use this theme
  /bin/bash base-theme/assets/build_scripts/prep_external_site.sh
  # Build the site
  cd $EXTERNAL_SITE_PATH
  hugo -d $PWD/dist -v
fi
