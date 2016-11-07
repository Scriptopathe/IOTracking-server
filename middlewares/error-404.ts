import * as express from "express"

let router = express.Router()

router.all('/', function(req, res, next) {
  res.write("<h1>ERROR 404 : page not found.</h1>")
  res.end()
  next()
})


export { router }