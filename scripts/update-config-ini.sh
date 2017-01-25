#!/bin/bash

# Execute this script after modification of CONFIG.ini

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
python ${DIR}/setup-config.py
bash ${DIR}/update-client.sh