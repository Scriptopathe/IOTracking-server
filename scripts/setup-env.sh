#!/bin/bash
# Run as sudo
function safe_exec {
    "$@"
    local status=$?
    if [ $status -ne 0 ]; then
        echo "error with $1" >&2$
        exit 1
    fi
    return $status
}

echo "Installing node, mongodb, python"
safe_exec apt-get install npm nodejs nodejs-legacy mongodb python -y

echo "Installing node packages"
safe_exec npm install -g typescript tsd node-dev ts-node

echo "Installing mosquitto"
wget http://repo.mosquitto.org/debian/mosquitto-repo.gpg.key
apt-key add mosquitto-repo.gpg.key

cd /etc/apt/sources.list.d/
wget http://repo.mosquitto.org/debian/mosquitto-wheezy.list

safe_exec apt-get update
safe_exec apt-get install mosquitto -y
safe_exec apt-get install mosquitto mosquitto-clients -y