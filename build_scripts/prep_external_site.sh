#!/bin/bash

set -euo pipefail
ENV_FILE=.env

if test -f "$ENV_FILE"; then
  export $(cat .env | xargs)
fi

cd $EXTERNAL_SITE_PATH
hugo mod tidy
hugo mod clean
hugo mod get -u
