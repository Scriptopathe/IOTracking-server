import * as monk from "monk"
import * as promise from "../helpers/model"
import * as properties from "./schema/property"
import { ModelBase } from "../models/base"
import { Schema } from "./schema/schema"
/**
 * Interface containing all the fields of a device object.
 */
export interface DeviceModel {
    hwid : string
    name : string
    batteryLevel : number
    isActive : boolean
}

/**
 * Database model implementation of the DeviceModel object.
 */
export class Device extends ModelBase<DeviceModel> implements DeviceModel {
    public static collectionName : string = "devices"
    public static schema : Schema = new Schema({
        "hwid" : new properties.StringProperty(),
        "name" : new properties.StringProperty(),
        "batteryLevel" : new properties.IntegerProperty(),
        "isActive": new properties.BoolProperty()
    })

    public hwid : string;
    public name : string;
    public batteryLevel : number
    public isActive : boolean

    public constructor(private db : monk.Monk, device? : DeviceModel) 
    {
        super(db.get(Device.collectionName), Device.schema, device)
    }

    /** 
     * Loads a model Device from the database.
     * @param needle used to query the database. See mongo db documentation for details.
     * @param db database instance to use to load the model.
     * @param done callback executed once the loading has been performed.
     */
    public static findOne(db : monk.Monk, needle : any, done : (x : Device)  => void) : void {
        var col : monk.Collection = db.get(Device.collectionName)
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
        let col  : monk.Collection = db.get(Device.collectionName)
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
        var col : monk.Collection = db.get(Device.collectionName);
        col.insert([
            {hwid: "1", name: "TRUC"},
            {hwid: "2", name: "TRUC2"}
        ])
    }
}