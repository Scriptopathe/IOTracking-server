#!/bin/bash
# Run as sudo

apt-get install node
apt-get install mongodb
apt-get install nodejs

npm install -g typescript
npm install -g tsd
npm install -g node-dev 
npm install -g ts-node

wget http://repo.mosquitto.org/debian/mosquitto-repo.gpg.key
apt-key add mosquitto-repo.gpg.key
cd /etc/apt/sources.list.d/
wget http://repo.mosquitto.org/debian/mosquitto-wheezy.list
apt-get update
apt-get install mosquitto
apt-get install mosquitto mosquitto-clients python-mosquitto