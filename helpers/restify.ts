import * as modelbase from "../models/base"
import * as express from "express"
import * as monk from "monk"

import { Schema } from "../models/schema/schema"

export interface Restifiable
{
    collectionName : string
    findAndWrap : typeof modelbase.ModelBase.findAndWrap
    schema : Schema
}

/**
 * Creates and returns a router providing a rest interface for the given
 * Type and properties.
 * 
 * The type Type must :
 *      - be a subclass of BaseModel
 *      - have a public static field called "collectionName" used to determine which collectionName
 *      - to pass to the findAndWrap method
 * 
 * The REST interface provides the following functions : 
 *   POST   /         (data) ==> 201 OK or 400
 *   PUT    /id       (data) ==> 200 OK or 400
 *   GET    /                ==> 200 OK + (data)
 *   GET    /id              ==> 200 OK + (data) or 404
 *   DELETE /id              ==> 200 OK or 404
 */
export function restify(Type : Restifiable)
{
    let r : express.Router = express.Router()
    r.use(function(req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*")
        res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, POST")
        res.setHeader("Access-Control-Allow-Headers", "Content-Type")
        res.setHeader("Access-Control-Expose-Headers", "X-IOTracking-Count")
        next()
    })

    r.post("/", function(req, res, next) {
        let dataStr = req.body
        let x = JSON.parse(req.body)
        
        let newobj  = new (<any> Type)(req["db"])

        // Check if all properties contained
        for(let prop of newobj.properties)
        {
            if (!(prop in x)) {
                res.statusCode = 400
                res.statusMessage = "Bad object format"
                res.end()
                return
            }

            newobj[prop] = newobj.schema.properties[prop].unwrap(x[prop])

            if(newobj[prop] == undefined) {
                res.statusCode = 400
                res.statusMessage = "Property " + prop + " has incorrect value"
                res.end()
                return
            }
        }

        newobj.save()
        res.statusCode = 201
        res.end()
    })

    r.put("/:identifier", function(req, res, next) {
        let id = req.params["identifier"]
        let obj = JSON.parse(req.body)
        let updobj = Type.findAndWrap(
            req["db"].get(Type.collectionName), {_id : id},
            (col : any, model : any) => new (<any> Type)(req["db"], model),
            function(objs : any[]) {
                let x = objs[0]
                if (objs.length == 0) {
                    res.statusCode = 404
                    res.statusMessage = "No such object"
                    res.end()
                    return
                }

                // Check if all properties contained
                for(let prop in Type.schema.properties)
                {
                    if (!(prop in obj)) {
                        res.statusCode = 400
                        res.statusMessage = "Bad object format"
                        res.end()
                        return
                    }

                    x[prop] = Type.schema.properties[prop].unwrap(obj[prop])

                    if(x[prop] == undefined) {
                        res.statusCode = 400
                        res.statusMessage = "Property " + prop + " has incorrect value"
                        res.end()
                        return
                    }
                }

                x.save()
                res.end()
            }
        )
    })

    r.get("/dummy", function(req, res, next) {
        let unwrapped = Type.schema.unwrap(Type.schema.random())
        res.statusCode = 200
        res.setHeader("Content-Type", "application/json")
        res.write(JSON.stringify(unwrapped))
        res.end()
    })

    r.get("/count", function(req, res, next) {
        Type.findAndWrap(
            req["db"].get(Type.collectionName), {},
            (col : any, model : any) => new (<any> Type)(req["db"], model),
            function(objs : any[]) {
                res.write(String(objs.length))
                res.end()
            }
        )
    })

    r.get("/", function(req, res, next) {
        let first = req.query["first"] == undefined ? 0 : Number(req.query["first"])
        let last = req.query["last"] == undefined ? -1 : Number(req.query["last"])
        let needle = req.query["needle"] == undefined ? {} : JSON.parse(req.query["needle"])
        Type.findAndWrap(
            req["db"].get(Type.collectionName), needle,
            (col : any, model : any) => new (<any> Type)(req["db"], model),
            function(objs : any[]) {
                let strings : string[] = []

                if(last < 0) last = objs.length
                first = Math.max(0, Math.min(objs.length, first)) 
                last = Math.max(0, Math.min(objs.length, last)) 

                for(let i = first; i < last; i++) {
                    strings.push(JSON.parse(objs[i].stringify()))
                }

                res.setHeader("X-IOTracking-Count", "" + objs.length)
                res.write(JSON.stringify(strings))
                res.end()
            }
        )
    })


    r.get("/:identifier", function(req, res, next) {
        let id = req.params["identifier"]
        Type.findAndWrap(
            req["db"].get(Type.collectionName), {_id : id},
            (col : any, model : any) => new (<any> Type)(req["db"], model),
            function(objs : any[]) {
                let x = objs[0]

                if (objs.length == 0) {
                    res.statusCode = 404
                    res.statusMessage = "No such object"
                    res.end()
                    return
                }

                res.write(x.stringify())
                res.end()
            }
        )
    })

    r.delete("/:identifier", function(req, res, next) {
        let id = req.params["identifier"]
        
        Type.findAndWrap(
            req["db"].get(Type.collectionName), {_id : id},
            (col : any, model : any) => new (<any> Type)(req["db"], model),
            function(objs : any[]) {
                let x = objs[0]
 
                if (objs.length == 0) {
                    res.statusCode = 404
                    res.statusMessage = "No such object"
                    res.end()
                    return
                }

                x.delete()
                res.end()
            }
        )
    })

    return r
}