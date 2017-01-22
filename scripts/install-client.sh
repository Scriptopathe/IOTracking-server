DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd ${DIR}/../site/IoTracking-Client/
git submodule init
git submodule update
npm install
ng build