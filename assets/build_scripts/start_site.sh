#!/bin/bash

set -euo pipefail
ENV_FILE=.env

if test -f "$ENV_FILE"; then
  export $(cat .env | xargs)
fi

if [[ -z "${EXTERNAL_SITE_PATH}" ]]; then
  # Run the site without external content
  cd www
  hugo mod get -u
  hugo server -p 3000 --bind 0.0.0.0 --renderToDisk
else
  /bin/bash assets/build_scripts/prep_external_site.sh
  # Change to our content directory, update modules and run hugo server
  cd $EXTERNAL_SITE_PATH
  hugo mod get -u
  hugo server -p 3000 --bind 0.0.0.0 --renderToDisk
fi
