#!/bin/bash

# Execute this script after modification of CONFIG.ini

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source ${DIR}/safe_exec.sh

safe_exec python ${DIR}/setup-config.py

safe_exec bash ${DIR}/update-client.sh