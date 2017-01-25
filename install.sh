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

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source ${DIR}/scripts/safe_exec.sh

echo "SETUP ENVIRONMENT"
chmod u+x scripts/iot-tracking.sh
chmod u+x scripts/setup-env.sh
safe_exec bash scripts/setup-env.sh

echo "RUN UPDATE"
chmod u+x scripts/update.sh
safe_exec bash scripts/update.sh