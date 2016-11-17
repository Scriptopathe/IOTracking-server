import { Property } from "./property" 

export class Schema
{
    constructor(public properties : { [name : string] : Property }) { }
}
