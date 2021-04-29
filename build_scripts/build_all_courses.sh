#!/bin/bash

set -euo pipefail

if test -f ".env"; then
  export $(cat .env | xargs)
fi

if [[ -z $OCW_TO_HUGO_OUTPUT_DIR ]]; then
  echo "OCW_TO_HUGO_OUTPUT_DIR not set"
  exit 1
elif [[ -z $COURSE_OUTPUT_DIR ]]; then
  echo "COURSE_OUTPUT_DIR not set"
  exit 1
elif [[ -z $COURSE_BASE_URL ]]; then
  echo "COURSE_BASE_URL not set"
  exit 1
fi

echo "Preparing course theme..."
# Make a tmp dir for staging and create boilerplate
THEME_DIR=$(pwd)
TMP_DIR=$(mktemp -d -t ocw-course-XXXXXXXXXX)
cd $TMP_DIR
mkdir data
cp $THEME_DIR/example_configs/example.course.config.toml config.toml
touch go.mod
printf "module github.com/mitodl/ocw-course\n\n" >> go.mod
printf "go 1.16\n\n" >> go.mod
printf "replace github.com/mitodl/ocw-hugo-themes/base-theme => $THEME_DIR/base-theme\n\n" >> go.mod
printf "replace github.com/mitodl/ocw-hugo-themes/course => $THEME_DIR/course\n\n" >> go.mod
hugo mod get -u
# Trim any trailing slashes from path variables
OCW_TO_HUGO_OUTPUT_DIR=$(echo $OCW_TO_HUGO_OUTPUT_DIR | sed 's:/*$::')
COURSE_OUTPUT_DIR=$(echo $COURSE_OUTPUT_DIR | sed 's:/*$::')
COURSE_BASE_URL=$(echo $COURSE_BASE_URL | sed 's:/*$::')
# Run hugo on all courses
echo "Running hugo on courses in $OCW_TO_HUGO_OUTPUT_DIR..."
for COURSE in $OCW_TO_HUGO_OUTPUT_DIR/*; do
  if [[ -d $COURSE ]]; then
    COURSE_ID=${COURSE#"$OCW_TO_HUGO_OUTPUT_DIR/"}
    cp $COURSE/data/course.json $TMP_DIR/data/course.json
    HUGO_COMMAND="hugo --config config.toml --configDir $COURSE/config --contentDir $COURSE/content -d $COURSE_OUTPUT_DIR/$COURSE_ID/"
    if [[ -n $COURSE_BASE_URL ]]; then
      HUGO_COMMAND="$HUGO_COMMAND --baseUrl $COURSE_BASE_URL/$COURSE_ID/"
    fi
    if [[ $VERBOSE -ne 1 ]]; then
      HUGO_COMMAND="$HUGO_COMMAND --quiet"
    else
      echo "Rendering Hugo site for $COURSE_ID..."
    fi
    eval $HUGO_COMMAND
  fi
done
# Remove the tmp dir
rm -rf $TMP_DIR
