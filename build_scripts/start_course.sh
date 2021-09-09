#!/bin/bash

set -euo pipefail

source build_scripts/common.sh
load_env --require-dot-env

# If the DOWNLOAD variable isn't set, default it to 1
if [[ -z "${DOWNLOAD+x}" ]]; then
  DOWNLOAD=1
fi

if [[ -z "${OCW_TEST_COURSE}" ]]; then
  echo "OCW_TEST_COURSE not set"
  exit 1
else
  rm -rf private/ocw-to-hugo-output/$OCW_TEST_COURSE
  mkdir -p private
  rm -f private/test_course.json
  if [[ $DOWNLOAD == 1 ]]; then
    echo "{\"courses\":[\"${OCW_TEST_COURSE}\"]}" | tee private/test_course.json
    /bin/bash build_scripts/import_courses.sh  private/test_course.json
  else
    rm -rf private/ocw-to-hugo-output/$OCW_TEST_COURSE
    cp -r $OCW_TO_HUGO_OUTPUT_DIR/$OCW_TEST_COURSE private/ocw-to-hugo-output/
  fi
  cp example_configs/example.course.go.mod private/ocw-to-hugo-output/$OCW_TEST_COURSE/go.mod
  cp example_configs/example.course.config.toml private/ocw-to-hugo-output/$OCW_TEST_COURSE/config/_default/config.toml
  mkdir -p private/ocw-to-hugo-output/$OCW_TEST_COURSE/static/pdfjs
  cp -r www/static/pdfjs/* private/ocw-to-hugo-output/$OCW_TEST_COURSE/static/pdfjs
  cd private/ocw-to-hugo-output/$OCW_TEST_COURSE
  hugo mod get -u
  hugo server -p 3000 --bind 0.0.0.0 --renderToDisk
fi
