#!/bin/sh

# This script makes the following things
#       - install system packages (setup environment)
#       - setup config files
#       - npm install
#       - install script and registers to update-rc.d

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi

echo "SETUP ENVIRONMENT"
chmod u+x scripts/setup-env.sh
bash scripts/setup-env.sh

echo "SETUP CONFIG"
chmod u+x scripts/setup-config.py
python scripts/setup-config.py

echo "SETUP NPM"
npm install

echo "COMPILE"
tsc -p server.js

echo "INSTALL"
bash scripts/install-service.sh
