import sys
import io
import uuid

print "---- setup-config.py"
print "Generating config.ts..."

templatePath = "scripts/config.template.ts"
configPath = "config.ts"

mqtt = "mqtt://127.0.0.1"
prodPort = 3001

print "* LoRaWAN mqtt server   : " + mqtt
print "* Server port           : " + str(prodPort)
secret = str(uuid.uuid1())

templateFile = open(templatePath, "r")
template = templateFile.read()
templateFile.close()

value = template.replace("$secret$",  secret.replace("\"", "\\\""))
value = value.replace("$port$",  str(prodPort))
value = value.replace("$mqtt$",  mqtt)

configFIle = open(configPath, "w+")
configFIle.write(value)
configFIle.close()

print "Note : You can change the private key by editing jwtSecret in config.ts."

print "---- end of setup-config.py"