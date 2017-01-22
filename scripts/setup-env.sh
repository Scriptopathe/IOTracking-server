#!/bin/bash
# Run as sudo

echo "Installing node, mongodb, python"
apt-get install npm nodejs nodejs-legacy mongodb python -y

echo "Installing node packages"
npm install -g typescript
npm install -g tsd
npm install -g node-dev 
npm install -g ts-node

echo "Installing mosquitto"
wget http://repo.mosquitto.org/debian/mosquitto-repo.gpg.key
apt-key add mosquitto-repo.gpg.key

cd /etc/apt/sources.list.d/
wget http://repo.mosquitto.org/debian/mosquitto-wheezy.list
apt-get update
apt-get install mosquitto -y
apt-get install mosquitto mosquitto-clients -y