import * as mqtt            from 'mqtt'
import * as config          from '../config'
import { db }               from '../middlewares/database'
import { Regatta }          from '../models/regata'
import { RaceModel }        from '../models/race'
import { RaceData }         from '../models/race-data'
import { Racer }            from '../models/racer'
import { Device }           from '../models/device'
import { LiveState }        from '../models/live-state'
import { TimePoint }        from '../models/schema/property'

interface MessageContent {
  x : number            // range 0-1024
  y : number            // range 0-1024
  batteryLevel : number // range 0-100
}
interface LoraRXInfo {
  mac: string
  time : string
  rssi : number
  loRaSNR: number
}

interface LoraRXMessage {
  // id of the device
  devEUI : string
  // rx info from gateways
  rxInfo : LoraRXInfo[]
  // base64 encoded data
  data : string 
}

var TOPIC = "gateway/#"

export class MQTTServer
{
  client : mqtt.Client
  remoteServer : string
  constructor() {
    this.remoteServer = config.loraMqttBrokerUrl
    this.client  = mqtt.connect(this.remoteServer)
  }

  decodeb64(msg : string) : MessageContent {
    /*let x = 50
    let y = 80
    let bat = 14
    let data = (x & 0x03FF) | ((y & 0x3FF) << 10) | ((bat & 0xF) << 20);
    let bytes = new Uint8Array(3)
    
    bytes[0] = data & 0xFF
    bytes[1] = (data >> 8) & 0xFF
    bytes[2] = (data >> 16) & 0xFF
    for(var i = 0; i < bytes.length; i++) {
      console.log("byte[" + i + "] = " + bytes[i])
    }
    console.log("The number " + data)
    
    let encoded = new Buffer(bytes).toString("base64")
    
    console.log("Encoded : " + encoded)*/

    let decoded = new Buffer(msg, "base64")
    var number = 0
    var byteNumbers = new Array(decoded.length);
    for (var i = 0; i < decoded.length; i++) {
      byteNumbers[i] = decoded.readUInt8(i);
      //console.log("byte[" + i + "] = " + byteNumbers[i])
      number |= byteNumbers[i] << (8 * i)
    }

    
    // console.log("The decoded number " + number)
    let newX = number & 0x03FF
    let newY = (number >> 10) & 0x03FF
    let newBat = (number >> 20) & 0xF
    // console.log("x, y, bat = " + newX + " - " + newY + " - " + newBat)

    return {
      x: newX,
      y: newY,
      batteryLevel: newBat
    }
  }

  decode(msg : string) : MessageContent {
    return this.decodeb64(msg)
  }

  start() {
    console.log("MQTT client connected to " + this.remoteServer)

    var self = this
    this.client.on('connect', function () {
      console.log("MQTT client subscribe to " + TOPIC)
      self.client.subscribe(TOPIC)
    })

    this.client.on('message', function (topic : string, messageBuffer : Buffer) {
      //console.log("Received message ! ")
      var message = messageBuffer.toString()
      var loraMessage : LoraRXMessage
      try {
         loraMessage = JSON.parse(message)
      } catch(e) {
        console.error("Message : " + message)
        console.error("Bad message format. " + e)
        return
      }
      // Regatta.findAndWrap()
      let messageContent : MessageContent 
      
      try {
        messageContent = self.decode(loraMessage.data)
      } catch(e) {
        console.error("Bad data format (" + e + ") : " + loraMessage.data)
        return
      }

      let t : number = new Date(loraMessage.rxInfo[0].time).getTime() / 1000.0
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
                  Device.findAndWrap(db.get(Device.collectionName), { "hwid" : loraMessage.devEUI },
                    (col, model) => new Device(db, <any>model),
                    (objs : Device[]) => {
                      if(objs.length == 0) {
                        console.error("Ignore lora message: no such device " + loraMessage.devEUI)
                        return
                      }
                      var device : Device = objs[0]
                      let deviceId = String(device.identifier)

                      device.batteryLevel = messageContent.batteryLevel
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

                      device.save()
                      raceData.save()
                      //console.log("Message processed successfully")
                    }
                  )
                }
              )
            }
          )
        }
      )


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