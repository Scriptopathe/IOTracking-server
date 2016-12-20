import * as monk from "monk"
import * as promise from "../helpers/model"
import * as properties from "./schema/property"
import { ModelBase, Reference } from "../models/base"
import { Schema } from "./schema/schema"
import { Device } from "./device"
import { User } from "../models/user"
/**
 * Interface containing all the fields of a racer object.
 */
export interface RacerModel {
    boatIdentifier : string
    user : Reference<User>
    device : Reference<Device>
}

/**
 * Database model implementation of the RacerModel object.
 */
export class Racer extends ModelBase<RacerModel> implements RacerModel {
    private static dbName : string = "racers"
    public static schema : Schema = new Schema({
        "boatIdentifier" : new properties.StringProperty(),
        "user" : new properties.ReferenceProperty(),
        "device" : new properties.ReferenceProperty()
    })

    public boatIdentifier : string
    public user : Reference<User>
    public device : Reference<Device>

    public constructor(private db : monk.Monk, racer? : RacerModel) 
    {
        super(db.get(Racer.dbName), Racer.schema, racer)
    }

    /** 
     * Loads a model Racer from the database.
     * @param needle used to query the database. See mongo db documentation for details.
     * @param db database instance to use to load the model.
     * @param done callback executed once the loading has been performed.
     */
    public static findOne(db : monk.Monk, needle : any, done : (x : Racer)  => void) : void {
        var col : monk.Collection = db.get(Racer.dbName)
        this.findAndWrap<RacerModel, Racer>(
            col, 
            needle,
            (col, model) => { return new Racer(db, model) },
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
            done : (obj : Racer[])  => void) : void
    {
        let col  : monk.Collection = db.get(Racer.dbName)
        this.findAndWrap<RacerModel, Racer>(
            col, 
            needle, 
            (col, model) => { return new Racer(db, model) },
            done
        )
    }

    /**
     * Creates a dummy database.
     */
    public static createDummy(db : monk.Monk) : void {                      
        var col : monk.Collection = db.get(Racer.dbName);
        col.insert([

        ])
    }
}