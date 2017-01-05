import * as monk            from "monk"
import * as express         from "express"
import { ServerState,
         ServerStateModel } from "../models/server-state"

let router = express.Router()

router.use("/live", function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, DELETE, POST")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
    next()
})

router.get("/live", function(req, res, next) {
    var db : monk.Monk = req["db"]

    ServerState.findAndWrap(db.get(ServerState.collectionName), {}, 
    (col, model) => {
        return new ServerState(db, <ServerStateModel>model)
    },
    function(objs : any[]) {
        var serverState : ServerState
        if(objs.length == 0) {
            res.write('{}')
            res.end()
            return
        } else {
            serverState = objs[0]
        }

        res.write(serverState.stringify())
        res.end()
    })
})

router.delete("/live", function(req, res, next) {
    var db : monk.Monk = req["db"]

    ServerState.findAndWrap(db.get(ServerState.collectionName), {}, 
    (col, model) => {
        return new ServerState(db, <ServerStateModel>model)
    },
    function(objs : any[]) {
        if(objs.length != 0) {
            let serverState : ServerState = objs[0]
            serverState.delete()
        }

        res.statusCode = 200
        res.end()
    })
})

router.post("/live", function(req, res, next) {
    var db : monk.Monk = req["db"]
    console.log("poooost")
    console.dir(req.body)
    let obj = JSON.parse(req.body)

    ServerState.findAndWrap(db.get(ServerState.collectionName), {}, 
    (col, model) => {
        return new ServerState(db, <ServerStateModel>model)
    },
    function(objs : any[]) {
        var serverState : ServerState = null
        if(objs.length == 0) {
            serverState = new ServerState(db)
        } else {
            serverState = objs[0]
        }

        for(let prop in ServerState.schema.properties) {
            if(!(prop in obj)) {
                res.statusCode = 400
                res.statusMessage = "Bad object format"
                res.end()
                return
            }

            serverState[prop] = ServerState.schema.properties[prop].unwrap(obj[prop])

            if(serverState[prop] == undefined) {
                res.statusCode = 400
                res.statusMessage = "Property " + prop + " has incorrect value"
                res.end()
                return
            }
        }

        serverState.save()
        res.statusCode = 201
        res.end()
    })
})

export { router }