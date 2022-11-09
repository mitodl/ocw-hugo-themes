#!/bin/bash

set -euo pipefail

THEMES_PATH=$(pwd)

# Run hugo server
cd $FIELDS_CONTENT_PATH
hugo server \
  -p 3000 \
  --bind 0.0.0.0 \
  --config $FIELDS_HUGO_CONFIG_PATH \
  --themesDir $THEMES_PATH \
  --renderToDisk
