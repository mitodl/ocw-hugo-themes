#!/bin/bash

set -euo pipefail

if test -f ".env"; then
  export $(cat .env | xargs)
fi

if [[ -z "${EXTERNAL_SITE_PATH}" ]]; then
  echo "EXTERNAL_SITE_PATH not set"
  exit 1
else
  # Prep our external site to use this theme
  /bin/bash build_scripts/prep_external_site.sh
  # Build the site
  rm -rf $EXTERNAL_SITE_PATH/dist
  GIT_HASH=`git rev-parse HEAD`
  npm run build:webpack --  --output-path=$EXTERNAL_SITE_PATH/dist
  cd $EXTERNAL_SITE_PATH
  hugo -d dist -v --log
  find dist
  mkdir -p dist/static
  printf $GIT_HASH >> dist/static/hash.txt
fi
