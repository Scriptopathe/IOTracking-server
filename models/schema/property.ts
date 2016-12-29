/* ==================================================================================
 * Random helpers
 * ================================================================================*/
function randomInt(max : number) {
    return Math.floor(Math.random()*max)
}
function randomFloat(max : number) {
    return Math.random()*max
}
function randomStr() {
    return "string#" + randomInt(1000)
}


/* ==================================================================================
 * Base classes
 * ================================================================================*/
export class Property
{
    /**
     * Object -> JSON / DB / API
     * Wraps the value to a format that can be put in a JSON file 
     * (for database and API)
     */
    public wrap(value : any) : any 
    {
        return value 
    }

    /**
     * JSON / DB / API -> Object
     * Unwraps the value from a JSON value to the type T.
     * If the value is already of the type T, it MUST BE returned as is.
     * e.g:
     *          unwrap(unwrap(data)) = unwrap(data)
     *          unwrap(wrap(data))   = unwrap(data)
     *          unwrap(invalid_data) = undefined
     * 
     * @returns the converted value if the import succeeded, undefined otherwise.
     */
    public unwrap(obj : any) : any | undefined 
    {
        return obj
    }

    public random() : any {
        return "{random}"
    }
}

export class Schema
{
    constructor(public properties : { [name : string] : Property }) { }

    public wrap(value : any) {
        let wrapped = {}
        for(let key in this.properties) {
            wrapped[key] = this.properties[key].wrap(value[key]) 
        }
        return wrapped
    }

    public unwrap(value : any) {
        console.log("unwrapp " + JSON.stringify(value))
        let unwrapped = {}
        for(let key in this.properties) {
            if(!(key in value)) { 
                return undefined
            }
            unwrapped[key] = this.properties[key].unwrap(value[key])
        }

        console.log("unwrapped " + JSON.stringify(unwrapped))
        return unwrapped
    }

    public random() : any {
        let rand = {}
        for(let prop in this.properties) {
            rand[prop] = this.properties[prop].random()
        }

        return rand
    }
}


/* ==================================================================================
 * Complex properties
 * ================================================================================*/
export class ObjectProperty<T> extends Property {
    public constructor(public schema : Schema) {
        super()
    }

    public wrap(value : T) {
        return value
    }

    public unwrap(obj : T | string) {
        if(typeof obj === "string")
            return JSON.parse(obj)
        
        return obj
    }

    public random() : any {
        return this.schema.random()
    }
}

export class MapProperty<TKey, TValue> extends Property {
    public constructor(public keyProperty : Property, public valueProperty : Property) {
        super()
    }

    public wrap(value : any) {
        var wrapped = {}
        for(let key in value) {
            let wKey = this.keyProperty.wrap(key)
            wrapped[wKey] = this.valueProperty.wrap(value[key])
        }
        return value
    }

    public unwrap(obj : any) {
        var unwrapped = {}
        for(let key in obj) {
            let uwKey = this.keyProperty.unwrap(key)
            let uwValue = this.valueProperty.unwrap(obj[key])
            if(uwKey == undefined || uwValue == undefined)
                return undefined
            
            unwrapped[uwKey] = uwValue
        }
        return unwrapped
    }

    public random() : any {
        var rand = {}
        for(let i = 0; i < 5; i++){
            rand[this.keyProperty.random()] = this.valueProperty.random()
        }
        return rand
    }
}


export class ArrayProperty<T> extends Property {
    public constructor(private items : Property) {
        super()
    }

    public wrap(value : T[]) {
        if(! (value instanceof(Array))) {
            console.dir(value)
            throw new Error("ArrayProperty.wrap wrapped value is not an array")
        }
        
        let array = value.map((value, index, array) => { return this.items.wrap(value) })
        return array
    }

    public unwrap(obj : any[]) {
        if(obj == undefined)
            return []
        
        if(! (obj instanceof(Array))) {
            return undefined
        }
        
        let array = obj.map((value, index, array) => { return this.items.unwrap(value) })
        return array
    }

    public random() {
        return [this.items.random(), this.items.random()]
    }
}
/* ==================================================================================
 * Structural properties
 * ================================================================================*/
export interface Point 
{ 
    x : number
    y : number
}

export interface TimePoint 
{ 
    x : number
    y : number
    t : number
} 

export class PointProperty extends Property {
    public wrap(value : Point) {
        return value.x + ";" + value.y
    }

    public unwrap(obj : any) {
        if(typeof obj === "string") {
            var xy = obj.split(';').map((value) => Number(value))
            if(xy.length != 2)
                return undefined
            return { x: xy[0], y: xy[1] }
        } else if (obj["x"] != undefined && obj["y"] != undefined) {
            return obj
        } else {
            return undefined
        }
    }

    public random() {
        return randomFloat(1000) + ";" + randomFloat(1000)
    }
}

export class TimePointProperty extends Property {
    public wrap(value : TimePoint) {
        return value.x + ";" + value.y + ";" + value.t
    }

    public unwrap(obj : any) {
        if(typeof obj === "string") {
            var xyz = obj.split(';').map((value) => Number(value))
            if(xyz.length != 3)
                return undefined
            return { x: xyz[0], y: xyz[1], t : xyz[2] }
        } else if (obj["x"] != undefined &&
                   obj["y"] != undefined && 
                   obj["t"] != undefined) {
            return obj
        } else {
            return undefined
        }
    }


    public random() {
        return randomFloat(1000) + ";" + randomFloat(1000) + ";" + randomFloat(1000)
    }
}


/* ==================================================================================
 * Simple properties
 * ================================================================================*/
export class StringProperty extends Property {
    public wrap(value : string) {
        return value
    }

    public unwrap(obj : any) {
        return String(obj)
    }

    public random() : string {
        return randomStr()
    }
}

export class StringEnumProperty extends Property {
    constructor(public values : string[]) {
        super()
    }

    public wrap(value : string) {    
        return value
    }

    public unwrap(obj : any) {
        if(this.values.indexOf(obj) != -1)
            return String(obj)
        return undefined
    }

    public random() : string {
        return this.values[randomInt(this.values.length)]
    }
}

export class ReferenceProperty extends StringProperty {
    public random() : string {
        return "invalid_reference"
    }
}

export class IntegerProperty extends Property {
    public wrap(value : number) {
        return value
    }

    public unwrap(obj : any) {
        let num = parseInt(obj)
        if (isNaN(num))
            return undefined
        return num
    }

    public random() {
        return randomInt(1000)
    }
}

export class FloatProperty extends Property {
    public wrap(value : number) {
        return value
    }

    public unwrap(obj : any) {
        let num = parseFloat(obj)
        if (isNaN(num))
            return undefined
        return num
    }

    public random() {
        return randomFloat(1000)
    }
}

export class BoolProperty extends Property {
    public wrap(value : boolean) {
        return value
    }

    public unwrap(obj : any) {
        let num = Boolean(obj)
        return num
    }

    public random() {
        return randomInt(2) == 1 ? true : false
    }
}

export class DateProperty extends Property {
    public wrap(value : Date) {
        return this.unwrap(value).getTime()
    }

    public unwrap(obj : any) {
        if(obj == undefined)
            return new Date()
        
        if(typeof(obj) == "number") {
            var date = new Date()
            date.setTime(obj)
            return date
        } else if(obj instanceof(Date)) {
            return <Date> obj
        } else {
            let date = new Date(obj)
            if (isNaN(date.getTime()))
                return undefined
                
            return date
        }
    }

    public random() {
        return new Date()
    }
}

export class TestProperty extends Property {
    // DB and JSON => "LULZ + 1000"
    // Internally : 1000

    public wrap(value : number) {
        if(value == undefined)
            return "LULZ + 0"

        return "LULZ + " + value
    }

    public unwrap(obj : any) {
        // Good format
        if(typeof(obj) == "string") {
            let arr : string[] = obj.split("LULZ +")
            if(arr.length == 2)
                return new IntegerProperty().unwrap(arr[1])
        }

        // Already unwrapped
        if(typeof(obj) == "number")
            return obj

        return undefined
    }

    public random() {
        return this.wrap(randomInt(1000))
    }
}