import os

def parse_config():
    config = {}
    DIR = os.path.dirname(os.path.realpath(__file__))
    PATH = DIR + "/../CONFIG.ini"
    OPTIONS = [
        "LISTEN_PORT", 
        "LORA_API",
        "LORA_BROKER",
        "SERVER_ROUTABLE_IP",
        "LORASERVER_ROUTABLE_IP"
    ]

    if not os.path.exists(PATH):
        print "**** NO CONFIG.INI FILE FOUND ****"
        print "**** See CONFIG.EXAMPLE.ini for details ****"
        return None
    
    f = open(PATH, "r")
    lines = f.readlines()
    f.close()

    optcount = 0
    for line in lines:
        # Comments
        if line.strip().startswith("#"):
            continue
        
        # Sections
        if not "=" in line:
            continue
        
        parts = line.split("=")
        key = parts[0].strip()
        value = parts[1].strip()
        
        if not key in OPTIONS:
            print "**** ERROR : invalid config parameter : " + key
            print "Valid values are : " + ",".join(OPTIONS)
            return None
        
        config[key] = value
        optcount += 1
    
    if optcount != len(OPTIONS):
        print "**** ERROR : invalid number of options in CONFIG.INI."
        print "**** All of the following options must be specified :"
        print ",".join(OPTIONS)
        return None

    return config
