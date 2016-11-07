import * as express from "express"

let router = express.Router()

router.post('/', function(req, res, next) {
  let text = req.body.text
  res.write("POST BODY : " + text)
  res.end()
  next()
})

router.get('/pid/:id', function(req, res, next) {
  let str : string = req.params.id
  res.write("ID : " + str)
  res.end()
  next() 
})

export { router }