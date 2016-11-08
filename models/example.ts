import * as monk from "monk"

export interface promise {
    then(doc : any) : promise
}

export class ExampleModel {
    constructor(private db : monk.Monk) { }

    /**
     * Creates a dummy database.
     */
    createDummy() : any {
        var col : monk.Collection = this.db.get("dummy");
        return col.insert([
            {hwid: "0000", name: "BOX-0000"},
            {hwid: "0001", name: "BOX-0001"},
            {hwid: "0002", name: "BOX-0002"},
        ])
    }

    /**
     * Inserts a device with the given hwid and name into the database.
     * @returns A promise.
     */
    insertDevice(hwid : string, name : string) : any {
        var col : monk.Collection = this.db.get("dummy")
        return col.insert({ hwid: hwid, name: name })
    }

    /**
     * Deletes the device with the given hwid from the database.
     * @returns A promise.
     */
    deleteDevice(hwid : string) : any {
        var col : monk.Collection = this.db.get("dummy")
        return col.remove({ hwid: hwid })
    }

    /**
     * Lists all the devices present in the database.
     * @returns A promise taking as argument a document with the listDevices
     * in the form of { hwid : "XXXX", name : "XXXX" }
     */
    listDevices() : any {
        var col : monk.Collection = this.db.get("dummy")
        return col.find({})
    }
}