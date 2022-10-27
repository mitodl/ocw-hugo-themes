#!/bin/bash

set -euo pipefail

source package_scripts/common.sh

THEMES_PATH=$(pwd)
COURSE_HUGO_CONFIG_PATH=${COURSE_HUGO_CONFIG_PATH:-}
COURSE_CONTENT_PATH=${COURSE_CONTENT_PATH:-}
OCW_TEST_COURSE=${OCW_TEST_COURSE:-"18.06-spring-2010"}
# re-export with some fallbacks
export STATIC_API_BASE_URL=${STATIC_API_BASE_URL:-"https://live-qa.ocw.mit.edu/"}
export RESOURCE_BASE_URL=${RESOURCE_BASE_URL:-"https://live-qa.ocw.mit.edu/"}

if [[ -z "${COURSE_HUGO_CONFIG_PATH}" ]]; then
  # Path to Hugo config not set, fetch default from Github
  clone_or_pull_repo git@github.com:mitodl/ocw-hugo-projects.git private/ocw-hugo-projects
  COURSE_HUGO_CONFIG_PATH=$THEMES_PATH/private/ocw-hugo-projects/ocw-course/config.yaml
fi

if [[ -z "${COURSE_CONTENT_PATH}" ]]; then
  # Path to course content not set, fetch default from ocw-content-rc
  clone_or_pull_repo git@github.mit.edu:ocw-content-rc/$OCW_TEST_COURSE.git private/$OCW_TEST_COURSE
  COURSE_CONTENT_PATH=$THEMES_PATH/private/$OCW_TEST_COURSE
  echo $COURSE_CONTENT_PATH
else
  # Trim any trailing slashes from the course content path
  COURSE_CONTENT_PATH=$(echo $COURSE_CONTENT_PATH | sed 's:/*$::')
  # Append the test course slug
  COURSE_CONTENT_PATH=$COURSE_CONTENT_PATH/$OCW_TEST_COURSE
fi

cd $COURSE_CONTENT_PATH
# Run hugo server
hugo server \
  -p 3000 \
  --bind 0.0.0.0 \
  --config $COURSE_HUGO_CONFIG_PATH \
  --themesDir $THEMES_PATH \
  --renderToDisk
