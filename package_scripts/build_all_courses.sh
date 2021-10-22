#!/bin/bash

set -euo pipefail

source package_scripts/common.sh
load_env

# If the VERBOSE variable isn't set, default it to 0
if [[ -z "${VERBOSE+x}" ]]; then
  VERBOSE=0
fi

# Set THEMES_PATH
THEMES_PATH=$(pwd)

# Check required env variables
if [[ -z $WWW_CONTENT_PATH ]]; then
  if [[ $VERBOSE == 1 ]]; then
    echo "WWW_CONTENT_PATH not set"
  fi
  exit 1
fi
if [[ -z $COURSE_CONTENT_PATH ]]; then
  if [[ $VERBOSE == 1 ]]; then
    echo "COURSE_CONTENT_PATH not set"
  fi
  exit 1
fi
if [[ -z $COURSE_HUGO_CONFIG_PATH ]]; then
  if [[ $VERBOSE == 1 ]]; then
    echo "COURSE_HUGO_CONFIG_PATH not set"
  fi
  exit 1
fi

# Trim any trailing slashes from path env variables
WWW_CONTENT_PATH=$(echo $WWW_CONTENT_PATH | sed 's:/*$::')
COURSE_CONTENT_PATH=$(echo $COURSE_CONTENT_PATH | sed 's:/*$::')

# Run hugo on all courses
echo "Running hugo on courses in $COURSE_CONTENT_PATH..."
for COURSE in $COURSE_CONTENT_PATH/*; do
  if [[ -d $COURSE ]]; then
    COURSE_ID=${COURSE#"$COURSE_CONTENT_PATH/"}
    COURSE_OUTPUT_DIR=$WWW_CONTENT_PATH/public/courses/$COURSE_ID
    cd $COURSE
    HUGO_COMMAND="hugo --config $COURSE_HUGO_CONFIG_PATH --themesDir $THEMES_PATH -d $COURSE_OUTPUT_DIR"
    if [[ -n $COURSE_BASE_URL ]]; then
      # Trim trailing slashes from COURSE_BASE_URL and pass it to Hugo
      COURSE_BASE_URL=$(echo $COURSE_BASE_URL | sed 's:/*$::')
      HUGO_COMMAND="$HUGO_COMMAND --baseUrl $COURSE_BASE_URL/$COURSE_ID/"
    fi
    if [[ $VERBOSE != 1 ]]; then
      HUGO_COMMAND="$HUGO_COMMAND --quiet"
    elif [[ $VERBOSE == 1 ]]; then
      echo "Rendering Hugo site for $COURSE_ID..."
    fi
    eval $HUGO_COMMAND
  fi
done
