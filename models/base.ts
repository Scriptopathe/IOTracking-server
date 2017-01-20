import * as monk from "monk"
import * as modelHelpers from "../helpers/model"

import { Schema } from "./schema/schema"
import { Property } from "./schema/property"

/** 
 * Represents a reference to another object of the database.
 */
export class Reference<T> extends String
{
}

export abstract class ModelBase<Model>
{
    private _id : string = undefined
    private _schema : Schema = undefined

    public get identifier() : Reference<Model> { return this._id }
    /**
     * Gets the schema of this model.
     */
    public get schema() : Schema {
        return this._schema
    }

    /**
     * Initialises the models from a collection and a set of properties.
     * If a model is given, its content is copied to this instance.
     */
    protected constructor(protected col : monk.Collection, properties : string[] | Schema, model? : Model) 
    {
        // Sets the model
        if(model != undefined) {
            if(model["_id"] != undefined)
                this._id = model["_id"]
        }

        // Sets the properties
        if(properties instanceof Schema) {
            this._schema = properties
        } else {
            this._schema = ModelBase.convertToSchema(properties)
        }

        if(model != undefined)
            ModelBase.copyProperties(this, model, this._schema)
    }

    /**
     * @return The properties contained in the model.
     */
    public get properties() : string[] {
        var arr : string[] = []
        for(let key in this._schema.properties) 
            arr.push(key)
        return arr
    }

    /** 
     * Saves the current object ot the database.
     */
    private _save(check : boolean, cb? : ((model : Model) => void)) : void
    {
        let data = {}
        try {
            if(check) {
                ModelBase.unwrapProperties(data, this, this._schema)
            } else {
                ModelBase.copyProperties(data, this, this._schema)
            }
        } catch(e) {
            console.log("Error in save.")
            console.trace(e)
            return
        }

        if (this._id == undefined) {
            (<any> this.col.insert(data)).then((doc : Model) => {
                this.afterCreate()
                this._id = doc["_id"];
                if(cb != null) { cb(doc) }
            })
        } else {
            (<any> this.col.update({ _id : this["_id"] }, data)).then((doc : Model) => {
                this.afterUpdate()
                if(cb != null) { cb(doc) }
            })
        }
    }

    /**
     * Saves the model after checking it.
     * Can throw an exception if the model is not valid.
     */
    public saveAndCheck(cb? :  ((model : Model) => void)) {
        this._save(true, cb)
    }

    /**
     * Saves the model using the fast method without prior checks.
     */
    public save(cb? :  ((model : Model) => void)) {
        this._save(false, cb)
    }

    /**
     * Deprecated.
     */
    public saveAndWait() {
        this.save()
    }

    /**
     * Deletes the current object from the database.
     */
    public delete() : void
    {
        if(this._id == undefined)
            throw new Error("This instance does not exist in the database. Can't remove it.");

        (<any> this.col.removeById(this._id)).then((doc : Model) => {
            this.afterDelete()
        });
    }
    
    /**
     * Extract special fields from the needle to pass them as options.
     */
    static processNeedle(needle : any) : any {
        var filter = needle
        var options = {}
        if(needle["$orderby"] != undefined) {
            options["sort"] = needle["$orderby"]
            delete filter["$orderby"]
        }
        return {
            "filter" : filter,
            "options" : options
        }
    }

    /**
     * Performs a find operation on the database. 
     * @param col collection where to find the data.
     * @param needle used to query the database. See mongo db documentation for details.
     * @param allocator used to allocate the Model wrapper instance from the raw model found
     *        in the database.
     * @param done callback to be executed when after the completion of the find operation. 
     *        takes an array of instance of the model wrapper as arguments.
     * @param err callback executed when an error occurs.
     */
    public static findAndWrap<Model, ModelWrapper>(
            col : monk.Collection,
            needle : any, 
            allocator: (col : monk.Collection, model : Model) => ModelWrapper,
            done : (obj : ModelWrapper[])  => void,
            err? : (error : Error) => void
            ) : void
    {
        try {
            var pneedle = this.processNeedle(needle)
            var prom : modelHelpers.FindPromise<Model> = modelHelpers.castFind<Model>(
                col.find(pneedle["filter"], pneedle["options"]))
            let docs : ModelWrapper[] = []
        
            prom.each(function(doc : Model) {
                docs.push(allocator(col, doc))
            }).then(function() {
                done(docs)
            })
            
        } catch (error) {
            if(err != undefined)
                err(error)
            else
                throw error   
        }
    }


    /**
     * Performs a find operation on the database. 
     * @param col collection where to find the data.
     * @param needle used to query the database. See mongo db documentation for details.
     * @param allocator used to allocate the Model wrapper instance from the raw model found
     *        in the database.
     * @param done callback to be executed when after the completion of the find operation. 
     *        takes an array of instance of the model wrapper as arguments.
     * @param err callback executed when an error occurs.
     */
    public static clearCollection<Model, ModelWrapper>(db : monk.Monk, Type : any) : void
    {
        var col = db.get(Type.collectionName)
        
        try {
            col.remove({})
        } catch (error) {
            throw error   
        }
    }
    /**
     * Gets the string representation of this object.
     */
    public stringify() : string {
        let data = {}
        modelHelpers.copy(data, this, ["_id"])
        ModelBase.copyProperties(data, this, this._schema)
        return JSON.stringify(data)
    }

    /**
     * Copy the properties of the given schema from src to dst.
     * */
    public static copyProperties(dst : any, src : any, schema : Schema) {
        for(let key in schema.properties) {
            dst[key] = src[key]
        }
    }

    /**
     * Unwraps the properties contained in the given schema value from the source 
     * object to the destination object.
     * */
    public static unwrapProperties(dst : any, src : any, schema : Schema) {
        for(let key in schema.properties) {
            dst[key] = schema.properties[key].unwrap(src[key])
        }
    }

    /**
     * Converts a set of properties to a schema.
     */
    private static convertToSchema(properties : string[]) : Schema {
        let props : { [name:string] : Property } = {}
        for(let key of properties) {
            props[key] = new Property()
        }
        return new Schema(props)
    }

    /* ---------------------------------------------------------------------------------
     * CALLBACKS
     * -------------------------------------------------------------------------------*/

    /**
     * Called after the item is created.
     */
    protected afterCreate() {
        return true
    }
    /**
     * Called after the item is updated.
     */
    protected afterUpdate() {
        return true
    }

    /**
     * Called after the item is deleted.
     */
    protected afterDelete() {
        return true
    }
}