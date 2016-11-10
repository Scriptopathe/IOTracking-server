import * as monk from "monk"
import * as promise from "../models/promise"

export enum Role { staff, member };

export interface User {
    username : string
    role : Role;
} 

export class UserModel implements User {
    
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

    static load(db : monk.Monk, needle : any) : promise.ModelPromise<User> {
        var col : monk.Collection = db.get("user");
        return <promise.ModelPromise<User>> <any> col.find(needle)
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