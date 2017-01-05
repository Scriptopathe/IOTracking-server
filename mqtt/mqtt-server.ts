import * as mqtt            from 'mqtt'

import { db }               from '../middlewares/database'
import { Regatta }          from '../models/regata'
import { RaceModel }        from '../models/race'
import { RaceData }         from '../models/race-data'
import { Racer }            from '../models/racer'
import { Device }           from '../models/device'
import { ServerState }      from '../models/server-state'
import { TimePoint }        from '../models/schema/property'

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

  start() {
    var self = this
    this.client.on('connect', function () {
      self.client.subscribe(TOPIC)
    })

    this.client.on('message', function (topic : string, message : string) {
      var loraMessage : LoraRXMessage = JSON.parse(message)
      
      // Regatta.findAndWrap()
      let x : number = 12
      let y : number = 54
      let t : number = 2

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
                      
                      raceData.rawData[<string>device.identifier].push({
                        x: x, y: y, t: t
                      })

                      raceData.save()
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