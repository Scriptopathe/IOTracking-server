import * as monk                            from "monk"
import * as express                         from "express"
import { LiveState, LiveStateModel }        from "../models/live-state"
import { Device, DeviceModel }              from "../models/device"
import { Regatta, RegattaModel }            from "../models/regata"
import { Race, RaceModel }                  from "../models/race"
import { RaceData, RaceDataModel }          from "../models/race-data"

let router = express.Router()

router.get("/live", function(req, res, next) {
    var db : monk.Monk = req["db"]

    LiveState.findAndWrap(db.get(LiveState.collectionName), {}, 
    (col, model) => {
        return new LiveState(db, <LiveStateModel>model)
    },
    function(objs : any[]) {
        var liveState : LiveState
        if(objs.length == 0) {
            res.write('{}')
            res.end()
            return
        } else {
            liveState = objs[0]
        }

        res.write(liveState.stringify())
        res.end()
    })
})


/** This route is for debug purposes. */
router.get("/live/devices", function(req, res, next) {
    var db : monk.Monk = req["db"]

    LiveState.findAndWrap(db.get(LiveState.collectionName), {}, 
    (col, model) => {
        return new LiveState(db, <LiveStateModel>model)
    },
    function(objs : any[]) {
        var liveState : LiveState
        if(objs.length == 0) {
            res.end('error: live state')
            return
        } else {
            liveState = objs[0]
        }

        Regatta.findAndWrap(db.get(Regatta.collectionName), { '_id' : liveState.liveRegata }, 
        (col, model) => { return new Regatta(db, <RegattaModel>model) },
        function(objs : Regatta[]) {
            if(objs.length == 0) {
                res.end('error: no such regatta ' + liveState.liveRegata)
                return
            }
            var regata : Regatta = objs[0]
            var race : RaceModel = regata.races[liveState.liveRaceId]
            var done = 0
            var hwids : string[] = []
            for(let racer of race.concurrents) {
                Device.findOne(db, { _id : racer.device }, (device : Device) => {
                    if(device) {
                        hwids.push(device.hwid)
                    }

                    // If it is the last device, send the result back
                    done += 1
                    if(done == race.concurrents.length) {
                        res.end(hwids.join(';'))
                    }
                })
            }
        })
    })
})

router.delete("/live", function(req, res, next) {
    var db : monk.Monk = req["db"]

    LiveState.findAndWrap(db.get(LiveState.collectionName), {}, 
    (col, model) => {
        return new LiveState(db, <LiveStateModel>model)
    },
    function(objs : any[]) {
        if(objs.length != 0) {
            let liveState : LiveState = objs[0]
            liveState.delete()
        }

        res.statusCode = 200
        res.end()
    })
})

router.post("/live", function(req, res, next) {
    var db : monk.Monk = req["db"]
    let obj = JSON.parse(req.body)

    LiveState.findAndWrap(db.get(LiveState.collectionName), {}, 
    (col, model) => {
        return new LiveState(db, <LiveStateModel>model)
    },
    function(objs : any[]) {
        var liveState : LiveState = null
        if(objs.length == 0) {
            liveState = new LiveState(db)
        } else {
            liveState = objs[0]
        }

        for(let prop in LiveState.schema.properties) {
            if(!(prop in obj)) {
                res.statusCode = 400
                res.statusMessage = "Bad object format"
                res.end()
                return
            }

            liveState[prop] = LiveState.schema.properties[prop].unwrap(obj[prop])

            if(liveState[prop] == undefined) {
                res.statusCode = 400
                res.statusMessage = "Property " + prop + " has incorrect value"
                res.end()
                return
            }
        }

        liveState.save()
        res.statusCode = 201
        res.end()
    })
})

export { router }