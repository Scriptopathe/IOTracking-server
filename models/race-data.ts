import * as monk from "monk"
import * as modelHelpers from "../helpers/model"
import * as properties from "./schema/property"

import { ModelBase, Reference } from "../models/base"
import { Point, TimePoint, Property } from "./schema/property"
import { Schema } from "./schema/schema"

/**
 * Interface containing all the fields of a raceData object.
 */
export interface RaceDataModel {
    rawData : { [devId : string] : Array<TimePoint> }
}

/**
 * Database model implementation of the RaceData object.
 */
export class RaceData extends ModelBase<RaceDataModel> {
    public static collectionName : string = "raceData"
    public static schema : Schema = new Schema({
        "rawData" : new properties.MapProperty<string, Array<TimePoint>>(
            new properties.StringProperty(),
            new properties.ArrayProperty(new properties.TimePointProperty())),
    })

    public rawData : { [devId : string] : Array<TimePoint> }

    public constructor(private db : monk.Monk, raceData? : RaceDataModel) 
    {
        super(db.get(RaceData.collectionName), RaceData.schema, raceData)
    }

    /** 
     * Loads a model RaceData from the database.
     * @param needle used to query the database. See mongo db documentation for details.
     * @param db database instance to use to load the model.
     * @param done callback executed once the loading has been performed.
     */
    public static findOne(db : monk.Monk, needle : any, done : (x : RaceData)  => void) : void {
        var col : monk.Collection = db.get(RaceData.collectionName)
        this.findAndWrap<RaceDataModel, RaceData>(
            col, 
            needle,
            (col, model) => { return new RaceData(db, model) },
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
            done : (obj : RaceData[])  => void) : void
    {
        let col  : monk.Collection = db.get(RaceData.collectionName)
        this.findAndWrap<RaceDataModel, RaceData>(
            col, 
            needle, 
            (col, model) => { return new RaceData(db, model) },
            done
        )
    }

    /**
     * Creates a dummy database.
     */
    public static createDummy(db : monk.Monk) : void {
        var col : monk.Collection = db.get(RaceData.collectionName);
        col.insert([
            
        ])
    }
}