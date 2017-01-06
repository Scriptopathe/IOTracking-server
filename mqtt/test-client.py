import paho.mqtt.client as mqtt
import datetime
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
    "data": "%d;%d;%d"
}"""


def makePayload(devId, time, x, y, batteryLevel):
    return message%(devId, time.isoformat(), x, y, batteryLevel)



payload = makePayload(
    "4d5d55f6-c797-48c6-8f3e-2610e4cc72f7",
    datetime.datetime.now(),
    214, 325, 52
)

client = mqtt.Client()
client.connect("localhost")
client.publish("application/lulz", payload)
client.loop(2)
print(payload)