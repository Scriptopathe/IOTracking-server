import * as monk            from "monk"
import * as express         from "express"
import { Point }            from "../models/schema/property"
import { Regatta,
         RegattaModel }     from "../models/regata"
import { Race,
         RaceModel }        from "../models/race"

let router = express.Router()

/**
 * This controler is used to change the buoys list associated to 
 * a given race.
 */
router.put("/:regata/:race", function(req, res, next) {
    var db : monk.Monk = req["db"]
    let obj = JSON.parse(req.body)
    let regata = req.params["regata"]
    let race = parseInt(req.params["race"])
    
    // Check race validity
    if(isNaN(race)) {
        res.statusCode = 404
        res.statusMessage = "The race parameter should be a number."
        res.end()
        return
    }

    // check that the buoys are valid.
    let buoys : Point[] = Race.schema.properties["buoys"].unwrap(obj)
    if(buoys == null) {
        res.statusCode = 400
        res.statusMessage = "Bad buoys format."
        res.end()
        return
    }

    Regatta.findAndWrap(db.get(Regatta.collectionName), { "_id" : regata }, 
    (col, model) => {
        return new Regatta(db, <RegattaModel>model)
    },
    function(objs : any[]) {
        var regata : Regatta = null
        if(objs.length == 0) {
            // ERROR
            res.statusCode = 404
            res.statusMessage = "Regata " + regata + "not found."
            res.end()
            return
        }

        regata = objs[0]

        console.log(regata.races[race].buoys)
        console.log(buoys)

        regata.races[race].buoys = buoys
        regata.save()

        res.statusCode = 200
        res.end()
    })
})

export { router }