import paho.mqtt.client as mqtt
import datetime
import base64
import time
import struct
import httplib
import random

message = """{
    "devEUI": "%s",
    "time": "%s",
    "rssi": -57,
    "rxInfo": [
        {
            "mac": "0303030303030303",
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
    packed = struct.pack("BBB", data & 0xFF, (data >> 8) & 0xFF, (data >> 16) & 0xFF)
    encoded = base64.b64encode(packed)
    return message%(devId, time.isoformat(), encoded)

devices = getDevices()

client = mqtt.Client()
client.connect("localhost")
trajs = [{"x" : 500, "y" : 500} for i in range(0, len(devices))]
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
        x, y, dev+1
    )

    client.publish("application/dijqiodjiosq", payload)
    print "Sent message with data : ", x, y, dev
    client.loop(100)
    time.sleep(3)