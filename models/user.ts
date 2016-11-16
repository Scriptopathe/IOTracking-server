import * as monk from "monk"
import * as promise from "../helpers/model"

export enum Role { staff, member };

export interface UserModel {
    username : string
    role : Role;
} 

export class User implements UserModel {
    public static collectionName : string = "user"
    
    username : string;
    role : Role;

    constructor(private db : monk.Monk) {}

    save() : any {
        var col : monk.Collection = this.db.get("user");
        return col.update({username : this.username}, {
            username: this.username,
            role: this.role
        })
    }

    static load(db : monk.Monk, needle : any) : promise.ModelPromise<UserModel> {
        var col : monk.Collection = db.get("user");
        return <promise.ModelPromise<UserModel>> <any> col.find(needle)
    }

    createDummy() : any {
        var col : monk.Collection = this.db.get("user");
        return col.insert([
            {username: "darkVador", role: "staff"},
            {username: "jesus", role: "member"}
        ])
    }

    /**
     * Inserts a device with the given username and role into the database.
     * @returns A promise.
     */
    insertUser(username : string, role : Role) : any {
        var col : monk.Collection = this.db.get("user");
        return col.insert({ username: username, role: role })
    }

    /**
     * Deletes the device with the given username from the database.
     * @returns A promise.
     */
    deleteUser(username : string) : any {
        var col : monk.Collection = this.db.get("user");
        return col.remove({ username: username })
    }

    /**
     * Lists all the users present in the database.
     * @returns A promise taking as argument a document with the listUsers
     * in the form of { username : "XXXX", role : "XXXX" }
     */
    listUser() : any {
        var col : monk.Collection = this.db.get("user");
        return col.find({})
    }
}