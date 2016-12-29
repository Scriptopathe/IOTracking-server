import * as monk from "monk"
import * as modelHelpers from "../helpers/model"
import * as properties from "./schema/property"

import { ModelBase, Reference } from "../models/base"
import { RaceMap } from "../models/race-map"
import { Point, Property } from "./schema/property"
import { RaceData } from '../models/race-data'
import { Racer, RacerModel } from '../models/racer'
import { Schema } from "./schema/schema"

export class ConcurrentModel { }

/**
 * Interface containing all the fields of a race object.
 */
export interface RaceModel {
    startDate : Date
    endDate : Date
    concurrents : Array<RacerModel>
    map : Reference<RaceMap>
    data : Reference<RaceData>
    buoys : Array<Point>
    name : string
}

/**
 * Database model implementation of the RaceModel object.
 */
export class Race extends ModelBase<RaceModel> {
    public static collectionName : string = "races"
    public static schema : Schema = new Schema({
        "startDate" : new properties.DateProperty(),
        "endDate" : new properties.DateProperty(),
        "concurrents" : new properties.ArrayProperty(new properties.ObjectProperty(Racer.schema)),
        "map"  : new properties.ReferenceProperty(),
        "data" : new properties.ReferenceProperty(),
        "buoys" : new properties.ArrayProperty(new properties.PointProperty()),
        "name" : new properties.StringProperty()
    })

    public startDate : Date
    public endDate : Date
    public concurrents : Array<RacerModel>
    public map : Reference<RaceMap>
    public data : Reference<RaceData>
    public buoys : Array<Point>
    public name : string

    public constructor(private db : monk.Monk, race? : RaceModel) 
    {
        super(db.get(Race.collectionName), Race.schema, race)
    }

    /** 
     * Loads a model Race from the database.
     * @param needle used to query the database. See mongo db documentation for details.
     * @param db database instance to use to load the model.
     * @param done callback executed once the loading has been performed.
     */
    public static findOne(db : monk.Monk, needle : any, done : (x : Race)  => void) : void {
        var col : monk.Collection = db.get(Race.collectionName)
        this.findAndWrap<RaceModel, Race>(
            col, 
            needle,
            (col, model) => { return new Race(db, model) },
            (items => { done(items[0]) })
        )
    }

    /**
     * Performs a find operation on the database. 
     * @param db database to use.
     * @param needle used to query the database. See mongo db documentation for details.
     * @param done callback to be executed when after the completion of the find operation. 
     *        takes an array of instance of the documents as arguments.
     */
    public static find(
            db : monk.Monk,
            needle : any, 
            done : (obj : Race[])  => void) : void
    {
        let col  : monk.Collection = db.get(Race.collectionName)
        this.findAndWrap<RaceModel, Race>(
            col, 
            needle, 
            (col, model) => { return new Race(db, model) },
            done
        )
    }

    /**
     * Creates a dummy database.
     */
    public static createDummy(db : monk.Monk) : void {
        var col : monk.Collection = db.get(Race.collectionName);
        col.insert([

        ])
    }
}