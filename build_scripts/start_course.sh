#!/bin/bash

set -euo pipefail
ENV_FILE=.env

if test -f "$ENV_FILE"; then
  export $(cat .env | xargs)
fi

if [[ -z "${OCW_TEST_COURSE}" ]]; then
  echo "OCW_TEST_COURSE not set"
else
  mkdir -p private
  rm -f private/test_course.json
  echo "{\"courses\":[\"${OCW_TEST_COURSE}\"]}" | tee private/test_course.json
  /bin/bash build_scripts/import_courses.sh  private/test_course.json
  cp example.go.mod private/ocw-to-hugo-output/$OCW_TEST_COURSE/go.mod
  cp example.config.toml private/ocw-to-hugo-output/$OCW_TEST_COURSE/config/_default/config.toml
  cd private/ocw-to-hugo-output/$OCW_TEST_COURSE
  hugo mod get -u
  hugo server -p 3000 --bind 0.0.0.0 --renderToDisk
fi