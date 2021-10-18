#!/bin/bash

set -euo pipefail

source package_scripts/common.sh
load_env --require-dot-env

if [[ -z "${COURSE_CONTENT_PATH}" ]]; then
  echo "COURSE_CONTENT_PATH not set"
  exit 1
elif [[ -z "${COURSE_HUGO_CONFIG_PATH}" ]]; then
  echo "COURSE_HUGO_CONFIG_PATH not set"
  exit 1
elif [[ -z "${OCW_TEST_COURSE}" ]]; then
  echo "OCW_TEST_COURSE not set"
  exit 1
else
  # Change to our content directory and start the Hugo server
  THEMES_PATH=$(pwd)
  # Trim any trailing slashes from the course content path
  COURSE_CONTENT_PATH=$(echo $COURSE_CONTENT_PATH | sed 's:/*$::')
  # Append the test course slug
  cd $COURSE_CONTENT_PATH/$OCW_TEST_COURSE
  # Run hugo server
  hugo server -p 3000 --bind 0.0.0.0 --config $COURSE_HUGO_CONFIG_PATH --themesDir $THEMES_PATH --renderToDisk
fi
