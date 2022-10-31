#!/bin/bash

clone_or_pull_repo() {
  THEMES_PATH=$(pwd)
  if [[ $# -lt 2 ]]; then
    echo "Usage: clone_or_pull_repo REPO_URL REPO_PATH"
  else
    REPO_URL=$1
    REPO_PATH=$2
    if [[ ! -d $REPO_PATH ]]; then
      git clone $REPO_URL $REPO_PATH
    else
      cd $REPO_PATH
      git pull
      cd $THEMES_PATH
    fi
  fi
}
