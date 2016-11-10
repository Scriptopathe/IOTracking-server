
/**
 * Copies properties from one model to another.
 */
export function copy<D, S>(dst : D, src : S, properties : Array<string>) {
    if(dst == undefined)
        throw new Error("copy : dst is undefined")

    if(src == undefined)
        throw new Error("copy : src is undefined")

    for(let property of properties) {
        dst[property] = src[property]
    }
}

export interface Cursor {
    close() : void
}

export interface ModelPromise<T> {
    then(func : (doc? : T[]) => void, error? : (error? : any) => void) : ModelPromise<T>
}

export interface FindPromise<T> {
    then(func : (doc? : T[]) => void, error? : (error? : any) => void) : ModelPromise<T>
    each(func : (doc? : T, cursor? : Cursor) => void) : ModelPromise<T>
}

export let cast = function<T>(promise : any) : ModelPromise<T> {
    return <ModelPromise<T>> promise
}

export let castFind = function<T>(promise : any) : FindPromise<T> {
    return <FindPromise<T>> promise
}