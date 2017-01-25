#!/bin/bash

# This script makes the following things
#       - setup config files
#       - npm install
#       - install script and registers to update-rc.d

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source ${DIR}/safe_exec.sh

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
chmod u+x scripts/update-client.sh
safe_exec bash scripts/update-client.sh