import sys
import io
import uuid
import config_parser
import os


DIR = os.path.dirname(os.path.realpath(__file__)) + "/../"

print "---- setup-config.py"
print "Generating config.ts..."

templatePath = DIR+"scripts/config.template.ts"
configPath = DIR+"config.ts"

config = config_parser.parse_config()

prodPort = config["LISTEN_PORT"]
mqtt = config["LORA_BROKER"]
loraserver = config["LORA_API"]

print "* LoRaWAN mqtt server   : " + mqtt
print "* Server port           : " + str(prodPort)
secret = str(uuid.uuid1())

templateFile = open(templatePath, "r")
template = templateFile.read()
templateFile.close()

value = template.replace("$secret$",  secret.replace("\"", "\\\""))
value = value.replace("$port$",  str(prodPort))
value = value.replace("$mqtt$",  mqtt)
value = value.replace("$loraserver$", loraserver)

configFIle = open(configPath, "w+")
configFIle.write(value)
configFIle.close()

print "Note : You can change the private key by editing jwtSecret in config.ts."

print "---- end of setup-config.py"