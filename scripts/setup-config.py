import sys
import io
import uuid

print "---- setup-config.py"
print "Generating config.ts..."

templatePath = "scripts/config.template.ts"
configPath = "config.ts"

configs = {
    # loraserver, mqtt, port
    "production" : ["https://127.0.0.1:8080", "mqtt://127.0.0.1:11883", 3001],
    "test" : ["https://127.0.0.1:8080", "mqtt://127.0.0.1", 3001]
}

loraserver, mqtt, prodPort = configs["production"]

# Choose configuration
if len(sys.argv) > 1 and (sys.argv[1] in configs):
    loraserver, mqtt, prodPort = configs[sys.argv[1]] 
    print "* Use configuration : " + sys.argv[1]
else:
    print "* Use configuration : production"

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