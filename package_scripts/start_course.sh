#!/bin/bash

set -euo pipefail

THEMES_PATH=$(pwd)

cd $SITE_CONTENT

# Run hugo server
hugo server \
  -p 3000 \
  --bind 0.0.0.0 \
  --config $COURSE_HUGO_CONFIG_PATH \
  --themesDir $THEMES_PATH \
  --renderToDisk
