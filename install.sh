#!/bin/bash

# This script makes the following things
#       - install system packages (setup environment)
#       - setup config files
#       - npm install
#       - install script and registers to update-rc.d

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi

function safe_exec {
    "$@"
    local status=$?
    if [ $status -ne 0 ]; then
        echo "error with $1" >&2$
        exit 1
    fi
    return $status
}

echo "SETUP ENVIRONMENT"
chmod u+x scripts/iot-tracking.sh
chmod u+x scripts/setup-env.sh
safe_exec bash scripts/setup-env.sh

echo "SETUP CONFIG"
chmod u+x scripts/setup-config.py
safe_exec python scripts/setup-config.py

echo "SETUP NPM"
safe_exec npm install

echo "COMPILE"
safe_exec tsc -p tsconfig.json

echo "INSTALL SERVICE"
chmod u+x scripts/install-service.sh
safe_exec bash scripts/install-service.sh

echo "INSTALL CLIENT"
chmod u+x scripts/install-client.sh
safe_exec bash scripts/install-client.sh