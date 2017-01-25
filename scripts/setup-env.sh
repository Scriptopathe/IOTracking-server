#!/bin/bash
# Run as sudo

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source ${DIR}/safe_exec.sh

echo "Installing node, mongodb, python"
safe_exec apt-get install npm nodejs nodejs-legacy mongodb python -y

echo "Installing node packages"
safe_exec npm install -g typescript tsd node-dev ts-node

echo "Installing mosquitto"
safe_exec wget http://repo.mosquitto.org/debian/mosquitto-repo.gpg.key
safe_exec apt-key add mosquitto-repo.gpg.key

cd /etc/apt/sources.list.d/
safe_exec wget http://repo.mosquitto.org/debian/mosquitto-wheezy.list

safe_exec apt-get update
safe_exec apt-get install mosquitto -y
safe_exec apt-get install mosquitto mosquitto-clients -y