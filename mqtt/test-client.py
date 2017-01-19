import paho.mqtt.client as mqtt
import datetime
import base64
import time
import struct
import httplib
import random

message = """{
    "devEUI": "%s",
    "rxInfo": [
        {
            "mac": "0303030303030303",
            "time": "%s",
            "rssi": -57,
            "loRaSNR": 10
        }
    ],
    "data": "%s"
}"""

def getDevices():
    serverUrl = "127.0.0.1:3001"
    deviceListUrl = "/api/state/live/devices"

    conn = httplib.HTTPConnection(serverUrl)
    conn.request("GET", deviceListUrl)
    r1 = conn.getresponse()
    return r1.read().split(';')

def makePayload(devId, time, x, y, batteryLevel):
    data = (x & 0x03FF) | ((y & 0x3FF) << 10) | ((batteryLevel & 0xF) << 20)
    packed = struct.pack("1I", data)
    encoded = base64.b64encode(packed)
    return message%(devId, time.isoformat(), encoded)

devices = getDevices()

client = mqtt.Client()
client.connect("localhost")
trajs = [{"x" : 0, "y" : 0} for i in range(0, len(devices))]
dev = 0
while(True):
    trajs[dev]["x"] += 1 + random.randint(0, 3)
    trajs[dev]["y"] += 1 + random.randint(0, 3)
    trajs[dev]["x"] %= 1023
    trajs[dev]["y"] %= 1023
    
    x = trajs[dev]["x"]
    y = trajs[dev]["y"]
    
    dev += 1
    dev %= len(devices)
    payload = makePayload(
        devices[dev],
        datetime.datetime.now(),
        x, y, dev
    )

    client.publish("gateway/dijqiodjiosq", payload)
    client.loop(100)
    time.sleep(0.1)
    print "Sent message with data : ", x, y, dev