#!/bin/bash

set -euo pipefail

if test -f ".env"; then
  export $(cat .env | xargs)
fi

# If the VERBOSE variable isn't set, default it to 0
if [[ -z "${VERBOSE+x}" ]]; then
  VERBOSE=0
fi

if [[ -z $OCW_TO_HUGO_OUTPUT_DIR ]]; then
  if [[ $VERBOSE == 1 ]]; then
    echo "OCW_TO_HUGO_OUTPUT_DIR not set"
  fi
  exit 1
elif [[ -z $COURSE_OUTPUT_DIR ]]; then
  if [[ $VERBOSE == 1 ]]; then
    echo "COURSE_OUTPUT_DIR not set"
  fi
  exit 1
elif [[ -z $COURSE_BASE_URL ]]; then
  if [[ $VERBOSE == 1 ]]; then
    echo "COURSE_BASE_URL not set"
  fi
  exit 1
fi

THEME_DIR=$(pwd)

# Trim any trailing slashes from path variables
OCW_TO_HUGO_OUTPUT_DIR=$(echo $OCW_TO_HUGO_OUTPUT_DIR | sed 's:/*$::')
COURSE_OUTPUT_DIR=$(echo $COURSE_OUTPUT_DIR | sed 's:/*$::')
COURSE_BASE_URL=$(echo $COURSE_BASE_URL | sed 's:/*$::')

# Run hugo on all courses
echo "Running hugo on courses in $OCW_TO_HUGO_OUTPUT_DIR..."
for COURSE_DIR in $OCW_TO_HUGO_OUTPUT_DIR/*; do
  if [[ -d $COURSE_DIR ]]; then
    cd $COURSE_DIR
    COURSE_ID=${COURSE_DIR#"$OCW_TO_HUGO_OUTPUT_DIR/"}
    HUGO_COMMAND="hugo --themesDir $THEME_DIR --destination $COURSE_OUTPUT_DIR/$COURSE_ID/"
    if [[ -n $COURSE_BASE_URL ]]; then
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
