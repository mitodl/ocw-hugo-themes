#!/bin/bash

set -euo pipefail

if [[ -z "${OCW_TO_HUGO_PATH}" ]]; then
  OCW_TO_HUGO_PATH="node_modules/@mitodl/ocw-to-hugo"
fi
mkdir -p private/ocw-to-hugo-input
mkdir -p private/ocw-to-hugo-output
node $OCW_TO_HUGO_PATH -i private/ocw-to-hugo-input -o private/ocw-to-hugo-output --download --courses $1
