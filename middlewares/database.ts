import * as monk from "monk"
import * as express from "express"

// Database initialisation
var db : monk.Monk = monk("localhost:27017/nodetest")

var dbMiddleware = function(req : express.Request, res : express.Response, next : express.NextFunction) : void
{
    req["db"] = db
    next();
}

export { db, dbMiddleware }