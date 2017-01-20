import * as mqtt                from 'mqtt'
import * as config              from '../config'
import { db }                   from '../middlewares/database'
import { Regatta }              from '../models/regata'
import { RaceModel }            from '../models/race'
import { RaceData }             from '../models/race-data'
import { Racer }                      from '../models/racer'
import { Device }                     from '../models/device'
import { LiveState }                  from '../models/live-state'
import { TimePoint }                  from '../models/schema/property'
import { ApplicationMessage, 
         MessageContent }             from './mqtt-server-types'
import { ParsingStrategy }            from './parsing-strategy'
import { ApplicationParsingStrategy } from './application-strategy'
import { GatewayParsingStrategy }     from './gateway-strategy'

export class MQTTServer
{
  client : mqtt.Client
  remoteServer : string
  constructor() {
    this.remoteServer = config.loraMqttBrokerUrl
    this.client  = mqtt.connect(this.remoteServer)
  }

  printBytes(base64encoded : string) {
    let decoded = new Buffer(base64encoded, "base64")
    var byteNumbers = new Array(decoded.length);
    for (var i = 0; i < decoded.length; i++) {
      byteNumbers[i] = decoded.readUInt8(i)
      let char = String.fromCharCode(byteNumbers[i])
      console.log("byte[" + i + "] = " + byteNumbers[i] + "(" + char + ")")
    }
  }

  /**
   * Process message.
   */
  processMessage(message : ApplicationMessage) {
    if(!message) return
    let messageContent = message.content
    let t : number = new Date(message.time).getTime() / 1000.0
    let x : number = messageContent.x
    let y : number = messageContent.y

    LiveState.findAndWrap(db.get(LiveState.collectionName), {}, 
      (col, model) => new LiveState(db, <any>model),
      (objs : LiveState[]) => {
        if(objs.length == 0) {
          console.error("Ignore lora message: no live race.")
          return
        }
        var liveState : LiveState = objs[0]
        let regataId : string = <string>liveState.liveRegata
        let raceId : number = liveState.liveRaceId

        Regatta.findAndWrap(db.get(Regatta.collectionName), { "_id" : regataId }, 
          (col, model) => new Regatta(db, <any>model),
          (objs : Regatta[]) => {
            // If no regatta, abort
            if(objs.length == 0) {
              console.error("Ignore lora message: no such regatta " + regataId)
              return
            }

            // Find regatta racedata
            var race : RaceModel = objs[0].races[raceId]
            var concurrentsDevices : string[] = race.concurrents.map((racer) => String(racer.device) )

            RaceData.findAndWrap(db.get(RaceData.collectionName), { "_id" : race.data },
              (col, model) => new RaceData(db, <any>model),
              (objs : RaceData[]) => {
                if(objs.length == 0) {
                  console.error("Ignore lora message: no such race data instance " + race.data)
                  return
                }
                var raceData : RaceData = objs[0]
                
                // Find the corresponding device
                Device.findAndWrap(db.get(Device.collectionName), { "hwid" : message.devEUI },
                  (col, model) => new Device(db, <any>model),
                  (objs : Device[]) => {
                    if(objs.length == 0) {
                      console.error("Ignore lora message: no such device " + message.devEUI)
                      return
                    }
                    var device : Device = objs[0]
                    let deviceId = String(device.identifier)

                    device.batteryLevel = messageContent.batteryLevel
                    device.lastActivity = new Date(messageContent.time)

                    var data = {
                      x: x, y: y, t: t
                    }

                    // Checks that the device is in the race.
                    if(concurrentsDevices.indexOf(deviceId) < 0) {
                      console.error("Device " + device.name + " not in race ")
                      return
                    }

                    // Create the array if it does no exists.
                    if(raceData.rawData[deviceId] == null) {
                      raceData.rawData[deviceId] = []
                    }

                    // Pushes the data !
                    raceData.rawData[<string>device.identifier].push(data)

                    device.saveAndCheck()
                    raceData.save()
                    console.log("Message processed successfully")
                  }
                )
              }
            )
          }
        )
      }
    )
  }


  start() {
    console.log("[MQTT client] connected to " + this.remoteServer)

    var self = this
    this.client.on('connect', function () {
      console.log("[MQTT client] subscribe to " + config.loraTopic)
      self.client.subscribe(config.loraTopic)
    })
    
    var strategy : ParsingStrategy
    
    // Auto config
    if(config.loraTopic.indexOf("gateway") >= 0) { 
      console.log("[MQTT Client] Using GatewayParsingStrategy")
      strategy = new GatewayParsingStrategy()
    }
    else {
      console.log("[MQTT Client] Using ApplicationParsingStrategy")
      strategy = new ApplicationParsingStrategy()
    }

    this.client.on('message', function (topic : string, messageBuffer : Buffer) {
      //console.log("Received message ! ")
      var message = messageBuffer.toString()
      console.log("topic: " + topic + " | " + message)
      
      var lulz = JSON.parse(message)
      if(lulz.data) {
        // to, from, id, flag == tx header
        self.printBytes(lulz.data)
      }

      let parsedMessage = strategy.parse(message)
      console.log("Parsed : " + JSON.stringify(parsedMessage))
      self.processMessage(parsedMessage)
    })
  }
}

/*
{
    "devEUI": "0202020202020202",  // device EUI
    "rxInfo": [
        {
            "mac": "0303030303030303",                 // MAC of the receiving gateway
            "time": "2016-11-25T16:24:37.295915988Z",  // time when the package was received (GPS time of gateway, only set when available)
            "rssi": -57,                               // signal strength (dBm)
            "loRaSNR": 10                              // signal to noise ratio
        }
    ],
    "txInfo": {
        "frequency": 868100000,    // frequency used for transmission
        "dataRate": {
            "modulation": "LORA",  // modulation (LORA or FSK)
            "bandwidth": 250,      // used bandwidth
            "spreadFactor": 5      // used SF (LORA)
            // "bitrate": 50000    // used bitrate (FSK)
        },
        "adr": false,
        "codeRate": "4/6"
    },
    "fCnt": 10,                    // frame-counter
    "fPort": 5,                    // FPort
    "data": "..."                  // base64 encoded payload (decrypted)
}

*/