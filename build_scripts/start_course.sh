#!/bin/bash

set -euo pipefail

if test -f ".env"; then
  export $(cat .env | xargs)
else
  echo ".env file not found"
  exit 1
fi

if [[ -z "${OCW_TEST_COURSE}" ]]; then
  echo "OCW_TEST_COURSE not set"
  exit 1
else
  mkdir -p private
  rm -f private/test_course.json
  echo "{\"courses\":[\"${OCW_TEST_COURSE}\"]}" | tee private/test_course.json
  /bin/bash build_scripts/import_courses.sh  private/test_course.json
  cp example_configs/example.course.go.mod private/ocw-to-hugo-output/$OCW_TEST_COURSE/go.mod
  cp example_configs/example.course.config.toml private/ocw-to-hugo-output/$OCW_TEST_COURSE/config/_default/config.toml
  cd private/ocw-to-hugo-output/$OCW_TEST_COURSE
  hugo mod get -u
  hugo server -p 3000 --bind 0.0.0.0 --renderToDisk
fi