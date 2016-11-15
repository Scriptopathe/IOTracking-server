import * as express from "express"
import * as monk from "monk"
import * as database from "../models/user"
import {User} from "../models/user"
import {Role} from "../models/user"

let router = express.Router()

let writeSuccess = function(res : express.Response) : void{
  res.statusCode = 200
  res.write("success")
  res.end()
}

/* ---------------------------------------------------------------------
 * user API
 * -------------------------------------------------------------------*/
router.get('/create', function(req, res, next) {
  User.createDummy(req["db"]);
  writeSuccess(res)
  next()
})

router.get('/insert/:username/:role', function(req, res, next) {
  let role : string = req["role"]
  let username : string = req["username"]
  let tempRole : Role = User.determineRole(role);

  let user : User = new User(req["db"], {
      username : username,
      role : tempRole
  })
  
  user.save()
  writeSuccess(res)
  next()
})

/*
router.get('/delete/:username', function(req, res, next) {
    let username : string = req["username"]
    User.findOne(req["db"], {username}, (objs => {
        objs.delete()
      }))
  next()
})
*/

router.get('/list', function(req, res, next) {
    User.find(req["db"], {}, (objs => {
        for(let obj of objs) {
            res.write(obj.stringify() + "\n") 
        }
        
        writeSuccess(res)
        next()
    }))
})

export { router }