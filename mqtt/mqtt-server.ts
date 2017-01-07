import * as mqtt            from 'mqtt'

import { db }               from '../middlewares/database'
import { Regatta }          from '../models/regata'
import { RaceModel }        from '../models/race'
import { RaceData }         from '../models/race-data'
import { Racer }            from '../models/racer'
import { Device }           from '../models/device'
import { ServerState }      from '../models/server-state'
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

var TOPIC = "application/lulz"

export class MQTTServer
{
  client : mqtt.Client

  constructor() {
    this.client  = mqtt.connect('mqtt://127.0.0.1')
  }

  decodeb64(msg : string) : MessageContent {
    let x = 50
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
    console.log("Encoded : " + encoded)

    let decoded = new Buffer(encoded, "base64")
    
    
    var number = 0
    var byteNumbers = new Array(decoded.length);
    for (var i = 0; i < decoded.length; i++) {
      byteNumbers[i] = decoded.readUInt8(i);
      console.log("byte[" + i + "] = " + byteNumbers[i])
      number |= byteNumbers[i] << (8 * i)
    }

    
    console.log("The decoded number " + number)
    let newX = number & 0x03FF
    let newY = (number >> 10) & 0x03FF
    let newBat = (number >> 20) & 0xF
    console.log("x, y, bat = " + newX + " - " + newY + " - " + newBat)

    return {
      x: 0,
      y: 0,
      batteryLevel: 0
    }
  }
  decode(msg : string) : MessageContent {
    this.decodeb64(msg)

    let values =  msg.split(';').map((value) => parseInt(value))
    return {
      x: values[0],
      y: values[1],
      batteryLevel : values[3]
    }
  }

  start() {
    var self = this
    this.client.on('connect', function () {
      self.client.subscribe(TOPIC)
    })

    this.client.on('message', function (topic : string, messageBuffer : Buffer) {
      console.log("Received message !")
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

      let t : number = new Date(loraMessage.rxInfo[0].time).getTime()
      let x : number = messageContent.x
      let y : number = messageContent.y

      ServerState.findAndWrap(db.get(ServerState.collectionName), {}, 
        (col, model) => new ServerState(db, <any>model),
        (objs : ServerState[]) => {
          if(objs.length == 0) {
            console.error("Ignore lora message: no live race.")
            return
          }
          var serverState : ServerState = objs[0]
          let regataId : string = <string>serverState.liveRegata
          let raceId : number = serverState.liveRaceId

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

                      device.batteryLevel = messageContent.batteryLevel
                      var data = {
                        x: x, y: y, t: t
                      }

                      if(!(<string>device.identifier in raceData.rawData)) {
                        console.error("Device " + device.name + " not in race ")
                        return
                        // raceData.rawData[<string>device.identifier] = []
                      }

                      raceData.rawData[<string>device.identifier].push(data)

                      device.save()
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