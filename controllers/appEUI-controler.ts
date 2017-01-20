import * as monk            from "monk"
import * as express         from "express"
import * as config          from "../config"
let router = express.Router()

router.get("", function(req, res) {
    res.end(config.appEUI)
});

export { router }