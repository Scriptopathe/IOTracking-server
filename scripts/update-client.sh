#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source ${DIR}/safe_exec.sh

cd ${DIR}/../site/IoTracking-Client/
safe_exec git submodule init
safe_exec git submodule update
safe_exec git checkout master
safe_exec git pull origin master
safe_exec npm install

safe_exec python ${DIR}/setup-client-config.py
ng build --env=custom