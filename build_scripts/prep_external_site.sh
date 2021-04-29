#!/bin/bash

set -euo pipefail

if test -f ".env"; then
  export $(cat .env | xargs)
fi

if [[ -z "${EXTERNAL_SITE_PATH}" ]]; then
  echo "EXTERNAL_SITE_PATH not set"
  exit 1
else
  THEME_DIR=$(pwd)
  cd $EXTERNAL_SITE_PATH
  if test -f "go.mod"; then
    mv go.mod go.mod.bak
  fi
  touch go.mod
  printf "module github.com/mitodl/ocw-www\n\n" >> go.mod
  printf "go 1.16\n\n" >> go.mod
  printf "replace github.com/mitodl/ocw-hugo-themes/base-theme => $THEME_DIR/base-theme\n\n" >> go.mod
  printf "replace github.com/mitodl/ocw-hugo-themes/www => $THEME_DIR/www\n\n" >> go.mod
  printf "replace github.com/mitodl/ocw-hugo-themes/course => $THEME_DIR/course\n\n" >> go.mod
  hugo mod clean
  hugo mod get -u
fi
