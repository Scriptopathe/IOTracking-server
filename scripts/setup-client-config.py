import sys
#!/usr/bin/python

import io
import uuid
import os
import config_parser
import sys
DIR = os.path.dirname(os.path.realpath(__file__)) + "/../"

print "---- setup-client-config.py"
print "Generating environment.custom.ts..."

templatePath = DIR + "scripts/client-config.template.ts"
configPath = DIR + "site/IoTracking-Client/src/environments/environment.custom.ts"

config = config_parser.parse_config()

if config == None:
    sys.exit(1)

loraserver = config["LORASERVER_ROUTABLE_IP"]
server = config["SERVER_ROUTABLE_IP"]

templateFile = open(templatePath, "r")
template = templateFile.read()
templateFile.close()

value = template.replace("@loraserver@",  loraserver)
value = value.replace("@server@",  server)

configFIle = open(configPath, "w+")
configFIle.write(value)
configFIle.close()

print "---- end of setup-client-config.py"