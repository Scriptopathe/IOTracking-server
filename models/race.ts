import * as monk from "monk"
import * as modelHelpers from "../helpers/model"
import * as properties from "./schema/property"

import { ModelBase, Reference } from "../models/base"
import { Property } from "./schema/property"
import { Schema } from "./schema/schema"

export class ConcurrentModel { }

/**
 * Interface containing all the fields of a race object.
 */
export interface RaceModel {
    date : Date
    location : string
    concurrents : Array<Reference<ConcurrentModel>>
    podium : Array<Reference<ConcurrentModel>>
    live : boolean
    lulz : number
}

/**
 * Database model implementation of the RaceModel object.
 */
export class Race extends ModelBase<RaceModel> {
    public static collectionName : string = "races"
    public static schema : Schema = new Schema({
        "date" : new properties.DateProperty(),
        "location" : new properties.StringProperty(),
        "concurrents" : new properties.ArrayProperty(new properties.ReferenceProperty()),
        "podium" : new properties.ArrayProperty(new properties.ReferenceProperty()),
        "live" : new properties.BoolProperty(),
        "lulz" : new properties.TestProperty() // TESTING
    })

    public date : Date
    public location : string
    public concurrents : Array<Reference<ConcurrentModel>>
    public podium : Array<Reference<ConcurrentModel>>
    public live : boolean
    public lulz : number

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
            {
                date: new Date(),
                live: false,
                location: "Lac Montbel",
                concurrents: [], // array of ConcurrentModel
                podium: [], // array of ConcurrentModel
            },
            {
                date: new Date(),
                live: true,
                location: "Lac Montbel", 
                concurrents: [],
                podium: []
            }
        ])
    }
}