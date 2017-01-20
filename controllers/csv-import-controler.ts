import * as monk            from "monk"
import * as express         from "express"
import { Point }            from "../models/schema/property"
import { Regatta,
         RegattaModel }     from "../models/regata"
import { Race,
         RaceModel }        from "../models/race"
import { Racer,
         RacerModel }        from "../models/racer"

var fileUpload = require('express-fileupload');
let router = express.Router()

router.post("", fileUpload(), function(req, res) {
    console.dir(req.body)
    if (!req['files'] || !req['body']) {
        res.send('No files were uploaded.');
        return;
    }
    
    let filename : string = req['body']['filename']
    let sampleFile : any = req['files']['file']

    console.log("Sample file: " + sampleFile)
    console.log("filename : " + filename)
    console.log(String(sampleFile.data))
    res.end("lol")
});

export { router }