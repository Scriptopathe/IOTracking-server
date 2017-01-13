import * as express from "express"
import * as monk from "monk"
import * as restmaker from "../helpers/restify"

var fileUpload = require('express-fileupload');

let router = express.Router()

router.use("", function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, DELETE, POST")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
    next()
})
 
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
    
    sampleFile.mv('public/uploads/racemaps/' + filename, function(err : any) {
        if (err) {
            res.status(500).send(err)
        }
        else {
            res.send('File uploaded!')
        }
    });
});

export { router }