#!/bin/bash

set -euo pipefail

# We should have 2 arguments; the path to the content and the config
if [[ $# -lt 2 ]]; then
  echo "Usage: build.sh /path/to/site /path/to/config.yaml"
  exit 1
else
  # Trim any trailing slashes from site path
  CONTENT_PATH=$(echo $1 | sed 's:/*$::')
  CONFIG_PATH=$2
  THEMES_PATH=$(pwd)
  STATIC_PATH=$CONTENT_PATH/dist/static_shared
  # Ensure static dir exists
  mkdir -p $STATIC_PATH
  # Build webpack assets
  npm run build:webpack --  --output-path=$STATIC_PATH
  cd $CONTENT_PATH
  # Run Hugo build
  hugo --config $CONFIG_PATH --themesDir $THEMES_PATH -d dist --logLevel info
  GIT_HASH=`git rev-parse HEAD`
  printf $GIT_HASH >> $STATIC_PATH/hash.txt
fi
