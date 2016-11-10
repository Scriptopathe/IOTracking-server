import * as express from "express"
import * as monk from "monk"
import * as database from "../models/user"
import {Role} from "../models/user"

let router = express.Router()

let writeSuccess = function(res : express.Response) : void{
  res.statusCode = 200
  res.write("success")
  res.end()
}

router.post('/', function(req, res, next) {
  let text = req.body.text
  res.write("POST BODY : " + text)
  res.end()
  next()
})

router.get('/', function(req, res, next) {
  var db : monk.Monk = req["db"];
  var collection : monk.Collection = db.get('usercollection');
  collection.find({},{},function(e : any,docs : any){
    
  });
  res.write("<html><head></head><body>")
  res.write("Base url = " + req.baseUrl + "<br />")
  res.write("Original url = " + req.originalUrl + "<br />")
  res.write("Url = " + req.url + "<br />")
  res.write("</body></html>")
  res.end()
  next()
})

router.get('/pid/:id', function(req, res, next) {
  let str : string = req.params.id
  res.write("ID : " + str)
  res.end()
  next() 
})

/* ---------------------------------------------------------------------
 * user API
 * -------------------------------------------------------------------*/
router.get('/user/create', function(req, res, next) {
  let db : database.User = new database.User(req["db"])
  db.createDummy().then(() => {})
  writeSuccess(res)
  next()
})

router.get('/user/insert/:username/:role', function(req, res, next) {
  let username : string = req.params.username
  let role : Role = req.params.role
  let db : database.User = new database.User(req["db"])
  db.insertUser(username, role).then(() => {})
  writeSuccess(res)
  next()
})

router.get('/user/delete/:username', function(req, res, next) {
  let username : string = req.params.username
  let db : database.User = new database.User(req["db"])
  
  writeSuccess(res)
  db.deleteUser(username).then(() => {})
  next()
})

router.get('/user/list', function(req, res, next) {
  let db : database.User = new database.User(req["db"])
  
  db.listUser().then(function(docs : any) : any {

    for(var i in docs) {
      let doc = docs[i]
      res.write("[username = " + doc["username"] + ", role = " + doc["role"] + "]\n")
    }
    writeSuccess(res)
    next()
  })
})

export { router }