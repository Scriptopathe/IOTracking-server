import * as express from "express"
import * as monk from "monk"
import * as database from "../models/user"
import {Device} from "../models/device"

let router = express.Router()

let writeSuccess = function(res : express.Response) : void{
  res.statusCode = 200
  res.write("success")
  res.end()
}

/* ---------------------------------------------------------------------
 * device API
 * -------------------------------------------------------------------*/
router.get('/create', function(req, res, next) {
  Device.createDummy(req["db"]);
  writeSuccess(res)
  next()
})

router.get('/insert/:id/:name', function(req, res, next) {
  let id : number = req["id"]
  let name : string = req["name"]

  let device : Device = new Device(req["db"], {
      id : id,
      name : name
  })
  
  device.save()
  writeSuccess(res)
  next()
})

/*
router.get('/delete/:name', function(req, res, next) {
    let name : string = req["name"]
    User.findOne(req["db"], {name}, (objs => {
        objs.delete()
      }))
  next()
})
*/

router.get('/list', function(req, res, next) {
    Device.find(req["db"], {}, (objs => {
        for(let obj of objs) {
            res.write(obj.stringify() + "\n") 
        }
        
        writeSuccess(res)
        next()
    }))
})

export { router }