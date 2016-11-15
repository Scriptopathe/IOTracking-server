import * as monk from "monk"
import * as promise from "../helpers/model"
import { ModelBase } from "../models/base"
 
/**
 * Interface containing all the fields of a device object.
 */
export interface DeviceModel {
    id : number;
    name : string;
}

/**
 * Database model implementation of the DeviceModel object.
 */
export class Device extends ModelBase<DeviceModel> implements DeviceModel {
    private static dbName : string = "devices"
       
    public id : number;
    public name : string;

    public constructor(private db : monk.Monk, device? : DeviceModel) 
    {
        super(db.get(Device.dbName), ["id", "name"], device)
    }

    /** 
     * Loads a model Device from the database.
     * @param needle used to query the database. See mongo db documentation for details.
     * @param db database instance to use to load the model.
     * @param done callback executed once the loading has been performed.
     */
    public static findOne(db : monk.Monk, needle : any, done : (x : Device)  => void) : void {
        var col : monk.Collection = db.get(Device.dbName)
        this.findAndWrap<DeviceModel, Device>(
            col, 
            needle,
            (col, model) => { return new Device(db, model) },
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
            done : (obj : Device[])  => void) : void
    {
        let col  : monk.Collection = db.get(Device.dbName)
        this.findAndWrap<DeviceModel, Device>(
            col, 
            needle, 
            (col, model) => { return new Device(db, model) },
            done
        )
    }

    /**
     * Creates a dummy database.
     */
    public static createDummy(db : monk.Monk) : void {                      
        var col : monk.Collection = db.get(Device.dbName);
        col.insert([
            {id: "1", name: "TRUC"},
            {id: "2", name: "TRUC2"}
        ])
    }
}