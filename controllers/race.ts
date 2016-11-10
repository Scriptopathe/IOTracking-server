import * as express from "express"
import * as monk from "monk"
import { RaceModel } from "../models/race"

let router = express.Router()

let writeSuccess = function(res : express.Response) : void{
  res.statusCode = 200
  res.write("success")
  res.end()
}

/* ---------------------------------------------------------------------
 * dummy api
 * -------------------------------------------------------------------*/
router.get('/create', function(req, res, next) {
  RaceModel.createDummy(req["db"])
  writeSuccess(res)
  next()
})

router.get('/insert/:live/:location', function(req, res, next) {
  let race : RaceModel = new RaceModel(req["db"], {
      concurrents : [],
      date : new Date(),
      live : Boolean(req.params["live"]),
      location : req.params["location"],
      podium : []
  })

  race.save()
  writeSuccess(res)
  next()
})

router.get('/list', function(req, res, next) {
    RaceModel.find(req["db"], {}, (objs => {
        for(let obj of objs) {
            res.write("Here it is : " + obj.stringify() + "\n")
        }

        writeSuccess(res)
        next()
    }))
})

export { router }