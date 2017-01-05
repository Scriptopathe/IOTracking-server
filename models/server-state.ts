import * as monk from "monk"
import * as promise from "../helpers/model"
import * as properties from "./schema/property"
import { Schema }   from "./schema/schema"
import { Race }     from "./race"
import { Regatta }     from "./regata"
import { ModelBase, Reference } from "../models/base"

/**
 * Interface containing all the fields of a user object.
 */
export interface ServerStateModel {
    liveRegata : Reference<Regatta>
    liveRaceId : number
} 

/**
 * Database model implementation of the RaceModel object.
 */
export class ServerState extends ModelBase<ServerStateModel> implements ServerStateModel {
    public static collectionName : string = "serverstate"
    public static schema : Schema = new Schema({
        "liveRegata" : new properties.ReferenceProperty(),
        "liveRaceId" : new properties.IntegerProperty(),
    })

    public liveRegata : Reference<Regatta>
    public liveRaceId : number

    public constructor(private db : monk.Monk, user? : ServerStateModel) 
    {
        super(db.get(ServerState.collectionName), ServerState.schema, user)
    }

    /** 
     * Loads a model ServerState from the database.
     * @param needle used to query the database. See mongo db documentation for details.
     * @param db database instance to use to load the model.
     * @param done callback executed once the loading has been performed.
     */
    public static findOne(db : monk.Monk, needle : any, done : (x : ServerState)  => void) : void {
        var col : monk.Collection = db.get(ServerState.collectionName)
        this.findAndWrap<ServerStateModel, ServerState>(
            col, 
            needle,
            (col, model) => { return new ServerState(db, model) },
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
            done : (obj : ServerState[])  => void) : void
    {
        let col  : monk.Collection = db.get(ServerState.collectionName)
        this.findAndWrap<ServerStateModel, ServerState>(
            col, 
            needle, 
            (col, model) => { return new ServerState(db, model) },
            done
        )
    }

    /**
     * Creates a dummy database.
     */
    public static createDummy(db : monk.Monk) : void {                      
        var col : monk.Collection = db.get(ServerState.collectionName);
        col.insert([
            
        ])
    }
}