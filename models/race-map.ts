import * as monk from "monk"
import * as modelHelpers from "../helpers/model"
import * as properties from "./schema/property"

import { ModelBase, Reference } from "../models/base"
import { Point, Property } from "./schema/property"
import { Schema } from "./schema/schema"

/**
 * Interface containing all the fields of a race object.
 */
export interface RaceMapModel {
    name : string
    raceMapImageUrl : string
    northLatReference : number
    southLatReference : number
    eastLongReference : number
    westLongReference : number
}

/**
 * Database model implementation of the RaceModel object.
 */
export class RaceMap extends ModelBase<RaceMapModel> {
    public static collectionName : string = "racemaps"
    public static schema : Schema = new Schema({
        "name" : new properties.StringProperty(),
        "raceMapImageUrl" : new properties.StringProperty(),
        "northLatReference" : new properties.FloatProperty(),
        "southLatReference" : new properties.FloatProperty(),
        "eastLongReference" : new properties.FloatProperty(),
        "westLongReference" : new properties.FloatProperty(),
    })

    public name : string
    public raceMapImageUrl : string
    public northLatReference : number
    public southLatReference : number
    public eastLongReference : number
    public westLongReference : number

    public constructor(private db : monk.Monk, race? : RaceMapModel) 
    {
        super(db.get(RaceMap.collectionName), RaceMap.schema, race)
    }

    /** 
     * Loads a model RaceMap from the database.
     * @param needle used to query the database. See mongo db documentation for details.
     * @param db database instance to use to load the model.
     * @param done callback executed once the loading has been performed.
     */
    public static findOne(db : monk.Monk, needle : any, done : (x : RaceMap)  => void) : void {
        var col : monk.Collection = db.get(RaceMap.collectionName)
        this.findAndWrap<RaceMapModel, RaceMap>(
            col, 
            needle,
            (col, model) => { return new RaceMap(db, model) },
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
            done : (obj : RaceMap[])  => void) : void
    {
        let col  : monk.Collection = db.get(RaceMap.collectionName)
        this.findAndWrap<RaceMapModel, RaceMap>(
            col, 
            needle, 
            (col, model) => { return new RaceMap(db, model) },
            done
        )
    }

    /**
     * Creates a dummy database.
     */
    public static createDummy(db : monk.Monk) : void {
        var col : monk.Collection = db.get(RaceMap.collectionName);
        col.insert([
            {
                raceMapImageUrl : "static/lulz",
                northLatReference : 0.50,
                southLatReference : 0.40,
                eastLongReference : 0.50,
                westLongReference : 0.40
            }
        ])
    }
}