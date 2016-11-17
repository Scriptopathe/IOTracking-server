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
     *          unwrap(wrap(data))   = unwrap
     * @returns the converted value if the import succeeded, undefined otherwise.
     */
    public unwrap(obj : any) : any | undefined 
    {
        return obj
    }
}

export class StringProperty extends Property {
    public wrap(value : string) {
        return value
    }

    public unwrap(obj : any) {
        return String(obj)
    }
}

export class ReferenceProperty extends StringProperty { }

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
}

export class BoolProperty extends Property {
    public wrap(value : boolean) {
        return value
    }

    public unwrap(obj : any) {
        let num = Boolean(obj)
        return num
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
        
        let array = value.map((value, index, array) => { this.items.wrap(value) })
        return array
    }

    public unwrap(obj : any[]) {
        if(obj == undefined)
            return []
        
        if(! (obj instanceof(Array))) {
            console.dir(obj)
            throw new Error("ArrayProperty.unwrap : wrapped value is not an array")
        }
        
        let array = obj.map((value, index, array) => { this.items.unwrap(value) })
        return array
    }
}

export class DateProperty extends Property {
    public wrap(value : Date) {
        return value
    }

    public unwrap(obj : any) {
        if(obj == undefined)
            return new Date()
        
        if(obj instanceof(Date)) {
            return <Date> obj
        } else {
            let date = new Date(obj)
            if (isNaN(date.getTime()))
                return undefined
            
            return date
        }
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
}