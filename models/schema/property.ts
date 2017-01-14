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

function getStackTrace() : string[] {
  var stack : any;

  try {
    throw new Error('');
  }
  catch (error) {
    stack = error.stack || '';
  }

  stack = stack.split('\n')
  return stack.splice(stack[0] == 'Error' ? 2 : 1);
}

/* ==================================================================================
 * Base classes
 * ================================================================================*/
export class Property
{
    public static DEBUG = false

    /** Set by the schema. */
    public name : string = ""

    protected error(str : string) : any {
        throw new Error(str)
    }

    /**
     * Check and converts value to internal storage format.
     *  
     * Unwraps the value from a JSON value to the type T. ty
     * If the value is already of the type T, it MUST BE returned as is.
     * e.g:
     *          unwrap(unwrap(data)) = unwrap(data)
     *          unwrap(wrap(data))   = unwrap(data)
     *          unwrap(invalid_data) = undefined
     * 
     * @returns the converted value if the import succeeded, undefined otherwise.
     */
    public unwrap(obj : any, depth : number = 0) : any 
    {
        if(Property.DEBUG) {
            var spaces = "                                                                                                 "
            var trace = getStackTrace()
            var className = trace[0].split('.unwrap')[0].split('.Property')[0]
            var prop = " | " + this.name + " = " + typeof(obj) + " {" + obj + "}"
            var tabs = spaces.slice(0, depth)

            console.log((depth +" " + tabs + className + spaces).slice(0, 50) + prop)
        }

        return obj
    }

    public random() : any {
        return "{random}"
    }
}

export class Schema extends Property
{
    constructor(public properties : { [name : string] : Property }) { 
        super()
    }

    public unwrap(value : any, depth : number = 0) : any {
        super.unwrap(value, depth)
        let unwrapped = {}
        for(let key in this.properties) {
            if(!(key in value)) { 
                return this.error("Missing property '" + key + "'")
            }
            this.properties[key].name = this.name + "." + key

            unwrapped[key] = this.properties[key].unwrap(value[key], depth+1)
            if(unwrapped[key] == undefined) {
                return this.error("Bad format for '" + key + "'")
            }
        }
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

    public unwrap(obj : T | string, depth : number = 0) {
        super.unwrap(obj, depth)

        this.schema.name = this.name
        if(typeof obj === "string")
            return this.schema.unwrap(JSON.parse(obj), depth+1)
        
        return this.schema.unwrap(obj, depth+1)
    }

    public random() : any {
        return this.schema.random()
    }
}

export class MapProperty<TKey, TValue> extends Property {
    public constructor(public keyProperty : Property, public valueProperty : Property) {
        super()
    }

    public unwrap(obj : any, depth : number = 0) {
        super.unwrap(obj, depth)
        var unwrapped = {}
        for(let key in obj) {
            this.keyProperty.name = this.name + "#key"
            this.valueProperty.name = this.name + "[key]"

            let uwKey = this.keyProperty.unwrap(key, depth+1)
            let uwValue = this.valueProperty.unwrap(obj[key], depth+1)

            if(uwKey == undefined || uwValue == undefined)
                return this.error("Bad key or value for '" + key + "'")
            
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

    public unwrap(obj : any[], depth : number = 0) {
        super.unwrap(obj, depth)
        if(obj == undefined)
            return []
        
        if(! (obj instanceof(Array))) {
            return this.error("Not an array")
        }
        
        let array : any[] = []
        for(let i in obj) {
            this.items.name = this.name + "[" + i + "]"
            let value = obj[i]
            let unwraped = this.items.unwrap(value, depth+1)
            if(unwraped == undefined)
                return this.error("Incorrect value for item " + value)
            array.push(unwraped)
        }

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

    public unwrap(obj : any, depth : number = 0) {
        super.unwrap(obj, depth)
        if(typeof obj === "string") {
            var xy = obj.split(';').map((value) => Number(value))
            if(xy.length != 2)
                return this.error("bad format")
            return { x: xy[0], y: xy[1] }
        } else if (obj["x"] != undefined && obj["y"] != undefined) {
            return obj
        } else {
            return this.error("bad Point format")
        }
    }

    public random() {
        return randomFloat(1000) + ";" + randomFloat(1000)
    }
}

export class TimePointProperty extends Property {

    public unwrap(obj : any, depth : number = 0) {
        super.unwrap(obj, depth)
        if(typeof obj === "string") {
            var xyz = obj.split(';').map((value) => Number(value))
            if(xyz.length != 3)
                return this.error("bad TimePoint format")
            return { x: xyz[0], y: xyz[1], t : xyz[2] }
        } else if (obj["x"] != undefined &&
                   obj["y"] != undefined && 
                   obj["t"] != undefined) {
            return obj
        } else {
            return this.error("bad TimePoint format")
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

    public unwrap(obj : any, depth : number = 0) {
        super.unwrap(obj, depth)
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

    public unwrap(obj : any, depth : number = 0) {
        super.unwrap(obj, depth)
        if(this.values.indexOf(obj) != -1)
            return String(obj)
        return this.error("Incorrect enum value" + obj)
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

    public unwrap(obj : any, depth : number = 0) {
        super.unwrap(obj, depth)
        let num = parseInt(obj)
        if (isNaN(num))
            return this.error("Incorrect integer value " + num)
        return num
    }

    public random() {
        return randomInt(1000)
    }
}

export class FloatProperty extends Property {

    public unwrap(obj : any, depth : number = 0) {
        super.unwrap(obj, depth)
        let num = parseFloat(obj)
        if (isNaN(num))
            return this.error("Incorrect numeric value " + num)
        return num
    }

    public random() {
        return randomFloat(1000)
    }
}

export class BoolProperty extends Property {

    public unwrap(obj : any, depth : number = 0) {
        super.unwrap(obj, depth)
        let num = Boolean(obj)
        return num
    }

    public random() {
        return randomInt(2) == 1 ? true : false
    }
}

export class DateProperty extends Property {

    public unwrap(obj : any, depth : number = 0) {
        super.unwrap(obj, depth)

        if(obj == undefined)
            return new Date().getTime()
        
        let timestamp = parseInt(obj)
        if(!isNaN(timestamp)) {
            return timestamp
        } else if(obj instanceof(Date)) {
            return obj.getTime()
        } else {
            let date = new Date(obj)
            if (isNaN(date.getTime()))
                return this.error("Incorrect date value '" + date + "'")
                
            return date.getTime()
        }
    }

    public random() {
        return new Date().getTime()
    }
}

export class TestProperty extends Property {

    public unwrap(obj : any, depth : number = 0) {
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
        return randomInt(1000)
    }
}