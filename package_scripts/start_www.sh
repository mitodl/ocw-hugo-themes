#!/bin/bash

set -euo pipefail

source package_scripts/common.sh
load_env --require-dot-env

THEMES_PATH=$(pwd)
SEARCH_API_URL=${SEARCH_API_URL:-}
OCW_STUDIO_BASE_URL=${OCW_STUDIO_BASE_URL:-}
WWW_HUGO_CONFIG_PATH=${WWW_HUGO_CONFIG_PATH:-}
WWW_CONTENT_PATH=${WWW_CONTENT_PATH:-}

# If the base URL variables aren't set, assign defaults
if [[ -z "${SEARCH_API_URL}" ]]; then
  export SEARCH_API_URL="https://discussions-rc.odl.mit.edu/api/v0/search/"
fi
if [[ -z "${OCW_STUDIO_BASE_URL}" ]]; then
  export OCW_STUDIO_BASE_URL="http://ocw-studio-rc.odl.mit.edu/"
fi
if [[ -z "${WWW_HUGO_CONFIG_PATH}" ]]; then
  # Path to Hugo config not set, fetch default from Github
  clone_or_pull_repo git@github.com:mitodl/ocw-hugo-projects.git private/ocw-hugo-projects
  WWW_HUGO_CONFIG_PATH=$THEMES_PATH/private/ocw-hugo-projects/ocw-www/config.yaml
fi
if [[ -z "${WWW_CONTENT_PATH}" ]]; then
  # Path to www content not set, fetch default from ocw-content-rc
  clone_or_pull_repo git@github.mit.edu:ocw-content-rc/ocw-www.git private/ocw-www
  WWW_CONTENT_PATH=$THEMES_PATH/private/ocw-www
fi
# Change to our content directory and start the Hugo server
cd $WWW_CONTENT_PATH
hugo server \
  -p 3000 \
  --bind 0.0.0.0 \
  --config $WWW_HUGO_CONFIG_PATH \
  --themesDir $THEMES_PATH \
  --renderToDisk
