import * as monk from "monk"
import * as modelHelpers from "../helpers/model"

import { ModelBase } from "../models/base"

export class ConcurrentModel { }

/**
 * Interface containing all the fields of a race object.
 */
export interface Race {
    date : Date
    location : string
    concurrents : ConcurrentModel[]
    podium : ConcurrentModel[]
    live : boolean
}

/**
 * Database model implementation of the Race object.
 */
export class RaceModel extends ModelBase<Race> implements Race {
    private static dbName : string = "races"

    public date : Date
    public location : string
    public concurrents : Array<ConcurrentModel>
    public podium : Array<ConcurrentModel>
    public live : boolean

    public constructor(private db : monk.Monk, race? : Race) 
    {
        super(db.get(RaceModel.dbName), ["date", "location", "concurrents", "podium", "live"], race)
    }

    /** 
     * Loads a model RaceModel from the database.
     * @param needle used to query the database. See mongo db documentation for details.
     * @param db database instance to use to load the model.
     * @param done callback executed once the loading has been performed.
     */
    public static load(db : monk.Monk, needle : any, done : (x : RaceModel)  => void) : void {
        var col : monk.Collection = db.get(RaceModel.dbName)
        this.findAndWrap<Race, RaceModel>(
            col, 
            needle,
            (col, model) => { return new RaceModel(db, model) },
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
            done : (obj : RaceModel[])  => void) : void
    {
        let col  : monk.Collection = db.get(RaceModel.dbName)
        this.findAndWrap<Race, RaceModel>(
            col, 
            needle, 
            (col, model) => { return new RaceModel(db, model) },
            done
        )
    }

    /**
     * Creates a dummy database.
     */
    public static createDummy(db : monk.Monk) : void {
        var col : monk.Collection = db.get(RaceModel.dbName);
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