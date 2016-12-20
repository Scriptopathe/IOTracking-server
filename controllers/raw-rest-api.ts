import * as express from "express"
import * as monk from "monk"
import * as restmaker from "../helpers/restify"

import { RaceData } from "../models/race-data"
import { RaceMap } from "../models/race-map"
import { Device } from "../models/device"
import { User } from "../models/user"
import { Regatta } from "../models/regata"

let router = express.Router()
router.use("/racedata", restmaker.restify(RaceData))
router.use("/racemaps", restmaker.restify(RaceMap))
router.use("/devices", restmaker.restify(Device))
router.use("/users", restmaker.restify(User))
router.use("/regattas", restmaker.restify(Regatta))

export { router }