#!/bin/bash

set -euo pipefail
ENV_FILE=.env

if test -f "$ENV_FILE"; then
  export $(cat .env | xargs)
fi

# Copy config.toml into place
# cp example.config.toml "$EXTERNAL_SITE_PATH/config.toml"
# Write a go.mod file in the target folder, pointing it here
# rm -f "$EXTERNAL_SITE_PATH/go.mod"
# printf "module github.com/mitodl/ocw-website\n\ngo 1.16\n\nreplace github.com/mitodl/ocw-hugo-theme => $PWD\n\n" >> "$EXTERNAL_SITE_PATH/go.mod"
cd $EXTERNAL_SITE_PATH
hugo mod get -u
