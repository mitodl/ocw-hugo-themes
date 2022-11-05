#!/bin/bash

set -euo pipefail

source package_scripts/common.sh

THEMES_PATH=$(pwd)
# re-export with some fallbacks
export SEARCH_API_URL=${SEARCH_API_URL:-"https://discussions-rc.odl.mit.edu/api/v0/search/"}
export OCW_STUDIO_BASE_URL=${OCW_STUDIO_BASE_URL:-"http://ocw-studio-rc.odl.mit.edu/"}
export WWW_HUGO_CONFIG_PATH=${WWW_HUGO_CONFIG_PATH:-"https://live-qa.ocw.mit.edu/"}
export WWW_CONTENT_PATH=${WWW_CONTENT_PATH:-"https://live-qa.ocw.mit.edu/"}


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
