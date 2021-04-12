#!/bin/bash

set -euo pipefail

ENV_FILE=.env

if test -f "$ENV_FILE"; then
    export $(cat .env | xargs)
fi

npm run build:webpack
hugo -d dist --contentDir $OCW_WWW_CONTENT_PATH
# npm run build:githash
