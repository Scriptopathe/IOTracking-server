#!/bin/bash

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SCRIPTS=${DIR}
RUN_SCRIPT=/usr/bin/node
RUN_ARGS=${DIR}/../server.js
INIT_SCRIPT=${SCRIPTS}/iot-tracking.sh
TEMP_SCRIPT=${SCRIPTS}/iot-tracking.temp.sh
DEST_SCRIPT=/etc/systemd/system/iot-tracking.service
#DEST_SCRIPT=/etc/init.d/iot-tracking

echo "INSTALL"
cp $INIT_SCRIPT $TEMP_SCRIPT
sed -i -e "s#@path@#${RUN_SCRIPT}#g" $TEMP_SCRIPT
sed -i -e "s#@args@#${RUN_ARGS}#g" $TEMP_SCRIPT
mv $TEMP_SCRIPT $DEST_SCRIPT
chmod u+x $DEST_SCRIPT

systemctl enable iot-tracking.service
#update-rc.d iot-tracking remove
#update-rc.d iot-tracking defaults
