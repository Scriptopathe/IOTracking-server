import * as express from "express"
import * as monk from "monk"
import * as database from "../models/example"

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
 * dummy api
 * -------------------------------------------------------------------*/
router.get('/dummy/create', function(req, res, next) {
  let db : database.ExampleModel = new database.ExampleModel(req["db"])
  db.createDummy().then(() => {})
  writeSuccess(res)
  next()
})

router.get('/dummy/insert/:hwid/:name', function(req, res, next) {
  let hwid : string = req.params.hwid
  let name : string = req.params.name
  let db : database.ExampleModel = new database.ExampleModel(req["db"])
  db.insertDevice(hwid, name).then(() => {})
  writeSuccess(res)
  next()
})

router.get('/dummy/delete/:hwid', function(req, res, next) {
  let hwid : string = req.params.hwid
  let db : database.ExampleModel = new database.ExampleModel(req["db"])
  
  writeSuccess(res)
  db.deleteDevice(hwid).then(() => {})
  next()
})

router.get('/dummy/list', function(req, res, next) {
  let db : database.ExampleModel = new database.ExampleModel(req["db"])
  
  db.listDevices().each(function(doc : any) : any {
    res.write("[_id = " + doc["_id"] + ", hwid = " + doc["hwid"] + ", name = " + doc["name"] + "]\n")
  }).then(function() {
    writeSuccess(res)
    next()
  })
})

export { router }