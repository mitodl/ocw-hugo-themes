#!/bin/bash

set -euo pipefail

source package_scripts/common.sh
load_env --require-dot-env

THEMES_PATH=$(pwd)
STATIC_API_BASE_URL=${STATIC_API_BASE_URL:-}
RESOURCE_BASE_URL=${RESOURCE_BASE_URL:-}
FIELDS_HUGO_CONFIG_PATH=${FIELDS_HUGO_CONFIG_PATH:-}
FIELDS_CONTENT_PATH=${FIELDS_CONTENT_PATH:-}
OCW_TEST_COURSE=${OCW_TEST_COURSE:-}

# If the base URL variables aren't set, assign defaults
if [[ -z "${STATIC_API_BASE_URL}" ]]; then
  export STATIC_API_BASE_URL="https://ocw-live-qa.global.ssl.fastly.net/"
fi
if [[ -z "${STATIC_API_BASE_URL}" ]]; then
  export RESOURCE_BASE_URL="https://ol-ocw-studio-app-qa.s3.amazonaws.com/"
fi

cd $FIELDS_CONTENT_PATH

echo $FIELDS_HUGO_CONFIG_PATH
echo $FIELDS_CONTENT_PATH

# Run hugo server
hugo server \
  -p 3000 \
  --bind 0.0.0.0 \
  --config $FIELDS_HUGO_CONFIG_PATH \
  --themesDir $THEMES_PATH \
  --renderToDisk
