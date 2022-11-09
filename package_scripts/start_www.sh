#!/bin/bash

set -euo pipefail

THEMES_PATH=$(pwd)

# Change to our content directory and start the Hugo server
cd $WWW_CONTENT_PATH
hugo server \
  -p 3000 \
  --bind 0.0.0.0 \
  --config $WWW_HUGO_CONFIG_PATH \
  --themesDir $THEMES_PATH \
  --renderToDisk
