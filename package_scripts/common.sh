#!/bin/bash

# test for `.env` file and export all env vars in it if found
# 
# pass --require-dot-env to error if the file is not present
#
# note that you *must* `set -euo pipefail` in scripts that call this function!
load_env () {
    if test -f ".env"; then
        export $(cat .env | grep -v '#' | xargs)
    else
        # .env not found, check if we're requiring its presence
        if [[ "$1" ]]; then
            if [[ "$1" == "--require-dot-env" ]]; then
                echo ".env file not found"
                return 1
            else
                echo "unrecognized argument: $1"
                echo "pass --require-dot-env to error if .env file not present"
                return 1
            fi
        fi
    fi
}
