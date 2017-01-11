import * as monk            from "monk"
import * as express         from "express"
import { LiveState,
         LiveStateModel } from "../models/live-state"

let router = express.Router()

router.use("/live", function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, DELETE, POST")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
    next()
})

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