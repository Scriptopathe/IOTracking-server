#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd ${DIR}/../site/IoTracking-Client/
git submodule init
git submodule update
git checkout master
git pull origin master
npm install

python ${DIR}/setup-client-config.py
ng build --env=custom