import * as monk from "monk"
import * as modelHelpers from "../helpers/model"

import { ModelBase } from "../models/base"

export class ConcurrentModel { }

/**
 * Interface containing all the fields of a race object.
 */
export interface RaceModel {
    date : Date
    location : string
    concurrents : ConcurrentModel[]
    podium : ConcurrentModel[]
    live : boolean
}

/**
 * Database model implementation of the RaceModel object.
 */
export class Race extends ModelBase<RaceModel> implements RaceModel {
    public static collectionName : string = "races"
    

    public date : Date
    public location : string
    public concurrents : Array<ConcurrentModel>
    public podium : Array<ConcurrentModel>
    public live : boolean

    public constructor(private db : monk.Monk, race? : RaceModel) 
    {
        super(db.get(Race.collectionName), ["date", "location", "concurrents", "podium", "live"], race)
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