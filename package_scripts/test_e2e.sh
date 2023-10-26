#!/bin/bash

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RESET='\033[0m'

if [[ "$NODE_ENV" == "development" && "$PLAYWRIGHT_BASE_URL" == "" ]]; then
    # Check if the webpack server is responsive
    if ! nc -z -w 10 "$WEBPACK_HOST" "$WEBPACK_PORT"; then
        echo -e "${YELLOW}Webpack server at $WEBPACK_HOST:$WEBPACK_PORT is not responsive."
        echo -e "Run webpack server in the background for faster start-up times."
        echo -e "\n\t yarn webpack:serve \n${RESET}"

        echo "Building webpack..."
        if ! yarn build:webpack:dev; then
            echo -e "\n${RED}Command 'yarn build:webpack:dev' failed. Exiting...${RESET}\n"
            exit 1
        fi
    else
        echo -e "${GREEN}Found Webpack server at $WEBPACK_HOST:$WEBPACK_PORT, skipping manual build.${RESET}"
    fi
fi

playwright test $@
