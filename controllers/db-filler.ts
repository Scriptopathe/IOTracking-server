import * as express from "express"
import * as monk from "monk"
import * as database from "../models/example"

import { RaceData } from '../models/race-data'
import { RaceMap } from '../models/race-map'
import { RacerModel } from '../models/racer'
import { Race, RaceModel } from '../models/race'
import { Regatta } from '../models/regata'
import { User, Role } from '../models/user'
import { Device } from '../models/device'
import { Point, TimePoint } from '../models/schema/property'

import * as uuid from 'uuid'

let router = express.Router()
let raceCount = 100
let regattaCount = 20
let racesPerRegatta = raceCount / regattaCount
let devicesCount = 20
let bounds = 1024
let buoysCount = 6


function generateRandomTrajectory(checkpoints : Point[]) : TimePoint[] {
    // Points <=> [0, 1024] en x et y
    let ptsPerCheckpoint = 50
    var pos : TimePoint = {
        x: checkpoints[0].x,
        y: checkpoints[0].y,
        t: 0    
    }

    var pts : TimePoint[] = [pos]
    let t : number = 0
    for(let i = 1; i < checkpoints.length; i++) {
        let distance = Math.sqrt(
            Math.pow(checkpoints[i].x - pos.x, 2) +
            Math.pow(checkpoints[i].y - pos.y, 2))
        
        let dir : Point = {
            x: (1.0 * checkpoints[i].x - pos.x) / distance,
            y: (1.0 * checkpoints[i].y - pos.y) / distance
        }

        let meanSpeed = distance / ptsPerCheckpoint

        for(let j = 0; j < ptsPerCheckpoint; j++) {
            distance = Math.sqrt(
                Math.pow(checkpoints[i].x - pos.x, 2) +
                Math.pow(checkpoints[i].y - pos.y, 2))
            
            dir = {
                x: (1.0 * checkpoints[i].x - pos.x) / distance,
                y: (1.0 * checkpoints[i].y - pos.y) / distance
            }

            let speed = Math.round(meanSpeed * (1 + (Math.random()-0.5)*0.1))
            let newPos = {
                x: pos.x + dir.x * speed + (30 * (Math.random() - 0.5)),
                y: pos.y + dir.y * speed + (30 * (Math.random() - 0.5)),
                t: pos.t + 10 + (Math.random() - 0.5)*5
            }
            pts.push(newPos)
            pos = newPos
        }

        pos = {
            x: checkpoints[i].x,
            y: checkpoints[i].y,
            t: pos.t + 10
        }

        pts.push(pos)
    }
    return pts
}

function createDevices(db : monk.Monk) : Device[] {
    let devices : Device[] = []
    for(let i = 0; i < devicesCount; i++) {
        var device = new Device(db, {
            hwid: uuid(),
            name: "DEV-" + i,
            batteryLevel: Math.ceil((Math.random() * 100)),
            isActive: Math.random() > 0.5
        })
        device.saveAndWait()
        devices.push(device)
    }
    console.log("Devices created")
    return devices
}

function createUsers(db : monk.Monk) : User[] {
    // Users
    let users : User[] = []
    for(let i = 0; i < devicesCount; i++) {
        var user = new User(db, {
            username: "user" + i,
            password : "password" + i,
            role: Role.staff
        })

        user.saveAndWait()
        users.push(user)
    }
    console.log("Users created.")
    return users
}

function createBuoys(db : monk.Monk) : Point[][] {
    // Buoys for each race
    let buoys : Point[][] = []
    for(let i = 0; i < raceCount; i++) {
        let b : Point[] = []
        for(let buoy = 0; buoy < buoysCount; buoy++) {
            b.push({
                x: Math.floor(Math.random() * bounds),
                y: Math.floor(Math.random() * bounds),
            })
        }
        buoys.push(b)
    }
    console.log("Buoys created.")
    return buoys
}

function createRaceData(db : monk.Monk, devices : Device[], buoys : Point[][]) : RaceData[] {
    let raceData : RaceData[] = []
    // Race Data
    for(let i = 0; i < raceCount; i++) {
        var raw = {}
        for (let dev = 0; dev < devicesCount; dev++) {
            // For each device, builds a set of geotracking data
            raw[<string>devices[dev].identifier] = generateRandomTrajectory(buoys[i])
        }

        var data = new RaceData(db, {
            rawData: raw
        })

        data.saveAndWait()
        raceData.push(data)
    }
    console.log("Race data created.")
    return raceData
}

function createRaceMaps(db : monk.Monk) : RaceMap[] {
    let raceMaps : RaceMap[] = []
    // Race maps
    let map = new RaceMap(db, {
        eastLongReference: 10.0,
        westLongReference: 12.0,
        northLatReference: 35.0,
        southLatReference: 37.0,
        raceMapImageUrl: "lake-montbel.png"
    })
    map.saveAndWait()
    raceMaps.push(map)
    console.log("Race maps created.")
    return raceMaps
}

function createRegattas(db : monk.Monk, 
        devices : Device[],
        users : User[],
        raceData : RaceData[], 
        buoys : Point[][],
        raceMaps : RaceMap[]) {
    console.log("Creating : Regattas...")
    // Regattas
    var dateOrigin = new Date()
    var dayStep = 15
    dateOrigin.setDate(dateOrigin.getDate() - (regattaCount / 2) * dayStep)
    
    for(let regattaId = 0; regattaId < regattaCount; regattaId++) {
        var startDate = new Date(dateOrigin)
        startDate.setDate(startDate.getDate() + regattaId * dayStep)

        var endDate = new Date(dateOrigin)
        endDate.setDate(endDate.getDate() + regattaId * dayStep + 1)


        // RACES
        var races : RaceModel[] = []
        for(let raceId = 0; raceId < racesPerRegatta; raceId++) {
            var raceSd = new Date(startDate)
            raceSd.setHours(8 + raceId)
            var raceEd = new Date(startDate)
            raceEd.setHours(9 + raceId)

            // Racers
            var racers : RacerModel[] = []
            for(let i = 0; i < devicesCount; i++) {
                racers.push({
                    boatIdentifier: uuid(),
                    device: devices[i].identifier,
                    skipperName: "Skipper_" + i,
                    user: users[i].identifier
                })
            }


            var race : RaceModel = {
                startDate: raceSd,
                endDate: raceEd,
                data: raceData[raceId].identifier,
                buoys: buoys[raceId],
                map: raceMaps[0].identifier,
                name: "Race_" + raceId,
                concurrents: racers
            }

            races.push(race)
        }

        var regatta = new Regatta(db, {
            name: "Regatta_" + regattaId,
            location: "Lake Montbel",
            startDate: startDate,
            endDate: endDate,
            races: races
        })

        regatta.saveAndWait()
    }

    console.log("CREATED : Regattas")    
}

router.get("/", function(req, res, next) {
    let db : monk.Monk = req["db"]
    
    // Devices
    let devices : Device[] = []
    Device.clearCollection(db, Device)
    Regatta.clearCollection(db, Regatta)
    RaceData.clearCollection(db, RaceData)
    Device.clearCollection(db, User)
    RaceMap.clearCollection(db, RaceMap)

    setTimeout(function() {
        let devices = createDevices(db)
        let users = createUsers(db)
        let buoys = createBuoys(db)
        let raceMaps = createRaceMaps(db)

        setTimeout(function() {
            let raceData = createRaceData(db, devices, buoys)
            setTimeout(function() {
                createRegattas(db, devices, users, raceData, buoys, raceMaps)
                res.write("Everything created.")
                res.end()
            }, 10000)
        }, 1000)
    }, 1000)
})



export { router }