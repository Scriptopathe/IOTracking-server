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

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SCRIPTS=${DIR}/scripts
RUN_SCRIPT=${SCRIPTS}/run.sh
INIT_SCRIPT=${SCRIPTS}/iot-tracking.sh
TEMP_SCRIPT=${SCRIPTS}/iot-tracking.temp.sh
DEST_SCRIPT=/etc/init.d/iot-tracking

echo "SETUP ENVIRONMENT"
chmod u+x scripts/setup-env.sh
bash scripts/setup-env.sh

echo "SETUP CONFIG"
chmod scripts/setup-config.py
python scripts/setup-config.py

echo "SETUP NPM"
npm install

echo "INSTALL"
cp $INIT_SCRIPT $TEMP_SCRIPT
sed -i -e "s#@path@#${RUN_SCRIPT}#g" $TEMP_SCRIPT
mv $TEMP_SCRIPT $DEST_SCRIPT
update-rc.d iot-tracking defaults