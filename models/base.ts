import * as monk from "monk"
import * as modelHelpers from "../helpers/model"

export abstract class ModelBase<Model>
{
    private _id : string = undefined

    /**
     * Initialises the models from a collection and a set of properties.
     * If a model is given, its content is copied to this instance.
     */
    protected constructor(protected col : monk.Collection, private _properties : string[], model? : Model) 
    {
        if(model != undefined) {
            if(model["_id"] != undefined)
                this._id = model["_id"]
            
            modelHelpers.copy(this, model, _properties)
        }
    }

    /**
     * @return The properties contained in the model.
     */
    public get properties() : string[] {
        return this._properties
    }

    /** 
     * Saves the current object ot the database.
     */
    public save() : void
    {
        let data = {}
        modelHelpers.copy(data, this, this.properties)

        if (this._id == undefined)
            (<any> this.col.insert(data)).then((doc : Model) => {
                this._id = doc["_id"];
            })
        else
            this.col.update({ _id : this["_id"] }, data)
    }

    /**
     * Deletes the current object from the database.
     */
    public delete() : void
    {
        if(this._id == undefined)
            throw new Error("This instance does not exist in the database. Can't remove it.")

        this.col.removeById(this._id)
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
            var prom : modelHelpers.FindPromise<Model> = modelHelpers.castFind<Model>(col.find(needle))
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

    public stringify() : string {
        let data = {}
        modelHelpers.copy(data, this, ["_id"])
        modelHelpers.copy(data, this, this.properties)
        return JSON.stringify(data)
    }
}