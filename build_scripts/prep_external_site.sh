#!/bin/bash

set -euo pipefail

if test -f ".env"; then
  export $(cat .env | xargs)
fi

if [[ -z "${EXTERNAL_SITE_PATH}" ]]; then
  echo "EXTERNAL_SITE_PATH not set"
  exit 1
else
  cd $EXTERNAL_SITE_PATH
  hugo mod tidy
  hugo mod clean
  hugo mod get -u
fi
