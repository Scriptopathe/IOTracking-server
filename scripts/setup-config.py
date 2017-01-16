import sys
import io
import uuid

print "---- setup-config.py"
print "Generating config.ts..."
templatePath = "scripts/config.template.ts"
configPath = "config.ts"
prodPort = 8000

print "Generating private key..."
secret = str(uuid.uuid1())

templateFile = open(templatePath, "r")
template = templateFile.read()
templateFile.close()

value = template.replace("$secret$",  secret.replace("\"", "\\\""))
value = template.replace("$port$",  prodPort)

configFIle = open(configPath, "w+")
configFIle.write(value)
configFIle.close()

print "config.ts overwritten."
print "You can change the private key by editing jwtSecret in config.ts."

print "---- end of setup-config.py"