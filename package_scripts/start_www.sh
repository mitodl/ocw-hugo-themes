#!/bin/bash

set -euo pipefail

source package_scripts/common.sh
load_env --require-dot-env

THEMES_PATH=$(pwd)
WWW_HUGO_CONFIG_PATH=${WWW_HUGO_CONFIG_PATH:-}
WWW_CONTENT_PATH=${WWW_CONTENT_PATH:-}

if [[ -z "${WWW_HUGO_CONFIG_PATH}" ]]; then
  clone_or_pull_repo git@github.com:mitodl/ocw-hugo-projects.git private/ocw-hugo-projects
  WWW_HUGO_CONFIG_PATH=$THEMES_PATH/private/ocw-hugo-projects/ocw-www/config.yaml
fi
if [[ -z "${WWW_CONTENT_PATH}" ]]; then
  clone_or_pull_repo git@github.mit.edu:ocw-content-rc/ocw-www.git private/ocw-www
  WWW_CONTENT_PATH=$THEMES_PATH/private/ocw-www
fi
# Change to our content directory and start the Hugo server
cd $WWW_CONTENT_PATH
hugo server -p 3000 --bind 0.0.0.0 --config $WWW_HUGO_CONFIG_PATH --themesDir $THEMES_PATH --renderToDisk
