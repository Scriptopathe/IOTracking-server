import * as monk from "monk"
import * as modelHelpers from "../helpers/model"
import * as properties from "./schema/property"

import { Race, RaceModel } from "../models/race"
import { ModelBase, Reference } from "../models/base"
import { Point, Property } from "./schema/property"
import { Schema } from "./schema/schema"

/**
 * Interface containing all the fields of a race object.
 */
export interface RegattaModel {
    races : Array<Race>
    location : string
    startDate : Date
    endDate : Date
    name : string
}

/**
 * Database model implementation of the RaceModel object.
 */
export class Regatta extends ModelBase<RegattaModel> {
    public static collectionName : string = "regattas"
    public static schema : Schema = new Schema({
        "startDate" : new properties.DateProperty(),
        "endDate" : new properties.DateProperty(),
        "races" : new properties.ArrayProperty(new properties.ObjectProperty<Race>(Race.schema)),
        "location" : new properties.StringProperty(),
        "name"     : new properties.StringProperty() 
    })

    public startDate : Date
    public endDate : Date
    public races : Array<RaceModel>
    public location : string
    public name : string

    public constructor(private db : monk.Monk, race? : RegattaModel) 
    {
        super(db.get(Regatta.collectionName), Regatta.schema, race)
    }

    /** 
     * Loads a model Regatta from the database.
     * @param needle used to query the database. See mongo db documentation for details.
     * @param db database instance to use to load the model.
     * @param done callback executed once the loading has been performed.
     */
    public static findOne(db : monk.Monk, needle : any, done : (x : Regatta)  => void) : void {
        var col : monk.Collection = db.get(Regatta.collectionName)
        this.findAndWrap<RegattaModel, Regatta>(
            col, 
            needle,
            (col, model) => { return new Regatta(db, model) },
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
            done : (obj : Regatta[])  => void) : void
    {
        let col  : monk.Collection = db.get(Regatta.collectionName)
        this.findAndWrap<RegattaModel, Regatta>(
            col, 
            needle, 
            (col, model) => { return new Regatta(db, model) },
            done
        )
    }

    /**
     * Creates a dummy database.
     */
    public static createDummy(db : monk.Monk) : void {
        var col : monk.Collection = db.get(Regatta.collectionName);
        col.insert([
            {
                
            }
        ])
    }
}