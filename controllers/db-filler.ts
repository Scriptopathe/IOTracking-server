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

router.get("/", function(req, res, next) {
    let raceCount = 10
    let regattaCount = 2
    let racesPerRegatta = raceCount / regattaCount
    let devicesCount = 20
    let rawDataPoints = 50
    let bounds = 1024

    let db : monk.Monk = req["db"]
    
    // Devices
    let devices : Device[] = []
    Device.clearCollection(db, Device);
    for(let i = 0; i < devicesCount; i++) {
        var device = new Device(db, {
            hwid: uuid(),
            name: "DEV-" + i
        })
        device.saveAndWait()
        devices.push(device)
    }
    console.log("Devices created")

    // Users
    let users : User[] = []
    Device.clearCollection(db, User)
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


    // Buoys for each race
    let buoys : Point[][] = []
    for(let i = 0; i < raceCount; i++) {
        let b : Point[] = []
        for(let buoy = 0; buoy < 4; buoy++) {
            b.push({
                x: Math.floor(Math.random() * bounds),
                y: Math.floor(Math.random() * bounds),
            })
        }
        buoys.push(b)
    }
    console.log("Buoys created.")


    let raceData : RaceData[] = []
    let raceMaps : RaceMap[] = []
    setTimeout(function() {
        console.log("Creating : Race Data and Race map...")
        // Race Data
        RaceData.clearCollection(db, RaceData)
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

        // Race maps
        RaceMap.clearCollection(db, RaceMap)
        let map = new RaceMap(db, {
            eastLongReference: 10.0,
            westLongReference: 12.0,
            northLatReference: 35.0,
            southLatReference: 37.0,
            raceMapImageUrl: "static/lake-montbel.png"
        })
        map.saveAndWait()
        raceMaps.push(map)


        console.log("CREATED Race Data and Race map")
    }, 200)

    setTimeout(function() {
        console.log("Creating : Regattas...")
        // Regattas
        Regatta.clearCollection(db, Regatta)
        var dateOrigin = new Date()
        dateOrigin.setMonth(0)
        dateOrigin.setFullYear(2016, 1, 1)
        for(let regattaId = 0; regattaId < regattaCount; regattaId++) {
            var startDate = new Date(dateOrigin)
            startDate.setDate(startDate.getDate() + 1)

            var endDate = new Date(startDate)
            endDate.setDate(endDate.getDate() + 1)

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
        res.write("Everything created.")
        res.end()
    }, 600)
    

})

function generateRandomTrajectory(checkpoints : Point[]) : TimePoint[] {
    // Points <=> [0, 1024] en x et y
    let ptsPerCheckpoint = 10
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
            x: (checkpoints[i].x - pos.x) / distance,
            y: (checkpoints[i].y - pos.y) / distance
        }

        let meanSpeed = distance / ptsPerCheckpoint

        for(let j = 0; j < ptsPerCheckpoint; j++) {
            let speed = Math.round(meanSpeed * (2 * Math.random() - 1))
            let newPos = {
                x: pos.x + dir.x * speed,
                y: pos.y + dir.y * speed,
                t: pos.t + 1 + (Math.random() - 0.5)*0.1 
            }
            pts.push(newPos)
            pos = newPos
        }
    }
    return pts
}


export { router }