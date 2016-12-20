import * as monk from "monk"
import * as promise from "../helpers/model"
import * as properties from "./schema/property"
import { Schema } from "./schema/schema"
import { ModelBase } from "../models/base"

export class Role {
    public static staff = "staff"
    public static member = "member"
    public static anonymous = "anonymous"
    public static ALL = [Role.staff, Role.member, Role.anonymous]
}
 
/**
 * Interface containing all the fields of a user object.
 */
export interface UserModel {
    username : string
    password : string
    role : string;
} 


/**
 * Database model implementation of the RaceModel object.
 */
export class User extends ModelBase<UserModel> implements UserModel {
    public static collectionName : string = "user"
    public static schema : Schema = new Schema({
        "username" : new properties.StringProperty(),
        "password" : new properties.StringProperty(),
        "role" : new properties.StringEnumProperty(Role.ALL)
    })

    public username : string;
    public password : string;
    public role : string;

    public constructor(private db : monk.Monk, user? : UserModel) 
    {
        super(db.get(User.collectionName), User.schema, user)
    }

    /** 
     * Loads a model User from the database.
     * @param needle used to query the database. See mongo db documentation for details.
     * @param db database instance to use to load the model.
     * @param done callback executed once the loading has been performed.
     */
    public static findOne(db : monk.Monk, needle : any, done : (x : User)  => void) : void {
        var col : monk.Collection = db.get(User.collectionName)
        this.findAndWrap<UserModel, User>(
            col, 
            needle,
            (col, model) => { return new User(db, model) },
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
            done : (obj : User[])  => void) : void
    {
        let col  : monk.Collection = db.get(User.collectionName)
        this.findAndWrap<UserModel, User>(
            col, 
            needle, 
            (col, model) => { return new User(db, model) },
            done
        )
    }

    /**
     * Creates a dummy database.
     */
    public static createDummy(db : monk.Monk) : void {                      
        var col : monk.Collection = db.get(User.collectionName);
        col.insert([
            
        ])
    }

    public static determineRole(str : string) : Role {
        if (str == "staff") {
            return Role.staff
        } else if (str == "member") {
            return Role.member
        } else {
            return Role.anonymous
        }
    }
}